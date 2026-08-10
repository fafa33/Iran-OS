// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Parliament
 * @dev مجلس شورای ملی دیجیتال — فرگرد ۴ منشور
 * - قوانین به صورت نسخه‌دار ثبت می‌شوند
 * - آرای نمایندگان در بلاک‌چین ثبت می‌شود (شفافیت کامل)
 * - مصونیت پارلمانی نمایندگان
 * - توشیح قوانین نیازمند دستینه دیجیتال پادشاه است
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract Parliament is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE    = keccak256("KERNEL_ROLE");
    bytes32 public constant MP_ROLE        = keccak256("MP_ROLE");
    bytes32 public constant SOVEREIGN_ROLE = keccak256("SOVEREIGN_ROLE");
    bytes32 public constant SPEAKER_ROLE   = keccak256("SPEAKER_ROLE");

    uint256 public constant REVIEW_PERIOD = 10 days;
    uint256 public constant BUDGET_CAP    = 150_000_000_000 * 1e18;

    enum LawStatus { Draft, Voting, PassedByParliament, RoyalReview, Enacted, Vetoed, ReturnedForRevision }

    struct Law {
        bytes32   contentHash;
        string    title;
        address   proposer;
        uint256   version;
        LawStatus status;
        uint256   votesFor;
        uint256   votesAgainst;
        uint256   proposedAt;
        uint256   enactedAt;
        bool      isBudgetLaw;
        string    rejectionReason;
    }

    struct MPVote {
        bool    hasVoted;
        bool    inFavor;
        uint256 timestamp;
    }

    uint256 public lawCount;
    uint256 public totalMPs;
    uint256 public currentFiscalYear;

    mapping(uint256 => Law)                        public laws;
    mapping(uint256 => mapping(address => MPVote)) public lawVotes;
    mapping(address => bool)                       public immuneMembers;
    mapping(bytes32 => uint256)                    public lawVersions;

    event LawProposed(uint256 indexed lawId, bytes32 contentHash, string title, address proposer);
    event VoteCast(uint256 indexed lawId, address indexed mp, bool inFavor);
    event LawPassedByParliament(uint256 indexed lawId, uint256 votesFor, uint256 votesAgainst);
    event LawEnacted(uint256 indexed lawId, uint256 timestamp);
    event LawVetoed(uint256 indexed lawId, string reason);
    event LawReturnedForRevision(uint256 indexed lawId, string reason);
    event MPImmunityGranted(address indexed mp);
    event NoConfidenceVote(address government, uint256 votesFor, uint256 votesAgainst);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "Parliament: invalid admin");
        require(_kernel != address(0), "Parliament: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        currentFiscalYear = 1404;
    }

    function registerMP(address mp) external onlyRole(KERNEL_ROLE) nonReentrant {
        require(mp != address(0), "Parliament: invalid MP");
        _grantRole(MP_ROLE, mp);
        immuneMembers[mp] = true;
        totalMPs++;
        emit MPImmunityGranted(mp);
    }

    function proposeLaw(bytes32 contentHash, string calldata title, bool isBudgetLaw) external onlyRole(MP_ROLE) nonReentrant returns (uint256 lawId) {
        require(contentHash != bytes32(0), "Parliament: invalid hash");
        require(bytes(title).length > 0, "Parliament: empty title");
        lawVersions[contentHash]++;
        lawCount++; lawId = lawCount;
        laws[lawId] = Law({ contentHash: contentHash, title: title, proposer: msg.sender, version: lawVersions[contentHash], status: LawStatus.Voting, votesFor: 0, votesAgainst: 0, proposedAt: block.timestamp, enactedAt: 0, isBudgetLaw: isBudgetLaw, rejectionReason: "" });
        emit LawProposed(lawId, contentHash, title, msg.sender);
        return lawId;
    }

    function castVote(uint256 lawId, bool inFavor) external onlyRole(MP_ROLE) nonReentrant {
        Law storage law = laws[lawId];
        require(law.status == LawStatus.Voting, "Parliament: not voting");
        require(!lawVotes[lawId][msg.sender].hasVoted, "Parliament: voted");
        lawVotes[lawId][msg.sender] = MPVote({ hasVoted: true, inFavor: inFavor, timestamp: block.timestamp });
        if (inFavor) { law.votesFor++; } else { law.votesAgainst++; }
        emit VoteCast(lawId, msg.sender, inFavor);
        if (law.votesFor > totalMPs / 2) {
            law.status = LawStatus.PassedByParliament;
            emit LawPassedByParliament(lawId, law.votesFor, law.votesAgainst);
        }
    }

    function enactLaw(uint256 lawId) external onlyRole(SOVEREIGN_ROLE) nonReentrant {
        Law storage law = laws[lawId];
        require(law.status == LawStatus.PassedByParliament || law.status == LawStatus.RoyalReview, "Parliament: wrong status");
        law.status = LawStatus.Enacted;
        law.enactedAt = block.timestamp;
        emit LawEnacted(lawId, block.timestamp);
    }

    function vetoLaw(uint256 lawId, string calldata reason) external onlyRole(SOVEREIGN_ROLE) nonReentrant {
        Law storage law = laws[lawId];
        require(law.status == LawStatus.PassedByParliament, "Parliament: cannot veto");
        law.status = LawStatus.Vetoed;
        law.rejectionReason = reason;
        emit LawVetoed(lawId, reason);
    }

    function returnForRevision(uint256 lawId, string calldata reason) external onlyRole(SOVEREIGN_ROLE) nonReentrant {
        Law storage law = laws[lawId];
        require(law.status == LawStatus.PassedByParliament, "Parliament: cannot return");
        law.status = LawStatus.ReturnedForRevision;
        law.rejectionReason = reason;
        emit LawReturnedForRevision(lawId, reason);
    }

    function voteNoConfidence(address government, bool inFavor) external onlyRole(MP_ROLE) nonReentrant {
        require(government != address(0), "Parliament: invalid government");
        emit NoConfidenceVote(government, inFavor ? 1 : 0, inFavor ? 0 : 1);
    }

    function getLaw(uint256 lawId) external view returns (Law memory) { return laws[lawId]; }
    function getMPVote(uint256 lawId, address mp) external view returns (MPVote memory) { return lawVotes[lawId][mp]; }
    function hasImmunity(address mp) external view returns (bool) { return immuneMembers[mp]; }
}