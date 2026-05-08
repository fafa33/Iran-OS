// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BudgetAllocation
 * @dev تخصیص و نظارت بودجه عمومی
 * - بودجه ۱۵۰ میلیارد پهلوی از صندوق ثروت ملی
 * - مجلس بر جریان خروج نقدینگی نظارت لحظه‌ای دارد
 * - قراردادهای هوشمند تضمین می‌کنند اعتبار هر سرفصل منحصراً در همان مسیر خرج شود
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract BudgetAllocation is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE     = keccak256("KERNEL_ROLE");
    bytes32 public constant PARLIAMENT_ROLE = keccak256("PARLIAMENT_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    bytes32 public constant AUDITOR_ROLE    = keccak256("AUDITOR_ROLE");
    bytes32 public constant ORACLE_ROLE     = keccak256("ORACLE_ROLE");

    uint256 public constant TOTAL_BUDGET         = 150_000_000_000 * 1e18;
    uint256 public constant HEALTH_RATIO         = 200;
    uint256 public constant EDUCATION_RATIO      = 200;
    uint256 public constant DEFENSE_RATIO        = 150;
    uint256 public constant INFRASTRUCTURE_RATIO = 150;
    uint256 public constant WELFARE_RATIO        = 100;
    uint256 public constant JUSTICE_RATIO        = 100;
    uint256 public constant ENVIRONMENT_RATIO    =  50;
    uint256 public constant ADMINISTRATION_RATIO =  50;

    enum Sector { Health, Education, Defense, Infrastructure, Welfare, Justice, Environment, Administration }

    struct SectorBudget {
        Sector  sector;
        uint256 allocated;
        uint256 spent;
        uint256 fiscalYear;
        bool    isLocked;
    }

    struct Expenditure {
        address initiator;
        Sector  sector;
        uint256 amount;
        string  description;
        uint256 timestamp;
        bool    approved;
        bool    flagged;
    }

    mapping(uint8 => SectorBudget)  public sectorBudgets;
    mapping(uint256 => Expenditure) public expenditures;
    uint256 public expenditureCount;
    uint256 public currentFiscalYear;
    bool    public budgetApproved;

    event BudgetApproved(uint256 fiscalYear, uint256 totalAmount, uint256 timestamp);
    event ExpenditureRecorded(uint256 indexed expId, Sector sector, uint256 amount);
    event ExpenditureFlagged(uint256 indexed expId, string reason);
    event SectorBudgetLocked(Sector sector, string reason);

    constructor(address _kernel) {
        require(_kernel != address(0), "BudgetAllocation: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
        currentFiscalYear = 1404;
    }

    function approveBudget(uint256 fiscalYear) external onlyRole(PARLIAMENT_ROLE) nonReentrant {
        require(fiscalYear >= currentFiscalYear, "BudgetAllocation: invalid year");
        require(!budgetApproved, "BudgetAllocation: approved");
        sectorBudgets[uint8(Sector.Health)]         = SectorBudget(Sector.Health,         (TOTAL_BUDGET * HEALTH_RATIO) / 1000,         0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Education)]