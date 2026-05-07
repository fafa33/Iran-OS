// SPDX-License-Identifier: MIT
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

    constructor(address _kernel) {
        require(_kernel != address(0), "JurySelection: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
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

    function submitVote(uint256 caseId, bytes32 commitment, bool isGuilty, bytes calldata zkProof) external nonReentrant {
        JuryPool storage pool = juryPools[caseId];
        require(pool.selectedAt > 0, "JurySelection: no jury for this case");
        require(!pool.isComplete, "JurySelection: voting complete");
        require(!usedCommitments[commitment], "JurySelection: already voted");
        require(zkProof.length > 0, "JurySelection: invalid ZK proof");
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
