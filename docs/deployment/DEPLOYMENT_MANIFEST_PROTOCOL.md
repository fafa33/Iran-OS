<div dir="rtl">

# مانیفست استقرار IranOS — پروتکل مستندسازی

**نسخه:** ۱.۳.۳  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**توسعه به پوشش ۲۵/۲۵:** ۲۴ خرداد ۲۵۸۵ شاهنشاهی / ۱۴ ژوئن ۲۰۲۶ میلادی  
**افزودن RecognizedReserveBacking و رفع شکاف setPahlaviToken:** ۱۴ تیر ۲۵۸۵ شاهنشاهی / ۵ ژوئیه ۲۰۲۶ میلادی  
**افزودن اسکریپت‌های اجرایی deploy/ برای مسیر اصلی پولی (۶ قرارداد):** ۱۴ تیر ۲۵۸۵ شاهنشاهی / ۵ ژوئیه ۲۰۲۶ میلادی  
**افزودن اسکریپت‌های اجرایی deploy/ برای ۵ قرارداد Layer 1 اضافی (VictimFund، ConstitutionGuard، JurySelection، JusticeProtocol، CitizenCard — مجموعاً ۱۱ از ۲۵ قرارداد):** ۱۵ تیر ۲۵۸۵ شاهنشاهی / ۶ ژوئیه ۲۰۲۶ میلادی  
**رفع P0 هم‌ترازی مسیر استقرار — sovereign به‌جای kernel در ۵ قرارداد Layer 1:** ۱۵ تیر ۲۵۸۵ شاهنشاهی / ۶ ژوئیه ۲۰۲۶ میلادی  
**افزودن اسکریپت اجرایی deploy/ برای PriceOracle (مجموعاً ۱۲ از ۲۵ قرارداد):** ۱۶ تیر ۲۵۸۵ شاهنشاهی / ۷ ژوئیه ۲۰۲۶ میلادی  
**شناسه شکاف:** G-11  
**نوع:** مستندات استقرار — بدون تغییر قرارداد  
**وضعیت:** راهنمای مرجع پیش از استقرار

---

> **⚠️ این سند مستندات‌محور است.**  
> **[استقرار انجام نمی‌شود | آمادگی تولید اعلام نمی‌شود | Step 12 بسته نمی‌شود | Step 13 بسته نمی‌شود | حسابرسی یا تأیید رسمی نیست]**

---

> **⚠️ یادداشت دامنه (نسخه ۱.۱.۰):**
> این نسخه نقشه وابستگی سازنده، جایگاه لایه، ترتیب استقرار و ارجاع سیم‌کشی نقش را برای **هر ۲۵ قرارداد مخزن** پوشش می‌دهد (پیش‌تر ۱۶/۲۵). ۹ قرارداد افزوده‌شده عبارت‌اند از:
>
> `VotingSystem`، `Parliament`، `BudgetAllocation`، `Fargard7PolicyAdapter`، `VelocityFee`، `BaseIncome`، `HealthCoverage`، `DisabilitySupport`، `SovereignCrawler`
>
> این اطلاعات صرفاً از **امضای سازنده و ثابت‌های نقشِ موجود در سورس مخزن** استخراج شده‌اند؛ هیچ آدرس، مقدار سازنده، هش، تخمین gas، یا اسکریپت استقراری اضافه نشده است.
>
> **وضعیت اسکریپت استقراری در نسخه ۱.۱.۰:** در این نسخه هیچ اسکریپت استقراری (`deploy/`) وجود نداشت و هیچ استقراری اجرا نشده بود. پوشش مستندیِ نقشه استقرار در آن زمان **۲۵/۲۵** بود، اما نیمه‌ی اجراییِ G-11 (اسکریپت‌ها، اجرای dry-run، هش‌ها، gas) باز بود. **این وضعیت دیگر کامل صادق نیست — به‌روزرسانی نسخه ۱.۳.۰ در پایین این بخش را ببینید.** `STEP9-BLOCK-005` در نسخه ۱.۳.۰ نیز همچنان **OPEN/PENDING** است.

> **⚠️ یادداشت دامنه (نسخه ۱.۲.۰):**
> این نسخه دو شکاف مستندیِ کشف‌شده در بازبینی هم‌ترازی استقرار را می‌بندد: (۱) قرارداد `RecognizedReserveBacking` — که از PR #110 تنها مسیر تولیدیِ تغییر `PahlaviToken.totalReserves` است — در نقشه وابستگی، ترتیب استقرار، و چک‌لیست پس از استقرار غایب بود؛ اکنون در بخش‌های ۲، ۳ (مرحله ۵)، و ۹ مستند شده است. (۲) فراخوانی `kernel.setPahlaviToken()` — پیش‌نیاز GAP-MEX-05 برای تمام مسیرهای `syncReserves`/`setPahlaviRecognizedReserveBacking`/`syncRecognizedBackingTotal` — در چک‌لیست پس از استقرار تأیید می‌شد اما در ترتیب اجباری استقرار (بخش ۳) به عنوان یک گام صریح ذکر نشده بود؛ اکنون به مرحله ۱۳ افزوده شده است. همچنین توضیح بخش ۶ (سیم‌کشی Oracle) به‌روزرسانی شد تا منعکس‌کند `syncReserves`/`updateReserves` پس از سیاست طبقه‌بندی پشتوانه (PR #113) صرفاً تله‌متری است و دیگر `totalReserves` را تغییر نمی‌دهد. شمار تست در چک‌لیست پیش از استقرار (بخش ۸) از ۶۹۳ به ۷۲۶ به‌روزرسانی شد. هیچ تغییر قراردادی در این نسخه اعمال نشده است.
>
> **⚠️ به‌روزرسانی (نسخه ۱.۳.۰):** اسکریپت‌های `deploy/` اکنون برای **۶ از ۲۵ قرارداد** (مسیر اصلی پولی/پشتوانه: `IranOS_Kernel`، `Treasury`، `SovereignWealthFund`، `PahlaviToken`، `API3Oracle`، `RecognizedReserveBacking`) در مخزن موجودند — به بخش ۱۱ و `deploy/README.md` مراجعه کنید. هیچ dry-run روی testnet، هش bytecode، یا تخمین gas مستند نشده است. اسکریپت برای ۱۹ قرارداد باقی‌مانده (رفاه، قضایی، حاکمیتی، بازپس‌گیری) هنوز ایجاد نشده است. `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است — این به‌روزرسانی بسته شدن آن را ادعا نمی‌کند.
>
> **⚠️ به‌روزرسانی (نسخه ۱.۳.۱):** اسکریپت‌های `deploy/` اکنون برای **۱۱ از ۲۵ قرارداد** موجودند — ۶ قرارداد مسیر اصلی پولی/پشتوانه (بالا) به‌علاوه ۵ قرارداد Layer 1 که constructor آن‌ها تنها به `KERNEL_ADDRESS` وابسته است و هیچ سیم‌کشی نقش پس از استقرار در بخش‌های ۴ تا ۷ برای آن‌ها مستند نشده: `VictimFund`، `ConstitutionGuard`، `JurySelection`، `JusticeProtocol`، `CitizenCard` (به `deploy/10_victim_fund.js` تا `deploy/14_citizen_card.js` و `deploy/README.md` مراجعه کنید). `PriceOracle`/`ProductionOracle` عمداً از این دسته حذف شدند: سیم‌کشی مستند آن‌ها (اعطای `FEEDER_ROLE` به `PRICE_FEEDER`/`PROD_FEEDER`، بخش‌های ۴ و ۹) به متغیرهای کتاب آدرسی نیاز دارد که در جدول بخش ۱ فهرست نشده‌اند — افزودن آن‌ها بدون این مستندسازی، اختراع پیکربندی مستندنشده خواهد بود. اسکریپت برای ۱۴ قرارداد باقی‌مانده (`PriceOracle`، `ProductionOracle`، `TriggerProtocol`، `AssetFreeze`، `PenalLabor`، `Provincial`، و ۹ قرارداد افزوده‌شده) هنوز ایجاد نشده است. هیچ تغییر قراردادی، پروتکلی، یا حاکمیتی در این نسخه اعمال نشده. `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است.
>
> **⚠️ به‌روزرسانی (نسخه ۱.۳.۲) — رفع P0:** یک بازبینی خصمانه معماری تأیید کرد که ۵ قرارداد افزوده‌شده در نسخه ۱.۳.۱ (`VictimFund`، `ConstitutionGuard`، `JurySelection`، `JusticeProtocol`، `CitizenCard`) با `KERNEL_ADDRESS` به‌عنوان تنها دارنده `DEFAULT_ADMIN_ROLE`/`admin` deploy می‌شدند، اما قرارداد `Kernel` (`contracts/kernel.sol`) هیچ مکانیزم forwarding، `call`/`delegatecall`، یا ارجاعی به این ۵ قرارداد ندارد — بنابراین Kernel هرگز نمی‌توانست `grantRole()`/`approveLaw()`/`registerEmployer()` و توابع مشابه را روی آن‌ها فراخوانی کند و این قراردادها پس از استقرار برای همیشه از نظر عملیاتی غیرقابل‌استفاده می‌ماندند (تأیید‌شده با grep کامل `contracts/kernel.sol` و مقایسه با تست‌های واحد موجود که به‌جای قرارداد واقعی Kernel از یک EOA آزمایشی استفاده می‌کردند). سازنده هر ۵ قرارداد اکنون یک آرگومان `_admin` جداگانه می‌پذیرد (`sovereign`) که `DEFAULT_ADMIN_ROLE` را دریافت می‌کند، دقیقاً مطابق الگوی already-established در `SovereignWealthFund.sol` (`constructor(sovereign, kernel)`)؛ `KERNEL_ROLE`/`kernel` همچنان صرفاً به‌عنوان هویت ثبت‌شده باقی می‌ماند. هیچ backdoor عمومی، هیچ تابع execute/delegatecall جدید در Kernel، و هیچ تغییر در سایر قراردادها یا حاکمیت اعمال نشده. تست‌های هم‌ترازی مسیر استقرار جدید (`test/32_deployment_workflow.test.js`) با آدرس واقعی قرارداد Kernel deploy‌شده (نه یک EOA جایگزین) این رفع را تأیید می‌کنند.
>
> **⚠️ به‌روزرسانی (نسخه ۱.۳.۳):** اسکریپت `deploy/15_price_oracle.js` اکنون `PriceOracle` را deploy می‌کند — مجموعاً **۱۲ از ۲۵ قرارداد**. سازنده از ابتدا با الگوی `constructor(_admin, _kernel)` نوشته شده (بدون نیاز به رفع بعدی): `SOVEREIGN_ADDRESS` (`admin`) `DEFAULT_ADMIN_ROLE` را دریافت می‌کند، `KERNEL_ADDRESS` (`kernel`) صرفاً `KERNEL_ROLE` را — دقیقاً مطابق رفع P0 نسخه ۱.۳.۲ برای ۵ قرارداد قبلی؛ بدون این الگو، `invalidatePrice()` (`onlyRole(KERNEL_ROLE)`) و `submitPrice()` (`onlyRole(FEEDER_ROLE)`, هرگز در سازنده اعطا نشده) برای همیشه غیرقابل‌فراخوانی می‌ماندند. `FEEDER_ROLE` توسط این اسکریپت اعطا **نمی‌شود**: چک §۹ گروه ۳ (`priceOracle.hasRole(FEEDER_ROLE, PRICE_FEEDER)`) به متغیر کتاب آدرس `PRICE_FEEDER` نیاز دارد که در جدول بخش ۱ فهرست نشده — این همان دلیلی است که `ProductionOracle` همچنان خارج از دامنه این workflow باقی می‌ماند. هیچ تغییر قراردادی، پروتکلی، حاکمیتی، یا پولی در این نسخه اعمال نشده. `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است.

---

## فهرست مطالب

1. [کتاب آدرس — الزامات پیش از استقرار](#۱-کتاب-آدرس--الزامات-پیش-از-استقرار)
2. [نقشه وابستگی سازنده‌ها](#۲-نقشه-وابستگی-سازندهها)
3. [ترتیب اجباری استقرار](#۳-ترتیب-اجباری-استقرار)
4. [ترتیب سیم‌کشی نقش‌ها](#۴-ترتیب-سیمکشی-نقشها)
5. [سیم‌کشی TriggerProtocol](#۵-سیمکشی-triggerprotocol)
6. [سیم‌کشی Oracle](#۶-سیمکشی-oracle)
7. [سیم‌کشی SWF و Treasury](#۷-سیمکشی-swf-و-treasury)
8. [چک‌لیست پیش از استقرار](#۸-چکلیست-پیش-از-استقرار)
9. [چک‌لیست پس از استقرار](#۹-چکلیست-پس-از-استقرار)
10. [چک‌لیست تأیید قابلیت تکرار](#۱۰-چکلیست-تأیید-قابلیت-تکرار)
11. [الزامات قابلیت تکرار](#۱۱-الزامات-قابلیت-تکرار)
12. [اعلام غیرادعا](#۱۲-اعلام-غیرادعا)

---

## ۱. کتاب آدرس — الزامات پیش از استقرار

پیش از اجرای هر دستور استقرار، آدرس‌های زیر باید در یک فایل امن خارج از مخزن عمومی مستند شده باشند:

| متغیر | توضیح | الزام |
|-------|-------|-------|
| `SOVEREIGN_ADDRESS` | آدرس کیف‌پول سخت‌افزاری پادشاه | اجباری |
| `COURT_1` تا `COURT_9` | آدرس‌های ۹ عضو دادگاه عالی | اجباری — پیش از هر چیز |
| `ORACLE_INITIAL` | آدرس اولیه oracle (placeholder تا API3Oracle deploy شود) — در گروه E پس از وایرینگ API3Oracle revoke می‌شود | اجباری |
| `SWF_MULTISIG` | آدرس چندامضایی صندوق ثروت ملی | اجباری |
| `TREASURY_KERNEL` | آدرس Kernel (برای Treasury constructor) | از deploy Kernel |
| `TRIGGER_TREASURY` | آدرس Treasury (برای TriggerProtocol constructor) | از deploy Treasury |
| `FEEDER_1..N` | آدرس‌های feeder API3Oracle | اجباری — پیش از ORACLE_ROLE |
| `CRAWLER_ADDRESS` | آدرس SovereignCrawler / AssetFreeze | اجباری |
| `COUNCIL_1..3` | حداقل ۳ عضو شورا برای AssetFreeze | اجباری |
| `RECOGNIZER_ADDRESS` | آدرس دارنده `RECOGNIZER_ROLE` در `RecognizedReserveBacking` (ثبت‌کننده هویت‌های پشتوانه) | اجباری — پیش از deploy `RecognizedReserveBacking` |

**هیچ کلید خصوصی، API key، یا آدرس حساس نباید در مخزن عمومی commit شود.**

---

## ۲. نقشه وابستگی سازنده‌ها

وابستگی‌های constructor هر قرارداد در جدول زیر آمده است. قراردادهای سطح بالاتر باید پیش از قراردادهای وابسته deploy شوند:

```
Layer 0 — بدون وابستگی خارجی
────────────────────────────
Kernel(sovereign, court_1, oracle_initial, swf_multisig)
  → آدرس نیاز ندارد به قرارداد دیگری

Layer 1 — وابسته به Kernel
───────────────────────────
Treasury(kernel)
SovereignWealthFund(sovereign, kernel)
API3Oracle(kernel, [feeder1, feeder2, ...])   ← FEEDER_ROLE در constructor اعطا می‌شود (Codex P1 fix)
ConstitutionGuard(sovereign, kernel)
JurySelection(sovereign, kernel)
JusticeProtocol(sovereign, kernel)
CitizenCard(sovereign, kernel)
VictimFund(sovereign, kernel)
  ← سازنده این ۵ قرارداد در نسخه ۱.۳.۲ اصلاح شد: sovereign تنها امضاکننده
    واقعی است که DEFAULT_ADMIN_ROLE را دریافت می‌کند و می‌تواند approveLaw/
    rejectLaw یا grantRole را اجرا کند؛ kernel صرفاً KERNEL_ROLE/هویت را
    ثبت می‌کند و خودش هرگز نمی‌تواند این توابع را فراخوانی کند (قرارداد
    Kernel هیچ مکانیزم forwarding به این قراردادها ندارد)

Layer 2 — وابسته به Kernel + Layer 1
──────────────────────────────────────
TriggerProtocol(kernel, treasury, swf)
PahlaviToken(swf, kernel, initialReserves)
PenalLabor(kernel, victimFund)
Provincial(kernel, treasury)
AssetFreeze(kernel, swfTempWallet, swfContract)

Layer 3 — وابسته به چند قرارداد Layer 1/2
───────────────────────────────────────────
PriceOracle(sovereign, kernel)   ← مستقل از Layer 2؛ سازنده در نسخه ۱.۳.۳ اصلاح شد:
                                    sovereign = DEFAULT_ADMIN_ROLE واقعی، kernel = صرفاً KERNEL_ROLE
ProductionOracle(kernel)   ← مستقل از Layer 2

Layer 2.5 — مستقل در deploy، اما سیم‌کشی‌اش به Layer 2 (PahlaviToken) نیاز دارد
──────────────────────────────────────────────────────────────────────────────
RecognizedReserveBacking(sovereign, recognizer)
  → constructor به Kernel یا PahlaviToken وابسته نیست
  → اما kernel.setPahlaviRecognizedReserveBacking() که آن را به PahlaviToken
    وصل می‌کند، نیازمند deploy شدن PahlaviToken (مرحله ۳) و اجرای
    kernel.setPahlaviToken() است — در غیر این صورت با
    "Kernel: pahlaviToken not set" revert می‌کند
```

| قرارداد | آرگومان‌های constructor | وابسته به |
|---------|----------------------|----------|
| `Kernel` | `sovereign, court_1, oracle_initial, swf` | هیچ |
| `Treasury` | `kernel` | Kernel |
| `SovereignWealthFund` | `sovereign, kernel` | Kernel |
| `PahlaviToken` | `swf, kernel, initialReserves` | Kernel، SWF |
| `TriggerProtocol` | `kernel, treasury, swf` | Kernel، Treasury، SWF |
| `API3Oracle` | `kernel, [feeder_1..N]` | Kernel (FEEDER_ROLE در constructor اعطا می‌شود) |
| `ConstitutionGuard` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE/admin واقعی؛ kernel صرفاً هویت ثبت‌شده — نسخه ۱.۳.۲) |
| `AssetFreeze` | `kernel, swfTempWallet, swfContract` | Kernel، SWF |
| `JurySelection` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE واقعی؛ kernel صرفاً KERNEL_ROLE — نسخه ۱.۳.۲) |
| `JusticeProtocol` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE واقعی؛ kernel صرفاً KERNEL_ROLE — نسخه ۱.۳.۲) |
| `PenalLabor` | `kernel, victimFund` | Kernel، VictimFund |
| `VictimFund` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE واقعی؛ kernel صرفاً KERNEL_ROLE — نسخه ۱.۳.۲) |
| `CitizenCard` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE واقعی؛ kernel صرفاً KERNEL_ROLE — نسخه ۱.۳.۲) |
| `Provincial` | `kernel, treasury` | Kernel، Treasury |
| `PriceOracle` | `sovereign, kernel` | Kernel (sovereign = DEFAULT_ADMIN_ROLE واقعی؛ kernel صرفاً KERNEL_ROLE — نسخه ۱.۳.۳) |
| `ProductionOracle` | `kernel` | Kernel |
| `VotingSystem` | `kernel` | Kernel |
| `Parliament` | `kernel` | Kernel |
| `BudgetAllocation` | `kernel` | Kernel |
| `BaseIncome` | `kernel` | Kernel |
| `HealthCoverage` | `kernel` | Kernel |
| `DisabilitySupport` | `kernel` | Kernel |
| `SovereignCrawler` | `kernel, swfTempWallet` | Kernel (+ آدرس کیف‌پول موقت SWF از کتاب آدرس) |
| `Fargard7PolicyAdapter` | `kernel, priceOracle` | Kernel، PriceOracle |
| `VelocityFee` | `kernel, developmentBank, pahlaviToken` | Kernel، PahlaviToken (+ آدرس بانک توسعه از کتاب آدرس) |
| `RecognizedReserveBacking` | `admin, recognizer` | هیچ در constructor؛ سیم‌کشی (`setPahlaviRecognizedReserveBacking`) به PahlaviToken deploy‌شده نیاز دارد |

### ۲.۱. جایگاه لایه قراردادهای افزوده‌شده (استخراج‌شده از امضای سازنده)

```
Layer 1 — تنها وابسته به Kernel
────────────────────────────────
VotingSystem(kernel)
Parliament(kernel)
BudgetAllocation(kernel)
BaseIncome(kernel)
HealthCoverage(kernel)
DisabilitySupport(kernel)
SovereignCrawler(kernel, swfTempWallet)   ← swfTempWallet یک آدرس از کتاب آدرس است، نه قرارداد

Layer 2 — وابسته به یک قرارداد Layer 1
──────────────────────────────────────
Fargard7PolicyAdapter(kernel, priceOracle)   ← پس از PriceOracle

Layer 3 — وابسته به قرارداد Layer 2
────────────────────────────────────
VelocityFee(kernel, developmentBank, pahlaviToken)   ← پس از PahlaviToken؛ developmentBank آدرس کتاب آدرس است
```

---

## ۳. ترتیب اجباری استقرار

**مرحله ۰ — پیش‌نیاز (off-chain)**

```
✓ کتاب آدرس تکمیل شده
✓ ۹ عضو دادگاه شناسایی و تأیید شده‌اند (COURT-01)
✓ کیف‌پول‌های سخت‌افزاری همه مقامات آماده است
✓ شبکه هدف (testnet/mainnet) مشخص است
✓ موجودی ETH کافی برای gas در تمام آدرس‌های deployer وجود دارد
```

**مرحله ۱ — Layer 0**

```
1.  deploy Kernel(SOVEREIGN, COURT_1, ORACLE_INITIAL, SWF_MULTISIG)
    → ثبت آدرس: KERNEL_ADDRESS
```

**مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)**

```
2.  deploy Treasury(KERNEL_ADDRESS)
    → ثبت آدرس: TREASURY_ADDRESS

3.  deploy SovereignWealthFund(SOVEREIGN, KERNEL_ADDRESS)
    → ثبت آدرس: SWF_ADDRESS

4.  deploy VictimFund(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → DEFAULT_ADMIN_ROLE به SOVEREIGN_ADDRESS، KERNEL_ROLE به KERNEL_ADDRESS (نسخه ۱.۳.۲)
    → ثبت آدرس: VICTIM_FUND_ADDRESS

5.  deploy API3Oracle(KERNEL_ADDRESS, [FEEDER_1, FEEDER_2, ...])
    → FEEDER_ROLE در constructor اعطا می‌شود — post-deploy grantRole لازم نیست (Codex P1 fix)
    → ثبت آدرس: API3_ORACLE_ADDRESS

6.  deploy ConstitutionGuard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → admin=SOVEREIGN_ADDRESS، kernel=KERNEL_ADDRESS؛ approveLaw/rejectLaw هر دو را می‌پذیرند (نسخه ۱.۳.۲)
    → ثبت آدرس: CONSTITUTION_GUARD_ADDRESS

7.  deploy JurySelection(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → DEFAULT_ADMIN_ROLE به SOVEREIGN_ADDRESS، KERNEL_ROLE به KERNEL_ADDRESS (نسخه ۱.۳.۲)
    → ثبت آدرس: JURY_SELECTION_ADDRESS

8.  deploy JusticeProtocol(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → DEFAULT_ADMIN_ROLE به SOVEREIGN_ADDRESS، KERNEL_ROLE به KERNEL_ADDRESS (نسخه ۱.۳.۲)
    → ثبت آدرس: JUSTICE_PROTOCOL_ADDRESS

9.  deploy CitizenCard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → DEFAULT_ADMIN_ROLE به SOVEREIGN_ADDRESS، KERNEL_ROLE به KERNEL_ADDRESS (نسخه ۱.۳.۲)
    → ثبت آدرس: CITIZEN_CARD_ADDRESS

10. deploy PriceOracle(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
    → DEFAULT_ADMIN_ROLE به SOVEREIGN_ADDRESS، KERNEL_ROLE به KERNEL_ADDRESS (نسخه ۱.۳.۳)
    → ثبت آدرس: PRICE_ORACLE_ADDRESS

11. deploy ProductionOracle(KERNEL_ADDRESS)
    → ثبت آدرس: PRODUCTION_ORACLE_ADDRESS
```

**مرحله ۳ — Layer 2 (پس از Layer 1)**

```
12. deploy TriggerProtocol(KERNEL_ADDRESS, TREASURY_ADDRESS, SWF_ADDRESS)
    → ثبت آدرس: TRIGGER_PROTOCOL_ADDRESS

13. deploy PahlaviToken(SWF_ADDRESS, KERNEL_ADDRESS, INITIAL_RESERVES)
    → ثبت آدرس: PAHLAVI_TOKEN_ADDRESS
    → sovereign اجرا کند: kernel.setPahlaviToken(PAHLAVI_TOKEN_ADDRESS)
      (GAP-MEX-05 — بدون این فراخوانی، pahlaviToken در Kernel صفر می‌ماند و
      syncReserves، setPahlaviRecognizedReserveBacking، و syncRecognizedBackingTotal
      برای همیشه با "Kernel: pahlaviToken not set" revert می‌کنند)

14. deploy PenalLabor(KERNEL_ADDRESS, VICTIM_FUND_ADDRESS)
    → ثبت آدرس: PENAL_LABOR_ADDRESS

15. deploy Provincial(KERNEL_ADDRESS, TREASURY_ADDRESS)
    → ثبت آدرس: PROVINCIAL_ADDRESS

16. deploy AssetFreeze(KERNEL_ADDRESS, SWF_TEMP_WALLET, SWF_ADDRESS)
    → ثبت آدرس: ASSET_FREEZE_ADDRESS
```

**مرحله ۴ — قراردادهای افزوده‌شده (آرگومان‌ها استخراج‌شده از امضای سازنده؛ مقادیر آدرس placeholder کتاب آدرس‌اند)**

```
# Layer 1 (تنها Kernel)
17. deploy VotingSystem(KERNEL_ADDRESS)                  → VOTING_SYSTEM_ADDRESS
18. deploy Parliament(KERNEL_ADDRESS)                    → PARLIAMENT_ADDRESS
19. deploy BudgetAllocation(KERNEL_ADDRESS)              → BUDGET_ALLOCATION_ADDRESS
20. deploy BaseIncome(KERNEL_ADDRESS)                    → BASE_INCOME_ADDRESS
21. deploy HealthCoverage(KERNEL_ADDRESS)                → HEALTH_COVERAGE_ADDRESS
22. deploy DisabilitySupport(KERNEL_ADDRESS)             → DISABILITY_SUPPORT_ADDRESS
23. deploy SovereignCrawler(KERNEL_ADDRESS, SWF_TEMP_WALLET) → SOVEREIGN_CRAWLER_ADDRESS

# Layer 2 (پس از PriceOracle — مرحله ۲)
24. deploy Fargard7PolicyAdapter(KERNEL_ADDRESS, PRICE_ORACLE_ADDRESS) → FARGARD7_ADAPTER_ADDRESS

# Layer 3 (پس از PahlaviToken — مرحله ۳)
25. deploy VelocityFee(KERNEL_ADDRESS, DEVELOPMENT_BANK, PAHLAVI_TOKEN_ADDRESS) → VELOCITY_FEE_ADDRESS
```

**مرحله ۵ — RecognizedReserveBacking و پیوند پشتوانه شناخته‌شده (پس از مرحله ۳ — PahlaviToken و setPahlaviToken)**

```
26. deploy RecognizedReserveBacking(SOVEREIGN_ADDRESS, RECOGNIZER_ADDRESS)
    → RECOGNIZER_ROLE در سازنده به RECOGNIZER_ADDRESS اعطا می‌شود
    → ثبت آدرس: RECOGNIZED_RESERVE_BACKING_ADDRESS

27. sovereign اجرا کند: kernel.setPahlaviRecognizedReserveBacking(RECOGNIZED_RESERVE_BACKING_ADDRESS)
    → این فراخوانی اتمیک است: هم recognizedReserveBacking را در PahlaviToken تنظیم می‌کند
      و هم بلافاصله totalReserves را با recognizedBackingTotal همگام می‌کند
      (رویدادهای RecognizedReserveBackingLinked و RecognizedReserveBackingSynced صادر می‌شوند)
    → updateReserves() (مسیر اوراکل) از زمان اجرای سیاست طبقه‌بندی پشتوانه (PR #113)
      دیگر totalReserves را تغییر نمی‌دهد — این وضعیت پیش از این گام هم برقرار است؛
      این گام صرفاً پیوند پشتوانه شناخته‌شده را برقرار و همگام می‌کند (بخش ۶)
```

**⚠️ این تنها مسیر تولیدی شناخته‌شده برای تبدیل مقادیر ثبت‌شده در `RecognizedReserveBacking.recordIdentity()` به پشتوانه پولی `PahlaviToken.totalReserves` است.**

---

## ۴. ترتیب سیم‌کشی نقش‌ها

**⚠️ گروه‌بندی اجباری — هر گروه باید کامل شود پیش از گروه بعدی.**

### گروه A — تکمیل دادگاه (COURT-01) — اول از همه

```
kernel.grantOfficialAccess(COURT_2, COURT_ROLE)
kernel.grantOfficialAccess(COURT_3, COURT_ROLE)
kernel.grantOfficialAccess(COURT_4, COURT_ROLE)
kernel.grantOfficialAccess(COURT_5, COURT_ROLE)
kernel.grantOfficialAccess(COURT_6, COURT_ROLE)
kernel.grantOfficialAccess(COURT_7, COURT_ROLE)
kernel.grantOfficialAccess(COURT_8, COURT_ROLE)
kernel.grantOfficialAccess(COURT_9, COURT_ROLE)
```

تأیید: `kernel.hasRole(COURT_ROLE, COURT_N)` → true برای ۹ عضو

### گروه B — سیم‌کشی TriggerProtocol

```
kernel.setTriggerProtocol(TRIGGER_PROTOCOL_ADDRESS)
treasury.grantRole(KERNEL_ROLE, TRIGGER_PROTOCOL_ADDRESS)
```

### گروه C — سیم‌کشی SWF

```
swf.grantRole(RECLAIM_ROLE, ASSET_FREEZE_ADDRESS)
```

### گروه D — سیم‌کشی AssetFreeze

```
assetFreeze.grantRole(CRAWLER_ROLE, CRAWLER_ADDRESS)
assetFreeze.grantRole(COUNCIL_ROLE, COUNCIL_1)
assetFreeze.grantRole(COUNCIL_ROLE, COUNCIL_2)
assetFreeze.grantRole(COUNCIL_ROLE, COUNCIL_3)
```

### گروه F — سیم‌کشی قراردادهای افزوده‌شده (ارجاع نقش — استخراج‌شده از ثابت‌های نقش سورس)

نقش‌های زیر پس از استقرار و طبق سیاست حاکمیتی اعطا می‌شوند. مقادیر آدرس از کتاب آدرس می‌آیند و در اینجا اختراع نمی‌شوند. این فهرست تنها **ارجاع** به ثابت‌های نقشِ موجود در سورس است:

```
VotingSystem         : ELECTION_ROLE، ORACLE_ROLE            (KERNEL_ROLE در سازنده)
Parliament           : MP_ROLE، SPEAKER_ROLE، SOVEREIGN_ROLE
BudgetAllocation     : PARLIAMENT_ROLE، GOVERNMENT_ROLE، AUDITOR_ROLE، ORACLE_ROLE
BaseIncome           : ORACLE_ROLE، EMPLOYER_ROLE، SWF_ROLE
HealthCoverage       : HEALTH_ROLE، PROVIDER_ROLE، PHARMACY_ROLE، SWF_ROLE
DisabilitySupport    : HEALTH_ROLE، WELFARE_ROLE، SWF_ROLE
SovereignCrawler     : NODE_ROLE، COUNCIL_ROLE
Fargard7PolicyAdapter: POLICY_ADMIN_ROLE، RECOMMENDER_ROLE، REVIEWER_ROLE
VelocityFee          : ORACLE_ROLE، STAKING_ROLE
```

**⚠️ توجه:** `Fargard7PolicyAdapter` صرفاً proposal-only و non-executing است؛ اعطای نقش‌های آن هیچ مسیر اجرایی ایجاد نمی‌کند. سیگنال‌های اوراکل برای `VotingSystem`، `BudgetAllocation`، `BaseIncome` و `VelocityFee` non-sovereign باقی می‌مانند.

### گروه E — سیم‌کشی Oracle (آخر از همه)

```
# گام ۱: API3Oracle را به عنوان Oracle در Kernel ثبت کن
kernel.grantOfficialAccess(API3_ORACLE_ADDRESS, ORACLE_ROLE)

# گام ۲: ORACLE_ROLE placeholder اولیه را revoke کن
# Kernel constructor نیاز به یک آدرس oracle غیرصفر داشت (ORACLE_INITIAL).
# اکنون که API3Oracle سیم‌کشی شده، placeholder باید revoke شود تا
# تنها مسیر مجاز feeder→API3Oracle→Kernel باشد.
kernel.revokeRole(ORACLE_ROLE, ORACLE_INITIAL)

# گام ۳: feeder‌های PriceOracle و ProductionOracle (این oracle‌ها constructor ساده دارند)
priceOracle.grantRole(FEEDER_ROLE, PRICE_FEEDER)
productionOracle.grantRole(FEEDER_ROLE, PROD_FEEDER)
```

**⚠️ توجه — FEEDER_ROLE روی API3Oracle:** FEEDER_ROLE در constructor اعطا می‌شود (Codex P1 fix). هیچ `api3Oracle.grantRole(FEEDER_ROLE, ...)` پس از deploy لازم نیست. همه feeder‌های مجاز باید در زمان deploy به عنوان `initialFeeders` مشخص باشند.

**⚠️ ORACLE_ROLE آخرین چیزی است که فعال می‌شود.** هر oracle فعال می‌تواند `flagViolation()` صدا کند و قفل اضطراری فعال کند. سیستم باید کاملاً آماده باشد.

---

## ۵. سیم‌کشی TriggerProtocol

TriggerProtocol باید قبل از اولین `flagViolation()` کاملاً سیم‌کشی شده باشد. بدون این، فعال‌سازی ماشه ناقص خواهد بود (CLC-05):

```
# گام ۱: Kernel باید آدرس TriggerProtocol را بشناسد
kernel.setTriggerProtocol(TRIGGER_PROTOCOL_ADDRESS)

# گام ۲: TriggerProtocol باید KERNEL_ROLE روی Treasury داشته باشد
# تا بتواند blockAddressByTrigger() را فراخوانی کند (TG-01)
treasury.grantRole(treasury.KERNEL_ROLE(), TRIGGER_PROTOCOL_ADDRESS)
```

بدون گام ۲، `executeTrigger()` با خطای AccessControl revert می‌کند.

---

## ۶. سیم‌کشی Oracle

```
# گام ۱: API3Oracle را با feeder‌های اولیه deploy کن (Codex P1 fix)
# FEEDER_ROLE در constructor اعطا می‌شود — نیازی به impersonation نیست.
# این گام در مرحله ۲ استقرار (Layer 1) اتفاق می‌افتد.
new API3Oracle(KERNEL_ADDRESS, [FEEDER_ADDRESS_1, FEEDER_ADDRESS_2, ...])

# گام ۲: API3Oracle را به عنوان Oracle در Kernel ثبت کن (گروه E)
kernel.grantOfficialAccess(API3_ORACLE_ADDRESS, kernel.ORACLE_ROLE())

# گام ۳: ORACLE_ROLE placeholder اولیه را revoke کن (گروه E)
# Kernel constructor نیاز به ORACLE_INITIAL داشت؛ اکنون API3Oracle جایگزین آن شده.
# این revoke تضمین می‌کند feeder→API3Oracle→Kernel تنها مسیر مجاز است.
kernel.revokeRole(kernel.ORACLE_ROLE(), ORACLE_INITIAL)

# گام ۴: feeder‌های PriceOracle و ProductionOracle
priceOracle.grantRole(priceOracle.FEEDER_ROLE(), PRICE_FEEDER)
productionOracle.grantRole(productionOracle.FEEDER_ROLE(), PROD_FEEDER)
```

**توجه — FEEDER_ROLE روی API3Oracle:** FEEDER_ROLE در constructor اعطا می‌شود. هیچ `api3Oracle.grantRole(FEEDER_ROLE, ...)` پس از deploy لازم نیست. همه feeder‌های مجاز باید در زمان deploy مشخص باشند. `DEFAULT_ADMIN_ROLE` در API3Oracle به `Kernel` اعطا می‌شود.

**توجه — ORACLE_INITIAL revoke:** این گام اجباری است. بدون آن، ORACLE_INITIAL می‌تواند مستقیماً `Kernel.syncReserves()` را فراخوانی کند و مسیر feeder→API3Oracle را دور بزند.

**توجه — Kernel.syncReserves اکنون فقط تله‌متری است:** پس از اجرای سیاست طبقه‌بندی پشتوانه (PR #113)، `PahlaviToken.updateReserves()` دیگر `totalReserves` را تغییر نمی‌دهد؛ تنها یک رویداد `ReservesUpdated` حسابرسی صادر می‌کند. تنها مسیر مجاز تغییر `totalReserves`، `syncRecognizedBackingTotal()` است که از `RecognizedReserveBacking.recognizedBackingTotal()` می‌خواند (بخش ۳، مرحله ۵). سیم‌کشی Oracle در این بخش برای گزارش‌دهی و تشخیص تخلف (`flagViolation`) هنوز لازم است، اما دیگر پشتوانه پولی توکن را تعیین نمی‌کند.

---

## ۷. سیم‌کشی SWF و Treasury

```
# الف — AssetFreeze باید RECLAIM_ROLE روی SWF داشته باشد (CLC-04)
swf.grantRole(swf.RECLAIM_ROLE(), ASSET_FREEZE_ADDRESS)

# ب — اعضای شورا برای تأیید freeze
assetFreeze.grantRole(assetFreeze.COUNCIL_ROLE(), COUNCIL_1)
assetFreeze.grantRole(assetFreeze.COUNCIL_ROLE(), COUNCIL_2)
assetFreeze.grantRole(assetFreeze.COUNCIL_ROLE(), COUNCIL_3)

# ج — Crawler برای شناسایی دارایی‌ها
assetFreeze.grantRole(assetFreeze.CRAWLER_ROLE(), CRAWLER_ADDRESS)
```

---

## ۸. چک‌لیست پیش از استقرار

```
□ کتاب آدرس کامل و در جای امن ذخیره شده
□ ۹ عضو دادگاه شناسایی شده‌اند (COURT-01)
□ کیف‌پول‌های سخت‌افزاری همه مقامات آماده
□ npm test پاس می‌شود (726/726)
□ npx hardhat compile بدون خطا اجرا می‌شود
□ موجودی gas کافی در آدرس deployer
□ شبکه هدف (testnet/mainnet) در hardhat.config.js تنظیم شده
□ kernel.emergencyLockActive() → false قبل از شروع
□ هیچ oracle فعالی وجود ندارد (سیستم پاک)
```

---

## ۹. چک‌لیست پس از استقرار

**گروه ۱ — دادگاه (باید اول تأیید شود)**

```
□ kernel.hasRole(COURT_ROLE, COURT_1) → true
□ kernel.hasRole(COURT_ROLE, COURT_2) → true
□ kernel.hasRole(COURT_ROLE, COURT_3) → true
□ kernel.hasRole(COURT_ROLE, COURT_4) → true
□ kernel.hasRole(COURT_ROLE, COURT_5) → true
□ kernel.hasRole(COURT_ROLE, COURT_6) → true
□ kernel.hasRole(COURT_ROLE, COURT_7) → true
□ kernel.hasRole(COURT_ROLE, COURT_8) → true
□ kernel.hasRole(COURT_ROLE, COURT_9) → true
□ kernel.emergencyLockActive() → false
```

**گروه ۲ — TriggerProtocol**

```
□ kernel.triggerProtocol() == TRIGGER_PROTOCOL_ADDRESS
□ treasury.hasRole(KERNEL_ROLE, TRIGGER_PROTOCOL_ADDRESS) → true
```

**گروه ۳ — Oracle**

```
□ kernel.hasRole(ORACLE_ROLE, API3_ORACLE_ADDRESS) → true
□ kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL) → false   ← تأیید revoke placeholder (گروه E گام ۳)
□ api3Oracle.hasRole(FEEDER_ROLE, FEEDER_N) → true (برای هر feeder مجاز — در constructor تنظیم شده)
□ priceOracle.hasRole(FEEDER_ROLE, PRICE_FEEDER) → true
□ productionOracle.hasRole(FEEDER_ROLE, PROD_FEEDER) → true
□ kernel.pahlaviToken() == PAHLAVI_TOKEN_ADDRESS   ← تأیید سیم‌کشی آدرس توکن (GAP-MEX-05) — پیش‌نیاز syncReserves و مسیر RecognizedReserveBacking
```

**گروه ۳.۱ — RecognizedReserveBacking (در صورت فعال‌سازی مسیر پشتوانه شناخته‌شده — مرحله ۵)**

```
□ recognizedReserveBacking.hasRole(RECOGNIZER_ROLE, RECOGNIZER_ADDRESS) → true
□ token.recognizedReserveBacking() == RECOGNIZED_RESERVE_BACKING_ADDRESS
□ token.totalReserves() == recognizedReserveBacking.recognizedBackingTotal()   ← تأیید همگام‌سازی اتمیک
```

**گروه ۴ — SWF و Reclaim**

```
□ swf.hasRole(RECLAIM_ROLE, ASSET_FREEZE_ADDRESS) → true
□ assetFreeze.hasRole(CRAWLER_ROLE, CRAWLER_ADDRESS) → true
□ assetFreeze.hasRole(COUNCIL_ROLE, COUNCIL_1) → true
□ assetFreeze.hasRole(COUNCIL_ROLE, COUNCIL_2) → true
□ assetFreeze.hasRole(COUNCIL_ROLE, COUNCIL_3) → true
```

**گروه ۵ — وضعیت سیستم**

```
□ kernel.isSystemHealthy() → true
□ api3Oracle.violationFlagCount() == 0
□ kernel.violationCount() == 0
□ kernel.triggerActivationCount() == 0
□ swf.totalAssets() با موجودی اولیه L1+L2+L3 مطابقت دارد
```

---

## ۱۰. چک‌لیست تأیید قابلیت تکرار

برای اینکه بررسی‌کننده خارجی (external auditor) بتواند استقرار را تکرار و تأیید کند:

```
□ hardhat.config.js با شبکه هدف تنظیم شده و در مخزن موجود است
□ اسکریپت‌های deploy/ با ترتیب مشخص موجود هستند — برای ۱۲ از ۲۵ قرارداد (مسیر اصلی پولی/پشتوانه + ۶ قرارداد Layer 1) برقرار است؛ برای ۱۳ قرارداد باقی‌مانده هنوز نه (`deploy/README.md`)
□ آدرس‌های deploy‌شده در یک فایل artifacts/ مستند شده‌اند
□ تمام تراکنش‌های گروه‌بندی نقش‌ها در یک اسکریپت قابل تکرار هستند
□ bytecode قراردادهای deploy‌شده با کد کامپایل‌شده از مخزن مطابقت دارد
□ رویداد‌های AccessControl.RoleGranted برای تمام نقش‌های اعطاشده در بلاکچین ثبت شده‌اند
□ آدرس deployer قابل تأیید از طریق امضا یا multisig است
```

---

## ۱۱. الزامات قابلیت تکرار

**ابزار ساخت:**
- Hardhat — نسخه مشخص در `package.json`
- Solidity `^0.8.20` — نسخه مشخص در `hardhat.config.js`
- تمام وابستگی‌ها در `package-lock.json` قفل شده

**ساختار اسکریپت استقرار برای پوشش کامل ۲۵/۲۵ (پیش از mainnet باید ایجاد شود — طرح آینده، جز بخش پیاده‌سازی‌شده زیر):**

```
deploy/
├── 01_kernel.js            # deploy Kernel
├── 02_layer1.js            # deploy Treasury, SWF, VictimFund, ...
├── 03_layer2.js            # deploy TriggerProtocol, PahlaviToken, ... + kernel.setPahlaviToken()
├── 04_court_wiring.js      # grantOfficialAccess × 9
├── 05_trigger_wiring.js    # setTriggerProtocol + KERNEL_ROLE
├── 06_swf_wiring.js        # RECLAIM_ROLE + COUNCIL_ROLE + CRAWLER_ROLE
├── 07_oracle_wiring.js     # grantOfficialAccess(API3Oracle, ORACLE_ROLE) + revokeRole(ORACLE_INITIAL) — FEEDER_ROLE در constructor API3Oracle تنظیم شده
├── 08_recognized_backing_wiring.js  # deploy RecognizedReserveBacking + kernel.setPahlaviRecognizedReserveBacking()
└── 09_verify.js            # تأیید تمام hasRole ها + kernel.pahlaviToken() + token.totalReserves()
```

**وضعیت واقعی (نسخه ۱.۳.۳):** اسکریپت‌های طرح‌شده در بالا برای پوشش کامل ۲۵/۲۵ هنوز طرح (پیشنهاد نام‌گذاری فایل) هستند، نه پیاده‌سازی. آنچه **واقعاً در مخزن پیاده‌سازی شده** ساختاری متفاوت با نام‌گذاری متفاوت است که ۱۲ قرارداد را پوشش می‌دهد — مسیر اصلی پولی/پشتوانه به‌علاوه ۶ قرارداد Layer 1:

```
deploy/
├── 01_kernel.js               # deploy Kernel
├── 02_token.js                # deploy PahlaviToken + kernel.setPahlaviToken()
├── 03_recognized_backing.js   # deploy RecognizedReserveBacking + kernel.setPahlaviRecognizedReserveBacking()
├── 04_oracle.js                # deploy API3Oracle
├── 05_treasury.js              # deploy Treasury
├── 06_swf.js                   # deploy SovereignWealthFund
├── 07_roles.js                 # Court completion (Group A)
├── 08_finalize.js              # Oracle activation (Group E — آخرین گام)
├── 09_verify.js                 # تأیید چک‌لیست بخش ۹ (زیرمجموعه قابل‌اجرا)
├── 10_victim_fund.js            # deploy VictimFund(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── 11_constitution_guard.js     # deploy ConstitutionGuard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── 12_jury_selection.js         # deploy JurySelection(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── 13_justice_protocol.js       # deploy JusticeProtocol(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── 14_citizen_card.js           # deploy CitizenCard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── 15_price_oracle.js           # deploy PriceOracle(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
├── index.js                     # orchestrator — ترتیب اجرای وابستگی‌محور
├── config.js، lib/addressBook.js # بارگذاری پیکربندی و ماندگاری آدرس
└── README.md                    # مستندات استفاده و دامنه
```

**نسخه ۱.۳.۲:** اسکریپت‌های ۱۰ تا ۱۴ اکنون `SOVEREIGN_ADDRESS` را به‌عنوان آرگومان اول (`admin`/`DEFAULT_ADMIN_ROLE`) و `KERNEL_ADDRESS` را به‌عنوان آرگومان دوم (`KERNEL_ROLE`/هویت) ارسال می‌کنند — رفع P0 هم‌ترازی مسیر استقرار (بالا را ببینید).

**نسخه ۱.۳.۳:** اسکریپت ۱۵ (`PriceOracle`) از ابتدا با همین الگوی `(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)` نوشته شده — بدون نیاز به رفع بعدی. `FEEDER_ROLE` توسط این اسکریپت اعطا نمی‌شود (بالا را ببینید).

ProductionOracle، PenalLabor، Provincial، TriggerProtocol، AssetFreeze، و ۹ قرارداد افزوده‌شده (۱۳ قرارداد در مجموع) در این پیاده‌سازی پوشش داده نشده‌اند — `deploy/README.md` فهرست کامل را مستند می‌کند. هیچ dry-run روی testnet/mainnet، هش bytecode، یا تخمین gas ثبت نشده است. `STEP9-BLOCK-005` همچنان یک باقی‌مانده G-11 فنی است.

---

## ۱۲. اعلام غیرادعا

این سند صرفاً مستندات مرجع استقرار است:

- هیچ استقراری روی testnet یا mainnet انجام نشده است
- آمادگی تولید یا mainnet اعلام نمی‌شود
- Step 12 یا Step 13 بسته نمی‌شود
- هیچ حسابرسی امنیتی (Slither / Mythril / Echidna) انجام نشده
- هیچ بررسی خارجی یا signoff وجود ندارد
- اسکریپت‌های `deploy/` برای ۱۲ از ۲۵ قرارداد (مسیر اصلی پولی/پشتوانه + ۶ قرارداد Layer 1: VictimFund، ConstitutionGuard، JurySelection، JusticeProtocol، CitizenCard، PriceOracle) در مخزن پیاده‌سازی شده‌اند (`deploy/README.md`)؛ برای ۱۳ قرارداد باقی‌مانده (ProductionOracle، PenalLabor، Provincial، TriggerProtocol، AssetFreeze، و ۹ قرارداد افزوده‌شده) هنوز ایجاد نشده‌اند — باقی‌مانده G-11 فنی
- هیچ dry-run روی testnet/mainnet، هش bytecode، یا تخمین gas ثبت نشده است؛ `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است و این نسخه بسته شدن آن را ادعا نمی‌کند
- پوشش مستندیِ نقشه استقرار (۲۵/۲۵) از پوشش اجرایی اسکریپت‌ها (۶/۲۵) متمایز است — این دو رقم را نباید یکسان تلقی کرد
- این سند نقطه شروع برای بررسی خارجی است، نه تأییدیه آن

</div>
