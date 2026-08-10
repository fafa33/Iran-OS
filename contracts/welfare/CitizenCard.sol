// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CitizenCard
 * @dev کارت هوشمند شهروندی ایران
 * ۱۰۰۰ پهلوی حداقل حقوق توسط کارفرما پرداخت می‌شود — نه از این قرارداد.
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract CitizenCard is AccessControl, ReentrancyGuard {

    bytes32 public constant ISSUER_ROLE   = keccak256("ISSUER_ROLE");
    bytes32 public constant HEALTH_ROLE   = keccak256("HEALTH_ROLE");
    bytes32 public constant WELFARE_ROLE  = keccak256("WELFARE_ROLE");
    bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");

    uint256 public constant MIN_WAGE               = 1000 * 1e18;
    uint256 public constant UNEMPLOYMENT_RATIO     = 700;
    uint256 public constant MAX_UNEMPLOYMENT_MONTHS = 18;
    uint256 public constant HEALTH_CREDIT_ANNUAL   = 500 * 1e18;
    uint256 public constant DRUG_QUOTA_MONTHLY     = 100 * 1e18;
    uint256 public constant RETIREMENT_AGE         = 65;

    enum EmploymentStatus { Employed, Unemployed, Retired, Disabled }

    struct Citizen {
        bytes32          biometricHash;
        uint256          nationalIdHash;
        uint256          birthYear;
        EmploymentStatus employmentStatus;
        address          currentEmployer;
        uint256          employmentStartDate;
        uint256          unemploymentStartDate;
        uint256          unemploymentMonthsPaid;
        uint256          healthCredit;
        uint256          drugQuota;
        uint256          lastHealthRenewal;
        bool             isDisabled;
        uint256          disabilityLevel;
        bool             isActive;
        uint256          registeredAt;
    }

    mapping(address => Citizen) public citizens;
    mapping(bytes32 => address) public biometricToAddress;
    mapping(address => bool)    public registeredEmployers;

    uint256 public totalRegistered;
    uint256 public totalEmployed;
    uint256 public totalUnemployed;
    uint256 public totalRetired;
    uint256 public totalDisabled;

    event CitizenRegistered(address indexed citizen, uint256 timestamp);
    event EmploymentStarted(address indexed citizen, address indexed employer, uint256 timestamp);
    event EmploymentEnded(address indexed citizen, address indexed employer, uint256 timestamp);
    event UnemploymentInsurancePaid(address indexed citizen, uint256 amount, uint256 month);
    event RetirementStarted(address indexed citizen, uint256 timestamp);
    event DisabilityRegistered(address indexed citizen, uint256 level, uint256 timestamp);
    event HealthCreditUsed(address indexed citizen, uint256 amount, address provider);
    event HealthCreditRenewed(address indexed citizen, uint256 amount, uint256 timestamp);
    event DrugQuotaUsed(address indexed citizen, uint256 amount, address pharmacy);
    event CardDeactivated(address indexed citizen, string reason);
    event EmployerRegistered(address indexed employer);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring, such as granting ISSUER_ROLE/HEALTH_ROLE/
    // WELFARE_ROLE, is reachable on mainnet). _kernel receives only
    // KERNEL_ROLE, recording the Kernel contract's identity without relying
    // on it to ever originate a transaction here (Kernel has no
    // call-forwarding mechanism to this contract, so registerEmployer()/
    // deactivateCard() would otherwise be permanently unreachable). Mirrors
    // SovereignWealthFund.sol's constructor(sovereign, kernel) split.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "CitizenCard: invalid admin");
        require(_kernel != address(0), "CitizenCard: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function registerCitizen(address citizen, bytes32 biometricHash, uint256 nationalIdHash, uint256 birthYear, bool isDisabled, uint256 disabilityLevel) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(citizen != address(0), "CitizenCard: invalid address");
        require(!citizens[citizen].isActive, "CitizenCard: already registered");
        require(biometricToAddress[biometricHash] == address(0), "CitizenCard: biometric used");
        require(birthYear > 1300 && birthYear <= 1420, "CitizenCard: invalid birth year");
        if (isDisabled) require(disabilityLevel >= 1 && disabilityLevel <= 3, "CitizenCard: invalid disability level");
        citizens[citizen] = Citizen({ biometricHash: biometricHash, nationalIdHash: nationalIdHash, birthYear: birthYear, employmentStatus: EmploymentStatus.Unemployed, currentEmployer: address(0), employmentStartDate: 0, unemploymentStartDate: block.timestamp, unemploymentMonthsPaid: 0, healthCredit: HEALTH_CREDIT_ANNUAL, drugQuota: DRUG_QUOTA_MONTHLY, lastHealthRenewal: block.timestamp, isDisabled: isDisabled, disabilityLevel: isDisabled ? disabilityLevel : 0, isActive: true, registeredAt: block.timestamp });
        biometricToAddress[biometricHash] = citizen;
        totalRegistered++;
        if (isDisabled) totalDisabled++;
        else totalUnemployed++;
        emit CitizenRegistered(citizen, block.timestamp);
    }

    function startEmployment(address citizen) external onlyRole(EMPLOYER_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.employmentStatus != EmploymentStatus.Employed, "CitizenCard: already employed");
        require(c.employmentStatus != EmploymentStatus.Retired, "CitizenCard: citizen is retired");
        if (c.employmentStatus == EmploymentStatus.Unemployed) totalUnemployed--;
        c.employmentStatus = EmploymentStatus.Employed;
        c.currentEmployer = msg.sender;
        c.employmentStartDate = block.timestamp;
        totalEmployed++;
        emit EmploymentStarted(citizen, msg.sender, block.timestamp);
    }

    function endEmployment(address citizen) external onlyRole(EMPLOYER_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.employmentStatus == EmploymentStatus.Employed, "CitizenCard: not employed");
        require(c.currentEmployer == msg.sender, "CitizenCard: not current employer");
        c.employmentStatus = EmploymentStatus.Unemployed;
        c.unemploymentStartDate = block.timestamp;
        c.unemploymentMonthsPaid = 0;
        c.currentEmployer = address(0);
        totalEmployed--;
        totalUnemployed++;
        emit EmploymentEnded(citizen, msg.sender, block.timestamp);
    }

    function payUnemploymentInsurance(address citizen) external onlyRole(WELFARE_ROLE) nonReentrant returns (uint256 amount) {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.employmentStatus == EmploymentStatus.Unemployed, "CitizenCard: not unemployed");
        require(c.unemploymentMonthsPaid < MAX_UNEMPLOYMENT_MONTHS, "CitizenCard: max months reached");
        amount = (MIN_WAGE * UNEMPLOYMENT_RATIO) / 1000;
        c.unemploymentMonthsPaid++;
        emit UnemploymentInsurancePaid(citizen, amount, c.unemploymentMonthsPaid);
        return amount;
    }

    function registerRetirement(address citizen) external onlyRole(WELFARE_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.employmentStatus != EmploymentStatus.Retired, "CitizenCard: already retired");
        if (c.employmentStatus == EmploymentStatus.Employed) totalEmployed--;
        else if (c.employmentStatus == EmploymentStatus.Unemployed) totalUnemployed--;
        c.employmentStatus = EmploymentStatus.Retired;
        c.currentEmployer = address(0);
        totalRetired++;
        emit RetirementStarted(citizen, block.timestamp);
    }

    function updateDisabilityStatus(address citizen, bool isDisabled, uint256 level) external onlyRole(HEALTH_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        if (isDisabled) require(level >= 1 && level <= 3, "CitizenCard: invalid level");
        bool wasDisabled = c.isDisabled;
        c.isDisabled = isDisabled;
        c.disabilityLevel = isDisabled ? level : 0;
        if (!wasDisabled && isDisabled) totalDisabled++;
        else if (wasDisabled && !isDisabled) totalDisabled--;
        emit DisabilityRegistered(citizen, level, block.timestamp);
    }

    function useHealthCredit(address citizen, uint256 amount, address provider) external onlyRole(HEALTH_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.healthCredit >= amount, "CitizenCard: insufficient health credit");
        c.healthCredit -= amount;
        emit HealthCreditUsed(citizen, amount, provider);
    }

    function renewHealthCredit(address citizen) external onlyRole(HEALTH_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(block.timestamp >= c.lastHealthRenewal + 365 days, "CitizenCard: too early");
        c.healthCredit = HEALTH_CREDIT_ANNUAL;
        c.lastHealthRenewal = block.timestamp;
        emit HealthCreditRenewed(citizen, HEALTH_CREDIT_ANNUAL, block.timestamp);
    }

    function useDrugQuota(address citizen, uint256 amount, address pharmacy) external onlyRole(HEALTH_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "CitizenCard: card not active");
        require(c.drugQuota >= amount, "CitizenCard: insufficient drug quota");
        c.drugQuota -= amount;
        emit DrugQuotaUsed(citizen, amount, pharmacy);
    }

    function deactivateCard(address citizen, string calldata reason) external onlyRole(KERNEL_ROLE) { citizens[citizen].isActive = false; emit CardDeactivated(citizen, reason); }
    function registerEmployer(address employer) external onlyRole(KERNEL_ROLE) { require(employer != address(0), "CitizenCard: invalid employer"); registeredEmployers[employer] = true; _grantRole(EMPLOYER_ROLE, employer); emit EmployerRegistered(employer); }
    function getCitizen(address citizen) external view returns (Citizen memory) { return citizens[citizen]; }
    function isRegistered(address citizen) external view returns (bool) { return citizens[citizen].isActive; }
    function isEmployed(address citizen) external view returns (bool) { return citizens[citizen].employmentStatus == EmploymentStatus.Employed; }
    function isRetired(address citizen) external view returns (bool) { return citizens[citizen].employmentStatus == EmploymentStatus.Retired; }
    function getEmploymentStatus(address citizen) external view returns (EmploymentStatus) { return citizens[citizen].employmentStatus; }
    function getUnemploymentInsuranceAmount() external pure returns (uint256) { return (MIN_WAGE * UNEMPLOYMENT_RATIO) / 1000; }
}
