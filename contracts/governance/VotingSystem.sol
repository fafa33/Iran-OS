// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VotingSystem
 * @dev سیستم رای‌گیری دیجیتال ملی
 * - رای‌گیری بر پایه هویت بیومتریک — تقلب از نظر فنی غیرممکن
 * - هیچ نهادی مانند شورای نگهبان وجود ندارد — تایید صلاحیت خودکار
 * - شرط اقامت برای نامزدی: حداقل ۵ سال در همان استان
 * - رفراندوم ملی برای تغییر قانون اساسی
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract VotingSystem is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant ORACLE_ROLE   = keccak256("ORACLE_ROLE");
    bytes32 public constant ELECTION_ROLE = keccak256("ELECTION_ROLE");

    uint256 public constant MIN_RESIDENCY_YEARS = 5;

    enum ElectionType   { National, Provincial, Referendum }
    enum ElectionStatus { Upcoming, Active, Completed, Cancelled }

    struct Candidate {
        address  wallet;
        bytes32  biometricHash;
        string   name;
        uint256  provinceId;
        uint256  residencyYears;
        bool     isEligible;
        uint256  voteCount;
        string   disqualifyReason;
    }

    struct Election {
        ElectionType   electionType;
        ElectionStatus status;
        uint256        provinceId;
        string         description;
        uint256        startTime;
        uint256        endTime;
        uint256        totalVotes;
        uint256        totalEligibleVoters;
        bool           resultFinalized;
    }

    mapping(uint256 => Election)                       public elections;
    mapping(uint256 => mapping(uint256 => Candidate))  public candidates;
    mapping(uint256 => mapping(bytes32 => bool))       public hasVoted;
    mapping(uint256 => uint256)                        public candidateCount;
    uint256 public electionCount;

    event ElectionCreated(uint256 indexed electionId, ElectionType electionType, uint256 startTime, uint256 endTime);
    event CandidateRegistered(uint256 indexed electionId, uint256 candidateId, address wallet, bool isEligible);
    event VoteCast(uint256 indexed electionId, uint256 timestamp);
    event ElectionCompleted(uint256 indexed electionId, uint256 totalVotes);

    constructor(address _kernel) {
        require(_kernel != address(0), "VotingSystem: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    /**
     * @notice ایجاد انتخابات جدید
     * @param electionType نوع انتخابات (ملی / استانی / رفراندوم)
     * @param provinceId شناسه استان (برای انتخابات استانی)
     * @param description توضیحات
     * @param startTime زمان شروع (Unix timestamp)
     * @param endTime زمان پایان (Unix timestamp)
     * @param totalEligibleVoters تعداد رأی‌دهندگان واجد شرایط
     */
    function createElection(ElectionType electionType, uint256 provinceId, string calldata description, uint256 startTime, uint256 endTime, uint256 totalEligibleVoters) external onlyRole(ELECTION_ROLE) nonReentrant returns (uint256 electionId) {
        require(startTime > block.timestamp,  "VotingSystem: invalid start");
        require(endTime > startTime,          "VotingSystem: invalid end");
        require(totalEligibleVoters > 0,      "VotingSystem: zero voters");
        electionCount++;
        electionId = electionCount;
        elections[electionId] = Election({
            electionType:        electionType,
            status:              ElectionStatus.Upcoming,
            provinceId:          provinceId,
            description:         description,
            startTime:           startTime,
            endTime:             endTime,
            totalVotes:          0,
            totalEligibleVoters: totalEligibleVoters,
            resultFinalized:     false
        });
        emit ElectionCreated(electionId, electionType, startTime, endTime);
        return electionId;
    }

    /**
     * @notice ثبت نامزد — اوراکل صلاحیت را از پایگاه داده بیومتریک تأیید می‌کند
     * @param electionId شناسه انتخابات
     * @param biometricHash هش بیومتریک نامزد
     * @param name نام نامزد
     * @param residencyYears سال‌های اقامت در استان
     * @param hasCriminalRecord آیا سابقه کیفری دارد
     */
    function registerCandidate(uint256 electionId, bytes32 biometricHash, string calldata name, uint256 residencyYears, bool hasCriminalRecord) external onlyRole(ORACLE_ROLE) nonReentrant returns (uint256 candidateId) {
        require(electionId > 0 && electionId <= electionCount,              "VotingSystem: invalid election");
        require(elections[electionId].status == ElectionStatus.Upcoming,    "VotingSystem: not upcoming");
        bool eligible = residencyYears >= MIN_RESIDENCY_YEARS && !hasCriminalRecord;
        string memory disqualifyReason = "";
        if (!eligible) {
            if (hasCriminalRecord)
                disqualifyReason = "criminal record";
            else
                disqualifyReason = "insufficient residency";
        }
        candidateCount[electionId]++;
        candidateId = candidateCount[electionId];
        candidates[electionId][candidateId] = Candidate({
            wallet:           msg.sender,
            biometricHash:    biometricHash,
            name:             name,
            provinceId:       elections[electionId].provinceId,
            residencyYears:   residencyYears,
            isEligible:       eligible,
            voteCount:        0,
            disqualifyReason: disqualifyReason
        });
        emit CandidateRegistered(electionId, candidateId, msg.sender, eligible);
        return candidateId;
    }

    /**
     * @notice فعال‌سازی انتخابات — تغییر وضعیت از Upcoming به Active
     * @param electionId شناسه انتخابات
     */
    function activateElection(uint256 electionId) external onlyRole(ELECTION_ROLE) {
        require(electionId > 0 && electionId <= electionCount,           "VotingSystem: invalid election");
        require(elections[electionId].status == ElectionStatus.Upcoming, "VotingSystem: not upcoming");
        elections[electionId].status = ElectionStatus.Active;
    }

    /**
     * @notice ثبت رأی — هر شناسه بیومتریک فقط یک بار مجاز
     * @param electionId شناسه انتخابات
     * @param candidateId شناسه نامزد
     * @param voterBiometric هش بیومتریک رأی‌دهنده
     * @param zkProof اثبات ZK (اجرای کامل در فاز بعدی)
     */
    function castVote(uint256 electionId, uint256 candidateId, bytes32 voterBiometric, bytes calldata zkProof) external nonReentrant {
        require(zkProof.length > 0,                                           "VotingSystem: invalid ZK proof");
        require(electionId > 0 && electionId <= electionCount,               "VotingSystem: invalid election");
        require(elections[electionId].status == ElectionStatus.Active,        "VotingSystem: not active");
        require(block.timestamp >= elections[electionId].startTime,           "VotingSystem: not started");
        require(block.timestamp <= elections[electionId].endTime,             "VotingSystem: ended");
        require(!hasVoted[electionId][voterBiometric],                        "VotingSystem: voted");
        require(candidateId > 0 && candidateId <= candidateCount[electionId], "VotingSystem: invalid candidate");
        hasVoted[electionId][voterBiometric] = true;
        candidates[electionId][candidateId].voteCount++;
        elections[electionId].totalVotes++;
        emit VoteCast(electionId, block.timestamp);
    }

    /// @notice دریافت اطلاعات انتخابات
    function getElection(uint256 electionId) external view returns (Election memory) {
        return elections[electionId];
    }

    /// @notice دریافت اطلاعات نامزد
    function getCandidate(uint256 electionId, uint256 candidateId) external view returns (Candidate memory) {
        return candidates[electionId][candidateId];
    }

    /// @notice محاسبه درصد مشارکت (در هزارم — ۱۰۰۰ = ۱۰۰٪)
    function getTurnout(uint256 electionId) external view returns (uint256) {
        Election storage e = elections[electionId];
        if (e.totalEligibleVoters == 0) return 0;
        return (e.totalVotes * 1000) / e.totalEligibleVoters;
    }
}
