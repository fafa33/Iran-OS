<div dir="rtl">

# بازبینی ردیابی workstream ۶: معماری اوراکل و سیگنال

**نام فنی:** Step 13 WS-6 Oracle and Signal Architecture Traceability Review
**نوع سند:** documentation-only / traceability review / AI-assisted pre-review
**workstream:** اوراکل و سیگنال‌ها
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** `claude/iran-os-step-40-gaps-WDCng` — commit `ffef348` (پس از ادغام main) — 499 test passing

---

## ۱. هدف و حدود

این سند ردیابی تفصیلی معماری اوراکل و سیگنال Iran-OS را از اصول سپیدنامه/منشور تا invariant قرارداد، حفاظ runtime، پوشش test، و وابستگی evidence/signoff پوشش می‌دهد.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ oracle authority را گسترش نمی‌دهد.
- هیچ اجرای خودکار حاکمیتی ایجاد نمی‌کند.
- هیچ threshold، timeout، role model، treasury logic، reserve logic، oracle authority، یا freeze authority را تغییر نمی‌دهد.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- `TRIGGER_TIMEOUT = 72h` SLA رسیدگی دادگاه (نه auto-unlock) است — مستند در step42.
- `MULTISIG_THRESHOLD = 7` تغییرناپذیر است.
- TG-01 بسته نمی‌شود — ریسک P0 در step38 مستند و رد شد.

**قانون بنیادی:**
- مسیر مجاز: داده → سیگنال → بررسی → تصمیم authorized انسانی/حاکمیتی
- مسیر ممنوع: داده → اجرای خودکار policy/بودجه/freeze/mint/حاکمیت

این بازبینی AI-assisted و documentation-only است و نیازمند review مستقل فنی/حقوقی/حکمرانی است.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | زنجیره کامل است: اصل/invariant، قرارداد، حفاظ runtime، و test همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد. |

---

## ۳. جدول ردیابی تفصیلی اصول اوراکل و سیگنال

---

### ۳-۱. دکترین اوراکل — اصل کلی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | دکترین اوراکل — اصل کلی نقش داده در حاکمیت |
| **منبع منشور/دکترین** | `constitution/constitution-fa.md` — فرگرد ۷ (استقلال SWF)؛ `whitepaper/whitepaper-fa.md` — بخش‌های oracle/data؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md` |
| **لینک دکترین** | اوراکل داده واقعی را به on-chain می‌آورد؛ سیگنال خروجی فقط ورودی evidence است — نه حاکمیت خودمختار؛ تصمیم نهایی در اختیار انسان/ساختار حاکمیتی است |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/oracles/PriceOracle.sol`؛ `contracts/oracles/ProductionOracle.sol`؛ `contracts/governance/Fargard7PolicyAdapter.sol`؛ `contracts/kernel.sol` |
| **حفاظ runtime** | `ORACLE_ROLE` فقط flag می‌زند — نه اجرا؛ `flagViolation()` فقط Kernel.flagViolation را فعال می‌کند؛ 7-of-9 multi-sig لازم است برای trigger activation؛ `COURT_ROLE` تنها مرجع رفع قفل اضطراری است |
| **invariant** | سیگنال اوراکل ≠ اختیار حاکمیتی؛ oracle flag → Kernel event (نه direct execution)؛ هیچ oracle call نمی‌تواند treasury/SWF/freeze را مستقیم فعال کند |
| **پوشش test** | `test/09_api3_oracle.test.js` (17 test)؛ `test/23_Price_Oracle.test.js` (23 test)؛ `test/24_Production_Oracle.test.js` (50 test)؛ `test/01_kernel.test.js` — بخش oracle/flag |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_TRACEABILITY_ROLLUP_FA.md`؛ `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet — `STEP9-BLOCK-004`)؛ issue #16 (oracle runbook — `STEP9-BLOCK-007`)؛ هیچ oracle signoff پذیرفته‌شده وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops protocol/runbook پذیرفته‌شده؛ feeder registry رسمی؛ signoff مستقل |
| **گام بعدی WS-6** | اتصال oracle doctrine به issue #15/#16؛ تهیه evidence template برای oracle ops signoff |

---

### ۳-۲. دکترین داده غیرحاکمیتی (Signal-only)

| محور | جزئیات |
| --- | --- |
| **نام اصل** | دکترین داده غیرحاکمیتی — سیگنال فقط ورودی evidence است |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md`؛ `constitution/constitution-fa.md` — اصل حاکمیت انسانی |
| **لینک دکترین** | هیچ سیگنالی نمی‌تواند خودمختار به اقدام اجرایی تبدیل شود؛ مسیر مجاز: داده→سیگنال→بررسی→تصمیم مجاز انسانی؛ مسیر ممنوع: داده→اجرای خودکار |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/governance/Fargard7PolicyAdapter.sol`؛ `contracts/kernel.sol` |
| **حفاظ runtime** | `Fargard7PolicyAdapter`: فیلد `executable = false` در ساختار Recommendation؛ `allSignalsFresh` guard قبل از createRecommendation؛ هیچ مسیر downstream policy execution وجود ندارد |
| **invariant** | `Recommendation.executable == false` در تمام موارد؛ review window ≥ 7 روز؛ هیچ oracle action نباید مستقیماً treasury/mint/freeze را تغییر دهد |
| **پوشش test** | `test/26_Step7_PolicyLayer.test.js` (41 test) — تأیید executable=false؛ تأیید allSignalsFresh |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md`؛ `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`؛ `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md` |
| **blocker/signoff** | issue #18 (non-claim preservation)؛ هیچ signoff پذیرفته‌شده وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | formal specification مرز signal-only برای audit/proof؛ governance runbook تأیید مرز downstream non-interference |
| **گام بعدی WS-6** | ثبت مرز signal-only در external audit scope (issue #12)؛ اتصال به proof candidate در formal verification (issue #13) |

---

### ۳-۳. یکپارچگی API3 — قرارداد اوراکل اصلی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | یکپارچگی API3 — اتصال داده خارجی به Kernel |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — فصل oracle/API3؛ `CLAUDE.md` — Oracle Contracts؛ `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` |
| **لینک دکترین** | API3Oracle ورودی اصلی قیمت‌ها، تخلفات، و داده‌های حاکمیتی است؛ feeder با `ORACLE_ROLE` داده را تغذیه و تخلف را flag می‌زند |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol` |
| **حفاظ runtime** | `onlyFeeder` (ORACLE_ROLE) برای `feedData()` و `flagViolation()`؛ `nonReentrant`؛ `MAX_DATA_AGE = 1 hour` staleness check در `flagViolation()` (CLC-03 — commit `6e688e5`)؛ `DATA_MILITARY` فقط `KERNEL_ROLE` می‌تواند دریافت کند |
| **invariant** | `MAX_DATA_AGE = 3600 seconds (1 hour)`؛ `DataPoint.timestamp` در هر `feedData()` به `block.timestamp` تنظیم می‌شود؛ feeder بدون داده جاری نمی‌تواند flag بزند |
| **پوشش test** | `test/09_api3_oracle.test.js` — 17 test شامل 3 test CLC-03 (stale revert، fresh success، MAX_DATA_AGE constant) |
| **evidence مرتبط** | `docs/step40/WHITEPAPER_STEP40_CLC03_ORACLE_STALENESS_DECISION.md`؛ `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md`؛ commit `6e688e5` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ issue #16 (oracle runbook)؛ `STEP9-BLOCK-004`، `STEP9-BLOCK-007` |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | feeder registry رسمی (آدرس feeders، SLA، rotation policy)؛ source attestation per DataPoint type؛ multi-key staleness (فعلاً فقط PAH_USD_KEY — ریسک ۲ در step41) |
| **گام بعدی WS-6** | ثبت CLC-03 residual risk (ریسک ۲: multi-key) در issue #15؛ تهیه feeder registry template |

---

### ۳-۴. یکپارچگی Airnode — شکاف

| محور | جزئیات |
| --- | --- |
| **نام اصل** | یکپارچگی Airnode — ارتباط مستقیم API3 Airnode |
| **منبع منشور/دکترین** | `CLAUDE.md` — Technology Stack (API3/Airnode)؛ `whitepaper/whitepaper-fa.md` |
| **لینک دکترین** | Airnode لایه transport داده API3 است؛ باید به `API3Oracle.sol` متصل شود اما هیچ اجرای on-chain مستقیمی نداشته باشد |
| **قرارداد/ماژول** | هیچ قرارداد Airnode-specific در repo وجود ندارد؛ `contracts/oracles/API3Oracle.sol` رابط on-chain است |
| **حفاظ runtime** | ناقص — هیچ Airnode config، RRP adapter، یا Airnode verification در repo وجود ندارد |
| **invariant** | Airnode باید فقط به feeders با ORACLE_ROLE متصل شود؛ هیچ direct write به Kernel از Airnode مجاز نیست |
| **پوشش test** | هیچ test Airnode-specific در repo وجود ندارد |
| **evidence مرتبط** | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` (ذکر شکاف Airnode)؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ `STEP9-BLOCK-004` |
| **وضعیت ردیابی** | **GAP** |
| **artifact ناموجود** | Airnode config/RRP adapter؛ Airnode→feeder connection spec؛ Airnode deployment manifest؛ Airnode test coverage |
| **گام بعدی WS-6** | ثبت Airnode GAP در issue #15؛ تعریف Airnode→feeder→API3Oracle connection spec در oracle ops packet |

---

### ۳-۵. PriceOracle — تازگی و انحراف قیمت

| محور | جزئیات |
| --- | --- |
| **نام اصل** | PriceOracle — حفاظ تازگی و انحراف قیمت |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — بخش oracle قیمت؛ `CLAUDE.md` — Oracle Contracts؛ `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` |
| **لینک دکترین** | قیمت‌های ورودی باید از چند feeder معتبر آمده و منقضی نشده باشند؛ انحراف بیش از آستانه مجاز نیست |
| **قرارداد/ماژول** | `contracts/oracles/PriceOracle.sol` |
| **حفاظ runtime** | `STALENESS_THRESHOLD = 1 hour` (خط ۲۲)؛ `MIN_FEEDERS = 3` (خط ۲۳)؛ `DEVIATION_THRESHOLD = 50` (خط ۲۴ — 5% = 50‰)؛ `invalidatePrice()` فقط `KERNEL_ROLE`؛ `isDataFresh()`: `prices[key].isValid && block.timestamp - prices[key].timestamp <= STALENESS_THRESHOLD` |
| **invariant** | قیمت معتبر نیاز به ≥ MIN_FEEDERS feeder دارد؛ هر قیمت باید در بازه STALENESS_THRESHOLD باشد؛ انحراف > DEVIATION_THRESHOLD → invalidate |
| **پوشش test** | `test/23_Price_Oracle.test.js` — 23 test (freshness، deviation، MIN_FEEDERS، invalidation، isDataFresh) |
| **evidence مرتبط** | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ issue #16 (runbook)؛ هیچ PriceOracle ops signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | PriceOracle feeder registry (≥3 feeder واقعی)؛ source attestation per key؛ monitoring/alerting runbook؛ oracle ops signoff |
| **گام بعدی WS-6** | ثبت PriceOracle در oracle ops packet (issue #15)؛ تهیه feeder registry و source attestation template |

---

### ۳-۶. ProductionOracle — امتیازدهی تولید ملی

| محور | جزئیات |
| --- | --- |
| **نام اصل** | ProductionOracle — محاسبه امتیاز ترکیبی تولید |
| **منبع منشور/دکترین** | `whitepaper/whitepaper-fa.md` — بخش oracle تولید/Provincial؛ `protocols/governance-protocol-fa.md`؛ `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` |
| **لینک دکترین** | داده تولید استان‌ها به امتیاز ترکیبی تبدیل می‌شود و مبنای تخصیص بودجه/bonus استان‌ها است — اما هیچ اجرای مستقیم بودجه از oracle نیست |
| **قرارداد/ماژول** | `contracts/oracles/ProductionOracle.sol` |
| **حفاظ runtime** | `PIONEER_THRESHOLD = 70` (خط ۲۱)؛ `TRANSITION_THRESHOLD = 50` (خط ۲۲)؛ `compositeScore` از فرمول وزن‌دار محاسبه می‌شود (خط ۹۶)؛ `ORACLE_ROLE` برای تغذیه داده |
| **invariant** | `compositeScore` ∈ [0, 100]؛ `PIONEER_THRESHOLD` و `TRANSITION_THRESHOLD` ثابت هستند؛ امتیاز فقط سیگنال است — نه تخصیص خودکار بودجه |
| **پوشش test** | `test/24_Production_Oracle.test.js` — 50 test (compositeScore، threshold، PIONEER_THRESHOLD، TRANSITION_THRESHOLD) |
| **evidence مرتبط** | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ issue #16 (runbook)؛ هیچ ProductionOracle ops signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | ProductionOracle data source spec (کدام داده تولید ملی)؛ feeder registry؛ runbook؛ oracle signoff |
| **گام بعدی WS-6** | ثبت ProductionOracle در oracle ops packet؛ مستندسازی فرمول compositeScore برای audit |

---

### ۳-۷. مصرف سیگنال توسط TriggerProtocol

| محور | جزئیات |
| --- | --- |
| **نام اصل** | مصرف سیگنال توسط TriggerProtocol — نقش oracle در مسیر trigger |
| **منبع منشور/دکترین** | `protocols/trigger-protocol-fa.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` |
| **لینک دکترین** | `ORACLE_ROLE` می‌تواند تخلف را flag کند؛ flag → Kernel event؛ سپس 7-of-9 multi-sig برای activation؛ oracle هرگز مستقیم TriggerProtocol را فعال نمی‌کند |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol` → `contracts/kernel.sol` → `contracts/core/TriggerProtocol.sol` |
| **حفاظ runtime** | `flagViolation()` → `IIranOSKernel(kernel).flagViolation()` (خط ۹۱)؛ Kernel: `ViolationFlagged` event؛ TR-01/02/03 → `emergencyLockActive = true`؛ `_activateTrigger()` نیازمند `signaturesCount >= MULTISIG_THRESHOLD`؛ `executeTrigger()` فقط `onlyKernel` |
| **invariant** | oracle flag ≠ trigger execution؛ MULTISIG_THRESHOLD = 7 تغییرناپذیر؛ هیچ oracle call نمی‌تواند مستقیم `executeTrigger()` را فراخوانی کند |
| **پوشش test** | `test/01_kernel.test.js` — بخش flagViolation/signViolation؛ `test/08_Trigger_Protocol.test.js` (51 test)؛ `test/09_api3_oracle.test.js` — integration tests |
| **evidence مرتبط** | `docs/step42/WHITEPAPER_STEP42_TRIGGER_TIMEOUT_DOCTRINE_DECISION.md`؛ `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md` |
| **blocker/signoff** | issue #12 (external audit)؛ issue #15 (oracle ops)؛ هیچ signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle→Kernel→TriggerProtocol sequence diagram رسمی برای audit؛ TG-01 governance runbook |
| **گام بعدی WS-6** | تهیه sequence diagram oracle→Kernel→TriggerProtocol برای external audit scope (issue #12) |

---

### ۳-۸. مرز اختیار TriggerProtocol

| محور | جزئیات |
| --- | --- |
| **نام اصل** | مرز اختیار TriggerProtocol — آنچه oracle نمی‌تواند انجام دهد |
| **منبع منشور/دکترین** | `protocols/trigger-protocol-fa.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` |
| **لینک دکترین** | TriggerProtocol اجرای trigger پس از 7-of-9 multi-sig است — نه oracle؛ oracle فقط evidence ارائه می‌دهد، اجرا انسانی/حاکمیتی است |
| **قرارداد/ماژول** | `contracts/core/TriggerProtocol.sol`؛ `contracts/kernel.sol` |
| **حفاظ runtime** | `executeTrigger()` فقط `onlyKernel` (نه oracle، نه feeder، نه هیچ آدرس خارجی)؛ Kernel `_activateTrigger()` نیازمند `signaturesCount >= 7`؛ TG-01: `executeTrigger()` → `blockedFromTreasury` (داخلی TriggerProtocol) — نه `Treasury.blockAddressByTrigger()` |
| **invariant** | oracle ∩ executor = ∅؛ MULTISIG_THRESHOLD = 7 تغییرناپذیر؛ TG-01: هیچ passthrough خودکار از TriggerProtocol به Treasury.blockAddressByTrigger وجود ندارد |
| **پوشش test** | `test/08_Trigger_Protocol.test.js` — 51 test (onlyKernel enforcement، TG-01 gap، Option D path)؛ `test/01_kernel.test.js` — MULTISIG_THRESHOLD invariant |
| **evidence مرتبط** | `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step21/` |
| **blocker/signoff** | issue #12 (external audit)؛ issue #13 (formal verification)؛ TG-01 مستند و رد شد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | formal proof برای oracle∩executor=∅؛ Option D governance runbook تأیید شده |
| **گام بعدی WS-6** | ثبت oracle authority boundary در formal verification scope (issue #13) |

---

### ۳-۹. حفاظ تازگی CLC-03 — API3Oracle

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حفاظ تازگی CLC-03 — جلوگیری از flag با داده قدیمی |
| **منبع منشور/دکترین** | `docs/step40/WHITEPAPER_STEP40_CLC03_ORACLE_STALENESS_DECISION.md`؛ `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md` |
| **لینک دکترین** | feeder نباید بتواند تخلف را بر اساس داده قدیمی flag کند و قفل اضطراری Kernel را فعال سازد — داده باید در بازه `MAX_DATA_AGE` باشد |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol` |
| **حفاظ runtime** | `uint256 public constant MAX_DATA_AGE = 1 hours` (خط ۲۹)؛ `require(block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE, "API3Oracle: stale data feed")` در `flagViolation()` (خط ۹۰)؛ commit `6e688e5` (step41) |
| **invariant** | `MAX_DATA_AGE = 3600 seconds`؛ feeder برای flag کردن باید PAH_USD_KEY را در ۱ ساعت گذشته تغذیه کرده باشد |
| **پوشش test** | `test/09_api3_oracle.test.js` — 3 test CLC-03: (۱) stale data revert، (۲) fresh data success، (۳) MAX_DATA_AGE == 3600 |
| **evidence مرتبط** | `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md`؛ commit `6e688e5` |
| **blocker/signoff** | issue #12 (external audit — CLC-03 remediation باید در audit scope باشد)؛ ریسک ۲ باقی‌مانده: فقط PAH_USD_KEY چک می‌شود |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | multi-key staleness (ریسک ۲ — برای نسخه آینده)؛ external audit تأیید CLC-03 |
| **گام بعدی WS-6** | ثبت CLC-03 در external audit scope (issue #12)؛ مستندسازی ریسک ۲ (single-key) برای future spec |

---

### ۳-۱۰. حفاظ تازگی PriceOracle — چند feeder

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حفاظ تازگی PriceOracle — حداقل feeder و staleness |
| **منبع منشور/دکترین** | `contracts/oracles/PriceOracle.sol`؛ `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **لینک دکترین** | قیمت معتبر نیاز به حداقل MIN_FEEDERS feeder مستقل دارد تا از تک‌نقطه‌گی و دستکاری جلوگیری شود؛ هر قیمت باید در STALENESS_THRESHOLD باشد |
| **قرارداد/ماژول** | `contracts/oracles/PriceOracle.sol` |
| **حفاظ runtime** | `MIN_FEEDERS = 3`؛ `STALENESS_THRESHOLD = 1 hour`؛ `DEVIATION_THRESHOLD = 50` (5%)؛ `isDataFresh()`: `prices[key].isValid && block.timestamp - prices[key].timestamp <= STALENESS_THRESHOLD`؛ `invalidatePrice()` فقط `KERNEL_ROLE` |
| **invariant** | `feeders.length >= MIN_FEEDERS` برای قیمت معتبر؛ `age <= STALENESS_THRESHOLD`؛ `deviation <= DEVIATION_THRESHOLD` |
| **پوشش test** | `test/23_Price_Oracle.test.js` — 23 test (MIN_FEEDERS enforcement، freshness check، deviation check، invalidation) |
| **evidence مرتبط** | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ هیچ feeder registry رسمی ندارد |
| **وضعیت ردیابی** | **COMPLETE** |
| **artifact ناموجود** | feeder registry واقعی (≥3 feeder با identity رسمی)؛ oracle ops signoff |
| **گام بعدی WS-6** | ثبت PriceOracle freshness invariants در external audit scope (issue #12)؛ تهیه feeder registry |

---

### ۳-۱۱. مهار خرابی اوراکل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | مهار خرابی اوراکل — رفتار سیستم هنگام از دسترس خارج شدن oracle |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md`؛ `constitution/constitution-fa.md` — تداوم سرویس |
| **لینک دکترین** | اگر oracle داده تازه ارائه ندهد، سیستم نباید به اجرای اتوماتیک بر اساس داده کهنه ادامه دهد؛ مهار خرابی باید در‌دسترس‌نبودن oracle را از نتایج فاجعه‌بار جدا کند |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/oracles/PriceOracle.sol`؛ `contracts/kernel.sol` |
| **حفاظ runtime** | `MAX_DATA_AGE = 1h` در `API3Oracle.flagViolation()` (اگر oracle کهنه شود، flag نمی‌تواند بزند)؛ `STALENESS_THRESHOLD = 1h` در `PriceOracle.isDataFresh()` (داده کهنه = invalid)؛ `invalidatePrice()` توسط KERNEL_ROLE برای force-invalidate |
| **invariant** | oracle failure → flag disabled (نه emergency lock خودکار)؛ stale price → isDataFresh = false؛ هیچ automatic execution هنگام oracle failure |
| **پوشش test** | `test/09_api3_oracle.test.js` — CLC-03 stale revert tests؛ `test/23_Price_Oracle.test.js` — freshness/invalidation tests |
| **evidence مرتبط** | `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` |
| **blocker/signoff** | issue #15 (oracle ops packet)؛ issue #16 (liveness monitoring runbook)؛ هیچ failure containment runbook رسمی ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | liveness monitoring runbook (alert thresholds، fallback actions)؛ oracle failure scenario test (چه اتفاقی می‌افتد اگر feeder برای >1h داده ندهد)؛ oracle ops signoff |
| **گام بعدی WS-6** | تهیه liveness monitoring runbook در oracle ops packet (issue #16)؛ افزودن oracle failure scenario به test coverage |

---

### ۳-۱۲. حفاظ بازپخش (Replay) داده اوراکل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | حفاظ بازپخش اوراکل — جلوگیری از استفاده مجدد از داده قدیمی |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md`؛ `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md` |
| **لینک دکترین** | یک feeder نباید بتواند همان داده قدیمی را دوباره ثبت کند و آن را fresh نشان دهد؛ hashing/nonce یا timestamp اجباری برای جلوگیری از replay |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/oracles/PriceOracle.sol` |
| **حفاظ runtime** | `DataPoint.timestamp = block.timestamp` در `feedData()` — هر بار timestamp به‌روز می‌شود؛ `MAX_DATA_AGE` چک می‌کند که timestamp اخیر باشد؛ اما هیچ nonce یا sequence number وجود ندارد |
| **invariant** | `DataPoint.timestamp` باید > آخرین timestamp قبلی باشد تا effective تازگی حفظ شود — این invariant به‌صورت صریح در کد enforce نشده |
| **پوشش test** | هیچ test خاص replay protection در repo وجود ندارد |
| **evidence مرتبط** | `docs/step41/WHITEPAPER_STEP41_CLC03_ORACLE_STALENESS_REMEDIATION_ROLLUP.md` — ریسک ۲ |
| **blocker/signoff** | issue #12 (external audit — باید replay risk را بررسی کند)؛ issue #13 (formal verification) |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | nonce یا sequence number برای DataPoint؛ replay protection test؛ audit finding درباره replay risk |
| **گام بعدی WS-6** | ثبت replay risk در external audit scope (issue #12)؛ بررسی نیاز به nonce/sequence در نسخه آینده |

---

### ۳-۱۳. جریان evidence اوراکل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | جریان evidence اوراکل — مسیر داده از feeder تا ثبت |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_EVIDENCE_WORKFLOW_ROLLUP_FA.md` |
| **لینک دکترین** | هر DataPoint باید قابل ردیابی باشد: feeder → source attestation → on-chain ثبت → review → تصمیم مجاز |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/oracles/PriceOracle.sol`؛ `contracts/oracles/ProductionOracle.sol` |
| **حفاظ runtime** | `DataPoint.feeder` ثبت می‌شود؛ `ViolationFlag.timestamp` ثبت می‌شود؛ events emit می‌شوند برای off-chain tracking؛ اما هیچ source attestation on-chain وجود ندارد |
| **invariant** | هر event باید feeder address، timestamp، و data type داشته باشد؛ هیچ داده anonymous نیست |
| **پوشش test** | `test/09_api3_oracle.test.js` — ثبت feeder و event تأیید می‌شود |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` |
| **blocker/signoff** | issue #15 (oracle ops)؛ issue #12 (external audit)؛ هیچ evidence flow accepted وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | source attestation per DataPoint (منبع real-world داده)؛ off-chain oracle monitoring log template؛ oracle evidence chain accepted |
| **گام بعدی WS-6** | تعریف source attestation requirement در oracle ops packet (issue #15) |

---

### ۳-۱۴. نیازمندی‌های عملیات اوراکل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | نیازمندی‌های عملیات اوراکل — آنچه قبل از production لازم است |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`؛ `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md` |
| **لینک دکترین** | oracle ops نیازمند: feeder registry، source attestation، freshness window رسمی، staleness rule، deviation threshold، invalidation rule، liveness monitoring، و signal-only boundary رسمی است |
| **قرارداد/ماژول** | `contracts/oracles/API3Oracle.sol`؛ `contracts/oracles/PriceOracle.sol`؛ `contracts/oracles/ProductionOracle.sol` |
| **حفاظ runtime** | constants موجودند (MAX_DATA_AGE، STALENESS_THRESHOLD، MIN_FEEDERS، DEVIATION_THRESHOLD) اما ops documentation ندارند |
| **invariant** | ops protocol باید constants را به procedures ترجمه کند؛ هیچ oracle production بدون ops protocol مجاز نیست |
| **پوشش test** | constants در tests تأیید شده‌اند؛ ops procedures هیچ test ندارند |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md`؛ `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`؛ `STEP9-BLOCK-004` |
| **blocker/signoff** | `STEP9-BLOCK-004` — oracle ops packet؛ issue #15؛ issue #16 (runbook)؛ هیچ oracle ops signoff وجود ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops packet (feeder registry، source attestation، freshness/staleness procedures، deviation procedure، invalidation procedure، liveness monitoring، dispute resolution)؛ oracle ops signoff |
| **گام بعدی WS-6** | تهیه oracle ops packet برای issue #15؛ oracle runbook برای issue #16 |

---

### ۳-۱۵. وابستگی‌های signoff اوراکل

| محور | جزئیات |
| --- | --- |
| **نام اصل** | وابستگی‌های signoff اوراکل — چه کسانی چه چیزی را باید تأیید کنند |
| **منبع منشور/دکترین** | `docs/step13/WHITEPAPER_STEP13_ISSUE_LINKAGE_FA.md`؛ `docs/step13/WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md`؛ `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md` |
| **لینک دکترین** | oracle signoff نیازمند: oracle ops reviewer، external auditor، و (برای formal proofs) formal verifier است — هیچ‌کدام AI نمی‌توانند جایگزین شوند |
| **قرارداد/ماژول** | oracle system به‌کلی — API3Oracle، PriceOracle، ProductionOracle |
| **حفاظ runtime** | N/A — signoff یک فرایند off-chain است |
| **invariant** | oracle production نیازمند independent human reviewer signoff است؛ AI-assisted review جایگزین نیست |
| **پوشش test** | N/A |
| **evidence مرتبط** | `docs/step13/WHITEPAPER_STEP13_REVIEW_REQUEST_STATUS_ROLLUP_FA.md`؛ `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` |
| **blocker/signoff** | issue #15 (oracle ops packet — `STEP9-BLOCK-004`)؛ issue #16 (oracle runbook — `STEP9-BLOCK-007`)؛ issue #12 (external audit)؛ issue #13 (formal verification)؛ هیچ‌کدام complete نیستند |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | oracle ops reviewer identity؛ external auditor engagement؛ formal verifier engagement؛ هیچ signoff پذیرفته‌شده وجود ندارد |
| **گام بعدی WS-6** | ارسال oracle ops packet به independent reviewer؛ ثبت reviewer identity و engagement |

---

### ۳-۱۶. شکاف TG-01 — مرز Oracle-Treasury

| محور | جزئیات |
| --- | --- |
| **نام اصل** | شکاف TG-01 — oracle-trigger-treasury integration boundary |
| **منبع منشور/دکترین** | `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` |
| **لینک دکترین** | وقتی TriggerProtocol اجرا می‌شود، `Treasury.blockAddressByTrigger()` به‌طور خودکار فراخوانی نمی‌شود؛ این یک شکاف مستند و عمدی است — Option D (Kernel.blockAddressByTrigger توسط human operator) مسیر رسمی است |
| **قرارداد/ماژول** | `contracts/core/TriggerProtocol.sol`؛ `contracts/monetary/Treasury.sol`؛ `contracts/kernel.sol` |
| **حفاظ runtime** | TriggerProtocol: `blockedFromTreasury[offender] = true` (داخلی — نه Treasury.isBlocked)؛ Treasury: `blockAddressByTrigger()` فقط `KERNEL_ROLE`؛ هیچ خودکارسازی این مسیر وجود ندارد |
| **invariant** | `TriggerProtocol.blockedFromTreasury[x]` ≠ `Treasury.isBlocked[x]` — دو mapping جداگانه هستند؛ پیاده‌سازی passthrough در step38 رد شد (ریسک P0 revert به مسیر signViolation) |
| **پوشش test** | `test/08_Trigger_Protocol.test.js` — 51 test شامل TG-01 gap documentation tests؛ `test/31_Treasury.test.js` — `blockAddressByTrigger` only KERNEL_ROLE |
| **evidence مرتبط** | `docs/step37/WHITEPAPER_STEP37_TG01_INTEGRATION_BOUNDARY_ROLLUP.md`؛ `docs/step38/WHITEPAPER_STEP38_TG01_KERNEL_PASSTHROUGH_DECISION.md`؛ `docs/step21/` — IM-08/RC-E-13 |
| **blocker/signoff** | issue #12 (external audit باید TG-01 boundary را بررسی کند)؛ هیچ closure مجاز نیست |
| **وضعیت ردیابی** | **GAP** |
| **artifact ناموجود** | Option D governance runbook رسمی (Kernel.blockAddressByTrigger manual path)؛ human operator SOP برای post-trigger Treasury blocking |
| **گام بعدی WS-6** | ثبت TG-01 در external audit scope (issue #12)؛ تهیه Option D governance runbook — TG-01 را نبندید |

---

### ۳-۱۷. مرز مداخله انسانی — TRIGGER_TIMEOUT و deactivateEmergencyLock

| محور | جزئیات |
| --- | --- |
| **نام اصل** | مرز مداخله انسانی — TRIGGER_TIMEOUT Court SLA و رفع قفل اضطراری |
| **منبع منشور/دکترین** | `docs/step42/WHITEPAPER_STEP42_TRIGGER_TIMEOUT_DOCTRINE_DECISION.md`؛ `constitution/constitution-fa.md` — دادگاه عالی؛ `protocols/trigger-protocol-fa.md` |
| **لینک دکترین** | `TRIGGER_TIMEOUT = 72h` SLA رسیدگی دادگاه است — نه auto-unlock، نه Sovereign-fallback؛ `deactivateEmergencyLock()` فقط `onlyCourt` — هیچ مسیر timeout-based وجود ندارد؛ این اصل در step42 مستند و تأیید شد |
| **قرارداد/ماژول** | `contracts/kernel.sol` — `TRIGGER_TIMEOUT = 72 hours` (خط ۵۷)، `deactivateEmergencyLock()` (خط ۴۳۵ — `onlyCourt`) |
| **حفاظ runtime** | `deactivateEmergencyLock()` فقط `onlyCourt`؛ هیچ call-site اجرایی برای TRIGGER_TIMEOUT در قراردادها وجود ندارد؛ اگر COURT_ROLE در دسترس نباشد قفل اضطراری نامحدود باقی می‌ماند |
| **invariant** | `TRIGGER_TIMEOUT = 259200 seconds (72h)` — SLA فقط؛ قفل رفع نمی‌شود مگر توسط COURT_ROLE به‌صورت explicit؛ auto-unlock ممنوع (step42 doctrine) |
| **پوشش test** | `test/01_kernel.test.js:46` — `TRIGGER_TIMEOUT == 72n * 3600n`؛ `test/01_kernel.test.js:259` — مقایسه timeout |
| **evidence مرتبط** | `docs/step42/WHITEPAPER_STEP42_TRIGGER_TIMEOUT_DOCTRINE_DECISION.md`؛ `docs/step40/WHITEPAPER_STEP40_CLC03_ORACLE_STALENESS_DECISION.md` (ذکر شد) |
| **blocker/signoff** | issue #12 (external audit — TRIGGER_TIMEOUT doctrine)؛ issue #13 (formal verification — Court SLA invariant)؛ هیچ signoff ندارد |
| **وضعیت ردیابی** | **PARTIAL** |
| **artifact ناموجود** | COURT_ROLE availability protocol (اگر Court در دسترس نباشد)؛ formal verification برای Court SLA invariant؛ doctrine در external audit scope |
| **گام بعدی WS-6** | ثبت TRIGGER_TIMEOUT doctrine در external audit scope (issue #12)؛ COURT_ROLE availability در oracle/trigger ops runbook (issue #16) |

---

## ۴. خلاصه وضعیت workstream ۶

| برچسب | تعداد | اصول اصلی |
| --- | --- | --- |
| **COMPLETE** | **2** | حفاظ تازگی CLC-03 (API3Oracle.MAX_DATA_AGE)، حفاظ تازگی PriceOracle (MIN_FEEDERS، STALENESS_THRESHOLD، DEVIATION_THRESHOLD) |
| **PARTIAL** | **13** | دکترین اوراکل، دکترین داده غیرحاکمیتی، یکپارچگی API3، PriceOracle (ops)، ProductionOracle، مصرف سیگنال TriggerProtocol، مرز اختیار TriggerProtocol، مهار خرابی اوراکل، حفاظ بازپخش، جریان evidence، نیازمندی‌های عملیات، وابستگی‌های signoff، مرز مداخله انسانی |
| **GAP** | **2** | یکپارچگی Airnode (هیچ قرارداد Airnode-specific در repo)، شکاف TG-01 (Oracle-Treasury integration boundary) |
| **مجموع** | **17** | — |

---

## ۵. الگوهای مشترک شکاف

| الگو | اصول مربوط |
| --- | --- |
| oracle ops packet/runbook pending (issue #15/#16) | دکترین اوراکل، API3 Integration، PriceOracle، ProductionOracle، مهار خرابی، جریان evidence، نیازمندی‌های عملیات، وابستگی‌های signoff |
| feeder registry رسمی ندارد | API3 Integration، PriceOracle، ProductionOracle |
| source attestation ندارد | API3 Integration، جریان evidence، نیازمندی‌های عملیات |
| external audit scope (issue #12) | CLC-03، مرز اختیار TriggerProtocol، حفاظ بازپخش، TG-01، TRIGGER_TIMEOUT doctrine |
| formal verification target (issue #13) | دکترین داده غیرحاکمیتی، مرز اختیار TriggerProtocol، TRIGGER_TIMEOUT Court SLA |
| Airnode GAP | یکپارچگی Airnode |
| TG-01 GAP | شکاف TG-01، مرز اختیار TriggerProtocol |

---

## ۶. non-claim نهایی

این سند AI-assisted و documentation-only است. هیچ‌کدام از موارد زیر ادعا نمی‌شود:

- هیچ oracle یا سیگنالی production-ready نیست.
- هیچ evidence پذیرفته‌شده وجود ندارد.
- هیچ reviewer signoff وجود ندارد.
- هیچ blocker بسته نشده است.
- گام ۱۲ باز می‌ماند.
- گام ۱۳ باز می‌ماند.
- COMPLETE فقط به‌معنای کامل بودن زنجیره ردیابی داخل repo است — نه production readiness، audit completion، یا formal verification.
- سیگنال‌های اوراکل non-sovereign و signal-only می‌مانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing می‌ماند.
- `TRIGGER_TIMEOUT = 72h` SLA رسیدگی دادگاه است — نه auto-unlock.
- `MULTISIG_THRESHOLD = 7` تغییرناپذیر است.
- TG-01 بسته نشده و بسته نمی‌شود.
- این بازبینی نیازمند review مستقل فنی/حقوقی/حکمرانی است.

</div>
