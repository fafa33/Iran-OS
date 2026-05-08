// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MonetaryPolicy
 * @dev سیاست پولی — انضباط پولی و نگهداشت سقف نقدینگی
 * - سقف ۹۰۰ میلیارد پهلوی قفل سخت‌افزاری دارد
 * - نسبت پشتوانه حداقل ۳۳.۳٪
 * - بانک مرکزی حق وام‌دهی به دولت را ندارد
 * - Proof of Reserve پیش از هر انتشار الزامی است
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract MonetaryPolicy is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE       = keccak256("KERNEL_ROLE");
    bytes32 public constant CENTRAL_BANK_ROLE = keccak256("CENTRAL_BANK_ROLE");
    bytes32 public constant SWF_ROLE          = keccak256("SWF_ROLE");
    bytes32 public constant ORACLE_ROLE       = keccak256("ORACLE_ROLE");

    uint256 public constant LIQUIDITY_CAP     = 900_000_000_000 * 1e18;
    uint256 public constant MIN_RESERVE_RATIO = 333;
    uint256 public constant TARGET_PAH_USD    = 1e18;

    uint256 public currentCirculation;
    uint256 public currentReserves;
    uint256 public pahlaviUSDRate;
    uint256 public lastProofOfReserve;
    bool    public mintingPaused;

    struct MintRequest {
        address requester;
        uint256 amount;
        uint256 reserveProof;
        uint256 timestamp;
        bool    approved;
        bool    executed;
        string  rejectionReason;
    }

    mapping(uint256 => MintRequest) public mintRequests;
    uint256 public mintRequestCount;

    event MintRequested(uint256 indexed requestId, uint256 amount, uint256 reserveProof);
    event MintApproved(uint256 indexed requestId, uint256 amount);
    event MintRejected(uint256 indexed requestId, string reason);
    event ReservesUpdated(uint256 newReserves, uint256 newRatio, uint256 timestamp);
    event PahlaviRateUpdated(uint256 newRate, uint256 timestamp);
    event MintingPaused(uint256 timestamp);
    event MintingResumed(uint256 timestamp);

    modifier mintingActive() {
        require(!mintingPaused, "MonetaryPolicy: minting paused");
        _;
    }

    modifier reserveCompliant(uint256 mintAmount) {
        uint256 newCirculation = currentCirculation + mintAmount;
        require(newCirculation <= LIQUIDITY_CAP, "MonetaryPolicy: exceeds 900B hard cap");
        if (newCirculation > 0) {
            uint256 ratio = (currentReserves * 1000) / newCirculation;
            require(ratio >= MIN_RESERVE_RATIO, "MonetaryPolicy: reserve below 33.3%");
        }
        _;
    }

    constructor(address _kernel) {
        require(_kernel != address(0), "MonetaryPolicy: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
        pahlaviUSDRate = TARGET_PAH_USD;
    }

    function requestMint(uint256 amount, uint256 reserveProof) external onlyRole(SWF_ROLE) nonReentrant mintingActive reserveCompliant(amount) returns (uint256 requestId) {
        require(amount > 0, "MonetaryPolicy: zero amount");
        require(block.timestamp - lastProofOfReserve <= 24 hours, "MonetaryPolicy: proof expired");
        mintRequestCount++; requestId = mintRequestCount;
        mintRequests[requestId] = MintRequest({ requester: msg.sender, amount: amount, reserveProof: reserveProof, timestamp: block.timestamp, approved: false, executed: false, rejectionReason: "" });
        emit MintRequested(requestId, amount, reserveProof);
        return requestId;
    }

    function approveMint(uint256 requestId) external onlyRole(KERNEL_ROLE) nonReentrant {
        MintRequest storage req = mintRequests[requestId];
        require(req.timestamp > 0, "MonetaryPolicy: not found");
        require​​​​​​​​​​​​​​​​
