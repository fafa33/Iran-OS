// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ITriggerProtocol {
    function executeTrigger(
        uint256 violationId,
        address offender,
        uint8   violationCode,
        address replacement
    ) external returns (uint256 executionId);
}

/**
 * @title IranOS_Kernel
 * @dev هسته سیستم‌عامل حاکمیتی ایران — لایه صفر
 *
 * این قرارداد سه ستون اصلی حاکمیت را به صورت Hard-coded قفل می‌کند:
 * ۱. دوری آرتش ملی از بازی‌های سیاسی
 * ۲. فرمول ریاضی ثروت ملی (سقف ۹۰۰ میلیارد پهلوی)
 * ۳. الگوریتم ماشه (Trigger) برای برخورد خودکار با تخلف از منشور
 *
 * هیچ Admin Access برای تغییر این اصول تعریف نشده است.
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract IranOS_Kernel is AccessControl, ReentrancyGuard {

    // ─────────────────────────────────────────
    // نقش‌ها (Roles)
    // ─────────────────────────────────────────

    bytes32 public constant SOVEREIGN_ROLE   = keccak256("SOVEREIGN_ROLE");   // پادشاه — داور ملی
    bytes32 public constant COURT_ROLE       = keccak256("COURT_ROLE");       // دادگاه عالی قانون اساسی
    bytes32 public constant ORACLE_ROLE      = keccak256("ORACLE_ROLE");      // اوراکل‌های API3
    bytes32 public constant GUARDIAN_ROLE    = keccak256("GUARDIAN_ROLE");    // نگهبانان نخبگانی

    // ─────────────────────────────────────────
    // خطوط قرمز غیرقابل تغییر (TR-01 تا TR-06)
    // ─────────────────────────────────────────

    uint8 public constant TR_CONSTITUTIONAL_MONARCHY = 1; // پادشاهی مشروطه سکولار
    uint8 public constant TR_SECULARISM              = 2; // سکولاریسم ساختاری
    uint8 public constant TR_TERRITORIAL_INTEGRITY   = 3; // یکپارچگی سرزمینی
    uint8 public constant TR_FUNDAMENTAL_RIGHTS      = 4; // حقوق بنیادین ملت
    uint8 public constant TR_SWF_INDEPENDENCE        = 5; // استقلال صندوق ثروت ملی
    uint8 public constant TR_LIQUIDITY_CAP           = 6; // سقف نقدینگی ۹۰۰ میلیارد پهلوی

    // ─────────────────────────────────────────
    // ثوابت سیستمی (Constants)
    // ─────────────────────────────────────────

    uint256 public constant LIQUIDITY_CAP = 900_000_000_000 * 1e18; // سقف ۹۰۰ میلیارد پهلوی
    uint256 public constant MIN_RESERVE_RATIO = 333;                 // نسبت پشتوانه حداقل ۳۳.۳٪ (در هزار)
    uint8   public constant MULTISIG_THRESHOLD = 7;                  // حداقل ۷ از ۹ امضا برای ماشه
    uint256 public constant TRIGGER_TIMEOUT = 72 hours;              // مهلت رسیدگی دادگاه

    // ─────────────────────────────────────────
    // حالت سیستم (State)
    // ─────────────────────────────────────────

    /// @notice آیا هیچ تخلفی در حال بررسی است؟
    bool public emergencyLockActive;

    /// @notice تعداد کل فعال‌سازی‌های ماشه در تاریخ
    uint256 public triggerActivationCount;

    /// @notice آدرس قرارداد پروتکل ماشه
    address public triggerProtocol;

    /// @notice آدرس صندوق ثروت ملی
    address public sovereignWealthFund;

    /// @notice آدرس اوراکل API3
    address public api3Oracle;

    // ─────────────────────────────────────────
    // ساختارها (Structs)
    // ─────────────────────────────────────────

    struct ViolationRecord {
        uint8   violationCode;      // کد تخلف (TR-01 تا TR-06)
        address offender;           // مقام خاطی
        string  reason;             // توضیح تخلف
        uint256 timestamp;          // زمان ثبت
        bool    courtConfirmed;     // آیا دادگاه تایید کرده؟
        uint8   signaturesCount;    // تعداد امضاهای Multi-Sig
        bool    triggered;          // آیا ماشه فعال شده؟
    }

    struct OfficialAccess {
        bool    isActive;           // آیا دسترسی فعال است؟
        bytes32 role;               // نقش مقام
        uint256 grantedAt;          // زمان اعطای دسترسی
        uint256 revokedAt;          // زمان سلب دسترسی (صفر = هنوز سلب نشده)
        string  suspensionReason;   // دلیل تعلیق
    }

    // ─────────────────────────────────────────
    // نگاشت‌ها (Mappings)
    // ─────────────────────────────────────────

    /// @notice سابقه تخلفات — کلید: شناسه تخلف
    mapping(uint256 => ViolationRecord) public violations;
    uint256 public violationCount;

    /// @notice وضعیت دسترسی مقامات
    mapping(address => OfficialAccess) public officialAccess;

    /// @notice امضاهای Multi-Sig برای هر تخلف
    mapping(uint256 => mapping(address => bool)) public violationSignatures;

    // ─────────────────────────────────────────
    // رویدادها (Events)
    // ─────────────────────────────────────────

    event ViolationFlagged(
        uint256 indexed violationId,
        uint8   indexed violationCode,
        address indexed offender,
        string  reason,
        uint256 timestamp
    );

    event ViolationSigned(
        uint256 indexed violationId,
        address indexed signer,
        uint8   signaturesCount
    );

    event TriggerActivated(
        uint256 indexed violationId,
        address indexed offender,
        uint8   violationCode,
        uint256 timestamp
    );

    event AccessRevoked(
        address indexed offender,
        string  reason,
        uint256 timestamp
    );

    event AccessGranted(
        address indexed official,
        bytes32 role,
        uint256 timestamp
    );

    event EmergencyLockActivated(uint256 timestamp);
    event EmergencyLockDeactivated(uint256 timestamp);

    event KernelContractUpdated(
        string  contractName,
        address oldAddress,
        address newAddress
    );

    // ─────────────────────────────────────────
    // تعدیل‌کننده‌ها (Modifiers)
    // ─────────────────────────────────────────

    modifier onlySovereign() {
        require(hasRole(SOVEREIGN_ROLE, msg.sender), "Kernel: caller is not the Sovereign");
        _;
    }

    modifier onlyCourt() {
        require(hasRole(COURT_ROLE, msg.sender), "Kernel: caller is not the Court");
        _;
    }

    modifier onlyOracle() {
        require(hasRole(ORACLE_ROLE, msg.sender), "Kernel: caller is not an Oracle");
        _;
    }

    modifier onlyGuardian() {
        require(hasRole(GUARDIAN_ROLE, msg.sender), "Kernel: caller is not a Guardian");
        _;
    }

    modifier notLocked() {
        require(!emergencyLockActive, "Kernel: system is under emergency lock");
        _;
    }

    modifier validViolationCode(uint8 code) {
        require(code >= 1 && code <= 6, "Kernel: invalid violation code");
        _;
    }

    // ─────────────────────────────────────────
    // سازنده (Constructor)
    // ─────────────────────────────────────────

    /**
     * @param _sovereign آدرس پادشاه (داور ملی)
     * @param _court آدرس دادگاه عالی قانون اساسی
     * @param _oracle آدرس اوراکل API3
     * @param _swf آدرس صندوق ثروت ملی
     */
    constructor(
        address _sovereign,
        address _court,
        address _oracle,
        address _swf
    ) {
        require(_sovereign != address(0), "Kernel: invalid sovereign address");
        require(_court     != address(0), "Kernel: invalid court address");
        require(_oracle    != address(0), "Kernel: invalid oracle address");
        require(_swf       != address(0), "Kernel: invalid SWF address");

        _grantRole(DEFAULT_ADMIN_ROLE, _sovereign);
        _grantRole(SOVEREIGN_ROLE,     _sovereign);
        _grantRole(COURT_ROLE,         _court);
        _grantRole(ORACLE_ROLE,        _oracle);

        sovereignWealthFund  = _swf;
        api3Oracle           = _oracle;
        emergencyLockActive  = false;
        violationCount       = 0;
        triggerActivationCount = 0;

        // ثبت دسترسی پادشاه
        officialAccess[_sovereign] = OfficialAccess({
            isActive:         true,
            role:             SOVEREIGN_ROLE,
            grantedAt:        block.timestamp,
            revokedAt:        0,
            suspensionReason: ""
        });
    }

    // ─────────────────────────────────────────
    // توابع اصلی (Core Functions)
    // ─────────────────────────────────────────

    /**
     * @notice پرچم‌گذاری تخلف توسط اوراکل API3
     * @dev لایه اول پروتکل ماشه — تشخیص
     * @param violationCode کد تخلف (۱ تا ۶)
     * @param offender آدرس مقام خاطی
     * @param reason توضیح تخلف
     */
    function flagViolation(
        uint8   violationCode,
        address offender,
        string  calldata reason
    )
        external
        onlyOracle
        validViolationCode(violationCode)
        nonReentrant
        returns (uint256 violationId)
    {
        require(offender != address(0), "Kernel: invalid offender address");
        require(bytes(reason).length > 0, "Kernel: reason cannot be empty");

        violationCount++;
        violationId = violationCount;

        violations[violationId] = ViolationRecord({
            violationCode:   violationCode,
            offender:        offender,
            reason:          reason,
            timestamp:       block.timestamp,
            courtConfirmed:  false,
            signaturesCount: 0,
            triggered:       false
        });

        emit ViolationFlagged(violationId, violationCode, offender, reason, block.timestamp);

        // برای تخلفات بحرانی TR-01 تا TR-03، قفل اضطراری فوری فعال می‌شود
        if (violationCode <= 3) {
            _activateEmergencyLock();
        }

        return violationId;
    }

    /**
     * @notice امضای تاییدیه تخلف توسط داوران دادگاه (Multi-Sig)
     * @dev لایه دوم پروتکل ماشه — تایید
     * @param violationId شناسه تخلف
     */
    function signViolation(uint256 violationId)
        external
        onlyCourt
        nonReentrant
    {
        ViolationRecord storage record = violations[violationId];
        require(record.timestamp > 0,               "Kernel: violation not found");
        require(!record.triggered,                  "Kernel: trigger already activated");
        require(!violationSignatures[violationId][msg.sender], "Kernel: already signed");

        violationSignatures[violationId][msg.sender] = true;
        record.signaturesCount++;

        emit ViolationSigned(violationId, msg.sender, record.signaturesCount);

        // اگر به آستانه Multi-Sig رسید، ماشه را فعال کن
        if (record.signaturesCount >= MULTISIG_THRESHOLD) {
            record.courtConfirmed = true;
            _activateTrigger(violationId);
        }
    }

    /**
     * @notice فعال‌سازی ماشه و سلب دسترسی مقام خاطی
     * @dev لایه سوم پروتکل ماشه — اجرا (خودکار)
     *      پس از سلب دسترسی داخلی، قرارداد TriggerProtocol را برای
     *      مسدودسازی خزانه و اطلاع‌رسانی عمومی فراخوانی می‌کند.
     * @param violationId شناسه تخلف
     */
    function _activateTrigger(uint256 violationId) internal {
        ViolationRecord storage record = violations[violationId];
        require(!record.triggered, "Kernel: already triggered");

        record.triggered = true;
        triggerActivationCount++;

        // لایه اول اجرا: سلب دسترسی حاکمیتی داخلی
        _revokeOfficialAccess(record.offender, record.reason);

        // لایه دوم اجرا: فراخوانی TriggerProtocol برای مسدودسازی خزانه
        // و اطلاع‌رسانی عمومی (اگر آدرس قرارداد تنظیم شده باشد)
        if (triggerProtocol != address(0)) {
            ITriggerProtocol(triggerProtocol).executeTrigger(
                violationId,
                record.offender,
                record.violationCode,
                address(0)
            );
        }

        emit TriggerActivated(
            violationId,
            record.offender,
            record.violationCode,
            block.timestamp
        );
    }

    /**
     * @notice سلب دسترسی‌های حاکمیتی مقام خاطی
     * @param offender آدرس مقام خاطی
     * @param reason دلیل سلب دسترسی
     */
    function _revokeOfficialAccess(address offender, string memory reason) internal {
        OfficialAccess storage access = officialAccess[offender];
        access.isActive         = false;
        access.revokedAt        = block.timestamp;
        access.suspensionReason = reason;

        // سلب تمام نقش‌های حاکمیتی
        if (hasRole(SOVEREIGN_ROLE, offender)) {
            _revokeRole(SOVEREIGN_ROLE, offender);
        }
        if (hasRole(COURT_ROLE, offender)) {
            _revokeRole(COURT_ROLE, offender);
        }
        if (hasRole(GUARDIAN_ROLE, offender)) {
            _revokeRole(GUARDIAN_ROLE, offender);
        }

        emit AccessRevoked(offender, reason, block.timestamp);
    }

    // ─────────────────────────────────────────
    // مدیریت دسترسی مقامات
    // ─────────────────────────────────────────

    /**
     * @notice اعطای دسترسی به مقام جدید
     * @param official آدرس مقام
     * @param role نقش مقام
     */
    function grantOfficialAccess(address official, bytes32 role)
        external
        onlySovereign
        nonReentrant
    {
        require(official != address(0), "Kernel: invalid address");
        require(
            role == COURT_ROLE || role == GUARDIAN_ROLE || role == ORACLE_ROLE,
            "Kernel: invalid role"
        );

        _grantRole(role, official);

        officialAccess[official] = OfficialAccess({
            isActive:         true,
            role:             role,
            grantedAt:        block.timestamp,
            revokedAt:        0,
            suspensionReason: ""
        });

        emit AccessGranted(official, role, block.timestamp);
    }

    /**
     * @notice بررسی فعال بودن دسترسی یک مقام
     * @param official آدرس مقام
     */
    function isAccessActive(address official) external view returns (bool) {
        return officialAccess[official].isActive;
    }

    // ─────────────────────────────────────────
    // مدیریت قفل اضطراری
    // ─────────────────────────────────────────

    /**
     * @notice فعال‌سازی قفل اضطراری سیستم
     */
    function _activateEmergencyLock() internal {
        if (!emergencyLockActive) {
            emergencyLockActive = true;
            emit EmergencyLockActivated(block.timestamp);
        }
    }

    /**
     * @notice غیرفعال‌سازی قفل اضطراری پس از رفع تخلف
     * @dev تنها پس از حکم دادگاه عالی ممکن است
     */
    function deactivateEmergencyLock() external onlyCourt nonReentrant {
        require(emergencyLockActive, "Kernel: no active emergency lock");
        emergencyLockActive = false;
        emit EmergencyLockDeactivated(block.timestamp);
    }

    // ─────────────────────────────────────────
    // به‌روزرسانی قراردادهای وابسته
    // ─────────────────────────────────────────

    /**
     * @notice به‌روزرسانی آدرس قرارداد پروتکل ماشه
     * @dev نیازمند تایید پادشاه
     */
    function setTriggerProtocol(address _triggerProtocol)
        external
        onlySovereign
        nonReentrant
    {
        require(_triggerProtocol != address(0), "Kernel: invalid address");
        address old = triggerProtocol;
        triggerProtocol = _triggerProtocol;
        emit KernelContractUpdated("TriggerProtocol", old, _triggerProtocol);
    }

    /**
     * @notice به‌روزرسانی آدرس صندوق ثروت ملی
     * @dev نیازمند تایید پادشاه
     */
    function setSovereignWealthFund(address _swf)
        external
        onlySovereign
        nonReentrant
    {
        require(_swf != address(0), "Kernel: invalid address");
        address old = sovereignWealthFund;
        sovereignWealthFund = _swf;
        emit KernelContractUpdated("SovereignWealthFund", old, _swf);
    }

    // ─────────────────────────────────────────
    // توابع خواندنی (View Functions)
    // ─────────────────────────────────────────

    /**
     * @notice دریافت جزییات یک تخلف
     */
    function getViolation(uint256 violationId)
        external
        view
        returns (ViolationRecord memory)
    {
        require(violations[violationId].timestamp > 0, "Kernel: violation not found");
        return violations[violationId];
    }

    /**
     * @notice بررسی اینکه آیا سیستم در وضعیت سالم است
     */
    function isSystemHealthy() external view returns (bool) {
        return !emergencyLockActive;
    }

    /**
     * @notice دریافت اطلاعات کلی سیستم
     */
    function getSystemInfo() external view returns (
        bool    _emergencyLockActive,
        uint256 _violationCount,
        uint256 _triggerActivationCount,
        uint256 _liquidityCap,
        uint256 _minReserveRatio
    ) {
        return (
            emergencyLockActive,
            violationCount,
            triggerActivationCount,
            LIQUIDITY_CAP,
            MIN_RESERVE_RATIO
        );
    }
}