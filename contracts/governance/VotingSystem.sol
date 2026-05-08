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

    mapping(uint256 => Election)                          public elections;
    mapping(uint256 => mapping(uint256 => Candidate))     public candidates;
    mapping(uint256 => mapping(bytes32 => bool))          public hasVoted;
    mapping(uint256 => uint256)                           public candidateCount;
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

    function createElection(ElectionType electionType, uint256 provinceId, string calldata description, uint256 startTime, uint256 endTime, uint256 totalEligibleVoters) external onlyRole(ELECTION_ROLE) nonReentrant returns (uint256 electionId) {
        require(startTime > block.timestamp, "VotingSystem: invalid start");
        require(endTime > startTime, "VotingSystem: invalid end");
        require(totalEligibleVoters > 0, "VotingSystem: zero voters");
        electionCou