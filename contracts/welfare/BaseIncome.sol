// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BaseIncome
 * @dev مدیریت حداقل حقوق پایه — ۱۰۰۰ پهلوی
 * - حداقل حقوق توسط کارفرما پرداخت می‌شود — نه دولت
 * - صندوق ثروت ملی پشتوانه ارزش پهلوی است
 * - مالیات بر درآمد حداقل حقوق پایه حذف شده است
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract BaseIncome is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant ORACLE_ROLE   = keccak256("ORACLE_ROLE");
    bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    bytes32 public constant SWF_ROLE      = keccak256("SWF_ROLE");

    uint256 public constant MIN_WAGE       = 1000 * 1e18;
    uint256 public constant TAX_EXEMPT_CAP = 1000 * 1e18;

    struct EmployerRecord {
        address employer;
        uint256 employeeCount;
        uint256 totalPaidThisMonth;
        uint256 lastPaymentTime;
        bool    isCompliant;
        bool    receivesSubsidy;
        uint256 subsidyAmount;
        bool    isRegistered;
    }

    struct PaymentRecord {
        address employer;
        address employee;
        uint256 amount;
        uint256 timestamp;
        bool    meetsMinWage;
    }

    mapping(address => EmployerRecord) public employers;
    mapping(uint256 => PaymentRecord)  public paymentRecords;
    uint256 public paymentCount;
    uint256 public totalCompliantEmployers;
    uint256 public totalNonCompliantEmployers;

    event EmployerRegistered(address indexed employer, uint256 employeeCount);
    event WagePaymentRecorded(uint256 indexed paymentId, address indexed employer, address indexed employee, uint256 amount, bool meetsMinWage);
    event EmployerNonCompliant(address indexed employer, uint256 shortfall);
    event SubsidyGranted(address indexed employer, uint256 amount);
    event SubsidyRevoked(address indexed employer);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "BaseIncome: invalid admin");
        require(_kernel != address(0), "BaseIncome: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function registerEmployer(address employer, uint256 employeeCount) external onlyRole(ORACLE_ROLE) nonReentrant {
        require(employer != address(0), "BaseIncome: invalid employer");
        require(employeeCount > 0, "BaseIncome: zero employees");
        require(!employers[employer].isRegistered, "BaseIncome: registered");
        employers[employer] = EmployerRecord({ employer: employer, employeeCount: employeeCount, totalPaidThisMonth: 0, lastPaymentTime: 0, isCompliant: true, receivesSubsidy: false, subsidyAmount: 0, isRegistered: true });
        _grantRole(EMPLOYER_ROLE, employer);
        emit EmployerRegistered(employer, employeeCount);
    }

    function recordWagePayment(address employee, uint256 amount) external onlyRole(EMPLOYER_ROLE) nonReentrant returns (uint256 paymentId) {
        require(employee != address(0), "BaseIncome: invalid employee");
        require(amount > 0, "BaseIncome: zero amount");
        EmployerRecord storage emp = employers[msg.sender];
        require(emp.isRegistered, "BaseIncome: not registered");
        bool meetsMinWage = amount >= MIN_WAGE;
        paymentCount++; paymentId = paymentCount;
        paymentRecords[paymentId] = PaymentRecord({ employer: msg.sender, employee: employee, amount: amount, timestamp: block.timestamp, meetsMinWage: meetsMinWage });
        emp.totalPaidThisMonth += amount;
        emp.lastPaymentTime = block.timestamp;
        if (!meetsMinWage) {
            emp.isCompliant = false;
            totalNonCompliantEmployers++;
            emit EmployerNonCompliant(msg.sender, MIN_WAGE - amount);
        } else {
            if (!emp.isCompliant) totalCompliantEmployers++;
            emp.isCompliant = true;
        }
        emit WagePaymentRecorded(paymentId, msg.sender, employee, amount, meetsMinWage);
        return paymentId;
    }

    function grantSubsidy(address employer, uint256 amount) external onlyRole(SWF_ROLE) nonReentrant {
        require(employers[employer].isRegistered, "BaseIncome: not registered");
        require(amount > 0, "BaseIncome: zero subsidy");
        employers[employer].receivesSubsidy = true;
        employers[employer].subsidyAmount = amount;
        emit SubsidyGranted(employer, amount);
    }

    function revokeSubsidy(address employer) external onlyRole(SWF_ROLE) {
        require(employers[employer].isRegistered, "BaseIncome: not registered");
        employers[employer].receivesSubsidy = false;
        employers[employer].subsidyAmount = 0;
        emit SubsidyRevoked(employer);
    }

    function getEmployerRecord(address employer) external view returns (EmployerRecord memory) { return employers[employer]; }
    function getPaymentRecord(uint256 paymentId) external view returns (PaymentRecord memory) { return paymentRecords[paymentId]; }
    function isWageTaxExempt(uint256 amount) external pure returns (bool) { return amount <= TAX_EXEMPT_CAP; }
}
