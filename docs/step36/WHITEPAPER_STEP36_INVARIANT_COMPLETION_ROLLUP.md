<div dir="rtl">

# رول‌آپ تکمیل اینوریانت‌ها — گام ۳۶

**نوع سند:** documentation-only / completion rollup  
**وضعیت:** باز؛ این سند گام ۳۶ را کامل یا بسته اعلام نمی‌کند.  
**تاریخ:** فروردین ۲۵۸۵ شاهنشاهی / مارس–آوریل ۲۰۲۶ میلادی  
**هد اصلی:** `e0f91de`  
**تعداد تست‌ها:** ۴۸۷ passing

## non-claim

این سند هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- production readiness
- release approval
- completed external audit
- completed formal verification
- blocker closure
- accepted evidence
- reviewer signoff
- completion of Step 12
- completion of Step 13

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

---

## ۱. هدف

**هدف گام ۳۶:** تکمیل پوشش اینوریانت‌های رسمی در سه حوزه اصلی — PahlaviToken (پولی)، Treasury (خزانه)، و BudgetAllocation (بودجه).

**محدوده:** تست‌های اینوریانت فقط. بدون تغییر قرارداد، بدون تغییر مستندات دکترین، بدون ادعای readiness یا signoff.

**الگوی اینوریانت:** هر اینوریانت باید دو چیز را اثبات کند:
1. مسیر مجاز (عملیات معتبر موفق می‌شود)
2. مسیر نقض (عملیات نامعتبر revert می‌کند و وضعیت قرارداد بدون تغییر می‌ماند — state-neutrality)

---

## ۲. اینوریانت‌های پولی پوشش‌داده‌شده (PahlaviToken)

| ID | توضیح | فایل تست | commit |
|----|-------|-----------|--------|
| INV-02 | نسبت ذخیره (ratio ≥ MIN_RESERVE_RATIO=333) در چند مرحله mint حفظ می‌شود؛ مرحله‌ای که ratio را به ۳۳۲ می‌رساند revert می‌کند و supply بدون تغییر می‌ماند | `test/02_pahlavi_token.test.js` | `42763bd` |
| INV-03 | `updateReserves()` توکن mint نمی‌کند؛ حتی پس از افزایش حداکثری ذخایر، gate سقف نقدینگی فعال می‌ماند | `test/02_pahlavi_token.test.js` | `306c4c6` |
| INV-04 | وضعیت اضطراری mint را مسدود می‌کند؛ supply بدون تغییر می‌ماند | `test/02_pahlavi_token.test.js` | `7f39056` |
| INV-05a | mint که ratio را دقیقاً ۳۳۳ می‌کند (مرز پایین) موفق می‌شود | `test/02_pahlavi_token.test.js` | `3d5c569` |
| INV-05b | mint که ratio را به ۳۳۲ می‌رساند revert می‌کند؛ supply بدون تغییر می‌ماند | `test/02_pahlavi_token.test.js` | `3d5c569` |
| INV-06a | mint که supply را دقیقاً به MAX_SUPPLY (900B PAH) می‌رساند موفق می‌شود | `test/02_pahlavi_token.test.js` | `90e3cb4` |
| INV-06b | mint که از MAX_SUPPLY تجاوز می‌کند revert می‌کند؛ supply بدون تغییر می‌ماند | `test/02_pahlavi_token.test.js` | `90e3cb4` |
| Burn conservation | burn مقدار دقیق را از supply کم می‌کند؛ totalReserves بدون تغییر می‌ماند | `test/02_pahlavi_token.test.js` | `0ff4aa3` |

**ثوابت تغییرناپذیر تأیید‌شده:**
- `MAX_SUPPLY = 900_000_000_000 × 1e18`
- `MIN_RESERVE_RATIO = 333` (۳۳.۳٪ در هزارم)

---

## ۳. اینوریانت‌های Treasury پوشش‌داده‌شده

| ID | توضیح | فایل تست | commit |
|----|-------|-----------|--------|
| TINV-01 | `totalBudgetAllocated` در چند مرحله `createBudgetLine` انباشته می‌شود؛ مجموع دقیقاً به `ANNUAL_BUDGET_CAP=150B PAH` می‌رسد؛ ۱ wei بیشتر revert می‌کند و `totalBudgetAllocated` بدون تغییر می‌ماند | `test/09_Treasury.test.js` | `1404f31` |
| TINV-04 | خرج یک ردیف بودجه تا سقف تخصیص موفق می‌شود؛ ۱ wei بیشتر revert می‌کند و `line.spent` بدون تغییر می‌ماند | `test/09_Treasury.test.js` | `4724035` |
| TINV-05 | `signTransaction()` وقتی recipient مسدود شده revert می‌کند؛ `signaturesCount`، `executed`، امضای حسابرس، و `line.spent` بدون تغییر می‌مانند | `test/09_Treasury.test.js` | `19d4410` |
| TINV-06 | `signTransaction()` روی تراکنش execute‌شده revert می‌کند؛ `executed`، `signaturesCount`، و `line.spent` بدون تغییر می‌مانند | `test/09_Treasury.test.js` | `cf3395b` |
| TINV-07 | `signTransaction()` روی تراکنش رد‌شده revert می‌کند؛ `rejected`، `signaturesCount`، و `line.spent` بدون تغییر می‌مانند | `test/09_Treasury.test.js` | `cf3395b` |
| TINV-08 | `proposeTransaction()` برای recipient مسدودشده revert می‌کند؛ `txCount` و بودجه ردیف بدون تغییر می‌مانند | `test/09_Treasury.test.js` | `9dcdb72` |

**ثابت تغییرناپذیر تأیید‌شده:**
- `MULTISIG_THRESHOLD = 3` (Treasury)
- `ANNUAL_BUDGET_CAP = 150_000_000_000 × 1e18`

---

## ۴. اینوریانت‌های BudgetAllocation پوشش‌داده‌شده

| ID | توضیح | فایل تست | commit |
|----|-------|-----------|--------|
| TINV-02 | `sectorBudgets[s].spent` برابر مجموع دقیق تجمعی هزینه‌ها است؛ بخش بی‌ربط (Defense) بدون تغییر می‌ماند | `test/17_Budget_Allocation.test.js` | `c7007d8` |
| TINV-09 | مجموع ۸ نسبت بخش دقیقاً ۱۰۰۰ است (200+200+150+150+100+100+50+50) | `test/17_Budget_Allocation.test.js` | `3c9a2e7` |
| TINV-10 | `approveBudget()` دقیقاً `TOTAL_BUDGET=150B PAH` را بدون باقی‌مانده توزیع می‌کند | `test/17_Budget_Allocation.test.js` | `3c9a2e7` |
| P-01 | `recordExpenditure()` وقتی بودجه تأییدنشده است revert می‌کند؛ `sector.spent` و `expenditureCount` بدون تغییر می‌مانند | `test/17_Budget_Allocation.test.js` | جزء ریبیس گام ۳۱ |

---

## ۵. پوشش اضافی guard های Treasury

دو مسیر modifier `withinBudget` که در کاتالوگ رسمی TINV نبودند:

| مسیر | شرط | revert message | پوشش state-neutrality | commit |
|-------|-----|----------------|----------------------|--------|
| lineId ناموجود | `line.isActive == false` (struct پیش‌فرض) | `"Treasury: budget line not active"` | txCount و transaction slot بدون تغییر | `e0f91de` |
| ردیف سال مالی قدیم | `line.fiscalYear != currentFiscalYear` | `"Treasury: wrong fiscal year"` | txCount و transaction slot بدون تغییر | `e0f91de` |

---

## ۶. خلاصه رشد تست‌ها

| نقطه | تعداد تست |
|------|-----------|
| شروع گام ۳۶ (پس از merge PR #22) | ~۴۷۲ |
| پس از TINV-09/10 و P-01 (ریبیس) | ۴۷۸ |
| پس از INV-04 | ۴۷۹ |
| پس از INV-03 | ۴۸۰ |
| پس از INV-02 | ۴۸۱ |
| پس از burn conservation | ۴۸۱ |
| پس از TINV-02 | ۴۸۲ |
| پس از TINV-05 | ۴۸۳ |
| پس از TINV-08 | ۴۸۳ |
| پس از TINV-06/07 | ۴۸۳ |
| پس از TINV-04 | ۴۸۴ |
| پس از TINV-01 | ۴۸۵ |
| پس از Budget Guard Neutrality | **۴۸۷** |

**commit‌های اینوریانت گام ۳۶ (به ترتیب زمانی):**

| commit | توضیح |
|--------|-------|
| `3c9a2e7` | TINV-09/10: arithmetic integrity check |
| `7f39056` | INV-04: emergency mode blocks mint |
| `3d5c569` | INV-05a/b: monetary expansion boundary |
| `306c4c6` | INV-03: reserve update mint gate |
| `42763bd` | INV-02: reserve ratio floor |
| `0ff4aa3` | Burn conservation |
| `c7007d8` | TINV-02: budget spent accounting |
| `19d4410` | TINV-05: blocked recipient neutrality |
| `9dcdb72` | TINV-08: trigger block neutrality |
| `cf3395b` | TINV-06/07: executed and rejected sign blocks |
| `4724035` | TINV-04: budget exhaustion boundary |
| `1404f31` | TINV-01: annual budget cap accumulation |
| `e0f91de` | Budget guard neutrality (isActive + fiscalYear) |

---

## ۷. موارد باقی‌مانده

### Step 12 — باز

Step 12 باز می‌ماند. این سند Step 12 را نمی‌بندد و هیچ ادعایی درباره بسته‌شدن آن ندارد.

### Step 13 — باز

Step 13 باز می‌ماند. رجیستر شکاف‌های Step 13 در `docs/step13/WHITEPAPER_STEP13_GAP_REGISTER_FA.md` همچنان pending/needs-review است. این سند Step 13 را نمی‌بندد.

### مشاهدات traceability برچسب SWF

در `test/03_sovereign_wealth_fund.test.js`، آزمون‌های محافظت `totalAssets` و چرخه برداشت وجود دارند اما بدون برچسب INV-01، ST-02، یا ST-03. substance پوشش‌داده شده؛ traceability برچسب‌ها پوشش داده نشده. این یک شکاف مستنداتی است نه شکاف تست.

### شکاف اینوریانت قانون اساسی

پس از بررسی کامل کاتالوگ TINV/INV رسمی، هیچ شکاف اینوریانت قانون اساسی‌ای شناسایی نشده است. تمام ۱۶ اینوریانت نام‌گذاری‌شده پوشش داده شده‌اند.

### طراحی باز (بدون تغییر قرارداد)

- **TG-01:** `TriggerProtocol.blockedFromTreasury[]` با `Treasury.blockedByTrigger[]` یکی نیست — فعال‌سازی trigger به‌طور خودکار دسترسی Treasury را مسدود نمی‌کند. این یک شکاف طراحی است که Option D (حکمرانی انسانی پس از trigger) آن را پوشش می‌دهد. بدون تغییر قرارداد.
- **DG-01:** TriggerProtocol در فعال‌سازی trigger، COUNCIL_ROLE صندوق ثروت ملی را لغو نمی‌کند. Option D پوشش می‌دهد. بدون تغییر قرارداد.

---

## ۸. نتیجه‌گیری

کاتالوگ رسمی INV/TINV در گام ۳۶ به طور کامل پوشش داده شده است.

این سند ادعا نمی‌کند که:
- هیچ باگی وجود ندارد
- قراردادها برای تولید آماده هستند
- هیچ audit خارجی انجام شده
- هیچ signoff دریافت شده
- Step 12 یا Step 13 بسته شده‌اند

گام بعدی باید توسط بازبین قرارداد، auditor، یا مرحله بعدی مهندسی تعریف شود.

</div>
