// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
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

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "BudgetAllocation: invalid admin");
        require(_kernel != address(0), "BudgetAllocation: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        currentFiscalYear = 1404;
    }

    /**
     * @notice تصویب بودجه سالانه — فقط مجلس مجاز
     * @param fiscalYear سال مالی (شمسی)
     */
    function approveBudget(uint256 fiscalYear) external onlyRole(PARLIAMENT_ROLE) nonReentrant {
        require(fiscalYear >= currentFiscalYear, "BudgetAllocation: invalid year");
        require(!budgetApproved, "BudgetAllocation: approved");
        sectorBudgets[uint8(Sector.Health)]         = SectorBudget(Sector.Health,         (TOTAL_BUDGET * HEALTH_RATIO)         / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Education)]      = SectorBudget(Sector.Education,      (TOTAL_BUDGET * EDUCATION_RATIO)      / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Defense)]        = SectorBudget(Sector.Defense,        (TOTAL_BUDGET * DEFENSE_RATIO)        / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Infrastructure)] = SectorBudget(Sector.Infrastructure, (TOTAL_BUDGET * INFRASTRUCTURE_RATIO) / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Welfare)]        = SectorBudget(Sector.Welfare,        (TOTAL_BUDGET * WELFARE_RATIO)        / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Justice)]        = SectorBudget(Sector.Justice,        (TOTAL_BUDGET * JUSTICE_RATIO)        / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Environment)]    = SectorBudget(Sector.Environment,    (TOTAL_BUDGET * ENVIRONMENT_RATIO)    / 1000, 0, fiscalYear, false);
        sectorBudgets[uint8(Sector.Administration)] = SectorBudget(Sector.Administration, (TOTAL_BUDGET * ADMINISTRATION_RATIO) / 1000, 0, fiscalYear, false);
        budgetApproved    = true;
        currentFiscalYear = fiscalYear;
        emit BudgetApproved(fiscalYear, TOTAL_BUDGET, block.timestamp);
    }

    /**
     * @notice دریافت اطلاعات بودجه یک بخش
     * @param sectorId شناسه بخش (۰=بهداشت … ۷=اداری)
     */
    function getSectorBudget(uint8 sectorId) external view returns (SectorBudget memory) {
        return sectorBudgets[sectorId];
    }

    /**
     * @notice ثبت هزینه — فقط دولت مجاز
     * @param sectorId بخش مربوطه
     * @param amount مقدار (در واحد ۱e18)
     * @param description شرح هزینه
     */
    function recordExpenditure(uint8 sectorId, uint256 amount, string calldata description) external onlyRole(GOVERNMENT_ROLE) nonReentrant {
        require(budgetApproved,                            "BudgetAllocation: not approved");
        SectorBudget storage sb = sectorBudgets[sectorId];
        require(!sb.isLocked,                              "BudgetAllocation: locked by Trigger");
        require(amount > 0,                                "BudgetAllocation: zero amount");
        require(sb.spent + amount <= sb.allocated,         "BudgetAllocation: exceeds budget");
        expenditureCount++;
        expenditures[expenditureCount] = Expenditure({
            initiator:   msg.sender,
            sector:      Sector(sectorId),
            amount:      amount,
            description: description,
            timestamp:   block.timestamp,
            approved:    false,
            flagged:     false
        });
        sb.spent += amount;
        emit ExpenditureRecorded(expenditureCount, Sector(sectorId), amount);
    }

    /**
     * @notice پرچم‌گذاری هزینه مشکوک — فقط حسابرس مجاز
     * @param expId شناسه هزینه
     * @param reason دلیل پرچم‌گذاری
     */
    function flagExpenditure(uint256 expId, string calldata reason) external onlyRole(AUDITOR_ROLE) {
        require(expId > 0 && expId <= expenditureCount, "BudgetAllocation: invalid expId");
        expenditures[expId].flagged = true;
        emit ExpenditureFlagged(expId, reason);
    }

    /**
     * @notice قفل کردن بودجه بخش — فقط Kernel (از طریق ماشه)
     * @param sectorId بخش مربوطه
     * @param reason دلیل قفل
     */
    function lockSectorBudget(uint8 sectorId, string calldata reason) external onlyRole(KERNEL_ROLE) {
        sectorBudgets[sectorId].isLocked = true;
        emit SectorBudgetLocked(Sector(sectorId), reason);
    }
}
