// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HealthCoverage
 * @dev بیمه همگانی و پوشش درمانی — فرگرد ۱۰ منشور
 * - بیمه درمانی رایگان برای تمام شهروندان
 * - بودجه مستقیم به کیف پول سلامت هر شهروند
 * - یارانه دارو در لحظه خرید اعمال می‌شود
 * - مرخصی زایمان برای هر دو والد از صندوق رفاه ملی
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract HealthCoverage is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant HEALTH_ROLE   = keccak256("HEALTH_ROLE");
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant SWF_ROLE      = keccak256("SWF_ROLE");

    uint256 public constant ANNUAL_HEALTH_CREDIT = 500  * 1e18;
    uint256 public constant MONTHLY_DRUG_QUOTA   = 100  * 1e18;
    uint256 public constant MATERNITY_LEAVE_PAY  = 6000 * 1e18;

    struct HealthWallet {
        uint256 annualCredit;
        uint256 monthlyDrugQuota;
        uint256 lastCreditRenewal;
        uint256 lastDrugReset;
        uint256 totalHealthSpent;
        bool    isActive;
    }

    struct MaternityLeave {
        address parent;
        uint256 startDate;
        uint256 totalPayment;
        bool    isPaid;
    }

    struct HealthProvider {
        string  name;
        address wallet;
        bool    isApproved;
        uint256 totalBillings;
        bool    meetsStandard;
    }

    mapping(address => HealthWallet)   public healthWallets;
    mapping(uint256 => MaternityLeave) public maternityLeaves;
    mapping(address => HealthProvider) public providers;
    uint256 public maternityLeaveCount;
    uint256 public strategicReserve;

    event HealthWalletCreated(address indexed citizen, uint256 timestamp);
    event HealthCreditUsed(address indexed citizen, uint256 amount, address provider);
    event DrugQuotaUsed(address indexed citizen, uint256 amount, address pharmacy);
    event CreditRenewed(address indexed citizen, uint256 newCredit, uint256 timestamp);
    event DrugQuotaReset(address indexed citizen, uint256 timestamp);
    event MaternityLeaveGranted(uint256 indexed leaveId, address parent, uint256 amount);
    event ProviderRegistered(address indexed provider, string name);
    event ProviderStandardUpdated(address indexed provider, bool meetsStandard);
    event StrategicReserveUpdated(uint256 newAmount, uint256 timestamp);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "HealthCoverage: invalid admin");
        require(_kernel != address(0), "HealthCoverage: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function createHealthWallet(address citizen) external onlyRole(HEALTH_ROLE) nonReentrant {
        require(citizen != address(0), "HealthCoverage: invalid citizen");
        require(!healthWallets[citizen].isActive, "HealthCoverage: exists");
        healthWallets[citizen] = HealthWallet({ annualCredit: ANNUAL_HEALTH_CREDIT, monthlyDrugQuota: MONTHLY_DRUG_QUOTA, lastCreditRenewal: block.timestamp, lastDrugReset: block.timestamp, totalHealthSpent: 0, isActive: true });
        emit HealthWalletCreated(citizen, block.timestamp);
    }

    function useHealthCredit(address citizen, uint256 amount, address provider) external onlyRole(PROVIDER_ROLE) nonReentrant {
        require(providers[provider].isApproved, "HealthCoverage: provider not approved");
        HealthWallet storage wallet = healthWallets[citizen];
        require(wallet.isActive, "HealthCoverage: not active");
        require(wallet.annualCredit >= amount, "HealthCoverage: insufficient credit");
        wallet.annualCredit -= amount;
        wallet.totalHealthSpent += amount;
        providers[provider].totalBillings += amount;
        emit HealthCreditUsed(citizen, amount, provider);
    }

    function useDrugQuota(address citizen, uint256 amount, address pharmacy) external onlyRole(PHARMACY_ROLE) nonReentrant {
        HealthWallet storage wallet = healthWallets[citizen];
        require(wallet.isActive, "HealthCoverage: not active");
        if (block.timestamp >= wallet.lastDrugReset + 30 days) {
            wallet.monthlyDrugQuota = MONTHLY_DRUG_QUOTA;
            wallet.lastDrugReset = block.timestamp;
            emit DrugQuotaReset(citizen, block.timestamp);
        }
        require(wallet.monthlyDrugQuota >= amount, "HealthCoverage: insufficient quota");
        wallet.monthlyDrugQuota -= amount;
        emit DrugQuotaUsed(citizen, amount, pharmacy);
    }

    function renewAnnualCredit(address citizen) external onlyRole(HEALTH_ROLE) nonReentrant {
        HealthWallet storage wallet = healthWallets[citizen];
        require(wallet.isActive, "HealthCoverage: not active");
        require(block.timestamp >= wallet.lastCreditRenewal + 365 days, "HealthCoverage: too early");
        wallet.annualCredit = ANNUAL_HEALTH_CREDIT;
        wallet.lastCreditRenewal = block.timestamp;
        emit CreditRenewed(citizen, ANNUAL_HEALTH_CREDIT, block.timestamp);
    }

    function grantMaternityLeave(address parent) external onlyRole(HEALTH_ROLE) nonReentrant returns (uint256 leaveId) {
        require(parent != address(0), "HealthCoverage: invalid parent");
        maternityLeaveCount++; leaveId = maternityLeaveCount;
        maternityLeaves[leaveId] = MaternityLeave({ parent: parent, startDate: block.timestamp, totalPayment: MATERNITY_LEAVE_PAY, isPaid: false });
        emit MaternityLeaveGranted(leaveId, parent, MATERNITY_LEAVE_PAY);
        return leaveId;
    }

    function registerProvider(address provider, string calldata name) external onlyRole(KERNEL_ROLE) nonReentrant {
        require(provider != address(0), "HealthCoverage: invalid provider");
        providers[provider] = HealthProvider({ name: name, wallet: provider, isApproved: true, totalBillings: 0, meetsStandard: false });
        _grantRole(PROVIDER_ROLE, provider);
        emit ProviderRegistered(provider, name);
    }

    function updateProviderStandard(address provider, bool meetsStandard) external onlyRole(HEALTH_ROLE) {
        require(providers[provider].isApproved, "HealthCoverage: not found");
        providers[provider].meetsStandard = meetsStandard;
        emit ProviderStandardUpdated(provider, meetsStandard);
    }

    function updateStrategicReserve(uint256 amount) external onlyRole(SWF_ROLE) {
        strategicReserve = amount;
        emit StrategicReserveUpdated(amount, block.timestamp);
    }

    function getHealthWallet(address citizen) external view returns (HealthWallet memory) { return healthWallets[citizen]; }
    function getProvider(address provider) external view returns (HealthProvider memory) { return providers[provider]; }
    function getMaternityLeave(uint256 leaveId) external view returns (MaternityLeave memory) { return maternityLeaves[leaveId]; }
}
