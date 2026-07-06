// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title JusticeProtocol
 * @dev پروتکل دادگستری دیجیتال — API قضایی واحد
 * - یک API قضایی واحد — هیچ دادگاه موازی وجود ندارد
 * - احکام به صورت فرمان‌های دیجیتال امضا شده صادر می‌شوند
 * - اعدام در کد تعریف نشده — از نظر فنی غیرممکن است
 * - ثبت غیرقابل تغییر تمام احکام در بلاک‌چین
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract JusticeProtocol is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE = keccak256("KERNEL_ROLE");
    bytes32 public constant JUDGE_ROLE  = keccak256("JUDGE_ROLE");
    bytes32 public constant COURT_ROLE  = keccak256("COURT_ROLE");
    bytes32 public constant APPEAL_ROLE = keccak256("APPEAL_ROLE");

    enum SentenceType {
        Acquitted,
        PenalLabor,
        Imprisonment,
        FinePlus,
        CommunityService
        // اعدام: وجود ندارد — از نظر فنی غیرممکن
    }

    enum CaseStatus {
        Filed,
        InvestigationPhase,
        JurySelection,
        Trial,
        Sentenced,
        OnAppeal,
        Final
    }

    struct Case {
        uint256      caseId;
        address      defendant;
        address      assignedJudge;
        string       chargeHash;
        CaseStatus   status;
        uint256      filedAt;
        uint256      sentencedAt;
        SentenceType sentenceType;
        uint256      sentenceDuration;
        uint256      fineAmount;
        string       sentenceNotes;
        bool         isAppealable;
        bool         digitalSigned;
    }

    struct JudgmentSignature {
        address judge;
        uint256 timestamp;
        bytes32 signatureHash;
    }

    mapping(uint256 => Case)              public cases;
    mapping(uint256 => JudgmentSignature) public judgmentSignatures;
    mapping(address => bool)              public approvedJudges;
    uint256 public caseCount;

    event CaseFiled(uint256 indexed caseId, address indexed defendant, uint256 timestamp);
    event JudgeAssigned(uint256 indexed caseId, address indexed judge);
    event SentenceIssued(uint256 indexed caseId, SentenceType sentenceType, uint256 timestamp);
    event SentenceDigitallySigned(uint256 indexed caseId, address judge, bytes32 signatureHash);
    event AppealFiled(uint256 indexed caseId, uint256 timestamp);
    event CaseFinalised(uint256 indexed caseId, uint256 timestamp);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring, such as granting COURT_ROLE/APPEAL_ROLE, is
    // reachable on mainnet). _kernel receives only KERNEL_ROLE, recording the
    // Kernel contract's identity without relying on it to ever originate a
    // transaction here (Kernel has no call-forwarding mechanism to this
    // contract, so approveJudge() would otherwise be permanently unreachable).
    // Mirrors SovereignWealthFund.sol's constructor(sovereign, kernel) split.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "JusticeProtocol: invalid admin");
        require(_kernel != address(0), "JusticeProtocol: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function fileCase(address defendant, string calldata chargeHash) external onlyRole(COURT_ROLE) nonReentrant returns (uint256 caseId) {
        require(defendant != address(0), "JusticeProtocol: invalid defendant");
        require(bytes(chargeHash).length > 0, "JusticeProtocol: empty charge");
        caseCount++; caseId = caseCount;
        cases[caseId] = Case({ caseId: caseId, defendant: defendant, assignedJudge: address(0), chargeHash: chargeHash, status: CaseStatus.Filed, filedAt: block.timestamp, sentencedAt: 0, sentenceType: SentenceType.Acquitted, sentenceDuration: 0, fineAmount: 0, sentenceNotes: "", isAppealable: true, digitalSigned: false });
        emit CaseFiled(caseId, defendant, block.timestamp);
        return caseId;
    }

    function assignJudge(uint256 caseId, address judge) external onlyRole(COURT_ROLE) nonReentrant {
        require(approvedJudges[judge], "JusticeProtocol: not approved");
        require(cases[caseId].filedAt > 0, "JusticeProtocol: not found");
        require(cases[caseId].status == CaseStatus.Filed || cases[caseId].status == CaseStatus.InvestigationPhase, "JusticeProtocol: wrong status");
        cases[caseId].assignedJudge = judge;
        cases[caseId].status = CaseStatus.Trial;
        emit JudgeAssigned(caseId, judge);
    }

    function issueSentence(uint256 caseId, SentenceType sentenceType, uint256 sentenceDuration, uint256 fineAmount, string calldata notes) external onlyRole(JUDGE_ROLE) nonReentrant {
        Case storage c = cases[caseId];
        require(c.assignedJudge == msg.sender, "JusticeProtocol: not assigned");
        require(c.status == CaseStatus.Trial, "JusticeProtocol: not in trial");
        c.status = CaseStatus.Sentenced;
        c.sentenceType = sentenceType;
        c.sentenceDuration = sentenceDuration;
        c.fineAmount = fineAmount;
        c.sentenceNotes = notes;
        c.sentencedAt = block.timestamp;
        emit SentenceIssued(caseId, sentenceType, block.timestamp);
    }

    function signJudgment(uint256 caseId, bytes32 signatureHash) external onlyRole(JUDGE_ROLE) nonReentrant {
        Case storage c = cases[caseId];
        require(c.assignedJudge == msg.sender, "JusticeProtocol: not assigned");
        require(c.status == CaseStatus.Sentenced, "JusticeProtocol: not sentenced");
        require(!c.digitalSigned, "JusticeProtocol: signed");
        require(signatureHash != bytes32(0), "JusticeProtocol: invalid sig");
        c.digitalSigned = true;
        judgmentSignatures[caseId] = JudgmentSignature({ judge: msg.sender, timestamp: block.timestamp, signatureHash: signatureHash });
        emit SentenceDigitallySigned(caseId, msg.sender, signatureHash);
    }

    function fileAppeal(uint256 caseId) external nonReentrant {
        Case storage c = cases[caseId];
        require(c.status == CaseStatus.Sentenced, "JusticeProtocol: cannot appeal");
        require(c.digitalSigned, "JusticeProtocol: not signed");
        require(c.isAppealable, "JusticeProtocol: not appealable");
        require(c.defendant == msg.sender, "JusticeProtocol: only defendant");
        c.status = CaseStatus.OnAppeal;
        emit AppealFiled(caseId, block.timestamp);
    }

    function finaliseCase(uint256 caseId) external onlyRole(APPEAL_ROLE) nonReentrant {
        Case storage c = cases[caseId];
        require(c.status == CaseStatus.OnAppeal || c.status == CaseStatus.Sentenced, "JusticeProtocol: wrong status");
        c.status = CaseStatus.Final;
        c.isAppealable = false;
        emit CaseFinalised(caseId, block.timestamp);
    }

    function approveJudge(address judge) external onlyRole(KERNEL_ROLE) {
        require(judge != address(0), "JusticeProtocol: invalid judge");
        approvedJudges[judge] = true;
        _grantRole(JUDGE_ROLE, judge);
    }

    function getCase(uint256 caseId) external view returns (Case memory) { return cases[caseId]; }
    function getJudgmentSignature(uint256 caseId) external view returns (JudgmentSignature memory) { return judgmentSignatures[caseId]; }
    function isCaseFinalised(uint256 caseId) external view returns (bool) { return cases[caseId].status == CaseStatus.Final; }
}