// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IRecognizedReserveBacking {
    function recognizedBackingTotal() external view returns (uint256);
}

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
    address public recognizedReserveBacking;

    /// @notice ذخایر پشتوانه ثبت‌شده برای حسابداری توکن — در واحد 1e18
    uint256 public totalReserves;

    /// @notice وضعیت اضطراری — در صورت فعال بودن، انتقال‌ها متوقف می‌شوند
    bool public emergencyMode;

    /// @notice وضعیت نقض کف پشتوانه — true وقتی حسابداری ذخایر شناخته‌شده نسبت را زیر MIN_RESERVE_RATIO برده باشد
    /// @dev توسط syncRecognizedBackingTotal() و burn() تنظیم و پاک می‌شود. مسیر اوراکل دیگر حسابداری ذخایر را تغییر نمی‌دهد.
    bool public reserveFloorBreached;

    // ─────────────────────────────────────────
    // رویدادها
    // ─────────────────────────────────────────

    event PahlaviMinted(address indexed to, uint256 amount, uint256 newTotalSupply, string reason);
    event PahlaviBurned(address indexed from, uint256 amount, uint256 newTotalSupply, string reason);
    event ReservesUpdated(uint256 oldReserves, uint256 newReserves, uint256 reserveRatioInThousandths);

    /// @notice نقض کف نسبت پشتوانه — هنگامی که updateReserves نسبت را برای عرضه موجود زیر MIN_RESERVE_RATIO می‌برد
    /// @dev CF-1 Option C. با هر تماس updateReserves که در وضعیت نقض است، منتشر می‌شود.
    event ReserveFloorBreached(
        uint256 oldReserves,
        uint256 newReserves,
        uint256 ratioInThousandths,
        uint256 supplyAtBreach
    );

    /// @notice بازگشت انطباق — هنگامی که updateReserves یا burn نسبت را به MIN_RESERVE_RATIO یا بالاتر بازمی‌گرداند
    /// @dev CF-1 Option C. یک بار در انتقال از وضعیت نقض به انطباق منتشر می‌شود.
    event ReserveFloorRestored(
        uint256 newReserves,
        uint256 ratioInThousandths,
        uint256 supply
    );

    event EmergencyModeActivated(uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    event SWFAddressUpdated(address oldSWF, address newSWF);
    event RecognizedReserveBackingUpdated(address oldBacking, address newBacking);

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
     * @dev CF-1 Option C: اگر در حالت نقض باشیم و سوزاندن نسبت را به MIN_RESERVE_RATIO یا بالاتر برساند،
     *      وضعیت نقض پاک و ReserveFloorRestored منتشر می‌شود.
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
        if (reserveFloorBreached) {
            uint256 supply = totalSupply();
            uint256 ratio = supply > 0 ? (totalReserves * 1000) / supply : 1000;
            if (ratio >= MIN_RESERVE_RATIO) {
                reserveFloorBreached = false;
                emit ReserveFloorRestored(totalReserves, ratio, supply);
            }
        }
    }

    // ─────────────────────────────────────────
    // به‌روزرسانی ذخایر (توسط اوراکل از طریق Kernel)
    // ─────────────────────────────────────────

    /**
     * @notice مسیر سازگاری برای گزارش ذخایر اوراکل
     * @dev این مسیر دیگر حسابداری ذخایر پولی را تغییر نمی‌دهد. تنها مسیر مجاز
     *      برای تغییر totalReserves، syncRecognizedBackingTotal() از قرارداد
     *      RecognizedReserveBacking متصل‌شده است.
     * @param newReserves ارزش گزارش‌شده توسط اوراکل؛ برای حسابداری پولی استفاده نمی‌شود.
     */
    function updateReserves(uint256 newReserves) external onlyKernel {
        newReserves;
        uint256 currentReserves = totalReserves;
        uint256 supply = totalSupply();
        uint256 ratio = supply > 0 ? (currentReserves * 1000) / supply : 1000;
        emit ReservesUpdated(currentReserves, currentReserves, ratio);
    }

    /**
     * @notice همگام‌سازی ذخایر توکن با recognizedBackingTotal
     * @dev فقط Kernel می‌تواند این مسیر صریح را فراخوانی کند. مقدار totalReserves
     *      با recognizedBackingTotal جایگزین می‌شود و با ذخایر موجود جمع نمی‌شود.
     */
    function syncRecognizedBackingTotal() external onlyKernel {
        require(
            recognizedReserveBacking != address(0),
            "PAH: recognized backing not set"
        );
        uint256 recognizedTotal =
            IRecognizedReserveBacking(recognizedReserveBacking).recognizedBackingTotal();
        _setReserves(recognizedTotal);
    }

    function _setReserves(uint256 newReserves) internal {
        uint256 old = totalReserves;
        totalReserves = newReserves;
        uint256 supply = totalSupply();
        uint256 ratio = supply > 0 ? (newReserves * 1000) / supply : 1000;
        emit ReservesUpdated(old, newReserves, ratio);
        if (supply > 0 && ratio < MIN_RESERVE_RATIO) {
            if (!reserveFloorBreached) {
                reserveFloorBreached = true;
            }
            emit ReserveFloorBreached(old, newReserves, ratio, supply);
        } else if (reserveFloorBreached) {
            reserveFloorBreached = false;
            emit ReserveFloorRestored(newReserves, ratio, supply);
        }
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

    /**
     * @notice تنظیم قرارداد ثبت پشتوانه شناخته‌شده
     * @dev فقط Kernel می‌تواند این پیوند را برقرار کند. پس از تنظیم، مسیر
     *      updateReserves دیگر نمی‌تواند داده اوراکل را به ظرفیت ضرب تبدیل کند.
     * @param _recognizedReserveBacking آدرس قرارداد RecognizedReserveBacking
     */
    function setRecognizedReserveBacking(address _recognizedReserveBacking)
        external
        onlyKernel
    {
        require(
            _recognizedReserveBacking != address(0),
            "PAH: invalid recognized backing"
        );
        address old = recognizedReserveBacking;
        recognizedReserveBacking = _recognizedReserveBacking;
        emit RecognizedReserveBackingUpdated(old, _recognizedReserveBacking);
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
