// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PahlaviToken
 * @dev واحد پول ملی ایران — پهلوی (PAH)
 *
 * قوانین بنیادین غیرقابل تغییر (فرگرد ۷ منشور، بند ۳۹ و ۴۱ سپیدنامه):
 * ۱. سقف کل عرضه: ۹۰۰ میلیارد پهلوی — هیچ استثنایی ندارد
 * ۲. ضرب (Mint) تنها با نسبت پشتوانه حداقل ۳۳.۳٪ مجاز است
 * ۳. Minter فقط صندوق ثروت ملی است — بانک مرکزی یا دولت نمی‌توانند مستقیم ضرب کنند
 * ۴. در وضعیت اضطراری ماشه، تمام انتقال‌ها متوقف می‌شوند
 *
 * نسخه ۱.۱ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract PahlaviToken is ERC20, AccessControl, ReentrancyGuard {

    // ─────────────────────────────────────────
    // نقش‌ها
    // ─────────────────────────────────────────

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant KERNEL_ROLE = keccak256("KERNEL_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ─────────────────────────────────────────
    // ثوابت سیستمی (قفل‌شده در منشور)
    // ─────────────────────────────────────────

    /// @notice سقف ۹۰۰ میلیارد پهلوی — فرگرد ۷ منشور، بند ۴۱ سپیدنامه
    uint256 public constant MAX_SUPPLY = 900_000_000_000 * 1e18;

    /// @notice حداقل نسبت پشتوانه ۳۳.۳٪ (در هزارم)
    uint256 public constant MIN_RESERVE_RATIO = 333;

    /// @notice هر پهلوی = ۱۰۰۰ سره (واحد کوچک‌تر)
    uint256 public constant SAREH_PER_PAHLAVI = 1000;

    // ─────────────────────────────────────────
    // حالت سیستم
    // ─────────────────────────────────────────

    address public sovereignWealthFund;
    address public kernel;

    /// @notice ذخایر دارایی (ارزش دلاری ثبت‌شده توسط اوراکل — در واحد 1e18)
    uint256 public totalReserves;

    /// @notice وضعیت اضطراری — در صورت فعال بودن، انتقال‌ها متوقف می‌شوند
    bool public emergencyMode;

    // ─────────────────────────────────────────
    // رویدادها
    // ─────────────────────────────────────────

    event PahlaviMinted(address indexed to, uint256 amount, uint256 newTotalSupply, string reason);
    event PahlaviBurned(address indexed from, uint256 amount, uint256 newTotalSupply, string reason);
    event ReservesUpdated(uint256 oldReserves, uint256 newReserves, uint256 reserveRatioInThousandths);
    event EmergencyModeActivated(uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    event SWFAddressUpdated(address oldSWF, address newSWF);

    // ─────────────────────────────────────────
    // تعدیل‌کننده‌ها
    // ─────────────────────────────────────────

    modifier notInEmergency() {
        require(!emergencyMode, "PAH: system in emergency mode");
        _;
    }

    modifier onlyKernel() {
        require(hasRole(KERNEL_ROLE, msg.sender), "PAH: caller is not the Kernel");
        _;
    }

    /// @dev بررسی رعایت سقف نقدینگی و نسبت پشتوانه پیش از ضرب
    modifier reserveCompliant(uint256 mintAmount) {
        uint256 newSupply = totalSupply() + mintAmount;
        require(newSupply <= MAX_SUPPLY, "PAH: exceeds liquidity cap");
        if (newSupply > 0) {
            uint256 ratio = (totalReserves * 1000) / newSupply;
            require(ratio >= MIN_RESERVE_RATIO, "PAH: reserve ratio below minimum 33.3%");
        }
        _;
    }

    // ─────────────────────────────────────────
    // سازنده
    // ─────────────────────────────────────────

    /**
     * @param _swf آدرس صندوق ثروت ملی (تنها مجاز به ضرب)
     * @param _kernel آدرس قرارداد Kernel
     * @param _initialReserves ذخایر اولیه ثبت‌شده (برای محاسبه نسبت پشتوانه)
     */
    constructor(
        address _swf,
        address _kernel,
        uint256 _initialReserves
    ) ERC20("Pahlavi", "PAH") {
        require(_swf    != address(0), "PAH: invalid SWF address");
        require(_kernel != address(0), "PAH: invalid kernel address");

        sovereignWealthFund = _swf;
        kernel              = _kernel;
        totalReserves       = _initialReserves;

        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
        _grantRole(MINTER_ROLE, _swf);
        _grantRole(BURNER_ROLE, _swf);
        _grantRole(PAUSER_ROLE, _kernel);
    }

    // ─────────────────────────────────────────
    // بازنویسی ERC20 برای اعمال توقف اضطراری
    // ─────────────────────────────────────────

    function transfer(address to, uint256 amount)
        public
        override
        notInEmergency
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount)
        public
        override
        notInEmergency
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }

    // ─────────────────────────────────────────
    // توابع حاکمیتی
    // ─────────────────────────────────────────

    /**
     * @notice ضرب پهلوی جدید — فقط با پشتوانه کافی از صندوق ثروت ملی
     * @param to آدرس دریافت‌کننده
     * @param amount مقدار (در واحد 1e18)
     * @param reason دلیل ضرب (برای شفافیت عمومی)
     */
    function mint(address to, uint256 amount, string calldata reason)
        external
        onlyRole(MINTER_ROLE)
        notInEmergency
        nonReentrant
        reserveCompliant(amount)
    {
        require(to     != address(0), "PAH: mint to zero address");
        require(amount  > 0,          "PAH: mint zero amount");
        require(bytes(reason).length > 0, "PAH: reason required");

        _mint(to, amount);
        emit PahlaviMinted(to, amount, totalSupply(), reason);
    }

    /**
     * @notice سوزاندن پهلوی (برای تنظیم عرضه یا بازپس‌گیری)
     * @param from آدرس صاحب توکن
     * @param amount مقدار
     * @param reason دلیل سوزاندن
     */
    function burn(address from, uint256 amount, string calldata reason)
        external
        onlyRole(BURNER_ROLE)
        nonReentrant
    {
        require(from   != address(0),         "PAH: burn from zero address");
        require(amount  > 0,                  "PAH: burn zero amount");
        require(balanceOf(from) >= amount,    "PAH: insufficient balance");
        require(bytes(reason).length > 0,     "PAH: reason required");

        _burn(from, amount);
        emit PahlaviBurned(from, amount, totalSupply(), reason);
    }

    // ─────────────────────────────────────────
    // به‌روزرسانی ذخایر (توسط اوراکل از طریق Kernel)
    // ─────────────────────────────────────────

    /**
     * @notice به‌روزرسانی مقدار ذخایر پشتوانه
     * @dev فراخوانی توسط API3Oracle از طریق Kernel
     * @param newReserves ارزش دلاری ذخایر در واحد 1e18
     */
    function updateReserves(uint256 newReserves) external onlyKernel {
        uint256 old = totalReserves;
        totalReserves = newReserves;
        uint256 supply = totalSupply();
        uint256 ratio = supply > 0 ? (newReserves * 1000) / supply : 1000;
        emit ReservesUpdated(old, newReserves, ratio);
    }

    // ─────────────────────────────────────────
    // کنترل وضعیت اضطراری
    // ─────────────────────────────────────────

    /**
     * @notice فعال‌سازی وضعیت اضطراری — توقف تمام انتقال‌ها
     * @dev توسط Kernel در هنگام فعال‌سازی ماشه فراخوانی می‌شود
     */
    function activateEmergencyMode() external onlyRole(PAUSER_ROLE) {
        require(!emergencyMode, "PAH: already in emergency mode");
        emergencyMode = true;
        emit EmergencyModeActivated(block.timestamp);
    }

    /**
     * @notice غیرفعال‌سازی وضعیت اضطراری — پس از رفع تخلف
     */
    function deactivateEmergencyMode() external onlyRole(PAUSER_ROLE) {
        require(emergencyMode, "PAH: not in emergency mode");
        emergencyMode = false;
        emit EmergencyModeDeactivated(block.timestamp);
    }

    // ─────────────────────────────────────────
    // به‌روزرسانی آدرس‌ها
    // ─────────────────────────────────────────

    function setSovereignWealthFund(address _swf) external onlyKernel {
        require(_swf != address(0), "PAH: invalid SWF address");
        address old = sovereignWealthFund;
        _revokeRole(MINTER_ROLE, sovereignWealthFund);
        _revokeRole(BURNER_ROLE, sovereignWealthFund);
        sovereignWealthFund = _swf;
        _grantRole(MINTER_ROLE, _swf);
        _grantRole(BURNER_ROLE, _swf);
        emit SWFAddressUpdated(old, _swf);
    }

    // ─────────────────────────────────────────
    // توابع خواندنی
    // ─────────────────────────────────────────

    /// @notice نسبت پشتوانه فعلی (در هزارم) — باید بالای ۳۳۳ باشد
    function currentReserveRatio() external view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 1000;
        return (totalReserves * 1000) / supply;
    }

    /// @notice ظرفیت باقی‌مانده تا سقف نقدینگی
    function remainingMintCapacity() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /// @notice آیا سیستم می‌تواند مقدار مشخصی ضرب کند؟
    function canMint(uint256 amount) external view returns (bool) {
        if (totalSupply() + amount > MAX_SUPPLY) return false;
        uint256 newSupply = totalSupply() + amount;
        if (newSupply == 0) return true;
        return (totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO;
    }
}
