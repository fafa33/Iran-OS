<div dir="rtl">

# گزارش مرز پیاده‌سازی — CLC-03: بررسی تازگی داده اوراکل

**نسخه:** 1.0  
**تاریخ:** ۲۵۸۵ شاهنشاهی / ۲۰۲۶ میلادی  
**مرحله:** Step 40  
**وضعیت:** تأیید شکاف — بدون پیاده‌سازی

---

## فهرست مطالب

1. [خلاصه](#خلاصه)
2. [شکاف تأییدشده CLC-03](#شکاف-تأییدشده-cLC-03)
3. [یافته‌های بازرسی](#یافته‌های-بازرسی)
4. [TRIGGER_TIMEOUT بدون فراخوانی اجرایی](#trigger_timeout-بدون-فراخوانی-اجرایی)
5. [مرز پیاده‌سازی](#مرز-پیاده‌سازی)
6. [گام بعدی](#گام-بعدی)

---

## خلاصه

شکاف CLC-03 در مسیر `flagViolation()` قرارداد `API3Oracle.sol` تأیید شد. این قرارداد هیچ بررسی تازگی داده (staleness check) روی نقاط داده تغذیه‌شده پیش از ثبت تخلف اعمال نمی‌کند. همچنین ثابت `TRIGGER_TIMEOUT = 72 hours` در `kernel.sol` هیچ call-site اجرایی ندارد. پیاده‌سازی اصلاح نیازمند تغییر قرارداد است و بدون مجوز صریح انجام نخواهد شد.

---

## شکاف تأییدشده CLC-03

| فیلد | مقدار |
|------|-------|
| قرارداد | `contracts/oracles/API3Oracle.sol` |
| تابع | `flagViolation()` — خط ۸۴ |
| نوع شکاف | فقدان بررسی تازگی داده |
| ریسک | P0 |
| وضعیت | تأیید شد — بدون پیاده‌سازی |

---

## یافته‌های بازرسی

### ساختار DataPoint

```
API3Oracle.sol:29–37
struct DataPoint {
    uint8   dataType;
    bytes32 key;
    int256  value;
    uint256 timestamp;   // ← ذخیره می‌شود
    address feeder;
    bool    isValid;
    uint256 confidence;
}
```

فیلد `timestamp` در ساختار `DataPoint` وجود دارد و در هر فراخوانی `feedData()` به `block.timestamp` تنظیم می‌شود (خط ۸۰).

### مسیر flagViolation

```
API3Oracle.sol:84–92
function flagViolation(address offender, uint8 violationCode, string calldata reason)
    external onlyFeeder nonReentrant returns (uint256 flagId)
```

- ثبت زمان فعلی `block.timestamp` در `ViolationFlag.timestamp` (خط ۸۹)
- هیچ بررسی سن داده (`DataPoint.timestamp`) در برابر `block.timestamp` انجام نمی‌شود
- هیچ ثابت `MAX_DATA_AGE` یا معادل آن تعریف نشده
- فراخوانی مستقیم به `IIranOSKernel(kernel).flagViolation()` (خط ۹۱) بدون اعتبارسنجی تازگی

**نتیجه:** یک feeder می‌تواند تخلف را بر اساس داده‌ای که هفته‌ها یا ماه‌ها پیش تغذیه شده اعلام کند و قفل اضطراری Kernel را فعال کند.

---

## TRIGGER_TIMEOUT بدون فراخوانی اجرایی

| موقعیت | نوع |
|--------|-----|
| `kernel.sol:57` — `uint256 public constant TRIGGER_TIMEOUT = 72 hours` | اعلام |
| `test/01_kernel.test.js:46` — `expect(await kernel.TRIGGER_TIMEOUT()).to.equal(72n * 3600n)` | خواندن در تست |
| `test/01_kernel.test.js:259` — مقایسه در تست timeout | خواندن در تست |

**هیچ call-site اجرایی در هیچ قراردادی وجود ندارد.**

تابع `deactivateEmergencyLock()` (خط ۴۳۵) فقط از طریق `onlyCourt` قابل فراخوانی است. هیچ مسیر timeout-based یا Sovereign-fallback وجود ندارد. اگر Court در دسترس نباشد، قفل اضطراری نامحدود باقی می‌ماند.

---

## مرز پیاده‌سازی

**پیاده‌سازی اصلاح در این مرحله انجام نشد.**

اصلاح CLC-03 نیازمند تغییر قراردادهای زیر است:

| قرارداد | تغییر موردنیاز |
|---------|---------------|
| `API3Oracle.sol` | افزودن ثابت `MAX_DATA_AGE`؛ بررسی سن `DataPoint` در `flagViolation()` |
| `kernel.sol` | ردیابی `lockActivatedAt`؛ افزودن مسیر Sovereign با بررسی `TRIGGER_TIMEOUT` |

هر دو تغییر خارج از محدوده docs-only این مرحله هستند و مستلزم مجوز صریح برای مرحله بعدی می‌باشند.

---

## گام بعدی

پیاده‌سازی CLC-03 باید به صراحت مجاز شود. هیچ تغییری در قراردادها، تست‌ها، یا آستانه‌های حاکمیتی بدون دستور صریح اعمال نخواهد شد.

ثابت‌های محافظت‌شده:
- `TRIGGER_TIMEOUT = 72 hours` — تغییرناپذیر
- `MULTISIG_THRESHOLD = 7` — تغییرناپذیر
- `MIN_RESERVE_RATIO = 333` — تغییرناپذیر
- Step 12/13 — باز

</div>
