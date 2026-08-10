// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title JurySelection
 * @dev انتخاب تصادفی داوران ملی (هیئت منصفه) با الگوریتم VRF
 * آستانه محکومیت: ۸ از ۱۲ رای
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract JurySelection is AccessControl, ReentrancyGuard {

    bytes32 public constant COURT_ROLE  = keccak256("COURT_ROLE");
    bytes32 public constant KERNEL_ROLE = keccak256("KERNEL_ROLE");
    bytes32 public constant VRF_ROLE    = keccak256("VRF_ROLE");

    uint8 public constant JURY_SIZE            = 12;
    uint8 public constant CONVICTION_THRESHOLD = 8;
    uint8 public constant ACQUITTAL_THRESHOLD  = 5;

    /// @dev Groth16 (Circom/SnarkJS) ABI-encoded proof minimum: pi_a(64) + pi_b(128) + pi_c(64) = 256 bytes.
    uint256 public constant ZK_PROOF_MIN_LENGTH = 256;

    struct JuryPool {
        bytes32[] jurorCommitments;
        uint256   caseId;
        uint8     guiltyVotes;
        uint8     notGuiltyVotes;
        bool      isComplete;
        uint8     verdict;
        uint256   selectedAt;
        uint256   completedAt;
    }

    mapping(uint256 => JuryPool) public juryPools;
    mapping(bytes32 => bool)     public usedCommitments;
    uint256 public totalCasesHandled;

    event JurySelected(uint256 indexed caseId, uint256 timestamp);
    event VoteSubmitted(uint256 indexed caseId, uint8 guiltyVotes, uint8 notGuiltyVotes);
    event VerdictReached(uint256 indexed caseId, uint8 verdict, uint256 timestamp);
    event SecondRoundRequired(uint256 indexed caseId, uint256 timestamp);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring, such as granting VRF_ROLE/COURT_ROLE, is
    // reachable on mainnet). _kernel receives only KERNEL_ROLE, recording the
    // Kernel contract's identity without relying on it to ever originate a
    // transaction here (Kernel has no call-forwarding mechanism to this
    // contract). Mirrors SovereignWealthFund.sol's constructor(sovereign,
    // kernel) split.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "JurySelection: invalid admin");
        require(_kernel != address(0), "JurySelection: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function selectJury(uint256 caseId, bytes32[] calldata jurorCommitments) external onlyRole(VRF_ROLE) nonReentrant {
        require(juryPools[caseId].selectedAt == 0, "JurySelection: jury already selected");
        require(jurorCommitments.length == JURY_SIZE, "JurySelection: wrong jury size");
        for (uint8 i = 0; i < JURY_SIZE; i++) {
            require(!usedCommitments[jurorCommitments[i]], "JurySelection: duplicate commitment");
        }
        juryPools[caseId] = JuryPool({ jurorCommitments: jurorCommitments, caseId: caseId, guiltyVotes: 0, notGuiltyVotes: 0, isComplete: false, verdict: 0, selectedAt: block.timestamp, completedAt: 0 });
        totalCasesHandled++;
        emit JurySelected(caseId, block.timestamp);
    }

    /**
     * @notice رای هیئت منصفه را به همراه ZK proof ثبت می‌کند
     * @dev سخت‌سازی ساختاری (mitigation فقط — نه تأیید رمزنگاری کامل):
     *      - حداقل ZK_PROOF_MIN_LENGTH بایت و تراز ۳۲ بایتی اجباری است
     *      - این بررسی proof جعلی padding‌شده با اندازه صحیح را رد نمی‌کند
     *      - proof به caseId، commitment یا isGuilty متصل نیست
     *      - هیچ قرارداد verifier روی زنجیره وجود ندارد
     *      - خطر باقیمانده: هر blob با اندازه صحیح و تراز مناسب پذیرفته می‌شود
     *      - بستن G-1: نیاز به قرارداد Groth16 verifier با public inputs
     *        (caseId، commitment، isGuilty/nullifier) دارد
     * @param caseId شناسه پرونده
     * @param commitment تعهد داور (bytes32)
     * @param isGuilty رای مجرم یا غیرمجرم
     * @param zkProof اثبات ZK (حداقل ZK_PROOF_MIN_LENGTH بایت، تراز ۳۲ بایتی؛ محتوا تأیید نمی‌شود)
     */
    function submitVote(uint256 caseId, bytes32 commitment, bool isGuilty, bytes calldata zkProof) external nonReentrant {
        JuryPool storage pool = juryPools[caseId];
        require(pool.selectedAt > 0, "JurySelection: no jury for this case");
        require(!pool.isComplete, "JurySelection: voting complete");
        require(!usedCommitments[commitment], "JurySelection: already voted");
        // Structural hardening only: rejects trivially short / non-word-aligned blobs.
        // Does NOT verify proof content or bind proof to caseId/commitment/isGuilty.
        // A correctly shaped fake proof still passes. G-1 is mitigated, not closed.
        // Closure requires a Groth16 verifier contract with public inputs.
        require(
            zkProof.length >= ZK_PROOF_MIN_LENGTH && zkProof.length % 32 == 0,
            "JurySelection: invalid ZK proof"
        );
        bool isValidJuror = false;
        for (uint8 i = 0; i < pool.jurorCommitments.length; i++) {
            if (pool.jurorCommitments[i] == commitment) { isValidJuror = true; break; }
        }
        require(isValidJuror, "JurySelection: not a valid juror");
        usedCommitments[commitment] = true;
        if (isGuilty) { pool.guiltyVotes++; } else { pool.notGuiltyVotes++; }
        emit VoteSubmitted(caseId, pool.guiltyVotes, pool.notGuiltyVotes);
        if (pool.guiltyVotes >= CONVICTION_THRESHOLD) {
            pool.isComplete = true; pool.verdict = 1; pool.completedAt = block.timestamp;
            emit VerdictReached(caseId, 1, block.timestamp);
        } else if (pool.notGuiltyVotes >= ACQUITTAL_THRESHOLD) {
            pool.isComplete = true; pool.verdict = 2; pool.completedAt = block.timestamp;
            emit VerdictReached(caseId, 2, block.timestamp);
        } else if (pool.guiltyVotes + pool.notGuiltyVotes == JURY_SIZE) {
            pool.isComplete = true; pool.verdict = 3; pool.completedAt = block.timestamp;
            emit SecondRoundRequired(caseId, block.timestamp);
        }
    }

    function getVerdict(uint256 caseId) external view returns (uint8) { return juryPools[caseId].verdict; }
    function getJuryPool(uint256 caseId) external view returns (uint8 guiltyVotes, uint8 notGuiltyVotes, bool isComplete, uint8 verdict, uint256 selectedAt) {
        JuryPool storage pool = juryPools[caseId];
        return (pool.guiltyVotes, pool.notGuiltyVotes, pool.isComplete, pool.verdict, pool.selectedAt);
    }
}
