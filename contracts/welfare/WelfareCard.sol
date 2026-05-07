// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WelfareCard
 * @dev کارت ملی هوشمند رفاه — هویت دیجیتال شهروندی
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract WelfareCard is AccessControl, ReentrancyGuard {

    bytes32 public constant ISSUER_ROLE  = keccak256("ISSUER_ROLE");
    bytes32 public constant WELFARE_ROLE = keccak256("WELFARE_ROLE");
    bytes32 public constant KERNEL_ROLE  = keccak256("KERNEL_ROLE");

    uint256 public constant BASE_INCOME        = 1000 * 1e18;
    uint256 public constant HEALTH_CREDIT      = 500  * 1e18;
    uint256 public constant MONTHLY_DRUG_QUOTA = 100  * 1e18;

    struct Citizen {
        bytes32 biometricHash;
        uint256 nationalIdHash;
        uint256 walletBalance;
        uint256 healthCredit;
        uint256 drugQuota;
        uint256 lastWelfarePayment;
        bool    isActive;
        bool    isEmployed;
        uint256 registeredAt;
    }

    mapping(address => Citizen) public citizens;
    mapping(bytes32 => address) public biometricToAddress;
    uint256 public totalRegistered;

    event CitizenRegistered(address indexed citizen, uint256 timestamp);
    event WelfarePaymentSent(address indexed citizen, uint256 amount, uint256 timestamp);
    event HealthCreditUsed(address indexed citizen, uint256 amount, address provider);
    event DrugQuotaUsed(address indexed citizen, uint256 amount, address pharmacy);
    event CardDeactivated(address indexed citizen, string reason);

    constructor(address _kernel) {
        require(_kernel != address(0), "WelfareCard: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    function registerCitizen(address citizen, bytes32 biometricHash, uint256 nationalIdHash, bool isEmployed) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(citizen != address(0), "WelfareCard: invalid address");
        require(!citizens[citizen].isActive, "WelfareCard: already registered");
        require(biometricToAddress[biometricHash] == address(0), "WelfareCard: biometric already used");
        citizens[citizen] = Citizen({ biometricHash: biometricHash, nationalIdHash: nationalIdHash, walletBalance: 0, healthCredit: HEALTH_CREDIT, drugQuota: MONTHLY_DRUG_QUOTA, lastWelfarePayment: 0, isActive: true, isEmployed: isEmployed, registeredAt: block.timestamp });
        biometricToAddress[biometricHash] = citizen;
        totalRegistered++;
        emit CitizenRegistered(citizen, block.timestamp);
    }

    function sendWelfarePayment(address citizen) external onlyRole(WELFARE_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "WelfareCard: card not active");
        require(block.timestamp >= c.lastWelfarePayment + 30 days, "WelfareCard: too early");
        c.walletBalance += BASE_INCOME;
        c.lastWelfarePayment = block.timestamp;
        c.drugQuota = MONTHLY_DRUG_QUOTA;
        emit WelfarePaymentSent(citizen, BASE_INCOME, block.timestamp);
    }

    function useHealthCredit(address citizen, uint256 amount, address provider) external onlyRole(WELFARE_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "WelfareCard: card not active");
        require(c.healthCredit >= amount, "WelfareCard: insufficient health credit");
        c.healthCredit -= amount;
        emit HealthCreditUsed(citizen, amount, provider);
    }

    function useDrugQuota(address citizen, uint256 amount, address pharmacy) external onlyRole(WELFARE_ROLE) nonReentrant {
        Citizen storage c = citizens[citizen];
        require(c.isActive, "WelfareCard: card not active");
        require(c.drugQuota >= amount, "WelfareCard: insufficient drug quota");
        c.drugQuota -= amount;
        emit DrugQuotaUsed(citizen, amount, pharmacy);
    }

    function deactivateCard(address citizen, string calldata reason) external onlyRole(KERNEL_ROLE) {
        citizens[citizen].isActive = false;
        emit CardDeactivated(citizen, reason);
    }

    function getCitizen(address citizen) external view returns (Citizen memory) { return citizens[citizen]; }
    function isRegistered(address citizen) external view returns (bool) { return citizens[citizen].isActive; }
}
