// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Provincial
 * @dev حاکمیت استانی — اجرای فرمول ۳۰/۷۰ توزیع بودجه
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract Provincial is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant ORACLE_ROLE   = keccak256("ORACLE_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    uint256 public constant PROVINCIAL_SHARE = 300;
    uint256 public constant NATIONAL_SHARE   = 700;

    struct Province {
        string  name;
        address governor;
        address developmentAccount;
        uint256 totalRevenue;
        uint256 provincialBalance;
        uint256 nationalContrib;
        uint256 productivityScore;
        bool    isActive;
        uint256 registeredAt;
    }

    mapping(uint256 => Province) public provinces;
    mapping(address => uint256)  public governorToProvince;
    uint256 public provinceCount;
    address public nationalTreasury;

    event ProvinceRegistered(uint256 indexed provinceId, string name, address governor);
    event RevenueDistributed(uint256 indexed provinceId, uint256 totalAmount, uint256 provincialShare, uint256 nationalShare);
    event ProductivityBonusPaid(uint256 indexed provinceId, uint256 bonusAmount);
    event GovernorUpdated(uint256 indexed provinceId, address oldGovernor, address newGovernor);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel, address _nationalTreasury) {
        require(_admin != address(0), "Provincial: invalid admin");
        require(_kernel != address(0), "Provincial: invalid kernel");
        require(_nationalTreasury != address(0), "Provincial: invalid treasury");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        nationalTreasury = _nationalTreasury;
    }

    function registerProvince(string calldata name, address governor, address developmentAccount) external onlyRole(KERNEL_ROLE) nonReentrant returns (uint256 provinceId) {
        require(governor != address(0), "Provincial: invalid governor");
        require(developmentAccount != address(0), "Provincial: invalid dev account");
        provinceCount++; provinceId = provinceCount;
        provinces[provinceId] = Province({ name: name, governor: governor, developmentAccount: developmentAccount, totalRevenue: 0, provincialBalance: 0, nationalContrib: 0, productivityScore: 50, isActive: true, registeredAt: block.timestamp });
        governorToProvince[governor] = provinceId;
        _grantRole(GOVERNOR_ROLE, governor);
        emit ProvinceRegistered(provinceId, name, governor);
        return provinceId;
    }

    function distributeRevenue(uint256 provinceId, uint256 amount) external onlyRole(ORACLE_ROLE) nonReentrant {
        Province storage p = provinces[provinceId];
        require(p.isActive, "Provincial: not active");
        require(amount > 0, "Provincial: zero amount");
        uint256 provincialShare = (amount * PROVINCIAL_SHARE) / 1000;
        uint256 nationalShare   = amount - provincialShare;
        p.totalRevenue += amount;
        p.provincialBalance += provincialShare;
        p.nationalContrib   += nationalShare;
        emit RevenueDistributed(provinceId, amount, provincialShare, nationalShare);
    }

    function payProductivityBonus(uint256 provinceId, uint256 bonusAmount) external onlyRole(KERNEL_ROLE) nonReentrant {
        Province storage p = provinces[provinceId];
        require(p.isActive, "Provincial: not active");
        require(p.productivityScore > 70, "Provincial: score too low");
        require(bonusAmount > 0, "Provincial: zero bonus");
        p.provincialBalance += bonusAmount;
        emit ProductivityBonusPaid(provinceId, bonusAmount);
    }

    function updateProductivityScore(uint256 provinceId, uint256 score) external onlyRole(ORACLE_ROLE) {
        require(score <= 100, "Provincial: score out of range");
        provinces[provinceId].productivityScore = score;
    }

    function updateGovernor(uint256 provinceId, address newGovernor) external onlyRole(KERNEL_ROLE) nonReentrant {
        require(newGovernor != address(0), "Provincial: invalid governor");
        Province storage p = provinces[provinceId];
        address oldGovernor = p.governor;
        _revokeRole(GOVERNOR_ROLE, oldGovernor);
        delete governorToProvince[oldGovernor];
        p.governor = newGovernor;
        governorToProvince[newGovernor] = provinceId;
        _grantRole(GOVERNOR_ROLE, newGovernor);
        emit GovernorUpdated(provinceId, oldGovernor, newGovernor);
    }

    function getProvince(uint256 provinceId) external view returns (Province memory) { return provinces[provinceId]; }
    function getProvinceByGovernor(address governor) external view returns (uint256) { return governorToProvince[governor]; }
}
