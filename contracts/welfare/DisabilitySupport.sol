// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DisabilitySupport
 * @dev حمایت از شهروندان توان‌خواه — فرگرد ۱۰ منشور رفاه و عدالت
 * - مستمری ماهانه تضمینی برابر حداقل دستمزد + مکمل درجه ناتوانی
 * - درجه ۱ (خفیف): ۱۳۰۰ پهلوی | درجه ۲ (متوسط): ۱۵۰۰ | درجه ۳ (شدید): ۱۷۰۰
 * - کارت دسترسی‌پذیری برای خدمات عمومی
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract DisabilitySupport is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE  = keccak256("KERNEL_ROLE");
    bytes32 public constant HEALTH_ROLE  = keccak256("HEALTH_ROLE");
    bytes32 public constant WELFARE_ROLE = keccak256("WELFARE_ROLE");
    bytes32 public constant SWF_ROLE     = keccak256("SWF_ROLE");

    uint256 public constant MIN_WAGE          = 1_000 * 1e18;
    uint256 public constant LEVEL1_SUPPLEMENT = 300;
    uint256 public constant LEVEL2_SUPPLEMENT = 500;
    uint256 public constant LEVEL3_SUPPLEMENT = 700;

    uint256 public constant PAYMENT_INTERVAL = 30 days;

    enum DisabilityLevel { None, Mild, Moderate, Severe }

    struct DisabledCitizen {
        uint8   level;
        uint256 monthlyStipend;
        uint256 lastPayment;
        bool    accessibilityCard;
        bool    isRegistered;
    }

    struct AccessibilityAudit {
        bytes32 subjectId;
        address auditor;
        string  subjectType;
        bool    meetsStandard;
        string  notes;
        uint256 timestamp;
    }

    mapping(address => DisabledCitizen)  public citizens;
    AccessibilityAudit[]                 public auditLog;

    event DisabledCitizenRegistered(address indexed citizen, uint8 level, uint256 stipend, uint256 timestamp);
    event StipendPaid(address indexed citizen, uint256 amount, uint256 timestamp);
    event DisabilityLevelUpdated(address indexed citizen, uint8 oldLevel, uint8 newLevel, uint256 newStipend, uint256 timestamp);
    event AccessibilityCardIssued(address indexed citizen, uint256 timestamp);
    event AccessibilityAuditCompleted(bytes32 indexed subjectId, address auditor, bool meetsStandard, uint256 timestamp);

    constructor(address _kernel) {
        require(_kernel != address(0), "DisabilitySupport: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
    }

    /**
     * @notice محاسبه مستمری ماهانه بر اساس درجه ناتوانی
     * @param level درجه ناتوانی (۱=خفیف، ۲=متوسط، ۳=شدید)
     */
    function calculateStipend(uint8 level) public pure returns (uint256) {
        if (level == uint8(DisabilityLevel.Mild))     return MIN_WAGE + LEVEL1_SUPPLEMENT * 1e18;
        if (level == uint8(DisabilityLevel.Moderate)) return MIN_WAGE + LEVEL2_SUPPLEMENT * 1e18;
        if (level == uint8(DisabilityLevel.Severe))   return MIN_WAGE + LEVEL3_SUPPLEMENT * 1e18;
        revert("DisabilitySupport: invalid level");
    }

    /**
     * @notice ثبت شهروند توان‌خواه
     * @param citizen آدرس شهروند
     * @param level درجه ناتوانی (۱–۳)
     */
    function registerDisabledCitizen(address citizen, uint8 level) external onlyRole(HEALTH_ROLE) nonReentrant {
        require(citizen != address(0), "DisabilitySupport: invalid address");
        require(!citizens[citizen].isRegistered, "DisabilitySupport: registered");
        uint256 stipend = calculateStipend(level); // reverts on level == 0
        citizens[citizen] = DisabledCitizen({
            level:            level,
            monthlyStipend:   stipend,
            lastPayment:      0,
            accessibilityCard: false,
            isRegistered:     true
        });
        emit DisabledCitizenRegistered(citizen, level, stipend, block.timestamp);
    }

    /**
     * @notice پرداخت مستمری ماهانه
     * @param citizen آدرس شهروند
     */
    function payMonthlyStipend(address citizen) external onlyRole(WELFARE_ROLE) nonReentrant {
        DisabledCitizen storage c = citizens[citizen];
        require(c.isRegistered, "DisabilitySupport: not registered");
        require(block.timestamp >= c.lastPayment + PAYMENT_INTERVAL, "DisabilitySupport: too early");
        c.lastPayment = block.timestamp;
        emit StipendPaid(citizen, c.monthlyStipend, block.timestamp);
    }

    /**
     * @notice به‌روزرسانی درجه ناتوانی و مستمری
     * @param citizen آدرس شهروند
     * @param newLevel درجه جدید (۱–۳)
     */
    function updateDisabilityLevel(address citizen, uint8 newLevel) external onlyRole(HEALTH_ROLE) nonReentrant {
        DisabledCitizen storage c = citizens[citizen];
        require(c.isRegistered, "DisabilitySupport: not registered");
        uint8 oldLevel = c.level;
        uint256 newStipend = calculateStipend(newLevel);
        c.level = newLevel;
        c.monthlyStipend = newStipend;
        emit DisabilityLevelUpdated(citizen, oldLevel, newLevel, newStipend, block.timestamp);
    }

    /**
     * @notice صدور کارت دسترسی‌پذیری برای خدمات عمومی
     * @param citizen آدرس شهروند
     */
    function issueAccessibilityCard(address citizen) external onlyRole(WELFARE_ROLE) nonReentrant {
        DisabledCitizen storage c = citizens[citizen];
        require(c.isRegistered, "DisabilitySupport: not registered");
        c.accessibilityCard = true;
        emit AccessibilityCardIssued(citizen, block.timestamp);
    }

    /**
     * @notice ثبت نتیجه بازرسی دسترسی‌پذیری
     * @param subjectId شناسه محل یا سازمان
     * @param auditor بازرس
     * @param subjectType نوع موضوع (ساختمان، حمل‌ونقل، …)
     * @param meetsStandard آیا استاندارد رعایت شده
     * @param notes یادداشت بازرسی
     */
    function recordAccessibilityAudit(
        bytes32 subjectId,
        address auditor,
        string calldata subjectType,
        bool meetsStandard,
        string calldata notes
    ) external onlyRole(WELFARE_ROLE) {
        auditLog.push(AccessibilityAudit({
            subjectId:    subjectId,
            auditor:      auditor,
            subjectType:  subjectType,
            meetsStandard: meetsStandard,
            notes:        notes,
            timestamp:    block.timestamp
        }));
        emit AccessibilityAuditCompleted(subjectId, auditor, meetsStandard, block.timestamp);
    }

    function getDisabledCitizen(address citizen) external view returns (DisabledCitizen memory) {
        return citizens[citizen];
    }

    function getAuditCount() external view returns (uint256) {
        return auditLog.length;
    }
}
