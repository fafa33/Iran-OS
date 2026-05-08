// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ProductionOracle
 * @dev اوراکل داده‌های تولید و بهره‌وری — Proof of Merit
 * - داده‌های واقعی از سامانه برق و لجستیک
 * - رتبه‌بندی: پیشران (۷۰+) | در حال گذار (۵۰-۷۰) | بحرانی (زیر ۵۰)
 * - کارگاه‌های بحرانی: حمایت رفاهی کارگران تا ۶ ماه
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract ProductionOracle is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE = keccak256("KERNEL_ROLE");
    bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");
    bytes32 public constant BANK_ROLE   = keccak256("BANK_ROLE");

    uint256 public constant PIONEER_THRESHOLD    = 70;
    uint256 public constant TRANSITION_THRESHOLD = 50;

    uint256 public constant EMPLOYMENT_WEIGHT  = 300;
    uint256 public constant VALUE_ADDED_WEIGHT = 300;
    uint256 public constant RENEWAL_WEIGHT     = 200;
    uint256 public constant COMPLIANCE_WEIGHT  = 200;

    enum ProductionCategory { Pioneer, Transition, Critical }

    struct ProductionUnit {
        address            owner;
        string             name;
        uint256            employeeCount;
        uint256            monthlyValueAdded;
        uint256            renewalCommitment;
        uint256            financialCompliance;
        uint256            compositeScore;
        ProductionCategory category;
        uint256            lastUpdated;
        bool               isEligibleForLoan;
        bool               isRegistered;
        uint256            subsidyMonthsRemaining;
    }

    struct LoanEligibility {
        address unit;
        uint256 maxLoanAmount;
        uint256 interestRate;
        uint256 eligibleAt;
        bool    approved;
    }

    mapping(address => ProductionUnit)  public productionUnits;
    mapping(uint256 => LoanEligibility) public loanEligibilities;
    address[] public allUnits;
    uint256   public eligibilityCount;
    uint256   public totalPioneerUnits;
    uint256   public totalTransitionUnits;
    uint256   public totalCriticalUnits;

    event UnitRegistered(address indexed unit, string name);
    event ProductionDataUpdated(address indexed unit, uint256 score, ProductionCategory category);
    event CategoryChanged(address indexed unit, ProductionCategory oldCategory, ProductionCategory newCategory);
    event LoanEligibilityGranted(address indexed unit, uint256 maxAmount, uint256 interestRate);
    event SubsidyGranted(address indexed unit, uint256 months);

    constructor(address _kernel) {
        require(_kernel != address(0), "ProductionOracle: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function registerUnit(address unit, string calldata name) external onlyRole(FEEDER_ROLE) nonReentrant {
        require(unit != address(0), "ProductionOracle: invalid unit");
        require(!productionUnits[unit].isRegistered, "ProductionOracle: registered");
        productionUnits[unit] = ProductionUnit({ owner: unit, name: name, employeeCount: 0, monthlyValueAdded: 0, renewalCommitment: 50, financialCompliance: 50, compositeScore: 50, category: ProductionCategory.Transition, lastUpdated: block.timestamp, isEligibleForLoan: true, isRegistered: true, subsidyMonthsRemaining: 0 });
        allUnits.push(unit);
        totalTransitionUnits++;
        emit UnitRegistered(unit, name);
    }

    function updateProductionData(address unit, uint256 employeeCount, uint256 monthlyValueAdded, uint256 renewalCommitment, uint256 financialCompliance) external onlyRole(FEEDER_ROLE) nonReentrant {
        ProductionUnit storage pu = productionUnits[unit];
        require(pu.isRegistered, "ProductionOracle: not registered");
        require(renewalCommitment <= 100, "ProductionOracle: invalid score");
        require(financialCompliance <= 100, "ProductionOracle: invalid score");
        ProductionCategory oldCategory = pu.category;
        pu.employeeCount = employeeCount;
        pu.monthlyValueAdded = monthlyValueAdded;
        pu.renewalCommitment = renewalCommitment;
        pu.financialCompliance = financialCompliance;
        pu.lastUpdated = block.timestamp;
        uint256 empScore   = employeeCount > 0 ? (employeeCount > 100 ? 100 : employeeCount) : 0;
        uint256 valueScore = monthlyValueAdded > 0 ? 100 : 0;
        pu.compositeScore = (empScore * EMPLOYMENT_WEIGHT + valueScore * VALUE_ADDED_WEIGHT + renewalCommitment * RENEWAL_WEIGHT + financialCompliance * COMPLIANCE_WEIGHT) / 1000;
        ProductionCategory newCategory;
        if (pu.compositeScore >= PIONEER_THRESHOLD) { newCategory = ProductionCategory.Pioneer; pu.isEligibleForLoan = true; }
        else if (pu.compositeScore >= TRANSITION_THRESHOLD) { newCategory = ProductionCategory.Transition; pu.isEligibleForLoan = true; }
        else { newCategory = ProductionCategory.Critical; pu.isEligibleForLoan = false; }
        if (oldCategory != newCategory) {
            if (oldCategory == ProductionCategory.Pioneer) totalPioneerUnits--;
            else if (oldCategory == ProductionCategory.Transition) totalTransitionUnits--;
            else totalCriticalUnits--;
            if (newCategory == ProductionCategory.Pioneer) totalPioneerUnits++;
            else if (newCategory == ProductionCategory.Transition) totalTransitionUnits++;
            else totalCriticalUnits++;
            pu.category = newCategory;
            emit CategoryChanged(unit, oldCategory, newCategory);
        }
        emit ProductionDataUpdated(unit, pu.compositeScore, pu.category);
    }

    function grantLoanEligibility(address unit) external onlyRole(BANK_ROLE) nonReentrant returns (uint256 eligibilityId) {
        ProductionUnit storage pu = productionUnits[unit];
        require(pu.isRegistered, "ProductionOracle: not registered");
        require(pu.isEligibleForLoan, "ProductionOracle: not eligible");
        uint256 maxAmount;
        uint256 interestRate;
        if (pu.category == ProductionCategory.Pioneer) { maxAmount = pu.monthlyValueAdded * 12; interestRate = 10; }
        else { maxAmount = pu.monthlyValueAdded * 6; interestRate = 30; }
        eligibilityCount++; eligibilityId = eligibilityCount;
        loanEligibilities[eligibilityId] = LoanEligibility({ unit: unit, maxLoanAmount: maxAmount, interestRate: interestRate, eligibleAt: block.timestamp, approved: true });
        emit LoanEligibilityGranted(unit, maxAmount, interestRate);
        return eligibilityId;
    }

    function grantCriticalSubsidy(address unit) external onlyRole(BANK_ROLE) {
        ProductionUnit storage pu = productionUnits[unit];
        require(pu.isRegistered, "ProductionOracle: not registered");
        require(pu.category == ProductionCategory.Critical, "ProductionOracle: not critical");
        pu.subsidyMonthsRemaining = 6;
        emit SubsidyGranted(unit, 6);
    }

    function getUnit(address unit) external view returns (ProductionUnit memory) { return productionUnits[unit]; }
    function getLoanEligibility(uint256 eligibilityId) external view returns (LoanEligibility memory) { return loanEligibilities[eligibilityId]; }
    function getTotalUnits() external view returns (uint256) { return allUnits.length; }
}