<div dir="rtl">

# بازبینی ردیابی workstream ۵: قراردادها و ماژول‌های runtime

**نام فنی:** Step 13 WS-5 Contracts and Runtime Modules Traceability Review
**نوع سند:** documentation-only / traceability review / AI-assisted pre-review
**workstream:** قراردادها و adapterها
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** main — commit `8626a82` — 499 test passing

---

## ۱. هدف و حدود

این سند ردیابی تفصیلی همه ماژول‌های runtime Iran-OS را از اصول سپیدنامه/منشور تا invariant قرارداد، حفاظ runtime، پوشش test، و وابستگی evidence/signoff پوشش می‌دهد.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ ماژولی را production-ready اعلام نمی‌کند.
- هیچ threshold، timeout، role model، treasury logic، reserve logic، oracle authority، یا freeze authority را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.
- SWF همچنان sovereign reserve resilience layer (SRR-role) است، نه DeFi یا yield engine.
- Kernel immutability، MULTISIG_THRESHOLD=7، TRIGGER_TIMEOUT=72h به‌عنوان SLA رسیدگی دادگاه، و human final freeze authority حفظ می‌شوند.

این بازبینی AI-assisted و documentation-only است.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | زنجیره کامل است: اصل/invariant، قرارداد، حفاظ runtime، و test همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد. |

---

## ۳. جدول ردیابی تفصیلی ماژول‌های runtime

---

### ۳-۱. IranOS_Kernel — هسته حاکمیتی لایه صفر

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | IranOS_Kernel — هسته حاکمیتی لایه صفر |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱ (سکولاریسم)، فرگرد ۲ (حقوق ملت)، فرگرد ۳ (ارضی)، فرگرد ۷ (SWF)، TR-01 تا TR-06؛ `protocols/trigger-protocol-fa.md` |
| **فایل قرارداد** | `contracts/kernel.sol` |
| **مسئولیت اصلی** | تعریف خطوط قرمز TR-01 تا TR-06؛ ثبت نقش‌های SOVEREIGN/COURT/ORACLE/GUARDIAN؛ multi-sig trigger activation (7-of-9)؛ قفل اضطراری emergencyLockActive؛ ثبت قراردادهای triggerProtocol و sovereignWealthFund |
| **مدل اختیار** | `SOVEREIGN_ROLE` (گزینش مقامات، توشیح)؛ `COURT_ROLE` (تأیید تخلف، رفع قفل اضطراری)؛ `ORACLE_ROLE` (flag violation)؛ `GUARDIAN_ROLE` (نظارت)؛ `DEFAULT_ADMIN_ROLE` (Kernel itself) |
| **حفاظ runtime** | `onlySovereign`؛ `onlyCourt`؛ `onlyOracle`؛ `onlyGuardian`؛ `notLocked` (پس از CLC-06 روی `grantOfficialAccess`، `setTriggerProtocol`، `setSovereignWealthFund`)؛ `nonReentrant`؛ `signaturesCount >= MULTISIG_THRESHOLD` |
| **invariant مرتبط** | `LIQUIDITY_CAP = 900B PAH`؛ `MIN_RESERVE_RATIO = 333`؛ `MULTISIG_THRESHOLD = 7`؛ `TRIGGER_TIMEOUT = 72h` (SLA رسیدگی دادگاه — نه auto-unlock — مستند در step42)؛ TR-01/02/03 → فوری emergencyLockActive |
| **پوشش test** | `test/01_kernel.test.js` — 46 test (نقش‌ها، flagViolation، signViolation، trigger، emergencyLock، CLC-06) |
| **evidence/گزارش مرتبط** | `contracts/CONTRACT_RUNTIME_MAP.md`؛ `docs/step42/WHITEPAPER_STEP42_TRIGGER_TIMEOUT_DOCTRINE_DECISION.md`؛ `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`؛ commit `f06e0be` (CLC-06) |
| **شکاف شناخته‌شده** | TG-01: `_activateTrigger()` هیچ passthrough به `Treasury.blockAddressByTrigger()` ندارد (مستند در step37/38، رد شد در step38 به دلیل ریسک revert) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production role registry (SOVEREIGN_ROLE/COURT_ROLE signer identities)؛ formal verification برای trigger lifecycle invariant؛ external audit sign-off |
| **گام بعدی WS-5** | ثبت TG-01 در external audit scope (issue #12)؛ اتصال TRIGGER_TIMEOUT=72h doctrine (step42) به audit evidence package |

---

### ۳-۲. TriggerProtocol — لایه اجرایی ماشه

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | TriggerProtocol — لایه اجرایی ماشه |
| **منبع منشور/دکترین** | `protocols/trigger-protocol-fa.md`؛ `constitution/constitution-fa.md` — مکانیسم enforcement تخلف از منشور |
| **فایل قرارداد** | `contracts/core/TriggerProtocol.sol` |
| **مسئولیت اصلی** | اجرای trigger پس از 7-of-9 multi-sig: تنظیم `blockedFromTreasury[offender]=true` (داخلی)؛ ابطال امضا (`signatureRevoked`)؛ اطلاع‌رسانی عمومی؛ فعال‌سازی جایگزین موقت |
| **مدل اختیار** | `onlyKernel` — فقط Kernel مجاز به فراخوانی `executeTrigger()` است |
| **حفاظ runtime** | `onlyKernel` modifier؛ `nonReentrant`؛ `offender != address(0)` |
| **invariant مرتبط** | `blockedFromTreasury[offender]` پس از `executeTrigger()` = true؛ `signatureRevoked[offender]` = true؛ `INTERIM_REPLACEMENT_DELAY = 24h` |
| **پوشش test** | `test/08_Trigger_Protocol.test.js` — 51 test (executeTrigger، TG-01 شکاف تأیید، Option D، interim replacement، blockedFromTreasury vs Treasury.isBlocked) |
| **evidence/گزارش مرتبط** | `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step21/` — TG-01 شرح کامل |
| **شکاف شناخته‌شده** | TG-01: `executeTrigger()` هرگز `Treasury.blockAddressByTrigger(offender)` را فراخوانی نمی‌کند. `Treasury.isBlocked(offender)` تا فراخوانی صریح Kernel (Option D) برابر false می‌ماند. |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | مسیر Option D از Kernel → `Treasury.blockAddressByTrigger()` (مستند اما اتوماتیک نیست)؛ formal verification برای trigger enforcement chain |
| **گام بعدی WS-5** | ثبت TG-01 Option D در governance runbook و audit evidence package (issue #12) |

---

### ۳-۳. ConstitutionGuard — نگهبان قانون اساسی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | ConstitutionGuard — نگهبان قانون اساسی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱ (سکولاریسم)، فرگرد ۲ (حقوق)، فرگرد ۳ (ارضی)، فرگرد ۶ (قضایی)، فرگرد ۷ (پولی)؛ `protocols/governance-protocol-fa.md` |
| **فایل قرارداد** | `contracts/core/ConstitutionGuard.sol` |
| **مسئولیت اصلی** | ثبت پیشنهاد قانون با اعلام اصول مرتبط؛ تأیید یا رد توسط Kernel (پس از بررسی دادگاه)؛ حفظ `IMMUTABLE_PRINCIPLES_MASK=0x07` (اصول ۱، ۲، ۳ همیشه اجباری) |
| **مدل اختیار** | `proposeLaw()` آزاد برای هر آدرس؛ `approveLaw()` و `rejectLaw()` منحصراً `onlyKernel` |
| **حفاظ runtime** | `onlyKernel` برای approve/reject؛ `IMMUTABLE_PRINCIPLES_MASK = 0x07` در `approveLaw()` — رد اگر `(principlesMask & 0x07) != 0`؛ `!proposal.executed` ضدِ double-execution |
| **invariant مرتبط** | `IMMUTABLE_PRINCIPLES_MASK = 0x07` (بیت‌های ۰،۱،۲ = اصول secular، rights، territorial)؛ `PRINCIPLE_SECULAR=1`؛ `PRINCIPLE_RIGHTS=2`؛ `PRINCIPLE_TERRITORIAL=3`؛ `PRINCIPLE_MONETARY=4`؛ `PRINCIPLE_JUDICIAL=5` |
| **پوشش test** | `test/04_constitution_guard.test.js` — 22 test (proposeLaw، approveLaw، rejectLaw، IMMUTABLE_PRINCIPLES_MASK، double-execution guard) |
| **evidence/گزارش مرتبط** | `contracts/CONTRACT_RUNTIME_MAP.md`؛ `whitepaper/whitepaper-fa.md` — فرگرد ۱، ۲، ۳، ۶، ۷ |
| **شکاف شناخته‌شده** | ندارد (در repo) — طراحی proposal-only با Kernel approval کامل است. production Kernel authority (signer identity) pending |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | production Kernel signer identity برای approveLaw/rejectLaw (حکمرانی off-chain)؛ formal verification برای IMMUTABLE_PRINCIPLES_MASK invariant |
| **گام بعدی WS-5** | اتصال IMMUTABLE_PRINCIPLES_MASK به formal verification target list (issue #13) |

---

### ۳-۴. PahlaviToken — توکن ملی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | PahlaviToken — واحد پول ملی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۷ (سقف نقدینگی)؛ TR-06 (سقف ۹۰۰ میلیارد)؛ `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` |
| **فایل قرارداد** | `contracts/monetary/PahlaviToken.sol` |
| **مسئولیت اصلی** | توکن ERC-20 ملی؛ اجرای `MAX_SUPPLY=900B PAH`؛ اجرای `MIN_RESERVE_RATIO=333`؛ مسیر `updateReserves()` منحصر به `KERNEL_ROLE` |
| **مدل اختیار** | `KERNEL_ROLE` برای `updateReserves()`؛ `MINTER_ROLE` برای `mint()` |
| **حفاظ runtime** | `reserveCompliant()` modifier — `newSupply <= MAX_SUPPLY` و `(totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO`؛ `onlyRole(KERNEL_ROLE)` برای updateReserves |
| **invariant مرتبط** | `MAX_SUPPLY = 900_000_000_000 * 1e18`؛ `MIN_RESERVE_RATIO = 333` (33.3‰)؛ `totalSupply <= MAX_SUPPLY` در هر مینت |
| **پوشش test** | `test/02_pahlavi_token.test.js` — 40 test (mint، burn، reserveCompliant، MAX_SUPPLY، MIN_RESERVE_RATIO، updateReserves KERNEL-only) |
| **evidence/گزارش مرتبط** | `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md`؛ `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` |
| **شکاف شناخته‌شده** | `updateReserves()` از SWF اتوماتیک فراخوانی نمی‌شود — تغییر `totalReserves` به عمل صریح Kernel نیاز دارد (طراحی عمدی) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production MINTER_ROLE registry؛ formal verification برای `reserveCompliant()` invariant؛ مستند صریح «no automatic SWF→totalReserves linkage» در deployment manifest |
| **گام بعدی WS-5** | ثبت «عدم پیوند خودکار SWF به totalReserves» در deployment doctrine؛ اتصال به formal verification list |

---

### ۳-۵. SovereignWealthFund — صندوق ثروت ملی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | SovereignWealthFund — صندوق ثروت ملی سه‌لایه |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۷؛ TR-05 (استقلال SWF)؛ `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md` |
| **فایل قرارداد** | `contracts/monetary/SovereignWealthFund.sol` |
| **مسئولیت اصلی** | نگهداری سه‌لایه ذخیره حاکمیتی (L1=300B نقد، L2=300B مولد، L3=2T گرو)؛ multi-sig withdrawal (3-of-N COUNCIL)؛ توزیع سود سالانه L2→L1 |
| **مدل اختیار** | `COUNCIL_ROLE` برای deposit، proposeWithdrawal، signWithdrawal، distributeAnnualYield؛ `KERNEL_ROLE` برای `receiveReclaimedAsset` (از AssetFreeze) |
| **حفاظ runtime** | `onlyRole(COUNCIL_ROLE)` روی همه توابع mutating؛ `signaturesCount >= MULTISIG_REQUIRED (3)` برای اجرای برداشت؛ `!executed` ضدِ double-execution؛ layer balance checks |
| **invariant مرتبط** | `L1_TARGET = 300B PAH`؛ `L2_TARGET = 300B PAH`؛ `L3_TARGET = 2T PAH`؛ `MULTISIG_REQUIRED = 3`؛ `ANNUAL_YIELD = 150‰` (15% از L2) |
| **پوشش test** | `test/03_sovereign_wealth_fund.test.js` — 32 test (L1/L2/L3 deposit، multi-sig withdrawal، annual yield، balance checks) |
| **evidence/گزارش مرتبط** | `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md` — RC-01/RC-02/RC-03؛ `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md`؛ `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md` |
| **شکاف شناخته‌شده** | production COUNCIL_ROLE signer registry ثبت نشده؛ L2 yield → `totalReserves` در PahlaviToken اتوماتیک نیست |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production COUNCIL_ROLE signer registry و rotation plan (issue #14)؛ formal verification برای conservation boundary invariant |
| **گام بعدی WS-5** | اتصال COUNCIL_ROLE به custody evidence packet (issue #14)؛ ثبت formal verification target |

---

### ۳-۶. Treasury — خزانه‌داری ملی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | Treasury — خزانه‌داری ملی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۷ (دارایی ملی)؛ ANNUAL_BUDGET_CAP از مجلس |
| **فایل قرارداد** | `contracts/monetary/Treasury.sol` |
| **مسئولیت اصلی** | مدیریت خطوط بودجه (سقف ۱۵۰B PAH)؛ multi-sig transaction (3-of-N AUDITOR)؛ blocking از trigger؛ سال مالی |
| **مدل اختیار** | `PARLIAMENT_ROLE` (createBudgetLine، startFiscalYear)؛ `GOVERNMENT_ROLE` (proposeTransaction)؛ `AUDITOR_ROLE` (signTransaction)؛ `KERNEL_ROLE` (blockAddressByTrigger) |
| **حفاظ runtime** | `notBlocked(recipient)` modifier (line 66)؛ `withinBudget()` modifier؛ `totalBudgetAllocated + amount <= ANNUAL_BUDGET_CAP` (line 89)؛ `onlyRole(KERNEL_ROLE)` برای `blockAddressByTrigger()` (line 131) |
| **invariant مرتبط** | `ANNUAL_BUDGET_CAP = 150B PAH`؛ `MULTISIG_THRESHOLD = 3` برای تراکنش‌ها؛ `notBlocked` = مانع پرداخت به آدرس‌های مسدود |
| **پوشش test** | `test/09_Treasury.test.js` — 29 test (budget lines، transactions، blockAddressByTrigger، annual cap، multi-sig) |
| **evidence/گزارش مرتبط** | `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md` — RC-E-13 |
| **شکاف شناخته‌شده** | TG-01: `blockAddressByTrigger()` هرگز از TriggerProtocol فراخوانی نمی‌شود — manual-only (Option D) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | Option D (manual Treasury blocking) مسیر رسمی در governance runbook؛ formal verification برای budget conservation invariant؛ production role wiring |
| **گام بعدی WS-5** | ثبت Option D در governance ops runbook؛ اتصال TG-01 به audit scope (issue #12) |

---

### ۳-۷. VelocityFee — کارمزد رکود

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | VelocityFee — کارمزد رکود نقدینگی |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فرگرد ۷ (جلوگیری از انباشت بی‌حرکت)؛ سیاست ضد-رکود |
| **فایل قرارداد** | `contracts/monetary/VelocityFee.sol` |
| **مسئولیت اصلی** | شناسایی حساب‌های راکد (balance > 100k PAH و بدون تراکنش ۳۶۵ روز)؛ محاسبه کارمزد سه‌سطحی (2%/5%/8%)؛ معافیت staking؛ ثبت event برای انتقال به بانک توسعه |
| **مدل اختیار** | `ORACLE_ROLE` برای registerAccount، recordActivity، applyFee؛ `STAKING_ROLE` برای activateStaking/deactivateStaking؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | `isRegistered` check؛ `!isStaking` check (معافیت staking)؛ `balance > THRESHOLD` check؛ `block.timestamp - lastActivityTime >= DORMANCY_PERIOD` check |
| **invariant مرتبط** | `THRESHOLD = 100k PAH`؛ `TIER1_RATE = 20‰ (2%)`؛ `TIER2_RATE = 50‰ (5%)`؛ `TIER3_RATE = 80‰ (8%)`؛ `DORMANCY_PERIOD = 365 days`؛ هیچ PAH واقعی در این نسخه سوزانده نمی‌شود |
| **پوشش test** | `test/11_Velocity_Fee.test.js` — 25 test (ثبت، رکود، کارمزد tiered، staking معافیت، calculateFee) |
| **evidence/گزارش مرتبط** | `contracts/monetary/VelocityFee.sol` — توضیح صریح «اجرای واقعی در فاز بعدی از طریق SWF» |
| **شکاف شناخته‌شده** | انتقال واقعی PAH به بانک توسعه پیاده‌سازی نشده («فاز بعدی»)؛ `applyFee()` فقط event emit می‌کند |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | مکانیسم انتقال واقعی PAH به Development Bank؛ production ORACLE_ROLE wiring؛ policy decision برای فاز اجرا |
| **گام بعدی WS-5** | ثبت صریح «fee transfer deferred» در deployment doctrine؛ مستندسازی dependency به SWF در manifest |

---

### ۳-۸. BudgetAllocation — تخصیص بودجه عمومی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | BudgetAllocation — تخصیص و نظارت بودجه عمومی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۴ (مجلس)، فرگرد ۷ (بودجه)؛ `whitepaper/whitepaper-fa.md` — نسبت‌های بخشی |
| **فایل قرارداد** | `contracts/governance/BudgetAllocation.sol` |
| **مسئولیت اصلی** | تصویب بودجه سالانه ۱۵۰B PAH توسط مجلس؛ تخصیص بخشی (Health 20%، Education 20%، Defense 15%، Infrastructure 15%، Welfare 10%، Justice 10%، Environment 5%، Admin 5%)؛ ثبت هزینه‌ها |
| **مدل اختیار** | `PARLIAMENT_ROLE` (approveBudget)؛ `GOVERNMENT_ROLE` (recordExpenditure)؛ `AUDITOR_ROLE` (flag)؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | `!budgetApproved` در approveBudget (یک‌بار در سال)؛ `sectorBudget.spent + amount <= sectorBudget.allocated` در recordExpenditure؛ `nonReentrant` |
| **invariant مرتبط** | `TOTAL_BUDGET = 150B PAH`؛ مجموع ratioها = 1000 (100%)؛ budget locking per sector |
| **پوشش test** | `test/17_Budget_Allocation.test.js` — 30 test (approveBudget، recordExpenditure، flag، sector limits) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` |
| **شکاف شناخته‌شده** | production PARLIAMENT_ROLE registry؛ پیوند واقعی BudgetAllocation به Treasury (هماهنگی off-chain) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production PARLIAMENT_ROLE wiring؛ integration test با Treasury؛ formal verification برای sector allocation invariant |
| **گام بعدی WS-5** | ثبت BudgetAllocation → Treasury integration boundary در deployment manifest |

---

### ۳-۹. Parliament — مجلس شورای ملی دیجیتال

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | Parliament — مجلس شورای ملی دیجیتال |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۴ (قوه مقننه)؛ `protocols/governance-protocol-fa.md` |
| **فایل قرارداد** | `contracts/governance/Parliament.sol` |
| **مسئولیت اصلی** | ارائه و رأی‌گیری قوانین توسط نمایندگان؛ توشیح پادشاه (SOVEREIGN_ROLE) یا وتو؛ مصونیت پارلمانی؛ BUDGET_CAP = 150B PAH؛ مدیریت قوانین بودجه |
| **مدل اختیار** | `MP_ROLE` (proposeLaw، castVote)؛ `SOVEREIGN_ROLE` (enactLaw، vetoLaw، returnForRevision)؛ `KERNEL_ROLE` (registerMP)؛ `SPEAKER_ROLE` |
| **حفاظ runtime** | `onlyRole(MP_ROLE)` برای proposeLaw/castVote؛ `onlyRole(SOVEREIGN_ROLE)` برای enact/veto؛ `!lawVotes[lawId][msg.sender].hasVoted` ضدِ double-vote؛ `REVIEW_PERIOD = 10 days` |
| **invariant مرتبط** | `BUDGET_CAP = 150B PAH`؛ `REVIEW_PERIOD = 10 days`؛ LawStatus lifecycle: Draft → Voting → PassedByParliament → RoyalReview → Enacted/Vetoed |
| **پوشش test** | `test/15_Parliament.test.js` — 22 test (proposeLaw، castVote، enact، veto، returnForRevision، immunity) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`؛ `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` |
| **شکاف شناخته‌شده** | production SOVEREIGN_ROLE و MP_ROLE registry؛ release council gap (issue #19)؛ قوه مقننه fully off-chain composition |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production SOVEREIGN/MP role registry؛ release council decision (step13 WS-2 GAP)؛ integration test با BudgetAllocation |
| **گام بعدی WS-5** | اتصال SOVEREIGN_ROLE wiring به custody evidence packet (issue #14) |

---

### ۳-۱۰. VotingSystem — سیستم رأی‌گیری دیجیتال

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | VotingSystem — سیستم رأی‌گیری دیجیتال ملی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۴ (انتخابات)؛ اصل «بدون شورای نگهبان» |
| **فایل قرارداد** | `contracts/governance/VotingSystem.sol` |
| **مسئولیت اصلی** | ثبت و مدیریت انتخابات (ملی/استانی/رفراندوم)؛ ثبت نامزد با تأیید بیومتریک (از oracle)؛ رأی‌گیری با biometric dedup؛ `MIN_RESIDENCY_YEARS = 5` برای نامزدی استانی |
| **مدل اختیار** | `ELECTION_ROLE` (createElection)؛ `ORACLE_ROLE` (registerCandidate و بررسی بیومتریک)؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | `startTime > block.timestamp`؛ `endTime > startTime`؛ `!hasVoted[electionId][biometricHash]` ضدِ double-vote؛ `residencyYears >= MIN_RESIDENCY_YEARS` |
| **invariant مرتبط** | `MIN_RESIDENCY_YEARS = 5`؛ biometric uniqueness ضدِ تقلب؛ ElectionStatus lifecycle |
| **پوشش test** | `test/18_Voting_System.test.js` — 20 test (createElection، registerCandidate، castVote، biometric dedup) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`؛ `constitution/constitution-fa.md` |
| **شکاف شناخته‌شده** | سیستم بیومتریک کاملاً off-chain است؛ ORACLE_ROLE برای تأیید صلاحیت نامزدها باید wired شود |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | biometric oracle integration spec؛ production ORACLE_ROLE و ELECTION_ROLE wiring؛ integration test با CitizenCard |
| **گام بعدی WS-5** | ثبت biometric oracle dependency در deployment manifest |

---

### ۳-۱۱. Provincial — حاکمیت استانی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | Provincial — حاکمیت استانی و فرمول ۳۰/۷۰ |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۵ (استان‌ها)؛ `whitepaper/whitepaper-fa.md` — توزیع ۳۰% محلی / ۷۰% ملی |
| **فایل قرارداد** | `contracts/governance/Provincial.sol` |
| **مسئولیت اصلی** | ثبت استان‌ها و استانداران؛ توزیع درآمد با فرمول PROVINCIAL_SHARE=300‰ / NATIONAL_SHARE=700‰؛ پرداخت پاداش بهره‌وری برای استان‌های با score > 70 |
| **مدل اختیار** | `KERNEL_ROLE` (registerProvince، payProductivityBonus، updateGovernor)؛ `ORACLE_ROLE` (distributeRevenue، updateProductivityScore) |
| **حفاظ runtime** | `p.isActive` check؛ `p.productivityScore > 70` برای bonus؛ `amount > 0`؛ `nonReentrant` |
| **invariant مرتبط** | `PROVINCIAL_SHARE = 300‰ (30%)`؛ `NATIONAL_SHARE = 700‰ (70%)`؛ productivityScore 0-100 |
| **پوشش test** | `test/16_Provincial.test.js` — 26 test (registerProvince، distributeRevenue، productivityBonus، updateGovernor) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`؛ `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **شکاف شناخته‌شده** | `nationalTreasury` آدرس باید در deployment wired شود؛ ORACLE_ROLE برای revenue reporting off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | deployment manifest شامل `nationalTreasury` address؛ ORACLE_ROLE wiring برای revenue data؛ integration test با Treasury |
| **گام بعدی WS-5** | ثبت Provincial → Treasury → Oracle dependency chain در deployment manifest |

---

### ۳-۱۲. Fargard7PolicyAdapter — adapter سیگنال اقتصادی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | Fargard7PolicyAdapter — proposal-only adapter سیگنال اقتصادی |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فرگرد ۷ (سیاست اقتصادی)؛ `protocols/monetary-protocol-fa.md` |
| **فایل قرارداد** | `contracts/governance/Fargard7PolicyAdapter.sol` |
| **مسئولیت اصلی** | دریافت snapshot سیگنال‌های اقتصادی (CPI، طلا، گاز) از PriceOracle؛ طبقه‌بندی سطح stress (Normal/Elevated/Severe)؛ تولید recommendation با `executable=false`؛ lifecycle مدیریت review |
| **مدل اختیار** | `RECOMMENDER_ROLE` (createRecommendation)؛ `REVIEWER_ROLE` (approve/reject/expire)؛ `POLICY_ADMIN_ROLE` (setThresholds، setPriceOracle، setReviewWindow) |
| **حفاظ runtime** | `allSignalsFresh == true` (بررسی staleness همه سیگنال‌ها قبل از create)؛ `executable = false` ثابت در همه recommendationها؛ `reviewWindow = 7 days`؛ `!recommendation.executed` |
| **invariant مرتبط** | `executable = false` در هر recommendation (هرگز upstream mutation انجام نمی‌دهد)؛ `allSignalsFresh` check؛ تهی‌بودن downstream execution path |
| **پوشش test** | `test/26_Step7_PolicyLayer.test.js` — 41 test (createRecommendation، approve، reject، expire، stale signal guard، stress classification، executable=false invariant) |
| **evidence/گزارش مرتبط** | `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`؛ `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`؛ WS-4 این review |
| **شکاف شناخته‌شده** | ندارد (در repo) — طراحی proposal-only به‌طور کامل پیاده‌سازی و test شده است |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | production RECOMMENDER_ROLE و REVIEWER_ROLE wiring (off-chain governance)؛ formal verification برای non-execution invariant |
| **گام بعدی WS-5** | اتصال Fargard7PolicyAdapter به formal verification target list (non-execution invariant → issue #13) |

---

### ۳-۱۳. API3Oracle — اوراکل اصلی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | API3Oracle — اوراکل اصلی و پل Airnode |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فرگرد ۷ (داده‌های خارجی)؛ اصل oracle signal-only |
| **فایل قرارداد** | `contracts/oracles/API3Oracle.sol` |
| **مسئولیت اصلی** | دریافت داده از FEEDER_ROLE (6 نوع: PRICE/PRODUCTION/GOVERNANCE/JUDICIAL/MILITARY/WELFARE)؛ flagViolation (با staleness guard CLC-03)؛ ارسال flagViolation به Kernel |
| **مدل اختیار** | `FEEDER_ROLE` (updateData، flagViolation)؛ `KERNEL_ROLE` (confirmViolation، military data restriction)؛ `CONSUMER_ROLE` (getData) |
| **حفاظ runtime** | `hasRole(FEEDER_ROLE)` onlyFeeder modifier؛ `MAX_DATA_AGE = 1 hours` staleness check در flagViolation (CLC-03 — remediated commit `6e688e5`)؛ military data `onlyRole(KERNEL_ROLE)` |
| **invariant مرتبط** | `MAX_DATA_AGE = 1 hours` (CLC-03)؛ `violationCode 1-6` validation؛ staleness guard پیش از هر flagViolation |
| **پوشش test** | `test/09_api3_oracle.test.js` — 17 test (updateData، flagViolation، staleness guard، military restriction، confirmViolation) |
| **evidence/گزارش مرتبط** | `docs/step40/WHITEPAPER_STEP40_CLC03_ORACLE_STALENESS_DECISION.md`؛ `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md`؛ commit `6e688e5` |
| **شکاف شناخته‌شده** | oracle operations runbook و signoff pending (issue #15)؛ production FEEDER_ROLE identity و rotation policy |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops runbook (issue #15)؛ production FEEDER_ROLE identity registry؛ evidence از oracle signoff |
| **گام بعدی WS-5** | اتصال CLC-03 staleness guard به external audit scope (issue #12)؛ oracle runbook (issue #15) |

---

### ۳-۱۴. PriceOracle — اوراکل قیمت‌های جهانی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | PriceOracle — اوراکل قیمت‌های جهانی |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فرگرد ۷ (ارزش‌گذاری دارایی، نرخ پهلوی)؛ `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` |
| **فایل قرارداد** | `contracts/oracles/PriceOracle.sol` |
| **مسئولیت اصلی** | تجمیع داده از حداقل ۳ feeder مستقل (PAH/USD، طلا، نفت، گاز، تورم، L2 yield)؛ staleness invalidation؛ deviation detection |
| **مدل اختیار** | `FEEDER_ROLE` (submitPrice)؛ `KERNEL_ROLE` admin؛ `CONSUMER_ROLE` (getPrice) |
| **حفاظ runtime** | `STALENESS_THRESHOLD = 1 hours`؛ `MIN_FEEDERS = 3`؛ `DEVIATION_THRESHOLD = 50‰` — emit event اگر deviation بیش از 5% |
| **invariant مرتبط** | `STALENESS_THRESHOLD = 1h`؛ `MIN_FEEDERS = 3`؛ قیمت‌ها signal-only هستند — هیچ autonomous policy execution انجام نمی‌دهند |
| **پوشش test** | `test/23_Price_Oracle.test.js` — 23 test (submitPrice، staleness، deviation، feeder tracking) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` — oracle ops |
| **شکاف شناخته‌شده** | oracle ops evidence و runbook pending (issue #16)؛ production FEEDER_ROLE identity |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops runbook (issue #16)؛ production FEEDER_ROLE identity و rotation؛ accepted oracle ops evidence |
| **گام بعدی WS-5** | اتصال PriceOracle به oracle ops evidence packet (issue #15/#16) |

---

### ۳-۱۵. ProductionOracle — اوراکل تولید و بهره‌وری

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | ProductionOracle — اوراکل تولید و Proof of Merit |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فرگرد ۷ (حمایت از تولید)؛ اصل Proof of Merit |
| **فایل قرارداد** | `contracts/oracles/ProductionOracle.sol` |
| **مسئولیت اصلی** | ثبت واحدهای تولیدی؛ محاسبه composite score (اشتغال/ارزش‌افزوده/تجدید/انطباق)؛ طبقه‌بندی Pioneer/Transition/Critical؛ loan eligibility؛ subsidy tracking |
| **مدل اختیار** | `FEEDER_ROLE` (registerUnit، updateProductionData)؛ `BANK_ROLE` (approveLoan)؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | `PIONEER_THRESHOLD = 70`؛ `TRANSITION_THRESHOLD = 50`؛ score 0-100 range؛ `isRegistered` check |
| **invariant مرتبط** | score ≥ 70 → Pioneer؛ 50-69 → Transition؛ < 50 → Critical؛ signal-only (هیچ autonomous subsidy payment) |
| **پوشش test** | `test/24_Production_Oracle.test.js` — 50 test (registerUnit، score calculation، category classification، loan eligibility، subsidy) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`؛ Step 12 oracle ops packet |
| **شکاف شناخته‌شده** | oracle ops runbook pending (issue #16)؛ loan disbursement واقعی off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops runbook (issue #16)؛ on-chain loan disbursement integration؛ FEEDER_ROLE identity registry |
| **گام بعدی WS-5** | ثبت ProductionOracle → BaseIncome → BudgetAllocation dependency در deployment manifest |

---

### ۳-۱۶. AssetFreeze — انجماد دارایی‌های غصبی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | AssetFreeze — پروتکل بازپس‌گیری دارایی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — بازپس‌گیری اموال ملی؛ `protocols/reclaim-protocol-fa.md` |
| **فایل قرارداد** | `contracts/reclaim/AssetFreeze.sol` |
| **مسئولیت اصلی** | انجماد توسط CRAWLER_ROLE؛ تأیید با ۳ امضای COUNCIL_ROLE؛ انتقال به SWF (فقط accounting update)؛ آزادسازی توسط KERNEL_ROLE |
| **مدل اختیار** | `CRAWLER_ROLE` (freezeAsset)؛ `COUNCIL_ROLE` (signConfirmation، transferToSWF)؛ `KERNEL_ROLE` (releaseAsset) |
| **حفاظ runtime** | `COUNCIL_THRESHOLD = 3`؛ FreezeStatus lifecycle (Active→UnderReview→Confirmed→TransferredToSWF/Released)؛ CEI pattern در transferToSWF؛ `!transferredToSWF` ضدِ double-transfer |
| **invariant مرتبط** | `COUNCIL_THRESHOLD = 3`؛ `transferredToSWF = false` قبل از انتقال؛ lifecycle یک‌طرفه (Confirmed → TransferredToSWF غیرقابل برگشت) |
| **پوشش test** | `test/06_asset_freeze.test.js` — 23 test (freeze، signConfirmation، transferToSWF، releaseAsset، lifecycle enforcement) |
| **evidence/گزارش مرتبط** | `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`؛ `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` |
| **شکاف شناخته‌شده** | production CRAWLER_ROLE و COUNCIL_ROLE registry؛ `ISovereignWealthFund.receiveReclaimedAsset()` اثر واقعی اقتصادی ندارد — فقط accounting event |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production COUNCIL_ROLE signer registry (issue #14)؛ CRAWLER_ROLE identity (SovereignCrawler wiring) |
| **گام بعدی WS-5** | اتصال AssetFreeze → SovereignCrawler role wiring به custody packet (issue #14) |

---

### ۳-۱۷. SovereignCrawler — خزنده شبکه

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | SovereignCrawler — بازپس‌گیری دارایی‌های غصبی |
| **منبع منشور/دکترین** | `protocols/reclaim-protocol-fa.md`؛ `constitution/constitution-fa.md` — بازپس‌گیری اموال |
| **فایل قرارداد** | `contracts/reclaim/SovereignCrawler.sol` |
| **مسئولیت اصلی** | شناسایی و ردیابی هدف‌های مشکوک (Cartel/ParastatalEntity/ShellCompany/PersonalAccount)؛ تحلیل گراف تراکنش‌ها (shell company chain)؛ انجماد با تأیید NODE_THRESHOLD=3 |
| **مدل اختیار** | `NODE_ROLE` (identifyTarget، trackTarget)؛ `COUNCIL_ROLE` (confirmTarget)؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | `NODE_THRESHOLD = 3`؛ `FREEZE_DEADLINE = 72 hours`؛ CrawlStatus lifecycle (Identified→Tracking→Frozen→Confirmed→Transferred/Released) |
| **invariant مرتبط** | `NODE_THRESHOLD = 3`؛ `FREEZE_DEADLINE = 72h`؛ graph edge immutability |
| **پوشش test** | `test/22_Sovereign_Crawler.test.js` — 23 test (identifyTarget، trackTarget، graph edges، node confirmation، status lifecycle) |
| **evidence/گزارش مرتبط** | `contracts/reclaim/AssetFreeze.sol` — downstream؛ `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md` |
| **شکاف شناخته‌شده** | production NODE_ROLE identity؛ پیوند خودکار به AssetFreeze (off-chain coordination)؛ AI/GNN component کاملاً off-chain |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production NODE_ROLE registry؛ SovereignCrawler → AssetFreeze on-chain integration spec؛ AI crawler component (خارج از scope قرارداد) |
| **گام بعدی WS-5** | ثبت SovereignCrawler → AssetFreeze coordination در ops runbook |

---

### ۳-۱۸. JurySelection — انتخاب هیئت منصفه

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | JurySelection — انتخاب تصادفی هیئت منصفه با VRF |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۶ (قضاء)؛ `protocols/justice-protocol-fa.md` |
| **فایل قرارداد** | `contracts/justice/JurySelection.sol` |
| **مسئولیت اصلی** | انتخاب ۱۲ داور با commitment VRF؛ ثبت آرا با ZK proof (طول-check)؛ verdict با آستانه محکومیت ۸/۱۲ یا برائت ۵/۱۲ |
| **مدل اختیار** | `VRF_ROLE` (selectJury)؛ `COURT_ROLE` admin؛ `KERNEL_ROLE` admin؛ هر آدرس با commitment معتبر (submitVote) |
| **حفاظ runtime** | `jurorCommitments.length == JURY_SIZE (12)`؛ `!usedCommitments[commitment]` ضدِ double-vote؛ `zkProof.length > 0` (طول-only)؛ commitment validity |
| **invariant مرتبط** | `JURY_SIZE = 12`؛ `CONVICTION_THRESHOLD = 8`؛ `ACQUITTAL_THRESHOLD = 5`؛ verdict 3 (دور دوم) اگر ۱۲ رأی بدون نتیجه |
| **پوشش test** | `test/07_jury_selection.test.js` — 28 test (selectJury، submitVote، conviction، acquittal، second-round، double-vote guard) |
| **evidence/گزارش مرتبط** | `whitepaper/whitepaper-fa.md` — ZK jury section؛ CLAUDE.md — «ZK proof only length-checked» |
| **شکاف شناخته‌شده** | ZK proof فقط length-check است — full ZKP verification on-chain پیاده‌سازی نشده (documented in CLAUDE.md)؛ VRF_ROLE wiring off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | full ZKP verification (planned future version)؛ VRF_ROLE identity و integration spec؛ formal verification برای verdict invariant |
| **گام بعدی WS-5** | ثبت «ZKP length-only» در external audit scope (issue #12)؛ formal verification target (issue #13) |

---

### ۳-۱۹. JusticeProtocol — پروتکل دادگستری دیجیتال

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | JusticeProtocol — API قضایی واحد |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۶ (قضاء)؛ «اعدام در کد تعریف نشده» |
| **فایل قرارداد** | `contracts/justice/JusticeProtocol.sol` |
| **مسئولیت اصلی** | ثبت پرونده و مدیریت lifecycle (Filed→InvestigationPhase→JurySelection→Trial→Sentenced→OnAppeal→Final)؛ صدور حکم digital-signed؛ درخواست تجدیدنظر |
| **مدل اختیار** | `JUDGE_ROLE` (assignJudge، issueSentence)؛ `COURT_ROLE` (approveSentence)؛ `APPEAL_ROLE` (fileAppeal)؛ `KERNEL_ROLE` admin |
| **حفاظ runtime** | lifecycle status checks؛ `digitalSigned` flag؛ `SentenceType` enum بدون اعدام |
| **invariant مرتبط** | `SentenceType` شامل فقط: Acquitted/PenalLabor/Imprisonment/FinePlus/CommunityService؛ هیچ اعدامی تعریف نشده |
| **پوشش test** | `test/19_Justice_Protocol.test.js` — 22 test (fileCase، assignJudge، issueSentence، digitalSign، appeal، finalize) |
| **evidence/گزارش مرتبط** | `whitepaper/whitepaper-fa.md`؛ `protocols/justice-protocol-fa.md` |
| **شکاف شناخته‌شده** | production JUDGE_ROLE و COURT_ROLE registry؛ پیوند با JurySelection off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production JUDGE_ROLE registry؛ JurySelection → JusticeProtocol integration spec |
| **گام بعدی WS-5** | ثبت justice system role wiring dependency در deployment manifest |

---

### ۳-۲۰. PenalLabor — مدل کار جبرانی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | PenalLabor — کار جبرانی جایگزین اعدام |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۶ (عدالت ترمیمی)؛ `protocols/justice-protocol-fa.md` |
| **فایل قرارداد** | `contracts/justice/PenalLabor.sol` |
| **مسئولیت اصلی** | تخصیص محکوم به پروژه ملی؛ توزیع درآمد: MAINTENANCE=200‰ / VICTIM=400‰ / NATIONAL_TAX=300‰ / SURVIVAL=100‰؛ ثبت پرداخت‌ها به VictimFund |
| **مدل اختیار** | `COURT_ROLE` (assignConvict)؛ `EMPLOYER_ROLE` (recordMonthlyIncome)؛ `VICTIM_FUND_ROLE` (receiveCompensation)؛ `KERNEL_ROLE` (registerProject) |
| **حفاظ runtime** | `difficultyScore >= 5 && <= 10`؛ `isActive` checks؛ distribution ratios sum = 1000 |
| **invariant مرتبط** | درآمد توزیع: MAINTENANCE+VICTIM+NATIONAL_TAX+SURVIVAL = 1000‰؛ victim compensation priority |
| **پوشش test** | `test/20-Penal_Labor.test.js` — 19 test (registerProject، assignConvict، monthlyIncome distribution، completeSentence) |
| **evidence/گزارش مرتبط** | `contracts/reclaim/VictimFund.sol`؛ `protocols/justice-protocol-fa.md` |
| **شکاف شناخته‌شده** | production COURT_ROLE و EMPLOYER_ROLE wiring؛ پیوند با VictimFund (transferFunds off-chain event-driven) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production COURT_ROLE registry؛ PenalLabor → VictimFund automatic fund transfer integration |
| **گام بعدی WS-5** | ثبت PenalLabor → VictimFund fund flow در ops runbook |

---

### ۳-۲۱. CitizenCard — کارت هوشمند شهروندی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | CitizenCard — هویت و رفاه شهروندی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (رفاه)؛ `whitepaper/whitepaper-fa.md` — 1000 پهلوی حداقل دستمزد |
| **فایل قرارداد** | `contracts/welfare/CitizenCard.sol` |
| **مسئولیت اصلی** | ثبت شهروند با biometric dedup؛ ردیابی وضعیت اشتغال (Employed/Unemployed/Retired/Disabled)؛ بیمه بیکاری (70% MIN_WAGE تا ۱۸ ماه)؛ اعتبار بهداشت (500 PAH/سال)؛ سهمیه دارو (100 PAH/ماه) |
| **مدل اختیار** | `ISSUER_ROLE` (registerCitizen)؛ `EMPLOYER_ROLE` (startEmployment، endEmployment)؛ `HEALTH_ROLE` (useHealthCredit)؛ `WELFARE_ROLE` (payUnemploymentInsurance، retireByAge) |
| **حفاظ runtime** | `biometricToAddress[hash] == address(0)` ضدِ duplicate؛ `unemploymentMonthsPaid < MAX_UNEMPLOYMENT_MONTHS (18)` ceiling؛ `!citizens[citizen].isActive` ضدِ duplicate registration |
| **invariant مرتبط** | `MIN_WAGE = 1000 PAH`؛ `UNEMPLOYMENT_RATIO = 700‰ (70%)`؛ `MAX_UNEMPLOYMENT_MONTHS = 18`؛ `HEALTH_CREDIT_ANNUAL = 500 PAH`؛ `RETIREMENT_AGE = 65` |
| **پوشش test** | `test/05_citizen_card.test.js` — 25 test (registerCitizen، startEmployment، endEmployment، unemploymentInsurance، healthCredit، retirement) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `constitution/constitution-fa.md` — فرگرد ۱۰ |
| **شکاف شناخته‌شده** | MIN_WAGE توسط کارفرما off-chain پرداخت می‌شود — قرارداد فقط eligibility track می‌کند؛ biometric system کاملاً off-chain |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | integration test با BaseIncome و HealthCoverage؛ biometric oracle integration spec؛ production ISSUER_ROLE registry |
| **گام بعدی WS-5** | ثبت «employer pays off-chain» در deployment doctrine |

---

### ۳-۲۲. BaseIncome — ردیابی حداقل دستمزد

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | BaseIncome — ردیابی حداقل دستمزد ۱۰۰۰ پهلوی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (۱۰۰۰ پهلوی حداقل دستمزد)؛ `whitepaper/whitepaper-fa.md` |
| **فایل قرارداد** | `contracts/welfare/BaseIncome.sol` |
| **مسئولیت اصلی** | ثبت کارفرما و تعداد کارمندان؛ ثبت پرداخت دستمزد (با امضای کارفرما)؛ تشخیص عدم انطباق (amount < MIN_WAGE)؛ یارانه از SWF_ROLE |
| **مدل اختیار** | `ORACLE_ROLE` (registerEmployer)؛ `EMPLOYER_ROLE` (recordWagePayment)؛ `SWF_ROLE` (grantSubsidy، revokeSubsidy) |
| **حفاظ runtime** | `amount >= MIN_WAGE` compliance check؛ `isRegistered` check؛ `nonReentrant` |
| **invariant مرتبط** | `MIN_WAGE = 1000 PAH`؛ `TAX_EXEMPT_CAP = 1000 PAH` (معافیت مالیاتی)؛ compliance tracking per employer |
| **پوشش test** | `test/12_Base_Income.test.js` — 27 test (registerEmployer، recordWagePayment، non-compliance، subsidy، tax exemption) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ CLAUDE.md — «CitizenCard does not pay wages» |
| **شکاف شناخته‌شده** | دستمزد واقعی off-chain است؛ recordWagePayment فقط record است نه payment execution |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | on-chain wage payment mechanism (off-chain by design)؛ ORACLE_ROLE wiring؛ integration test با CitizenCard |
| **گام بعدی WS-5** | ثبت «wage paid by employer off-chain» در deployment doctrine |

---

### ۳-۲۳. HealthCoverage — بیمه همگانی

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | HealthCoverage — بیمه همگانی و پوشش درمانی |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (بهداشت رایگان)؛ `whitepaper/whitepaper-fa.md` |
| **فایل قرارداد** | `contracts/welfare/HealthCoverage.sol` |
| **مسئولیت اصلی** | کیف‌پول سلامت شهروندی (500 PAH/سال)؛ سهمیه دارو (100 PAH/ماه)؛ مرخصی زایمان (6000 PAH)؛ مدیریت providers تأییدشده |
| **مدل اختیار** | `HEALTH_ROLE` (createHealthWallet، renewCredit)؛ `PROVIDER_ROLE` (billHealthCredit)؛ `PHARMACY_ROLE` (useDrugQuota)؛ `SWF_ROLE` (payMaternityLeave) |
| **حفاظ runtime** | `isActive` checks؛ credit spending limits؛ `ANNUAL_HEALTH_CREDIT = 500 PAH`؛ `MONTHLY_DRUG_QUOTA = 100 PAH` |
| **invariant مرتبط** | `ANNUAL_HEALTH_CREDIT = 500 PAH`؛ `MONTHLY_DRUG_QUOTA = 100 PAH`؛ `MATERNITY_LEAVE_PAY = 6000 PAH` |
| **پوشش test** | `test/13_Health_Coverage.test.js` — 23 test (createWallet، useCredit، drugQuota، maternity، provider billing) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`؛ `constitution/constitution-fa.md` — فرگرد ۱۰ |
| **شکاف شناخته‌شده** | production health provider registry؛ پیوند به SWF برای تأمین مالی off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production PROVIDER_ROLE و PHARMACY_ROLE registry؛ SWF funding integration spec |
| **گام بعدی WS-5** | ثبت HealthCoverage → SWF funding dependency در deployment manifest |

---

### ۳-۲۴. DisabilitySupport — حمایت از توان‌خواهان

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | DisabilitySupport — مستمری و دسترسی‌پذیری توان‌خواهان |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۱۰ (رفاه)؛ `whitepaper/whitepaper-fa.md` — مستمری تضمینی |
| **فایل قرارداد** | `contracts/welfare/DisabilitySupport.sol` |
| **مسئولیت اصلی** | ثبت شهروند توان‌خواه؛ محاسبه مستمری بر اساس درجه (Level1=1300، Level2=1500، Level3=1700 PAH/ماه)؛ کارت دسترسی‌پذیری؛ ممیزی خدمات عمومی |
| **مدل اختیار** | `HEALTH_ROLE` (registerDisabledCitizen)؛ `WELFARE_ROLE` (payStipend، updateLevel)؛ `SWF_ROLE` (fund) |
| **حفاظ runtime** | `PAYMENT_INTERVAL = 30 days`؛ disability level 1-3 validation؛ `block.timestamp - lastPayment >= PAYMENT_INTERVAL` |
| **invariant مرتبط** | `MIN_WAGE = 1000 PAH`؛ `LEVEL1_SUPPLEMENT = 300‰ (30%)`؛ `LEVEL2_SUPPLEMENT = 500‰ (50%)`؛ `LEVEL3_SUPPLEMENT = 700‰ (70%)` |
| **پوشش test** | `test/14_Disability_Support.test.js` — 26 test (registerCitizen، payStipend، interval enforcement، level update، accessibility card) |
| **evidence/گزارش مرتبط** | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **شکاف شناخته‌شده** | پرداخت واقعی مستمری off-chain است؛ SWF funding path به مستمری مستند نشده |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | on-chain stipend payment execution؛ SWF → DisabilitySupport funding path |
| **گام بعدی WS-5** | ثبت DisabilitySupport → SWF funding در deployment manifest |

---

### ۳-۲۵. VictimFund — گنجینه حمایت از آسیب‌دیدگان

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | VictimFund — غرامت قربانیان فساد و سرکوب |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۶ (عدالت ترمیمی)؛ `protocols/justice-protocol-fa.md` |
| **فایل قرارداد** | `contracts/reclaim/VictimFund.sol` |
| **مسئولیت اصلی** | ثبت قربانی (COURT_ROLE)؛ دریافت وجه از PenalLabor (PENAL_LABOR_ROLE)؛ پرداخت غرامت (COUNCIL_ROLE)؛ مدیریت VictimCategory (DirectCorruption/PoliticalPrisoner/StructuralHarm/TortureVictim/PropertySeizure) |
| **مدل اختیار** | `COURT_ROLE` (registerVictim)؛ `PENAL_LABOR_ROLE`/`COUNCIL_ROLE`/`KERNEL_ROLE` (receiveFunds)؛ `COUNCIL_ROLE` (payCompensation) |
| **حفاظ runtime** | `approvedAmount > 0`؛ `isActive`؛ `vr.paidAmount + amount <= vr.approvedAmount`؛ `totalBalance >= amount` |
| **invariant مرتبط** | `paidAmount <= approvedAmount` در هر پرداخت؛ `fullyCompensated` flag |
| **پوشش test** | `test/21_Victim_Fund.test.js` — 19 test (registerVictim، receiveFunds، payCompensation، cap enforcement، fully compensated) |
| **evidence/گزارش مرتبط** | `contracts/justice/PenalLabor.sol`؛ `protocols/justice-protocol-fa.md` |
| **شکاف شناخته‌شده** | production COURT_ROLE و COUNCIL_ROLE registry؛ automatic fund transfer از PenalLabor به VictimFund off-chain است |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | production COURT_ROLE registry؛ PenalLabor → VictimFund automatic transfer spec |
| **گام بعدی WS-5** | ثبت VictimFund funding flow در justice ops runbook |

---

### ۳-۲۶. TG-01 — شکاف یکپارچگی TriggerProtocol ↔ Treasury

| محور | جزئیات |
| --- | --- |
| **نام ماژول** | TG-01 — مرز یکپارچگی TriggerProtocol و Treasury |
| **منبع منشور/دکترین** | `protocols/trigger-protocol-fa.md` — انتظار: فعال‌سازی ماشه باید دسترسی مالی خاطی را قطع کند |
| **فایل قرارداد** | `contracts/core/TriggerProtocol.sol` (executeTrigger) ↔ `contracts/monetary/Treasury.sol` (blockAddressByTrigger) |
| **مسئولیت اصلی** | [شکاف] پس از `executeTrigger()`، `TriggerProtocol.blockedFromTreasury[offender]=true` اما `Treasury.blockedByTrigger[offender]` همچنان false می‌ماند |
| **مدل اختیار** | [شکاف] `Treasury.blockAddressByTrigger()` نیاز به `onlyRole(KERNEL_ROLE)` دارد. `executeTrigger()` به Treasury دسترسی ندارد. فقط Kernel می‌تواند Treasury را block کند (Option D) |
| **حفاظ runtime** | [شکاف] `notBlocked(recipient)` در Treasury اجرا می‌شود اما تا زمان فراخوانی صریح Kernel فعال نمی‌شود |
| **invariant مرتبط** | [شکاف] انتظار: `Treasury.isBlocked(offender) == true` پس از trigger؛ واقعیت: `false` تا Option D |
| **پوشش test** | `test/08_Trigger_Protocol.test.js` — TG-01 شکاف تأیید شده (steps A-G)؛ Option D تأیید شده |
| **evidence/گزارش مرتبط** | `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step21/` — RC-E-13 |
| **شکاف شناخته‌شده** | گپ طراحی مستند: `executeTrigger()` هرگز `Treasury.blockAddressByTrigger()` را فراخوانی نمی‌کند. پیاده‌سازی passthrough در step38 رد شد (ریسک P0 revert) |
| **وضعیت ردیابی** | **GAP** |
| **artifact ناموجود** | Option D governance runbook (Kernel → `blockAddressByTrigger()` پس از trigger)؛ formal specification برای human-in-the-loop Treasury blocking |
| **گام بعدی WS-5** | ثبت Option D در governance ops runbook؛ اتصال TG-01 به external audit scope (issue #12)؛ شرط تغییر آینده (step38) به deployment doctrine اضافه شود |

---

## ۴. خلاصه وضعیت workstream ۵

| برچسب | تعداد | ماژول‌های اصلی |
| --- | --- | --- |
| **COMPLETE** | **2** | ConstitutionGuard، Fargard7PolicyAdapter |
| **PARTIAL** | **23** | Kernel، TriggerProtocol، PahlaviToken، SovereignWealthFund، Treasury، VelocityFee، BudgetAllocation، Parliament، VotingSystem، Provincial، API3Oracle، PriceOracle، ProductionOracle، AssetFreeze، SovereignCrawler، JurySelection، JusticeProtocol، PenalLabor، CitizenCard، BaseIncome، HealthCoverage، DisabilitySupport، VictimFund |
| **GAP** | **1** | TG-01 (TriggerProtocol ↔ Treasury integration boundary) |
| **مجموع** | **26** | — |

---

## ۵. الگوهای مشترک شکاف

| الگو | ماژول‌های مربوط |
| --- | --- |
| production role registry pending | Kernel، SWF، AssetFreeze، Parliament، JusticeProtocol، VictimFund، BaseIncome |
| oracle ops runbook/signoff pending | API3Oracle، PriceOracle، ProductionOracle |
| formal verification target ثبت‌نشده | Kernel، PahlaviToken، SWF، Treasury، ConstitutionGuard، JurySelection، Fargard7PolicyAdapter |
| off-chain payment/execution | VelocityFee (fee transfer)، BaseIncome (wage payment)، CitizenCard (wage)، HealthCoverage، DisabilitySupport |
| integration boundary off-chain | Provincial → Treasury، PenalLabor → VictimFund، SovereignCrawler → AssetFreeze |
| ZK proof partial (length-only) | JurySelection |
| TG-01 gap | TriggerProtocol، Treasury، Kernel (cross-cutting) |

---

## ۶. non-claim نهایی

این سند AI-assisted و documentation-only است. هیچ‌کدام از موارد زیر ادعا نمی‌شود:

- هیچ ماژولی production-ready نیست.
- هیچ evidence پذیرفته‌شده وجود ندارد.
- هیچ reviewer signoff وجود ندارد.
- هیچ blocker بسته نشده است.
- گام ۱۲ باز می‌ماند.
- گام ۱۳ باز می‌ماند.
- COMPLETE فقط به‌معنای کامل بودن زنجیره ردیابی داخل repo است — نه production readiness، audit completion، یا formal verification.
- سیگنال‌های اوراکل non-sovereign و signal-only می‌مانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing می‌ماند.
- SWF sovereign reserve resilience layer می‌ماند — نه DeFi، نه yield engine.
- Kernel immutability، MULTISIG_THRESHOLD=7، TRIGGER_TIMEOUT=72h (SLA رسیدگی دادگاه)، و human final freeze authority حفظ می‌شوند.

</div>
