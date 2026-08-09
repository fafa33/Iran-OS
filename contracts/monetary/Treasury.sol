// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @dev خزانه‌داری ملی ایران‌اواس
 * - سقف بودجه سالانه دولت: ۱۵۰ میلیارد پهلوی (مصوب مجلس)
 * - تمام تراکنش‌ها شفاف و در بلاک‌چین ثبت می‌شوند (Glass Box)
 * - هیچ برداشتی خارج از ردیف‌های مصوب مجاز نیست
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract Treasury is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE     = keccak256("KERNEL_ROLE");
    bytes32 public constant PARLIAMENT_ROLE = keccak256("PARLIAMENT_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant AUDITOR_ROLE    = keccak256("AUDITOR_ROLE");
    bytes32 public constant SWF_ROLE        = keccak256("SWF_ROLE");

    uint256 public constant ANNUAL_BUDGET_CAP  = 150_000_000_000 * 1e18;
    uint256 public constant MULTISIG_THRESHOLD = 3;

    enum BudgetCategory { Health, Education, Defense, Infrastructure, Welfare, Justice, Environment, Administration }

    struct BudgetLine {
        BudgetCategory category;
        uint256        allocated;
        uint256        spent;
        uint256        fiscalYear;
        bool           isActive;
    }

    struct TreasuryTransaction {
        address        initiator;
        address        recipient;
        uint256        amount;
        uint256        budgetLineId;
        string         description;
        uint256        timestamp;
        uint8          signaturesCount;
        bool           executed;
        bool           rejected;
    }

    uint256 public currentFiscalYear;
    uint256 public totalBudgetAllocated;
    uint256 public txCount;
    uint256 public budgetLineCount;

    mapping(uint256 => BudgetLine)          public budgetLines;
    mapping(uint256 => TreasuryTransaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public txSignatures;
    mapping(address => bool)                public blockedByTrigger;

    event BudgetLineCreated(uint256 indexed lineId, BudgetCategory category, uint256 amount);
    event TransactionProposed(uint256 indexed txId, address recipient, uint256 amount, uint256 budgetLineId);
    event TransactionSigned(uint256 indexed txId, address signer, uint8 sigCount);
    event TransactionExecuted(uint256 indexed txId, address recipient, uint256 amount);
    event TransactionRejected(uint256 indexed txId, string reason);
    event AddressBlockedByTrigger(address indexed target);
    event FiscalYearStarted(uint256 year, uint256 timestamp);

    modifier notBlocked(address addr) {
        require(!blockedByTrigger[addr], "Treasury: address blocked by Trigger Protocol");
        _;
    }

    modifier withinBudget(uint256 lineId, uint256 amount) {
        BudgetLine storage line = budgetLines[lineId];
        require(line.isActive, "Treasury: budget line not active");
        require(line.fiscalYear == currentFiscalYear, "Treasury: wrong fiscal year");
        require(line.spent + amount <= line.allocated, "Treasury: exceeds budget line");
        _;
    }

    // _admin receives DEFAULT_ADMIN_ROLE (a real signer, e.g. the Sovereign,
    // so post-deploy role wiring — such as granting KERNEL_ROLE to
    // TriggerProtocol so it can call blockAddressByTrigger() — is reachable
    // on mainnet). _kernel continues to receive only KERNEL_ROLE, recording
    // the Kernel contract's identity without relying on it to ever originate
    // a transaction here (contracts/kernel.sol has no call-forwarding
    // mechanism to this contract). Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "Treasury: invalid admin");
        require(_kernel != address(0), "Treasury: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        currentFiscalYear = 1404;
        emit FiscalYearStarted(currentFiscalYear, block.timestamp);
    }

    function createBudgetLine(BudgetCategory category, uint256 amount) external onlyRole(PARLIAMENT_ROLE) nonReentrant {
        require(amount > 0, "Treasury: zero amount");
        require(totalBudgetAllocated + amount <= ANNUAL_BUDGET_CAP, "Treasury: exceeds 150B cap");
        budgetLineCount++;
        budgetLines[budgetLineCount] = BudgetLine({ category: category, allocated: amount, spent: 0, fiscalYear: currentFiscalYear, isActive: true });
        totalBudgetAllocated += amount;
        emit BudgetLineCreated(budgetLineCount, category, amount);
    }

    function proposeTransaction(address recipient, uint256 amount, uint256 budgetLineId, string calldata description) external onlyRole(GOVERNMENT_ROLE) nonReentrant notBlocked(recipient) withinBudget(budgetLineId, amount) returns (uint256 txId) {
        require(recipient != address(0), "Treasury: invalid recipient");
        require(amount > 0, "Treasury: zero amount");
        txCount++; txId = txCount;
        transactions[txId] = TreasuryTransaction({ initiator: msg.sender, recipient: recipient, amount: amount, budgetLineId: budgetLineId, description: description, timestamp: block.timestamp, signaturesCount: 1, executed: false, rejected: false });
        txSignatures[txId][msg.sender] = true;
        emit TransactionProposed(txId, recipient, amount, budgetLineId);
        return txId;
    }

    function signTransaction(uint256 txId) external onlyRole(AUDITOR_ROLE) nonReentrant {
        TreasuryTransaction storage tx_ = transactions[txId];
        require(tx_.timestamp > 0, "Treasury: not found");
        require(!tx_.executed, "Treasury: executed");
        require(!tx_.rejected, "Treasury: rejected");
        require(!txSignatures[txId][msg.sender], "Treasury: already signed");
        require(!blockedByTrigger[tx_.recipient], "Treasury: recipient blocked");
        txSignatures[txId][msg.sender] = true;
        tx_.signaturesCount++;
        emit TransactionSigned(txId, msg.sender, tx_.signaturesCount);
        if (tx_.signaturesCount >= MULTISIG_THRESHOLD) {
            tx_.executed = true;
            budgetLines[tx_.budgetLineId].spent += tx_.amount;
            emit TransactionExecuted(txId, tx_.recipient, tx_.amount);
        }
    }

    function rejectTransaction(uint256 txId, string calldata reason) external nonReentrant {
        require(hasRole(AUDITOR_ROLE, msg.sender) || hasRole(KERNEL_ROLE, msg.sender), "Treasury: unauthorized");
        require(!transactions[txId].executed, "Treasury: executed");
        require(!transactions[txId].rejected, "Treasury: rejected");
        transactions[txId].rejected = true;
        emit TransactionRejected(txId, reason);
    }

    function blockAddressByTrigger(address target) external onlyRole(KERNEL_ROLE) {
        blockedByTrigger[target] = true;
        emit AddressBlockedByTrigger(target);
    }

    function startNewFiscalYear(uint256 newYear) external onlyRole(PARLIAMENT_ROLE) {
        require(newYear > currentFiscalYear, "Treasury: invalid year");
        currentFiscalYear = newYear;
        totalBudgetAllocated = 0;
        emit FiscalYearStarted(newYear, block.timestamp);
    }

    function getBudgetLine(uint256 lineId) external view returns (BudgetLine memory) { return budgetLines[lineId]; }
    function getTransaction(uint256 txId) external view returns (TreasuryTransaction memory) { return transactions[txId]; }
    function getRemainingCapacity() external view returns (uint256) { return ANNUAL_BUDGET_CAP - totalBudgetAllocated; }
    function isBlocked(address addr) external view returns (bool) { return blockedByTrigger[addr]; }
}
