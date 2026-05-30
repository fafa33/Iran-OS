<div dir="rtl">

# بازبینی ردیابی workstream ۲: ساختار حکمرانی

**نام فنی:** Step 13 WS-2 Governance Structure Traceability Review
**نوع سند:** documentation-only / traceability review / AI-assisted pre-review
**workstream:** ساختار حکمرانی
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** main — commit `6c4202d` — 499 test passing

---

## ۱. هدف و حدود

این سند ردیابی تفصیلی ساختار حکمرانی سپیدنامه/منشور را به سطوح اختیار (role)، قرارداد، حفاظ runtime، پوشش test، وابستگی evidence/signoff، و blockerهای باز ردیابی می‌کند.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ نهاد، signer، quorum production، release council decision، governance approval یا signoff جدید اختراع نمی‌کند.
- هیچ قرارداد، test، threshold، timeout یا مکانیزم حاکمیتی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

این بازبینی AI-assisted و documentation-only است. جایگزین review فنی مستقل، legal review، governance review یا formal verification نیست.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | اصل/ساختار، قرارداد، نقش، حفاظ runtime، test، و مستند همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه (قرارداد، runtime guard، test، یا مستند) ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد یا صراحتاً مستند نشده است. |

---

## ۳. جدول ردیابی تفصیلی ساختار حکمرانی

---

### ۳-۱. نقش پادشاه — SOVEREIGN_ROLE (داور ملی)

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | پادشاه به‌عنوان داور ملی، خارج از رقابت حزبی، نگهبان منشور — فرگرد ۳ منشور |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد سوم، بخش ۱۰ |
| دکترین مرتبط | TRIGGER_TIMEOUT SLA (Step42)؛ MULTISIG_THRESHOLD = 7-of-9 (غیرقابل کاهش) |
| قرارداد/ماژول | `contracts/kernel.sol:34` — `SOVEREIGN_ROLE`؛ `kernel.sol:165` — `onlySovereign()` modifier؛ `kernel.sol:385-402` — `grantOfficialAccess()`؛ `kernel.sol:450-462` — `setTriggerProtocol()`؛ `kernel.sol:466-477` — `setSovereignWealthFund()` |
| نقش اختیار | `SOVEREIGN_ROLE` — DEFAULT_ADMIN_ROLE در Kernel؛ اعطای COURT/GUARDIAN/ORACLE roles |
| حفاظ runtime | `notLocked` (CLC-06) — در emergency lock، setterهای اختیار SOVEREIGN قابل فراخوانی نیستند؛ `grantOfficialAccess` SOVEREIGN_ROLE خودش را نمی‌تواند اعطا کند (`kernel.sol:393`) |
| پوشش test | `test/01_kernel.test.js` — نقش‌های استقرار، grantOfficialAccess، CLC-06 emergency lock |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | production signer identity برای SOVEREIGN_ROLE → issue #14 (custody) |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | production custodian/signer برای SOVEREIGN_ROLE؛ key rotation policy؛ compromise response plan |
| گام بعدی | اتصال به ROLE_WIRING_CHECKLIST.md و issue #14؛ ثبت نیاز custody evidence بدون اختراع signer |

---

### ۳-۲. نقش دادگاه عالی — COURT_ROLE

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | دادگاه عالی قانون اساسی — تایید تخلف، فعال‌سازی ماشه، رفع قفل اضطراری — فرگرد ۶ منشور |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ششم (استقلال دادگستری) |
| دکترین مرتبط | MULTISIG_THRESHOLD = 7-of-9؛ TRIGGER_TIMEOUT = 72h SLA (Step42) |
| قرارداد/ماژول | `contracts/kernel.sol:35` — `COURT_ROLE`؛ `kernel.sol:289-312` — `signViolation()`؛ `kernel.sol:436-442` — `deactivateEmergencyLock()` |
| نقش اختیار | `COURT_ROLE` — می‌تواند `signViolation()` و `deactivateEmergencyLock()` فراخوانی کند؛ max 9 members برای threshold 7-of-9 |
| حفاظ runtime | `onlyCourt()` modifier؛ `deactivateEmergencyLock()` بدون `notLocked` (عمداً — این تنها راه unlock است)؛ double-sign protection در `violationSignatures` mapping |
| پوشش test | `test/01_kernel.test.js` — signViolation، double-sign rejection، قفل اضطراری، post-threshold replay prevention |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | production court signer registry → issue #14 (custody)؛ governance signoff برای court appointment process |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | production court signer list؛ appointment/removal process off-chain؛ quorum degradation/replacement plan |
| گام بعدی | ثبت court signer policy در custody packet؛ ارجاع به issue #14 |

---

### ۳-۳. نقش اوراکل — ORACLE_ROLE

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | اوراکل‌های API3 — داده‌دهنده و flag‌گذار تخلف — non-sovereign، signal-only |
| منبع منشور | `whitepaper/whitepaper-fa.md` — فصل اوراکل و سیگنال‌ها |
| دکترین مرتبط | CLC-03 staleness guard (Step40/41)؛ oracle signal-only boundary |
| قرارداد/ماژول | `contracts/kernel.sol:36` — `ORACLE_ROLE`؛ `contracts/oracles/API3Oracle.sol` — `flagViolation()` با MAX_DATA_AGE |
| نقش اختیار | `ORACLE_ROLE` — فقط `flagViolation()` در Kernel؛ هیچ اختیار گسترش دهنده ندارد |
| حفاظ runtime | `onlyOracle()` modifier؛ `MAX_DATA_AGE = 1 hours` (CLC-03)؛ `validViolationCode` modifier |
| پوشش test | `test/01_kernel.test.js` — ORACLE_ROLE deployment؛ `test/09_api3_oracle.test.js` — CLC-03، ORACLE_ROLE revocation |
| evidence موجود | داخل repo: CLC-03 کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | oracle ops runbook → issue #15/#16؛ oracle data-source attestation |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | oracle ops runbook؛ feeder registry production؛ data-source attestation |
| گام بعدی | ارجاع به workstream اوراکل و سیگنال‌ها؛ اتصال به issue #15/#16 |

---

### ۳-۴. نقش نگهبان — GUARDIAN_ROLE

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | نگهبانان نخبگانی — نقش اختیار ثانویه قابل اعطا و سلب |
| منبع منشور | `whitepaper/whitepaper-fa.md`؛ `CLAUDE.md` — elite guardians |
| دکترین مرتبط | GUARDIAN_ROLE در `_revokeOfficialAccess` لغو می‌شود |
| قرارداد/ماژول | `contracts/kernel.sol:37` — `GUARDIAN_ROLE`؛ `kernel.sol:366-368` — revocation در trigger path |
| نقش اختیار | قابل اعطا توسط SOVEREIGN_ROLE از طریق `grantOfficialAccess()`؛ قابل سلب در trigger execution |
| حفاظ runtime | `notLocked` بر `grantOfficialAccess()` — نمی‌توان در emergency lock نگهبان جدید اضافه کرد |
| پوشش test | `test/01_kernel.test.js` — grantOfficialAccess GUARDIAN_ROLE، trigger revocation |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | production guardian registry → issue #14 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | production guardian list؛ selection/appointment criteria |
| گام بعدی | ثبت selection criteria در protocol docs؛ ارجاع به issue #14 |

---

### ۳-۵. مجلس شورای ملی — Parliament

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | مجلس شورای ملی دیجیتال — قانون‌گذاری، رای نمایندگان، توشیح پادشاه — فرگرد ۴ منشور |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد چهارم |
| دکترین مرتبط | پیشنهاد قانون نیاز به توشیح SOVEREIGN_ROLE دارد (`LawStatus.RoyalReview → Enacted`) |
| قرارداد/ماژول | `contracts/governance/Parliament.sol` — نقش‌های `MP_ROLE`، `SOVEREIGN_ROLE`، `SPEAKER_ROLE`؛ `REVIEW_PERIOD = 10 days`؛ `BUDGET_CAP = 150B PAH` |
| نقش اختیار | `MP_ROLE` — رای‌گیری؛ `SPEAKER_ROLE` — مدیریت جلسه؛ `SOVEREIGN_ROLE` — توشیح یا رد قانون |
| حفاظ runtime | `LawStatus` lifecycle — Draft → Voting → PassedByParliament → RoyalReview → Enacted/Vetoed؛ `BUDGET_CAP` برای قوانین بودجه |
| پوشش test | `test/15_Parliament.test.js` |
| evidence موجود | داخل repo: contract و test. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | election و MP appointment off-chain؛ production deployment → issue #17 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | انتخابات واقعی off-chain؛ MP signer registry؛ constitutional review by ConstitutionGuard linkage |
| گام بعدی | ثبت linkage از Parliament → ConstitutionGuard → Kernel در deployment checklist |

---

### ۳-۶. سیستم رای‌گیری — VotingSystem

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | رای‌گیری بیومتریک ملی — انتخابات، استان‌ها، رفراندوم — بدون شورای نگهبان |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد چهارم؛ بخش ۸ (حق تجمع)؛ رفراندوم برای تغییر اساسی |
| دکترین مرتبط | `MIN_RESIDENCY_YEARS = 5` برای نامزدی استانی؛ biometric deduplication |
| قرارداد/ماژول | `contracts/governance/VotingSystem.sol` — نقش‌های `ELECTION_ROLE`، `ORACLE_ROLE`، `KERNEL_ROLE`؛ `ElectionType`، `ElectionStatus` |
| نقش اختیار | `ELECTION_ROLE` — ایجاد انتخابات؛ `ORACLE_ROLE` — ثبت نتایج؛ `KERNEL_ROLE` — لغو |
| حفاظ runtime | biometric hash deduplication؛ `MIN_RESIDENCY_YEARS` check؛ election lifecycle status |
| پوشش test | `test/18_Voting_System.test.js` |
| evidence موجود | داخل repo: contract و test. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | biometric registry off-chain؛ production election authority → issue #17 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | biometric infrastructure off-chain؛ election authority credential؛ oracle deduplication attestation |
| گام بعدی | ثبت off-chain boundary در deployment docs؛ ارجاع به workstream oracle |

---

### ۳-۷. حکمرانی استانی — Provincial

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | شوراهای استانی — فرمول ۳۰/۷۰ توزیع درآمد — استقلال محلی |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۹ |
| دکترین مرتبط | `PROVINCIAL_SHARE = 300` (30%)؛ `productivityScore > 70` برای پاداش |
| قرارداد/ماژول | `contracts/governance/Provincial.sol` — نقش‌های `GOVERNOR_ROLE`، `KERNEL_ROLE`، `ORACLE_ROLE`؛ revenue distribution |
| نقش اختیار | `GOVERNOR_ROLE` — مدیریت استانی؛ `ORACLE_ROLE` — تزریق درآمد؛ `KERNEL_ROLE` — governance |
| حفاظ runtime | `productivityScore` threshold check؛ `isActive` guard برای استان |
| پوشش test | `test/16_Provincial.test.js` |
| evidence موجود | داخل repo: contract و test. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | استاندارهای off-chain؛ oracle revenue attestation → issue #15/#16 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | governor appointment process؛ province registry initialization؛ oracle attestation برای revenue |
| گام بعدی | ارجاع به workstream oracle و سیگنال‌ها |

---

### ۳-۸. تخصیص بودجه — BudgetAllocation

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | تخصیص بودجه ملی — سکولاریسم در بودجه — ممنوعیت ردیف مذهبی |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷؛ سکولاریسم بخش ۵/۶ |
| دکترین مرتبط | `isLocked` از طریق TriggerProtocol؛ `BUDGET_CAP` در Parliament |
| قرارداد/ماژول | `contracts/governance/BudgetAllocation.sol` — `lockBySector()` via `KERNEL_ROLE`؛ `isLocked` guard |
| نقش اختیار | `KERNEL_ROLE` — قفل sector؛ `BUDGET_ROLE` — تخصیص؛ lock از طریق TriggerProtocol |
| حفاظ runtime | `sb.isLocked` — revert با "locked by Trigger"؛ `amount <= sb.allocated` ceiling |
| پوشش test | `test/17_Budget_Allocation.test.js` |
| evidence موجود | داخل repo: contract و test. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | budget law passage by Parliament؛ king's assent؛ proof of secularism enforcement |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | اتصال صریح از sector lock به TriggerProtocol path؛ formal verification secularism invariant |
| گام بعدی | ثبت TG-01 impact روی BudgetAllocation lock path؛ ارجاع به workstream اقتصاد |

---

### ۳-۹. نگهبان قانون اساسی — ConstitutionGuard

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | تطبیق مصوبات با اصول منشور — گیت‌وی قانون‌گذاری — بدون شورای نگهبان مذهبی |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۱۳ (بازنگری قوانین) |
| دکترین مرتبط | IMMUTABLE_PRINCIPLES_MASK = 0x07 — اصول ۱/۲/۳ همیشه اجباری |
| قرارداد/ماژول | `contracts/core/ConstitutionGuard.sol` — پنج اصل اجباری؛ `proposeLaw()`، `approveLaw()`، `rejectLaw()` |
| نقش اختیار | `onlyKernel()` modifier — فقط Kernel می‌تواند قانون را تأیید یا رد کند؛ هر آدرس می‌تواند proposeLaw |
| حفاظ runtime | `principlesMask` bitmask؛ `IMMUTABLE_PRINCIPLES_MASK` override؛ `approvedLaws` mapping |
| پوشش test | `test/04_constitution_guard.test.js` |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | اتصال ConstitutionGuard → Parliament → Kernel در deployment؛ formal verification |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | نگاشت اصول ConstitutionGuard (PRINCIPLE_SECULAR/RIGHTS/TERRITORIAL/MONETARY/JUDICIAL) به TR codes در Kernel؛ deployment wiring Parliament → ConstitutionGuard |
| گام بعدی | ساخت جدول تطبیق PRINCIPLE → TR؛ ثبت در ROLE_WIRING_CHECKLIST.md |

---

### ۳-۱۰. adapter سیاست‌گذاری — Fargard7PolicyAdapter

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | فرگرد ۷ — adapter پیشنهادی سیاست اقتصادی — proposal-only / non-executing |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷ (اقتصاد و دارایی ملی) |
| دکترین مرتبط | Step7/8 boundary — adapter فقط recommendation emit می‌کند؛ downstream execution ندارد |
| قرارداد/ماژول | `contracts/governance/Fargard7PolicyAdapter.sol` |
| نقش اختیار | non-executing — هیچ role governance مستقیم ندارد |
| حفاظ runtime | هیچ state mutation مستقیم؛ proposal path فقط recommendation emit می‌کند |
| پوشش test | `test/26_Step7_PolicyLayer.test.js` — non-execution در همه مسیرها |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification target برای absence of downstream execution |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification target |
| گام بعدی | حفظ وضعیت؛ ثبت formal verification target در workstream قراردادها/adapterها |

---

### ۳-۱۱. ماشه سه‌لایه — Trigger Protocol

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | ماشه سه‌لایه: تشخیص (oracle) → تأیید (multi-sig court) → اجرا (TriggerProtocol) |
| منبع منشور | `constitution/constitution-fa.md`؛ `whitepaper/whitepaper-fa.md` — فصل ماشه |
| دکترین مرتبط | MULTISIG_THRESHOLD = 7-of-9؛ TRIGGER_TIMEOUT = 72h SLA؛ TG-01 gap |
| قرارداد/ماژول | `contracts/kernel.sol:289-346` — `signViolation()` → `_activateTrigger()`؛ `contracts/core/TriggerProtocol.sol` — `executeTrigger()` |
| نقش اختیار | Kernel — `_activateTrigger()` internal؛ TriggerProtocol — `onlyKernel()` guard |
| حفاظ runtime | double-sign guard؛ `record.triggered` idempotency؛ MULTISIG_THRESHOLD enforcement |
| پوشش test | `test/01_kernel.test.js`؛ `test/08_Trigger_Protocol.test.js` |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | TG-01 (Treasury block gap) → issue #12؛ court signer custody → issue #14 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | TG-01 — TriggerProtocol هرگز Treasury.blockAddressByTrigger() را فراخوانی نمی‌کند (مستند در step37/38) |
| گام بعدی | ثبت TG-01 در external audit scope (issue #12) |

---

### ۳-۱۲. چک‌لیست wiring نقش‌ها — ROLE_WIRING_CHECKLIST

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | فهرست اقدامات post-deploy برای اتصال همه نقش‌ها — CLC-04 و CLC-05 |
| منبع منشور | deployment doctrine |
| دکترین مرتبط | CLC-04 (RECLAIM_ROLE)؛ CLC-05 (setTriggerProtocol) — هر دو در ROLE_WIRING_CHECKLIST.md |
| قرارداد/ماژول | `docs/deployment/ROLE_WIRING_CHECKLIST.md` |
| نقش اختیار | ORACLE_ROLE، FEEDER_ROLE، COUNCIL_ROLE، CRAWLER_ROLE، RECLAIM_ROLE — همه manual post-deploy |
| حفاظ runtime | هیچ on-chain enforcement برای deployment completeness وجود ندارد — checklist صرفاً manual است |
| پوشش test | هیچ deployment-completeness automated test وجود ندارد |
| evidence موجود | checklist مستند است. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | deployment dry-run → issue #17؛ RECLAIM_ROLE + setTriggerProtocol deployment |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | automated deployment verification script؛ deployment dry-run accepted evidence |
| گام بعدی | ارجاع به issue #17؛ در فاز deployment از checklist به‌عنوان verification baseline استفاده شود |

---

### ۳-۱۳. شورای انتشار / سیستم release — release council

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | مرجع go/no-go برای انتشار — نیازمند upstream blocker disposition |
| منبع منشور | `docs/IRAN_OS_ROADMAP.md`؛ Step-9 deployment doctrine |
| دکترین مرتبط | Step-9 BLOCK-006؛ Step-12 release signoff prep packet |
| قرارداد/ماژول | هیچ قراردادی — سازوکار off-chain/governance |
| نقش اختیار | تعریف نشده در repo — placeholder در Step-12 packet |
| حفاظ runtime | هیچ on-chain release guard وجود ندارد |
| پوشش test | هیچ test مستقیم |
| evidence موجود | placeholder در Step-12. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | issue #19 release signoff؛ همه #12 تا #18 upstream |
| وضعیت ردیابی | **GAP** |
| artifact ناموجود | release council membership؛ go/no-go criteria؛ release package hash؛ signer approvals؛ minutes |
| گام بعدی | فقط پس از upstream disposition در #12 تا #18؛ هیچ اختراعی ممنوع است |

---

### ۳-۱۴. مدیریت کلید و custody — key-management / custody

| محور | جزئیات |
| --- | --- |
| اصل/ساختار | حفظ کلیدهای SOVEREIGN_ROLE، COURT_ROLE، ORACLE_ROLE در production |
| منبع منشور | `whitepaper/whitepaper-fa.md` — فصل امنیت و کلیدها |
| دکترین مرتبط | Step-9 BLOCK-003؛ Step-12 custody/key-management evidence packet |
| قرارداد/ماژول | off-chain — repo فقط draft packet دارد |
| نقش اختیار | همه production role-holders → signer registry لازم است |
| حفاظ runtime | هیچ on-chain key management؛ multi-sig thresholds در kernel code هستند |
| پوشش test | هیچ test برای production custody |
| evidence موجود | draft packet. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | issue #14 custody/key-management evidence + signoff |
| وضعیت ردیابی | **GAP** |
| artifact ناموجود | production signer registry؛ custodian identity؛ key rotation plan؛ offboarding log؛ compromise response |
| گام بعدی | تکمیل packet در issue #14 با داده واقعی؛ هیچ اختراع signer ممنوع |

---

## ۴. خلاصه وضعیت ردیابی workstream ۲

| ساختار/اصل | وضعیت |
| --- | --- |
| SOVEREIGN_ROLE — داور ملی | PARTIAL |
| COURT_ROLE — دادگاه عالی | PARTIAL |
| ORACLE_ROLE — اوراکل API3 | PARTIAL |
| GUARDIAN_ROLE — نگهبانان | PARTIAL |
| Parliament — مجلس شورای ملی | PARTIAL |
| VotingSystem — سیستم رای‌گیری | PARTIAL |
| Provincial — حکمرانی استانی | PARTIAL |
| BudgetAllocation — تخصیص بودجه | PARTIAL |
| ConstitutionGuard — نگهبان قانون اساسی | PARTIAL |
| Fargard7PolicyAdapter — proposal-only | COMPLETE (داخل repo) |
| Trigger Protocol سه‌لایه | PARTIAL |
| ROLE_WIRING_CHECKLIST | PARTIAL |
| release council | GAP |
| custody/key-management | GAP |

**وضعیت کلی workstream ۲:**
- COMPLETE (داخل repo): 1
- PARTIAL: 11
- GAP: 2

**مهم‌ترین شکاف‌ها:**
1. **GAP — release council**: هیچ membership، go/no-go decision، یا release package hash وجود ندارد — فقط پس از upstream #12–#18 قابل تکمیل است.
2. **GAP — custody/key-management**: production signer registry، custodian identity، rotation plan، و compromise response وجود ندارند — issue #14.

---

## ۵. artifact‌های ناموجود اولویت‌بندی‌شده

| اولویت | artifact | مرتبط با |
| --- | --- | --- |
| ۱ | production signer registry و custody packet تکمیل‌شده | issue #14 |
| ۲ | جدول تطبیق ConstitutionGuard PRINCIPLE → Kernel TR codes | ConstitutionGuard |
| ۳ | Parliament → ConstitutionGuard → Kernel deployment wiring | ROLE_WIRING_CHECKLIST |
| ۴ | TG-01 در external audit scope | issue #12 |
| ۵ | oracle ops runbook برای ORACLE_ROLE | issue #15/#16 |

---

## ۶. محدودیت‌های این بازبینی

این بازبینی:
- AI-assisted و documentation-only است.
- بر پایه repo در commit `6c4202d` است.
- هیچ evidence بیرونی evaluate نشده است.
- جایگزین review فنی مستقل، legal review، governance review، یا formal verification نیست.
- وضعیت COMPLETE (داخل repo) به معنای accepted evidence، audit completion یا formal verification completion **نیست**.

---

## ۷. non-claim نهایی

این سند فقط بازبینی ردیابی AI-assisted داخلی repo است. هیچ نهاد، signer، quorum production، release council decision یا governance approval جدید اختراع یا ادعا نشده است. هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion یا formal verification completion ادعا نشده است. گام ۱۲ و گام ۱۳ همچنان باز هستند.

</div>
