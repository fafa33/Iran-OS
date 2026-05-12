// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IPahlaviToken {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title VelocityFee
 * @dev کارمزد رکود — جلوگیری از انباشت نقدینگی بی‌حرکت
 * - بالای ۱۰۰,۰۰۰ پهلوی و بدون تراکنش ۳۶۵ روزه: مشمول کارمزد
 * - ۱۰۰ تا ۵۰۰ هزار: ۲٪ | ۵۰۰ هزار تا ۵ میلیون: ۵٪ | بالای ۵ میلیون: ۸٪
 * - استیکینگ در صندوق‌های نوسازی تولید: معاف
 * - درآمد کارمزد → بانک‌های تخصصی توسعه (اجرا در فاز بعدی از طریق صندوق ثروت ملی)
 * نسخه ۱.۱ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract VelocityFee is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE  = keccak256("KERNEL_ROLE");
    bytes32 public constant ORACLE_ROLE  = keccak256("ORACLE_ROLE");
    bytes32 public constant STAKING_ROLE = keccak256("STAKING_ROLE");

    uint256 public constant THRESHOLD       = 100_000   * 1e18;
    uint256 public constant TIER1_MAX       = 500_000   * 1e18;
    uint256 public constant TIER2_MAX       = 5_000_000 * 1e18;
    uint256 public constant TIER1_RATE      = 20;
    uint256 public constant TIER2_RATE      = 50;
    uint256 public constant TIER3_RATE      = 80;
    uint256 public constant DORMANCY_PERIOD = 365 days;

    struct AccountStatus {
        uint256 lastActivityTime;
        bool    isStaking;
        uint256 stakingAmount;
        uint256 totalFeesPaid;
        bool    isRegistered;
    }

    mapping(address => AccountStatus) public accounts;
    uint256 public totalFeesCollected;
    address public developmentBankAddress;
    address public pahlaviToken;

    event AccountRegistered(address indexed account, uint256 balanceAtRegistration);
    event ActivityRecorded(address indexed account, uint256 timestamp);
    event FeeCollected(address indexed account, uint256 amount, uint256 timestamp);
    event StakingActivated(address indexed account, uint256 amount);
    event StakingDeactivated(address indexed account);
    event FeeTransferredToDevelopmentBank(uint256 amount, uint256 timestamp);

    constructor(address _kernel, address _developmentBank, address _pahlaviToken) {
        require(_kernel != address(0), "VelocityFee: invalid kernel");
        require(_developmentBank != address(0), "VelocityFee: invalid bank");
        require(_pahlaviToken != address(0), "VelocityFee: invalid token");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
        developmentBankAddress = _developmentBank;
        pahlaviToken = _pahlaviToken;
    }

    /**
     * @notice ثبت حساب برای نظارت بر رکود
     * @param account آدرس حساب
     */
    function registerAccount(address account) external onlyRole(ORACLE_ROLE) nonReentrant {
        require(account != address(0), "VelocityFee: invalid account");
        accounts[account] = AccountStatus({
            lastActivityTime: block.timestamp,
            isStaking:        false,
            stakingAmount:    0,
            totalFeesPaid:    0,
            isRegistered:     true
        });
        emit AccountRegistered(account, IPahlaviToken(pahlaviToken).balanceOf(account));
    }

    /**
     * @notice ثبت فعالیت حساب — بازنشانی تایمر رکود
     * @param account آدرس حساب
     */
    function recordActivity(address account) external onlyRole(ORACLE_ROLE) {
        require(accounts[account].isRegistered, "VelocityFee: not registered");
        accounts[account].lastActivityTime = block.timestamp;
        emit ActivityRecorded(account, block.timestamp);
    }

    /**
     * @notice فعال‌سازی استیکینگ — معافیت از کارمزد رکود
     * @param account آدرس حساب
     * @param amount مقدار استیک‌شده
     */
    function activateStaking(address account, uint256 amount) external onlyRole(STAKING_ROLE) nonReentrant {
        require(accounts[account].isRegistered, "VelocityFee: not registered");
        require(amount > 0, "VelocityFee: zero amount");
        accounts[account].isStaking = true;
        accounts[account].stakingAmount = amount;
        accounts[account].lastActivityTime = block.timestamp;
        emit StakingActivated(account, amount);
    }

    /**
     * @notice غیرفعال‌سازی استیکینگ
     * @param account آدرس حساب
     */
    function deactivateStaking(address account) external onlyRole(STAKING_ROLE) {
        require(accounts[account].isRegistered, "VelocityFee: not registered");
        accounts[account].isStaking = false;
        accounts[account].stakingAmount = 0;
        accounts[account].lastActivityTime = block.timestamp;
        emit StakingDeactivated(account);
    }

    /**
     * @notice اعمال کارمزد رکود — موجودی واقعی از PahlaviToken خوانده می‌شود
     * @dev هیچ PAH واقعی سوزانده یا منتقل نمی‌شود در این نسخه.
     *      اجرای واقعی در فاز بعدی از طریق صندوق ثروت ملی انجام می‌شود.
     * @param account آدرس حساب راکد
     */
    function applyFee(address account) external onlyRole(ORACLE_ROLE) nonReentrant {
        AccountStatus storage acc = accounts[account];
        require(acc.isRegistered, "VelocityFee: not registered");
        require(!acc.isStaking,   "VelocityFee: staking exempt");

        uint256 realBalance = IPahlaviToken(pahlaviToken).balanceOf(account);
        require(realBalance > THRESHOLD, "VelocityFee: below threshold");
        require(block.timestamp - acc.lastActivityTime >= DORMANCY_PERIOD, "VelocityFee: not dormant");

        uint256 feeAmount;
        if (realBalance <= TIER1_MAX)      feeAmount = (realBalance * TIER1_RATE) / 1000;
        else if (realBalance <= TIER2_MAX) feeAmount = (realBalance * TIER2_RATE) / 1000;
        else                               feeAmount = (realBalance * TIER3_RATE) / 1000;

        require(feeAmount > 0, "VelocityFee: zero fee");
        acc.totalFeesPaid += feeAmount;
        totalFeesCollected += feeAmount;
        emit FeeCollected(account, feeAmount, block.timestamp);
        emit FeeTransferredToDevelopmentBank(feeAmount, block.timestamp);
    }

    /**
     * @notice محاسبه کارمزد رکود بر اساس موجودی واقعی PahlaviToken
     * @param account آدرس حساب
     */
    function calculateFee(address account) external view returns (uint256 feeAmount, uint8 tier, bool dormant) {
        AccountStatus storage acc = accounts[account];
        uint256 realBalance = IPahlaviToken(pahlaviToken).balanceOf(account);
        if (!acc.isRegistered || acc.isStaking || realBalance <= THRESHOLD) return (0, 0, false);
        dormant = block.timestamp - acc.lastActivityTime >= DORMANCY_PERIOD;
        if (!dormant) return (0, 0, false);
        if (realBalance <= TIER1_MAX)      { feeAmount = (realBalance * TIER1_RATE) / 1000; tier = 1; }
        else if (realBalance <= TIER2_MAX) { feeAmount = (realBalance * TIER2_RATE) / 1000; tier = 2; }
        else                               { feeAmount = (realBalance * TIER3_RATE) / 1000; tier = 3; }
    }

    function getAccountStatus(address account) external view returns (AccountStatus memory) {
        return accounts[account];
    }

    function isDormant(address account) external view returns (bool) {
        return accounts[account].isRegistered
            && !accounts[account].isStaking
            && IPahlaviToken(pahlaviToken).balanceOf(account) > THRESHOLD
            && block.timestamp - accounts[account].lastActivityTime >= DORMANCY_PERIOD;
    }
}
