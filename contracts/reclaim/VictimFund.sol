// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VictimFund
 * @dev گنجینه حمایت از آسیب‌دیدگان
 * - درآمد کار جبرانی محکومان به این گنجینه واریز می‌شود
 * - پرداخت مستقیم غرامت به قربانیان مستقیم فساد و سرکوب
 * - حمایت از خانواده‌های زندانیان سیاسی سابق
 * - مستقل از دولت اداره می‌شود
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract VictimFund is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE      = keccak256("KERNEL_ROLE");
    bytes32 public constant PENAL_LABOR_ROLE = keccak256("PENAL_LABOR_ROLE");
    bytes32 public constant COURT_ROLE       = keccak256("COURT_ROLE");
    bytes32 public constant COUNCIL_ROLE     = keccak256("COUNCIL_ROLE");

    enum VictimCategory { DirectCorruption, PoliticalPrisoner, StructuralHarm, TortureVictim, PropertySeizure }

    struct VictimRecord {
        address        victim;
        VictimCategory category;
        uint256        caseId;
        uint256        approvedAmount;
        uint256        paidAmount;
        uint256        registeredAt;
        bool           isActive;
        bool           fullyCompensated;
    }

    struct IncomingPayment {
        address source;
        uint256 amount;
        uint256 timestamp;
        string  description;
    }

    mapping(uint256 => VictimRecord)    public victimRecords;
    mapping(uint256 => IncomingPayment) public incomingPayments;
    uint256 public victimCount;
    uint256 public paymentCount;
    uint256 public totalBalance;
    uint256 public totalPaid;

    event VictimRegistered(uint256 indexed victimId, address victim, VictimCategory category, uint256 approvedAmount);
    event CompensationPaid(uint256 indexed victimId, address victim, uint256 amount, uint256 timestamp);
    event FundsReceived(address indexed source, uint256 amount, string description);
    event VictimFullyCompensated(uint256 indexed victimId, address victim);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring, such as granting COURT_ROLE/COUNCIL_ROLE/
    // PENAL_LABOR_ROLE, is reachable on mainnet). _kernel receives only
    // KERNEL_ROLE, recording the Kernel contract's identity without relying
    // on it to ever originate a transaction here (Kernel has no call-forwarding
    // mechanism to this contract). Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "VictimFund: invalid admin");
        require(_kernel != address(0), "VictimFund: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function registerVictim(address victim, VictimCategory category, uint256 caseId, uint256 approvedAmount) external onlyRole(COURT_ROLE) nonReentrant returns (uint256 victimId) {
        require(victim != address(0), "VictimFund: invalid victim");
        require(approvedAmount > 0,   "VictimFund: zero amount");
        victimCount++; victimId = victimCount;
        victimRecords[victimId] = VictimRecord({ victim: victim, category: category, caseId: caseId, approvedAmount: approvedAmount, paidAmount: 0, registeredAt: block.timestamp, isActive: true, fullyCompensated: false });
        emit VictimRegistered(victimId, victim, category, approvedAmount);
        return victimId;
    }

    function receiveFunds(uint256 amount, string calldata description) external nonReentrant {
        require(hasRole(PENAL_LABOR_ROLE, msg.sender) || hasRole(COUNCIL_ROLE, msg.sender) || hasRole(KERNEL_ROLE, msg.sender), "VictimFund: unauthorized");
        require(amount > 0, "VictimFund: zero amount");
        totalBalance += amount;
        paymentCount++;
        incomingPayments[paymentCount] = IncomingPayment({ source: msg.sender, amount: amount, timestamp: block.timestamp, description: description });
        emit FundsReceived(msg.sender, amount, description);
    }

    function payCompensation(uint256 victimId, uint256 amount) external onlyRole(COUNCIL_ROLE) nonReentrant {
        VictimRecord storage vr = victimRecords[victimId];
        require(vr.isActive,                              "VictimFund: not active");
        require(!vr.fullyCompensated,                     "VictimFund: compensated");
        require(amount > 0,                               "VictimFund: zero amount");
        require(vr.paidAmount + amount <= vr.approvedAmount, "VictimFund: exceeds approved");
        require(totalBalance >= amount,                   "VictimFund: insufficient");
        vr.paidAmount  += amount;
        totalBalance   -= amount;
        totalPaid      += amount;
        emit CompensationPaid(victimId, vr.victim, amount, block.timestamp);
        if (vr.paidAmount >= vr.approvedAmount) {
            vr.fullyCompensated = true;
            emit VictimFullyCompensated(victimId, vr.victim);
        }
    }

    function getVictimRecord(uint256 victimId) external view returns (VictimRecord memory) { return victimRecords[victimId]; }
    function getRemainingCompensation(uint256 victimId) external view returns (uint256) {
        VictimRecord storage vr = victimRecords[victimId];
        return vr.approvedAmount > vr.paidAmount ? vr.approvedAmount - vr.paidAmount : 0;
    }
    function getFundBalance() external view returns (uint256) { return totalBalance; }
}