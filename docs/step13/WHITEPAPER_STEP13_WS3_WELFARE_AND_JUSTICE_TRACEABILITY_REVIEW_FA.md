<div dir="rtl">

# بازبینی ردیابی workstream ۳: رفاه و عدالت

**نام فنی:** Step 13 WS-3 Welfare and Justice Traceability Review
**نوع سند:** documentation-only / traceability review / AI-assisted pre-review
**workstream:** رفاه و عدالت
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** `main` — commit `22f6a24` — 499 test passing

---

## ۱. هدف و حدود

این سند ردیابی تفصیلی اصول رفاه و عدالت Iran-OS را از اصول سپیدنامه/منشور تا invariant قرارداد، حفاظ runtime، پوشش test، و وابستگی evidence/signoff پوشش می‌دهد.

**دکترین بنیادین رفاه Iran-OS:**

رفاه Iran-OS یعنی:
- حفاظت از کرامت اقتصادی
- حفاظت از ارزش کار
- حفاظت از قدرت خرید
- یکپارچگی پولی پشتیبانی‌شده توسط ذخیره
- ضمانت‌های مشروطه
- کف اقتصادی اجرایی
- ثبات قبل از گسترش
- تاب‌آوری قبل از بهینه‌سازی

رفاه Iran-OS نیست:
- درآمد پایه همگانی (UBI)
- برنامه انتقال وجه نقد
- سیستم انگیزه‌بندی توکنی
- توزیع یارانه
- خرج دولتی افزایشی یا بدهی‌محور

**اصل ۱۰۰۰ پهلوی:** کف کرامت کار — نه پرداخت ماهانه، نه یارانه، نه UBI. کارفرما می‌پردازد. قرارداد ردیابی می‌کند. SWF پشتوانه ارزش پول است.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ entitlement قانونی، برنامه رفاهی اجراشده، بودجه در دسترس، یا سیاست مصوب ادعا نمی‌کند.
- هیچ threshold، timeout، role model، treasury logic، reserve logic، oracle authority، یا freeze authority را تغییر نمی‌دهد.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- Kernel immutability، MULTISIG_THRESHOLD=7، TRIGGER_TIMEOUT=72h (SLA دادگاه)، و human final authority حفظ می‌شوند.

این بازبینی AI-assisted و documentation-only است و نیازمند review مستقل حقوقی/اقتصادی/حکمرانی است.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | زنجیره کامل است: اصل/invariant، قرارداد، حفاظ runtime، و test همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد. |

---

## ۳. جدول ردیابی تفصیلی اصول رفاه و عدالت

---

### ۳-۱. دکترین رفاه — اصل کلی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | دکترین رفاه — اصل کلی نقش رفاه در حاکمیت |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگردهای ۸، ۹، ۱۰ (کار، رفاه، بهداشت)؛ `whitepaper/whitepaper-fa.md` — بخش‌های رفاه؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **لینک دکترین** | رفاه = حفاظت از کرامت اقتصادی، ارزش کار، قدرت خرید، و کف حمایت مشروطه؛ نه توزیع یارانه، نه UBI، نه stimulus |
| **قرارداد/ماژول** | `contracts/welfare/CitizenCard.sol`؛ `contracts/welfare/BaseIncome.sol`؛ `contracts/welfare/HealthCoverage.sol`؛ `contracts/welfare/DisabilitySupport.sol`؛ `contracts/monetary/SovereignWealthFund.sol` |
| **حفاظ runtime** | ماژول‌های رفاهی نقش‌محور هستند (ISSUER_ROLE، HEALTH_ROLE، WELFARE_ROLE، EMPLOYER_ROLE)؛ هیچ توزیع مستقیم پول از قرارداد بدون role مشخص نیست؛ enrollment نیازمند ISSUER_ROLE |
| **invariant** | کرامت رفاهی = ردیابی قابل‌ممیزی وضعیت اشتغال، سلامت، و حمایت؛ نه پرداخت خودکار؛ SWF پشتوانه ارزش PAH است — نه منبع مستقیم پرداخت رفاهی |
| **پوشش test** | `test/05_citizen_card.test.js` (25 test)؛ `test/12_Base_Income.test.js` (27 test)؛ `test/13_Health_Coverage.test.js` (23 test)؛ `test/14_Disability_Support.test.js` (26 test) |
| **evidence مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`؛ `docs/step13/WHITEPAPER_STEP13_GAP_REGISTER_FA.md` |
| **blocker/signoff** | issue #12 (external audit)؛ issue #13 (formal verification)؛ issue #14 (custody/welfare ops)؛ هیچ welfare doctrine signoff پذیرفته‌شده وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | welfare ops protocol رسمی؛ Fargard linkage تفصیلی برای هر ماژول رفاهی؛ external audit disposition |
| **گام بعدی WS-3** | اتصال هر ماژول رفاهی به فرگرد دقیق منشور؛ ثبت welfare ops در issue #14 |

---

### ۳-۲. اصل کرامت اقتصادی — کف حمایت مشروطه

| محور | جزئیات |
| --- | --- |
| **نام اصل** | کرامت اقتصادی — کف حمایت مشروطه برای شهروندان |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۸ (حق کار)، فرگرد ۹ (حق حمایت اجتماعی)، فرگرد ۱۰ (حق بهداشت)؛ `whitepaper/whitepaper-fa.md` |
| **لینک دکترین** | کرامت اقتصادی = ضمانت مشروطه که کار ارزش واقعی داشته باشد، سلامت قابل دسترس باشد، ناتوانی موجب سقوط از کف نشود؛ نه entitlement، نه UBI |
| **قرارداد/ماژول** | `contracts/welfare/CitizenCard.sol`؛ `contracts/welfare/BaseIncome.sol`؛ `contracts/welfare/DisabilitySupport.sol`؛ `contracts/welfare/HealthCoverage.sol` |
| **حفاظ runtime** | `CitizenCard.registerCitizen()` ثبت بیومتریک و جلوگیری از ثبت تکراری؛ `CitizenCard.payUnemploymentInsurance()`: `require(c.unemploymentMonthsPaid < MAX_UNEMPLOYMENT_MONTHS)`؛ `DisabilitySupport.calculateStipend()`: `revert` روی level نامعتبر؛ `HealthCoverage.useHealthCredit()`: `require(wallet.annualCredit >= amount)` |
| **invariant** | کف کرامت = MIN_WAGE در ذهن قانون‌گذار — نه پرداخت مستقیم از قرارداد؛ ضمانت سلامت سالانه ۵۰۰ PAH؛ ضمانت بیمه بیکاری حداکثر ۱۸ ماه؛ ضمانت مستمری معلولیت = MIN_WAGE + supplement |
| **پوشش test** | `test/05_citizen_card.test.js` — biometric dedup، unemployment insurance، retirement؛ `test/14_Disability_Support.test.js` — stipend calculation، level validation |
| **evidence مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `contracts/welfare/CitizenCard.sol` — NatSpec comments (خط ۱۰-۱۲) |
| **blocker/signoff** | issue #12 (audit)؛ issue #14؛ هیچ حقوقی/اقتصادی review پذیرفته‌شده‌ای وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | legal adoption سیاست رفاهی؛ fiscal feasibility study؛ enrollment ops؛ economic reviewer signoff |
| **گام بعدی WS-3** | ثبت Fargard-8/9/10 linkage per ماژول در issue #14؛ تعریف welfare evidence packet |

---

### ۳-۳. اصل ۱۰۰۰ پهلوی — کف دستمزد کار

| محور | جزئیات |
| --- | --- |
| **نام اصل** | اصل ۱۰۰۰ پهلوی — کف کرامت کار (نه UBI، نه یارانه) |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۸ (حق کار با دستمزد عادلانه)؛ `whitepaper/whitepaper-fa.md`؛ `CLAUDE.md` — CitizenCard design decisions (بند ۵) |
| **لینک دکترین** | ۱۰۰۰ PAH = کف دستمزد کار توسط کارفرما؛ نه پرداخت دولتی، نه انتقال وجه نقد، نه UBI؛ معافیت مالیاتی تا کف (TAX_EXEMPT_CAP=1000 PAH)؛ SWF پشتوانه ارزش PAH است — کارفرما از ارزش محافظت‌شده می‌پردازد |
| **قرارداد/ماژول** | `contracts/welfare/CitizenCard.sol`؛ `contracts/welfare/BaseIncome.sol` |
| **حفاظ runtime** | `BaseIncome.MIN_WAGE = 1000 * 1e18` (خط ۲۲)؛ `BaseIncome.recordWagePayment()`: `bool meetsMinWage = amount >= MIN_WAGE`؛ `EmployerNonCompliant` event هنگام عدم انطباق؛ `CitizenCard.MIN_WAGE = 1000 * 1e18` (خط ۲۱)؛ `CitizenCard.getUnemploymentInsuranceAmount()`: `(MIN_WAGE * UNEMPLOYMENT_RATIO) / 1000 = 700 PAH`؛ `BaseIncome.TAX_EXEMPT_CAP = 1000 * 1e18` — معافیت مالیاتی کف |
| **invariant** | `MIN_WAGE = 1000 * 1e18` در CitizenCard و BaseIncome یکسان است؛ کارفرمای غیرمنطبق flagged می‌شود؛ معافیت مالیاتی تا ۱۰۰۰ PAH؛ قرارداد پرداخت نمی‌کند — ردیابی و compliance enforcement می‌کند |
| **پوشش test** | `test/12_Base_Income.test.js` — 27 test: MIN_WAGE enforcement، meetsMinWage، EmployerNonCompliant، TAX_EXEMPT_CAP؛ `test/05_citizen_card.test.js` — MIN_WAGE، getUnemploymentInsuranceAmount |
| **evidence مرتبط** | `contracts/welfare/BaseIncome.sol` — NatSpec (خط ۹-۱۳): «حداقل حقوق توسط کارفرما پرداخت می‌شود — نه دولت»؛ `contracts/welfare/CitizenCard.sol` — NatSpec (خط ۱۰-۱۲) |
| **blocker/signoff** | issue #12 (external audit — MIN_WAGE invariant)؛ issue #14 (welfare ops packet)؛ هیچ signoff ندارد |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | production employer registry؛ compliance enforcement ops runbook؛ external audit disposition درباره MIN_WAGE invariant |
| **گام بعدی WS-3** | ثبت MIN_WAGE = 1000 PAH در external audit scope (issue #12)؛ تهیه employer compliance ops runbook |

---

### ۳-۴. حفاظت ارزش کار — ردیابی انطباق کارفرما

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حفاظت ارزش کار — ردیابی و enforcement انطباق کارفرما |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۸ (حق کار)؛ `whitepaper/whitepaper-fa.md`؛ `contracts/welfare/BaseIncome.sol` — NatSpec |
| **لینک دکترین** | ارزش کار = MIN_WAGE در هر PAH واقعی؛ SWF پشتوانه قدرت خرید PAH را نگه می‌دارد؛ BaseIncome کارفرمایان را ثبت و پرداخت‌ها را ردیابی می‌کند؛ غیرمنطبق flagged می‌شود — نه جریمه on-chain |
| **قرارداد/ماژول** | `contracts/welfare/BaseIncome.sol` |
| **حفاظ runtime** | `registerEmployer()` فقط `ORACLE_ROLE`؛ `recordWagePayment()` فقط `EMPLOYER_ROLE`؛ `grantSubsidy()` / `revokeSubsidy()` فقط `SWF_ROLE`؛ `nonReentrant` روی همه state-changing functions |
| **invariant** | `MIN_WAGE = 1000 * 1e18`؛ `meetsMinWage = amount >= MIN_WAGE`؛ `isCompliant` مبتنی بر آخرین پرداخت؛ subsidy فقط از SWF_ROLE — نه خودکار |
| **پوشش test** | `test/12_Base_Income.test.js` — 27 test (employer registration، payment recording، non-compliance، subsidy grant/revoke، TAX_EXEMPT_CAP) |
| **evidence مرتبط** | `contracts/welfare/BaseIncome.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **blocker/signoff** | issue #12؛ issue #14؛ employer registry ops pending |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production employer registry (آدرس‌های واقعی)؛ ORACLE_ROLE feeder برای registerEmployer در production؛ compliance reporting runbook؛ ops signoff |
| **گام بعدی WS-3** | تعریف employer registry و ORACLE_ROLE ops در welfare ops packet (issue #14) |

---

### ۳-۵. حفاظت قدرت خرید — پشتوانه ذخیره ملی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حفاظت قدرت خرید — SWF reserve-backed monetary integrity |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۷ (استقلال SWF)؛ `whitepaper/whitepaper-fa.md`؛ `contracts/monetary/SovereignWealthFund.sol` |
| **لینک دکترین** | قدرت خرید ۱۰۰۰ PAH تنها اگر ارزش PAH حفظ شود واقعی است؛ SWF = پشتوانه ارزشی PAH از طریق MIN_RESERVE_RATIO=333 (33.3%)؛ این پیوند welfare را از UBI جدا می‌کند — رفاه = ثبات پولی، نه چاپ پول |
| **قرارداد/ماژول** | `contracts/monetary/SovereignWealthFund.sol`؛ `contracts/monetary/Treasury.sol`؛ `contracts/monetary/PahlaviToken.so` |
| **حفاظ runtime** | `MIN_RESERVE_RATIO = 333` تغییرناپذیر در Kernel؛ SWF 3-layer (L1 نقد، L2 مولد، L3 گرو)؛ withdrawal نیازمند COUNCIL_ROLE 3-of-N |
| **invariant** | `MIN_RESERVE_RATIO = 333`؛ SWF sovereignty = مستقل از دولت؛ هیچ چاپ پول یا بدهی برای تأمین مالی رفاه مجاز نیست |
| **پوشش test** | `test/03_sovereign_wealth_fund.test.js`؛ `test/01_kernel.test.js` — MIN_RESERVE_RATIO constant |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_WS4_ECONOMY_AND_NATIONAL_RESOURCES_TRACEABILITY_REVIEW_FA.md`؛ `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` |
| **blocker/signoff** | issue #12 (audit — SWF independence)؛ issue #13 (formal verification — MIN_RESERVE_RATIO invariant)؛ هیچ signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | formal proof MIN_RESERVE_RATIO never violated؛ SWF → welfare linkage در external audit scope؛ fiscal feasibility evidence |
| **گام بعدی WS-3** | ثبت SWF→welfare linkage در external audit scope (issue #12)؛ اتصال به WS-4 (اقتصاد) traceability |

---

### ۳-۶. CitizenCard — ردیابی هویت و وضعیت شهروندی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | CitizenCard — سیستم ردیابی هویت و وضعیت رفاهی شهروند |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۲ (حقوق شهروندی)، فرگرد ۹ (حق حمایت اجتماعی)؛ `CLAUDE.md` — CitizenCard design decisions |
| **لینک دکترین** | CitizenCard = سند هویت on-chain و tracker وضعیت اشتغال/رفاه؛ نه wallet پرداخت؛ نه UBI dispenser؛ RETIREMENT_AGE=65 مشروطه است |
| **قرارداد/ماژول** | `contracts/welfare/CitizenCard.sol` |
| **حفاظ runtime** | `registerCitizen()` فقط `ISSUER_ROLE`؛ biometric deduplication: `require(biometricToAddress[biometricHash] == address(0))`؛ birth year validation (1300-1420)؛ `startEmployment()` فقط `EMPLOYER_ROLE`؛ `payUnemploymentInsurance()` فقط `WELFARE_ROLE`؛ `deactivateCard()` فقط `KERNEL_ROLE`؛ `nonReentrant` روی همه |
| **invariant** | `MIN_WAGE = 1000 * 1e18`؛ `UNEMPLOYMENT_RATIO = 700` (70% = 700 PAH)؛ `MAX_UNEMPLOYMENT_MONTHS = 18`؛ `HEALTH_CREDIT_ANNUAL = 500 * 1e18`؛ `DRUG_QUOTA_MONTHLY = 100 * 1e18`؛ `RETIREMENT_AGE = 65`؛ هیچ transfer on-chain در payUnemploymentInsurance — event emit فقط، settlement off-chain |
| **پوشش test** | `test/05_citizen_card.test.js` — 25 test (registration، biometric dedup، employment lifecycle، unemployment insurance، retirement، health credit، drug quota، card deactivation) |
| **evidence مرتبط** | `contracts/welfare/CitizenCard.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **blocker/signoff** | issue #12 (audit)؛ issue #14 (welfare ops — ISSUER_ROLE identity registry)؛ هیچ production enrollment ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | ISSUER_ROLE identity registry production؛ biometric enrollment ops؛ off-chain payment settlement protocol؛ welfare ops signoff |
| **گام بعدی WS-3** | تعریف ISSUER_ROLE enrollment ops در welfare ops packet (issue #14)؛ مستندسازی off-chain settlement pattern برای audit |

---

### ۳-۷. پوشش سلامت همگانی — HealthCoverage

| محور | جزئیات |
| --- | --- |
| **نام اصل** | پوشش سلامت همگانی — بیمه درمانی مشروطه برای تمام شهروندان |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (حق بهداشت)؛ `whitepaper/whitepaper-fa.md`؛ `contracts/welfare/HealthCoverage.sol` — NatSpec (فرگرد ۱۰ منشور) |
| **لینک دکترین** | HealthCoverage = ردیابی credit سلامت و quota دارو؛ هیچ پرداخت on-chain به ارائه‌دهنده نیست — credit wallet کسر می‌شود، settlement off-chain است؛ مرخصی زایمان ثبت می‌شود اما پرداخت آن isPaid=false (settlement pending) |
| **قرارداد/ماژول** | `contracts/welfare/HealthCoverage.sol` |
| **حفاظ runtime** | `createHealthWallet()` فقط `HEALTH_ROLE`؛ `useHealthCredit()` فقط `PROVIDER_ROLE` — `require(providers[provider].isApproved)`؛ `useDrugQuota()` فقط `PHARMACY_ROLE`؛ `renewAnnualCredit()`: `require(block.timestamp >= wallet.lastCreditRenewal + 365 days)`؛ `grantMaternityLeave()` فقط `HEALTH_ROLE`؛ `updateStrategicReserve()` فقط `SWF_ROLE`؛ `nonReentrant` روی همه |
| **invariant** | `ANNUAL_HEALTH_CREDIT = 500 * 1e18`؛ `MONTHLY_DRUG_QUOTA = 100 * 1e18`؛ `MATERNITY_LEAVE_PAY = 6000 * 1e18`؛ credit تجاوز نمی‌کند؛ renewal interval ≥ 365 days؛ provider باید isApproved=true باشد |
| **پوشش test** | `test/13_Health_Coverage.test.js` — 23 test (wallet creation، health credit، drug quota، renewal، maternity leave، provider management) |
| **evidence مرتبط** | `contracts/welfare/HealthCoverage.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **blocker/signoff** | issue #12 (audit)؛ issue #14 (welfare ops)؛ هیچ provider registry production، ops signoff، یا maternity payment settlement ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | HEALTH_ROLE/PROVIDER_ROLE/PHARMACY_ROLE registry production؛ maternity leave off-chain payment protocol؛ HealthCoverage ops signoff |
| **گام بعدی WS-3** | ثبت ANNUAL_HEALTH_CREDIT و MATERNITY_LEAVE_PAY در audit scope (issue #12)؛ مستندسازی off-chain settlement pattern |

---

### ۳-۸. حمایت از توان‌خواهان — DisabilitySupport

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حمایت از توان‌خواهان — مستمری ماهانه و دسترسی‌پذیری |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (حق بهداشت و حمایت ویژه)؛ `whitepaper/whitepaper-fa.md`؛ `contracts/welfare/DisabilitySupport.sol` — NatSpec (فرگرد ۱۰ منشور) |
| **لینک دکترین** | توان‌خواهان نباید از کف کرامت اقتصادی خارج شوند؛ مستمری = MIN_WAGE + supplement بر اساس درجه؛ کارت دسترسی‌پذیری برای خدمات عمومی؛ `payMonthlyStipend()` event emit می‌کند — settlement off-chain |
| **قرارداد/ماژول** | `contracts/welfare/DisabilitySupport.sol` |
| **حفاظ runtime** | `registerDisabledCitizen()` فقط `HEALTH_ROLE`؛ `calculateStipend()`: `revert` روی level==0 یا نامعتبر؛ `payMonthlyStipend()` فقط `WELFARE_ROLE`؛ `require(block.timestamp >= c.lastPayment + PAYMENT_INTERVAL)`؛ `updateDisabilityLevel()` فقط `HEALTH_ROLE`؛ `recordAccessibilityAudit()` فقط `WELFARE_ROLE`؛ `nonReentrant` |
| **invariant** | `MIN_WAGE = 1_000 * 1e18`؛ `LEVEL1_SUPPLEMENT = 300` (1300 PAH)؛ `LEVEL2_SUPPLEMENT = 500` (1500 PAH)؛ `LEVEL3_SUPPLEMENT = 700` (1700 PAH)؛ `PAYMENT_INTERVAL = 30 days`؛ مستمری همیشه ≥ MIN_WAGE |
| **پوشش test** | `test/14_Disability_Support.test.js` — 26 test (registration، stipend calculation، level validation، payment interval، accessibility card، audit logging) |
| **evidence مرتبط** | `contracts/welfare/DisabilitySupport.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **blocker/signoff** | issue #12 (audit)؛ issue #14 (ops)؛ هیچ disability registry production، ops signoff، یا off-chain payment protocol ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | disability registry production؛ HEALTH_ROLE/WELFARE_ROLE identity registry؛ off-chain stipend payment protocol؛ ops signoff |
| **گام بعدی WS-3** | ثبت DisabilitySupport stipend invariants در audit scope (issue #12)؛ مستندسازی off-chain settlement pattern |

---

### ۳-۹. دکترین عدالت — اصل کلی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | دکترین عدالت — اصل کلی نظام قضایی دیجیتال |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگردهای ۱۱، ۱۲، ۱۳ (دادرسی، حقوق متهم، ممنوعیت شکنجه/اعدام)؛ `whitepaper/whitepaper-fa.md`؛ `protocols/justice-protocol-fa.md` |
| **لینک دکترین** | عدالت = دادرسی قابل ممیزی، حکم دیجیتال امضاشده، حق تجدیدنظر، منع اعدام از طریق عدم تعریف در کد، غرامت قربانیان از طریق کار جبرانی |
| **قرارداد/ماژول** | `contracts/justice/JurySelection.sol`؛ `contracts/justice/JusticeProtocol.sol`؛ `contracts/justice/PenalLabor.sol`؛ `contracts/reclaim/VictimFund.sol` |
| **حفاظ runtime** | `fileCase()` فقط `COURT_ROLE`؛ `assignJudge()` فقط `COURT_ROLE` — قاضی باید `approvedJudges[judge]=true`؛ `issueSentence()` فقط `JUDGE_ROLE` و `c.assignedJudge == msg.sender`؛ `signJudgment()` نیازمند `!c.digitalSigned`؛ `fileAppeal()` فقط توسط متهم؛ `finaliseCase()` فقط `APPEAL_ROLE`؛ `nonReentrant` |
| **invariant** | اعدام از SentenceType enum خارج است — از نظر فنی غیرممکن؛ هر حکم باید digitally signed باشد؛ حق تجدیدنظر (isAppealable) پیش‌فرض true است؛ COURT_ROLE نه JUDGE_ROLE پرونده باز می‌کند |
| **پوشش test** | `test/19_Justice_Protocol.test.js` (22 test)؛ `test/07_jury_selection.test.js` (28 test) |
| **evidence مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `protocols/justice-protocol-fa.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` |
| **blocker/signoff** | issue #12 (external audit)؛ issue #13 (formal verification)؛ هیچ justice ops signoff یا legal adoption ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | JUDGE_ROLE registry production؛ court ops runbook؛ legal adoption نظام قضایی دیجیتال؛ justice ops signoff |
| **گام بعدی WS-3** | ثبت justice system در external audit scope (issue #12)؛ اتصال هر SentenceType به Fargard دقیق |

---

### ۳-۱۰. ممنوعیت اعدام در کد — Constitutional Justice Guarantee

| محور | جزئیات |
| --- | --- |
| **نام اصل** | ممنوعیت فنی اعدام — تضمین مشروطه از طریق عدم تعریف در کد |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۳ (ممنوعیت اعدام)؛ `contracts/justice/JusticeProtocol.sol` — NatSpec (خط ۲۹): «اعدام: وجود ندارد — از نظر فنی غیرممکن» |
| **لینک دکترین** | ممنوعیت اعدام نه از طریق قانون (که قابل تغییر است) بلکه از طریق عدم تعریف در SentenceType enum اعمال می‌شود؛ این مهم‌ترین ضمانت مشروطه در کد justice است |
| **قرارداد/ماژول** | `contracts/justice/JusticeProtocol.sol` |
| **حفاظ runtime** | `SentenceType` enum: `{Acquitted, PenalLabor, Imprisonment, FinePlus, CommunityService}` — هیچ death/execution option وجود ندارد؛ `issueSentence()` فقط می‌تواند یکی از این ۵ نوع را صادر کند |
| **invariant** | `SentenceType` enum ثابت در source — تغییر نیازمند re-deployment است؛ هیچ مسیر اجرایی برای اعدام در هیچ قرارداد وجود ندارد |
| **پوشش test** | `test/19_Justice_Protocol.test.js` — SentenceType values tested؛ هیچ death sentence option در tests قابل ارجاع نیست |
| **evidence مرتبط** | `contracts/justice/JusticeProtocol.sol` — خط ۲۹ NatSpec comment؛ `constitution/constitution-fa.md` |
| **blocker/signoff** | issue #12 (external audit باید این را تأیید کند)؛ issue #13 (formal verification) |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | formal proof که هیچ upgrade path برای اضافه کردن death sentence وجود ندارد؛ external audit confirmation |
| **گام بعدی WS-3** | ثبت SentenceType enum در external audit scope (issue #12)؛ اتصال به Fargard-13 در audit evidence package |

---

### ۳-۱۱. هیئت منصفه — انتخاب تصادفی با VRF

| محور | جزئیات |
| --- | --- |
| **نام اصل** | هیئت منصفه — انتخاب تصادفی با VRF و آستانه محکومیت |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۱ (حق دادرسی توسط هیئت منصفه)؛ `whitepaper/whitepaper-fa.md`؛ `CLAUDE.md` — JurySelection |
| **لینک دکترین** | هیئت منصفه ملی با الگوریتم VRF انتخاب می‌شود تا از دستکاری جلوگیری شود؛ CONVICTION_THRESHOLD=8 از ۱۲ برای محکومیت؛ ACQUITTAL_THRESHOLD=5 برای تبرئه |
| **قرارداد/ماژول** | `contracts/justice/JurySelection.sol` |
| **حفاظ runtime** | `selectJury()` فقط `VRF_ROLE`؛ `require(jurorCommitments.length == JURY_SIZE)` — دقیقاً ۱۲ juror؛ commitment deduplication: `require(!usedCommitments[...])` ؛ `submitVote()`: `require(zkProof.length > 0)` — proof required اما فقط length-check |
| **invariant** | `JURY_SIZE = 12`؛ `CONVICTION_THRESHOLD = 8`؛ `ACQUITTAL_THRESHOLD = 5`؛ اگر ۱۲ رای بدون رسیدن به آستانه → verdict=3 (دور دوم لازم)؛ هر commitment فقط یک‌بار قابل استفاده |
| **پوشش test** | `test/07_jury_selection.test.js` — 28 test (selectJury، submitVote، conviction، acquittal، second round، duplicate commitment) |
| **evidence مرتبط** | `contracts/justice/JurySelection.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `CLAUDE.md` design decisions (بند ۶) |
| **blocker/signoff** | issue #12 (audit)؛ issue #13 (formal verification — ZK proof gap)؛ هیچ VRF ops signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | full ZK proof verification on-chain (فعلاً فقط length>0 چک می‌شود)؛ VRF oracle ops؛ jury ops runbook؛ formal proof برای CONVICTION_THRESHOLD invariant |
| **گام بعدی WS-3** | ثبت ZK proof gap در formal verification scope (issue #13)؛ VRF ops در justice ops packet |

---

### ۳-۱۲. ZK Proof — شکاف تأیید کامل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | ZK Proof در JurySelection — شکاف تأیید کامل on-chain |
| **منبع منشور/دکترین** | `CLAUDE.md` — design decisions (بند ۶): «ZK proofs در JurySelection به‌صورت on-chain تأیید نمی‌شوند — پارامتر zkProof پذیرفته اما فقط طول چک می‌شود (zkProof.length > 0). تأیید کامل ZKP برای نسخه آینده برنامه‌ریزی شده.» |
| **لینک دکترین** | رأی دهندگان به proof صحت رای نیاز دارند که هم anonymity و هم validity را تضمین کند؛ فعلاً فقط وجود proof (نه صحت آن) چک می‌شود |
| **قرارداد/ماژول** | `contracts/justice/JurySelection.sol` — `submitVote()` |
| **حفاظ runtime** | `require(zkProof.length > 0)` — فقط وجود proof؛ هیچ on-chain ZKP verifier وجود ندارد |
| **invariant** | ZK proof must be non-empty — اما صحت ریاضی تأیید نمی‌شود؛ این یک gap مستند و تعمدی است |
| **پوشش test** | `test/07_jury_selection.test.js` — zero-length proof revert test وجود دارد؛ هیچ proof validity test ندارد |
| **evidence مرتبط** | `CLAUDE.md`؛ `contracts/justice/JurySelection.sol` |
| **blocker/signoff** | issue #13 (formal verification — ZK proof gap باید در scope باشد)؛ issue #12 (audit) |
| **وضعیت ردیابی** | **GAP** |
| **artifact ناموجود** | on-chain ZKP verifier (Circom/SnarkJS/Noir)؛ ZK proof spec و circuit؛ formal proof صحت voting anonymity |
| **گام بعدی WS-3** | ثبت ZK proof gap در formal verification scope (issue #13)؛ تعریف circuit spec و verifier roadmap |

---

### ۳-۱۳. کار جبرانی و غرامت قربانیان

| محور | جزئیات |
| --- | --- |
| **نام اصل** | کار جبرانی و غرامت قربانیان — PenalLabor و VictimFund |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۳ (جایگزین اعدام)، فرگرد ۱۴ (حق جبران خسارت برای قربانیان)؛ `whitepaper/whitepaper-fa.md`؛ `protocols/reclaim-protocol-fa.md` |
| **لینک دکترین** | PenalLabor = جایگزین اعدام + منبع غرامت قربانی؛ توزیع درآمد: ۲۰% نگهداری، ۴۰% قربانی، ۳۰% مالیات ملی، ۱۰% بقا؛ VictimFund = مستقل از دولت، categories: DirectCorruption/PoliticalPrisoner/StructuralHarm/TortureVictim/PropertySeizure |
| **قرارداد/ماژول** | `contracts/justice/PenalLabor.sol`؛ `contracts/reclaim/VictimFund.sol` |
| **حفاظ runtime** | `PenalLabor.assignConvict()` فقط `COURT_ROLE`؛ `distributeMonthlyIncome()` فقط `EMPLOYER_ROLE`؛ `difficultyScore >= 5 && <= 10`؛ `VictimFund.registerVictim()` فقط `COURT_ROLE`؛ `payCompensation()` فقط `COUNCIL_ROLE`؛ `require(totalBalance >= amount)`؛ `require(vr.paidAmount + amount <= vr.approvedAmount)` — هیچ over-payment |
| **invariant** | `MAINTENANCE_RATIO + VICTIM_RATIO + NATIONAL_TAX_RATIO + SURVIVAL_RATIO = 200+400+300+100 = 1000`؛ کل ۱۰۰%؛ VictimFund.paidAmount ≤ approvedAmount همیشه؛ receiveFunds فقط از PENAL_LABOR_ROLE/COUNCIL_ROLE/KERNEL_ROLE |
| **پوشش test** | `test/20-Penal_Labor.test.js` (19 test)؛ `test/21_Victim_Fund.test.js` (19 test) |
| **evidence مرتبط** | `contracts/justice/PenalLabor.sol`؛ `contracts/reclaim/VictimFund.sol`؛ `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **blocker/signoff** | issue #12 (audit)؛ هیچ PenalLabor project registry production؛ هیچ VictimFund funding source production؛ هیچ justice ops signoff |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | national project registry production؛ COURT_ROLE identity production؛ VictimFund→PenalLabor funding chain evidence؛ victim compensation ops runbook |
| **گام بعدی WS-3** | ثبت PenalLabor/VictimFund در external audit scope (issue #12)؛ تعریف funding chain در justice ops packet |

---

### ۳-۱۴. وابستگی‌های signoff رفاه و عدالت

| محور | جزئیات |
| --- | --- |
| **نام اصل** | وابستگی‌های signoff — چه کسانی چه چیزی را باید تأیید کنند |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ISSUE_LINKAGE_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md`؛ `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md` |
| **لینک دکترین** | welfare/justice signoff نیازمند: legal reviewer (حقوقی)، economic reviewer (اقتصادی)، external auditor، و formal verifier است — هیچ‌کدام AI نمی‌توانند جایگزین شوند |
| **قرارداد/ماژول** | welfare/justice system به‌کلی |
| **حفاظ runtime** | N/A — signoff یک فرایند off-chain است |
| **invariant** | welfare/justice production نیازمند independent human reviewer signoff است؛ AI-assisted review جایگزین نیست |
| **پوشش test** | N/A |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_REVIEW_REQUEST_STATUS_ROLLUP_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` |
| **blocker/signoff** | issue #12 (external audit)؛ issue #13 (formal verification)؛ issue #14 (welfare ops packet)؛ issue #18 (non-claim preservation)؛ هیچ‌کدام complete نیستند |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | legal reviewer identity و engagement؛ economic reviewer identity؛ external auditor engagement؛ formal verifier engagement؛ welfare ops signoff؛ هیچ signoff پذیرفته‌شده وجود ندارد |
| **گام بعدی WS-3** | ارسال welfare/justice packet به independent reviewer؛ ثبت reviewer identity و engagement |

---

## ۴. خلاصه وضعیت workstream ۳

| برچسب | تعداد | اصول اصلی |
| --- | --- | --- |
| **COMPLETE** | **2** | اصل ۱۰۰۰ پهلوی (MIN_WAGE=1000 PAH، employer compliance، tax exemption)، ممنوعیت فنی اعدام (SentenceType enum بدون death option) |
| **PARTIAL** | **11** | دکترین رفاه، کرامت اقتصادی، حفاظت ارزش کار، حفاظت قدرت خرید، CitizenCard، HealthCoverage، DisabilitySupport، دکترین عدالت، هیئت منصفه، کار جبرانی/VictimFund، وابستگی‌های signoff |
| **GAP** | **1** | ZK Proof on-chain verification (فقط length>0، بدون تأیید ریاضی) |
| **مجموع** | **14** | — |

---

## ۵. الگوهای مشترک شکاف

| الگو | اصول مربوط |
| --- | --- |
| off-chain payment execution — قرارداد ردیابی می‌کند نه پرداخت | CitizenCard (unemployment)، DisabilitySupport (stipend)، HealthCoverage (provider settlement)، VictimFund (receiveFunds) |
| production role registry pending | CitizenCard (ISSUER_ROLE)، BaseIncome (ORACLE_ROLE)، HealthCoverage (HEALTH/PROVIDER/PHARMACY_ROLE)، JusticeProtocol (JUDGE_ROLE)، PenalLabor (COURT_ROLE) |
| welfare/justice ops packet/runbook pending (issue #14) | دکترین رفاه، CitizenCard، HealthCoverage، DisabilitySupport |
| external audit scope (issue #12) | اصل ۱۰۰۰ پهلوی، ممنوعیت اعدام، JurySelection، PenalLabor، VictimFund |
| formal verification target (issue #13) | MIN_WAGE invariant، CONVICTION_THRESHOLD، ZK proof gap، SentenceType enum |
| legal/economic reviewer signoff pending | کرامت اقتصادی، حفاظت قدرت خرید، دکترین رفاه، وابستگی‌های signoff |
| ZK proof partial | JurySelection (length-only check، بدون verifier) |

---

## ۶. non-claim نهایی

این سند AI-assisted و documentation-only است. هیچ‌کدام از موارد زیر ادعا نمی‌شود:

- هیچ برنامه رفاهی اجرا نشده.
- هیچ entitlement قانونی ایجاد نشده.
- هیچ بودجه در دسترس نیست.
- هیچ سیاست مصوب نشده.
- هیچ evidence پذیرفته‌شده وجود ندارد.
- هیچ reviewer signoff وجود ندارد.
- هیچ blocker بسته نشده است.
- گام ۱۲ باز می‌ماند.
- گام ۱۳ باز می‌ماند.
- COMPLETE فقط به‌معنای کامل بودن زنجیره ردیابی داخل repo است — نه production readiness، audit completion، یا formal verification.
- اصل ۱۰۰۰ پهلوی کف کرامت کار است — نه UBI، نه یارانه، نه انتقال وجه نقد.
- CitizenCard ردیابی وضعیت می‌کند — پرداخت نمی‌کند.
- SWF پشتوانه ارزش PAH است — منبع مستقیم رفاه نیست.
- این بازبینی نیازمند review مستقل حقوقی/اقتصادی/حکمرانی است.

</div>
