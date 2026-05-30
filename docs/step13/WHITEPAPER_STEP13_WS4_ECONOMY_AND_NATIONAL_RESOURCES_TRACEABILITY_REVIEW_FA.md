<div dir="rtl">

# بازبینی ردیابی workstream ۴: اقتصاد و منابع ملی

**نام فنی:** Step 13 WS-4 Economy and National Resources Traceability Review
**نوع سند:** documentation-only / traceability review / AI-assisted pre-review
**workstream:** اقتصاد و منابع ملی
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** main — commit `de2e429` — 499 test passing

---

## ۱. هدف و حدود

این سند ردیابی تفصیلی اقتصاد و منابع ملی سپیدنامه/منشور را به سطوح invariant، قرارداد، حفاظ runtime، پوشش test، و وابستگی evidence/signoff ردیابی می‌کند.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ نسبت ذخیره، سقف نقدینگی، threshold، یا ثابت پولی را تغییر نمی‌دهد.
- هیچ سیاست اقتصادی تصویب‌شده، بودجه واقعی، موجودی خزانه، یا feasibility مالی را ادعا نمی‌کند.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.
- SWF همچنان sovereign reserve resilience layer (SRR-role) است، نه DeFi یا yield engine.

این بازبینی AI-assisted و documentation-only است.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | اصل/invariant، قرارداد، حفاظ runtime، test، و مستند همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد. |

---

## ۳. جدول ردیابی تفصیلی

---

### ۳-۱. مدل ذخیره حاکمیتی — Sovereign Reserve Model

| محور | جزئیات |
| --- | --- |
| نام اصل | مدل ذخیره حاکمیتی — تعریف، طبقه‌بندی، و انضباط پشتوانه |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷؛ `whitepaper/whitepaper-fa.md` |
| دکترین مرتبط | `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`؛ `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md` |
| invariant مرتبط | Conservation Boundary؛ Exact-Once Accounting؛ Failed Transition Neutrality؛ Replay Resistance |
| قرارداد/ماژول | `contracts/monetary/SovereignWealthFund.sol` — لایه‌های L1/L2/L3؛ `contracts/monetary/Treasury.sol`؛ `contracts/monetary/PahlaviToken.sol` |
| حفاظ runtime | `COUNCIL_ROLE` multi-sig 3-of-N برای همه تراکنش‌های SWF؛ `depositToL1/L2/L3` محدود به `COUNCIL_ROLE`؛ `proposeWithdrawal` + `signWithdrawal` |
| پوشش test | `test/03_sovereign_wealth_fund.test.js` — 32 test (deposit، withdrawal multi-sig، yield) |
| evidence موجود | داخل repo: contracts، doctrine docs، و testها. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | production COUNCIL_ROLE custody → issue #14؛ external audit → issue #12؛ formal verification → issue #13 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | formal verification invariant برای conservation boundary؛ production COUNCIL_ROLE signer registry؛ accepted evidence از مسیر #12/#13 |
| گام بعدی | ثبت formal verification target؛ اتصال COUNCIL_ROLE به ROLE_WIRING_CHECKLIST و issue #14 |

---

### ۳-۲. خزانه ملی — Treasury

| محور | جزئیات |
| --- | --- |
| نام اصل | خزانه ملی — accounting، بودجه سالانه، بلوک trigger |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷ (دارایی ملی) |
| دکترین مرتبط | `docs/STEP4_1_TREASURY_ACCOUNTING_RULES.md`؛ `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md` |
| invariant مرتبط | `ANNUAL_BUDGET_CAP = 150B PAH`؛ `notBlocked()` modifier؛ `spent + amount <= allocated` ceiling |
| قرارداد/ماژول | `contracts/monetary/Treasury.sol` — `ANNUAL_BUDGET_CAP`، `budgetLines`، `blockAddressByTrigger()` |
| حفاظ runtime | `notBlocked(recipient)` modifier (line 66)؛ `withinBudget()` modifier؛ `ANNUAL_BUDGET_CAP` ceiling (line 89)؛ `KERNEL_ROLE`-only برای `blockAddressByTrigger()` (line 131) |
| پوشش test | `test/09_Treasury.test.js` — 29 test (budget lines، transactions، block، annual cap) |
| evidence موجود | داخل repo: contract و tests. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | TG-01 gap — `blockAddressByTrigger()` هرگز توسط TriggerProtocol فراخوانی نمی‌شود (مستند در step37/38) → issue #12 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | TG-01: مسیر خودکار از TriggerProtocol به `blockAddressByTrigger()` وجود ندارد (manual-only فعلاً)؛ formal verification برای budget conservation invariant |
| گام بعدی | ثبت TG-01 در external audit scope (issue #12)؛ ثبت formal verification target |

---

### ۳-۳. صندوق ثروت ملی — Sovereign Wealth Fund

| محور | جزئیات |
| --- | --- |
| نام اصل | صندوق ثروت ملی — سه‌لایه، multi-sig، yield سالانه، استقلال از سیاست |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷؛ TR-05 (استقلال SWF) |
| دکترین مرتبط | `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md`؛ `docs/step21/` — RC-01/RC-02/RC-03 |
| invariant مرتبط | L1_TARGET = 300B؛ L2_TARGET = 300B؛ L3_TARGET = 2T؛ ANNUAL_YIELD = 150‰ (15%)؛ MULTISIG_REQUIRED = 3-of-N |
| قرارداد/ماژول | `contracts/monetary/SovereignWealthFund.sol:20-24` — constants؛ `distributeAnnualYield()`؛ `layerFillRatio()` |
| حفاظ runtime | `COUNCIL_ROLE` on all mutating functions؛ `signaturesCount >= MULTISIG_REQUIRED` برای withdrawal execution؛ layer balance checks |
| پوشش test | `test/03_sovereign_wealth_fund.test.js` — 32 test (L1/L2/L3 deposits، multi-sig withdrawal، annual yield) |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | COUNCIL_ROLE production signer registry → issue #14؛ CLC-04 RECLAIM_ROLE wiring → ROLE_WIRING_CHECKLIST |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | production COUNCIL_ROLE signer registry؛ L2 yield reserve backing link to `totalReserves` in PahlaviToken (هیچ خودکاری وجود ندارد — عمداً)؛ formal verification invariant |
| گام بعدی | ثبت explicit «no automatic totalReserves update» در deployment docs؛ اتصال به ROLE_WIRING_CHECKLIST |

---

### ۳-۴. طبقه‌بندی ذخیره — Reserve Classification

| محور | جزئیات |
| --- | --- |
| نام اصل | طبقه‌بندی ذخیره — مسیر تبدیل موجودی خزانه به پشتوانه شناخته‌شده |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷ |
| دکترین مرتبط | `docs/STEP4_2_RESERVE_CLASSIFICATION_PROTOCOL.md`؛ `docs/step21/` — classification states |
| invariant مرتبط | Exact-Once Classification Accounting؛ Classification Neutrality؛ no oracle-autonomous classification |
| قرارداد/ماژول | `contracts/monetary/PahlaviToken.sol:198-202` — `updateReserves()` (تنها مسیر مجاز برای `totalReserves`)؛ `contracts/monetary/SovereignWealthFund.sol` — layer balances |
| حفاظ runtime | `updateReserves()` محدود به `KERNEL_ROLE`؛ هیچ oracle-autonomous classification وجود ندارد |
| پوشش test | `test/02_pahlavi_token.test.js` — reserve update tests |
| evidence موجود | داخل repo: contract و tests. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification برای classification neutrality؛ external audit → issue #12/#13 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | formal verification target برای classification neutrality invariant؛ oracle signal → reserve boundary test |
| گام بعدی | ثبت formal verification target در issue #13 |

---

### ۳-۵. محدودیت‌های انبساط پولی — Monetary Expansion Constraints

| محور | جزئیات |
| --- | --- |
| نام اصل | انبساط پولی فقط درون محدودیت‌های ذخیره — Expansion Eligibility Rules |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷ |
| دکترین مرتبط | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` — Expansion Eligibility Rules |
| invariant مرتبط | `MIN_RESERVE_RATIO = 333` (33.3‰)؛ `LIQUIDITY_CAP = MAX_SUPPLY = 900B PAH`؛ `reserveCompliant()` modifier |
| قرارداد/ماژول | `contracts/monetary/PahlaviToken.sol:83-90` — `reserveCompliant()` modifier؛ `mint()` (line 153) |
| حفاظ runtime | `reserveCompliant(mintAmount)`: newSupply <= MAX_SUPPLY AND ratio >= MIN_RESERVE_RATIO — revert اگر هر کدام نقض شوند |
| پوشش test | `test/02_pahlavi_token.test.js` — 40 test (mint gate، reserve ratio، supply cap) |
| evidence موجود | داخل repo: modifier و tests. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13؛ external audit → issue #12 |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification invariant از مسیر issue #13؛ evidence accepted از issue #12 |
| گام بعدی | حفظ وضعیت؛ ثبت formal verification target در issue #13 |

---

### ۳-۶. حفاظ نسبت ذخیره — Reserve Ratio Protection

| محور | جزئیات |
| --- | --- |
| نام اصل | نسبت ذخیره حداقل ۳۳.۳٪ — MIN_RESERVE_RATIO |
| منبع منشور | `constitution/constitution-fa.md`؛ `whitepaper/whitepaper-fa.md` — انضباط پشتوانه |
| دکترین مرتبط | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` — Reserve Backing Constraints |
| invariant مرتبط | `MIN_RESERVE_RATIO = 333`؛ `(totalReserves * 1000) / newSupply >= 333` |
| قرارداد/ماژول | `contracts/monetary/PahlaviToken.sol:39,83-90` — MIN_RESERVE_RATIO؛ `kernel.sol:55` — همان مقدار در Kernel |
| حفاظ runtime | `reserveCompliant()` — mint revert اگر ratio نقض شود؛ `canMint()` view function (line 261-264) |
| پوشش test | `test/02_pahlavi_token.test.js` — reserve ratio floor tests |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13 |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification invariant از issue #13؛ evidence accepted از issue #12 |
| گام بعدی | حفظ وضعیت؛ ثبت formal verification target |

---

### ۳-۷. حفاظ سقف نقدینگی — Liquidity Cap Protection

| محور | جزئیات |
| --- | --- |
| نام اصل | سقف نقدینگی ۹۰۰ میلیارد پهلوی — LIQUIDITY_CAP |
| منبع منشور | `constitution/constitution-fa.md` — TR-06 |
| دکترین مرتبط | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` — Liquidity Cap Constraints |
| invariant مرتبط | `MAX_SUPPLY = LIQUIDITY_CAP = 900B PAH`؛ `newSupply <= MAX_SUPPLY` |
| قرارداد/ماژول | `contracts/monetary/PahlaviToken.sol:36` — `MAX_SUPPLY = 900_000_000_000 * 1e18`؛ `kernel.sol:54` — `LIQUIDITY_CAP` همان مقدار |
| حفاظ runtime | `reserveCompliant()` — mint revert اگر `newSupply > MAX_SUPPLY`؛ `remainingMintCapacity()` view |
| پوشش test | `test/02_pahlavi_token.test.js` — supply cap tests؛ `test/01_kernel.test.js:41` — تأیید مقدار LIQUIDITY_CAP |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13؛ external audit → issue #12 |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification invariant از issue #13 |
| گام بعدی | حفظ وضعیت؛ ثبت formal verification target |

---

### ۳-۸. حمایت اقتصادی از طریق ماشه — Trigger-based Economic Protection

| محور | جزئیات |
| --- | --- |
| نام اصل | تخلف از منشور اقتصادی (TR-05/TR-06) باید منجر به اجرای اقتصادی شود |
| منبع منشور | `constitution/constitution-fa.md` — TR-05، TR-06؛ فرگرد ۷ |
| دکترین مرتبط | Step37/38 — TG-01 gap؛ `docs/step21/` — RC-E-11/RC-E-13 |
| invariant مرتبط | `blockAddressByTrigger()` در Treasury؛ `notBlocked()` guard |
| قرارداد/ماژول | `contracts/core/TriggerProtocol.sol` — `executeTrigger()`؛ `contracts/monetary/Treasury.sol:131` — `blockAddressByTrigger()`؛ `contracts/kernel.sol:43-48` — TR-05/TR-06 |
| حفاظ runtime | `notBlocked(recipient)` در Treasury (line 66)؛ `blockedByTrigger[addr]` mapping |
| پوشش test | `test/09_Treasury.test.js` — blockAddressByTrigger, notBlocked guard |
| evidence موجود | داخل repo: guard موجود است اما **TG-01 gap** — TriggerProtocol هرگز `blockAddressByTrigger()` را فراخوانی نمی‌کند |
| وابستگی blocker/signoff | TG-01 → issue #12 external audit؛ step38 تغییر را به‌دلیل revert-risk رد کرده |
| وضعیت ردیابی | **GAP** |
| artifact ناموجود | مسیر خودکار از `TriggerProtocol.executeTrigger()` به `Treasury.blockAddressByTrigger()` — step38 عمداً رد کرده است |
| گام بعدی | ثبت TG-01 در external audit scope (issue #12)؛ هیچ پیاده‌سازی بدون step جداگانه |

---

### ۳-۹. گذار حالت صندوق ثروت — Wealth Fund State Transitions

| محور | جزئیات |
| --- | --- |
| نام اصل | تغییر حالت‌های SWF باید authorized، exact-once، و replay-resistant باشد |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷؛ TR-05 |
| دکترین مرتبط | `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md` — SWF State Definitions |
| invariant مرتبط | Recognized Deposit (exact-once)؛ Pending/Executed Withdrawal idempotency؛ SWF Neutrality |
| قرارداد/ماژول | `contracts/monetary/SovereignWealthFund.sol` — `transactions` mapping؛ `executed` flag روی هر Transaction |
| حفاظ runtime | `tx_.executed = true` پیش از transfer — reentrancy guard؛ MULTISIG_REQUIRED check قبل از execution؛ layer balance checks |
| پوشش test | `test/03_sovereign_wealth_fund.test.js` — multi-sig path، replay resistance، exact-once withdrawal |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13؛ external audit → issue #12 |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification invariant از issue #13 |
| گام بعدی | حفظ وضعیت؛ ثبت formal verification target |

---

### ۳-۱۰. اصل ۱۰۰۰ پهلوی — 1000 Pahlavi Minimum Wage Principle

| محور | جزئیات |
| --- | --- |
| نام اصل | دستمزد حداقل ۱۰۰۰ پهلوی — حق بنیادین رفاهی از فرگرد ۱۰ منشور |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۱۰ (رفاه و سلامت) |
| دکترین مرتبط | `CLAUDE.md` — `MIN_WAGE = 1,000 Pahlavi`؛ CitizenCard docs |
| invariant مرتبط | `MIN_WAGE` در CitizenCard — ثابت، نه پرداخت مستقیم on-chain |
| قرارداد/ماژول | `contracts/welfare/CitizenCard.sol` — `MIN_WAGE = 1000 PAH`؛ employment status tracking |
| حفاظ runtime | CitizenCard وضعیت اشتغال، بیمه بیکاری، و اهلیت را ردیابی می‌کند؛ دستمزد واقعی off-chain است |
| پوشش test | `test/05_citizen_card.test.js` |
| evidence موجود | داخل repo: contract و test. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | treasury operational funding → issue #17؛ production deployment → issue #17 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | پرداخت واقعی دستمزد off-chain؛ funding source برای MIN_WAGE؛ employment registry off-chain |
| گام بعدی | ثبت صریح مرز on-chain/off-chain برای MIN_WAGE در deployment docs |

---

### ۳-۱۱. دکترین پول پشتوانه‌دار — Reserve-backed Currency Doctrine

| محور | جزئیات |
| --- | --- |
| نام اصل | پهلوی فقط با پشتوانه شناخته‌شده قابل mint است |
| منبع منشور | `constitution/constitution-fa.md` — فرگرد ۷؛ TR-06 |
| دکترین مرتبط | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` — Expansion Eligibility؛ `docs/step21/` — Step-21 Preserved Constants |
| invariant مرتبط | `totalReserves` در PahlaviToken — تنها مسیر مجاز: `updateReserves()` با KERNEL_ROLE؛ `reserveCompliant()` |
| قرارداد/ماژول | `contracts/monetary/PahlaviToken.sol` — `totalReserves`، `updateReserves()`، `reserveCompliant()` |
| حفاظ runtime | `updateReserves()` — `onlyRole(KERNEL_ROLE)` + `nonReentrant`؛ هیچ oracle-autonomous reserve update وجود ندارد |
| پوشش test | `test/02_pahlavi_token.test.js` — 40 test (reserve update، mint gate، ratio floor) |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13؛ external audit → issue #12 |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification invariant از issue #13؛ production reserve backing source |
| گام بعدی | ثبت formal verification target؛ ارجاع به workstream oracle برای داده ذخایر |

---

### ۳-۱۲. مدل تخصیص منابع ملی — National Resource Allocation Model

| محور | جزئیات |
| --- | --- |
| نام اصل | تخصیص منابع ملی — بودجه سالانه، فرمول ۳۰/۷۰ استانی، کارمزد velocity |
| منبع منشور | `constitution/constitution-fa.md` — فرگردهای ۷ و ۹ |
| دکترین مرتبط | `docs/STEP4_1_TREASURY_ACCOUNTING_RULES.md`؛ Provincial 30/70 formula |
| invariant مرتبط | `ANNUAL_BUDGET_CAP = 150B PAH`؛ `PROVINCIAL_SHARE = 300` (30%)؛ `VelocityFee` |
| قرارداد/ماژول | `contracts/monetary/Treasury.sol:23` — ANNUAL_BUDGET_CAP؛ `contracts/governance/Provincial.sol` — 30/70؛ `contracts/monetary/VelocityFee.sol` |
| حفاظ runtime | `ANNUAL_BUDGET_CAP` ceiling در Treasury؛ `productivityScore > 70` در Provincial؛ VelocityFee rate guard |
| پوشش test | `test/09_Treasury.test.js` — 29 test؛ `test/16_Provincial.test.js`؛ `test/11_Velocity_Fee.test.js` — 25 test |
| evidence موجود | داخل repo: contracts و tests. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | oracle revenue data → issue #15/#16؛ budget law (Parliament approval)؛ deployment → issue #17 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | Parliament budget law approval flow؛ oracle revenue attestation؛ province initialization؛ VelocityFee parameter governance |
| گام بعدی | ثبت Parliament → BudgetAllocation → Treasury flow در deployment checklist |

---

### ۳-۱۳. invariantهای cross-layer — Cross-Layer Conservation

| محور | جزئیات |
| --- | --- |
| نام اصل | ارزش نباید از طریق طبقه‌بندی ایجاد یا از طریق اجرای ناموفق نابود شود |
| منبع منشور | `whitepaper/whitepaper-fa.md` |
| دکترین مرتبط | `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md` — Conservation Boundary؛ `docs/step21/` — Accounting Invariants |
| invariant مرتبط | Failed Transition Neutrality؛ Replay Resistance؛ Exact-Once Accounting؛ No Double-Counting |
| قرارداد/ماژول | همه قراردادهای `contracts/monetary/` — SWF، Treasury، PahlaviToken؛ `contracts/reclaim/AssetFreeze.sol` |
| حفاظ runtime | `nonReentrant` در همه توابع mutating؛ `executed` flag؛ `reserveCompliant` پیش از mint |
| پوشش test | `test/02_pahlavi_token.test.js`، `test/03_sovereign_wealth_fund.test.js`، `test/09_Treasury.test.js`، `test/06_asset_freeze.test.js` |
| evidence موجود | داخل repo: tests موجودند. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | formal verification → issue #13؛ external audit → issue #12 |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | formal verification proof برای cross-layer conservation invariant؛ audit trail پذیرفته‌شده |
| گام بعدی | ثبت formal verification target در issue #13 با تمرکز بر cross-layer invariants |

---

### ۳-۱۴. کارمزد velocity — VelocityFee

| محور | جزئیات |
| --- | --- |
| نام اصل | کارمزد بر تراکنش‌های سریع — ابزار سیاست پولی غیراجرایی |
| منبع منشور | `whitepaper/whitepaper-fa.md` — سیاست پولی |
| دکترین مرتبط | Step7 policy layer — proposal-only؛ `Fargard7PolicyAdapter` non-executing |
| invariant مرتبط | `VelocityFee` rate bounds؛ fee collection does not expand money supply |
| قرارداد/ماژول | `contracts/monetary/VelocityFee.sol` |
| حفاظ runtime | rate governance via KERNEL_ROLE؛ fee collection accounting |
| پوشش test | `test/11_Velocity_Fee.test.js` — 25 test |
| evidence موجود | داخل repo: contract و tests. Evidence accepted: **ندارد** |
| وابستگی blocker/signoff | policy adoption governance → Fargard7PolicyAdapter proposal path |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | اتصال VelocityFee rate governance به Parliament/ConstitutionGuard flow؛ formal verification |
| گام بعدی | ارجاع به workstream قراردادها/adapterها برای Fargard7 → VelocityFee boundary |

---

## ۴. خلاصه وضعیت ردیابی workstream ۴

| اصل/invariant | وضعیت |
| --- | --- |
| Sovereign Reserve Model | PARTIAL |
| Treasury | PARTIAL |
| Sovereign Wealth Fund | PARTIAL |
| Reserve Classification | PARTIAL |
| Monetary Expansion Constraints | COMPLETE (داخل repo) |
| Reserve Ratio Protection | COMPLETE (داخل repo) |
| Liquidity Cap Protection | COMPLETE (داخل repo) |
| Trigger-based Economic Protection | GAP (TG-01) |
| Wealth Fund State Transitions | COMPLETE (داخل repo) |
| اصل ۱۰۰۰ پهلوی | PARTIAL |
| Reserve-backed Currency Doctrine | COMPLETE (داخل repo) |
| National Resource Allocation Model | PARTIAL |
| Cross-Layer Conservation Invariants | PARTIAL |
| VelocityFee | PARTIAL |

**وضعیت کلی workstream ۴:**
- COMPLETE (داخل repo): 5
- PARTIAL: 8
- GAP: 1

**مهم‌ترین شکاف:** TG-01 — `TriggerProtocol.executeTrigger()` هرگز `Treasury.blockAddressByTrigger()` را فراخوانی نمی‌کند. `notBlocked()` guard در Treasury موجود است اما فعال‌سازی آن manual-only است. Step38 پیاده‌سازی خودکار را به‌دلیل revert-risk رد کرده است.

---

## ۵. artifact‌های ناموجود اولویت‌بندی‌شده

| اولویت | artifact | مرتبط با |
| --- | --- | --- |
| ۱ | ثبت TG-01 در external audit scope | issue #12 |
| ۲ | formal verification target برای cross-layer conservation | issue #13 |
| ۳ | formal verification target برای MIN_RESERVE_RATIO و LIQUIDITY_CAP invariants | issue #13 |
| ۴ | production COUNCIL_ROLE signer registry | issue #14 |
| ۵ | Parliament → BudgetAllocation → Treasury deployment flow | ROLE_WIRING_CHECKLIST + issue #17 |
| ۶ | مرز صریح on-chain/off-chain برای MIN_WAGE | deployment docs |

---

## ۶. محدودیت‌های این بازبینی

این بازبینی:
- AI-assisted و documentation-only است.
- بر پایه repo در commit `de2e429` است.
- هیچ evidence بیرونی evaluate نشده است.
- جایگزین review مالی/اقتصادی مستقل، legal review، یا formal verification نیست.
- وضعیت COMPLETE (داخل repo) به معنای accepted evidence، audit completion یا formal verification completion **نیست**.

---

## ۷. non-claim نهایی

این سند فقط بازبینی ردیابی AI-assisted داخلی repo است. هیچ بودجه واقعی، موجودی خزانه، feasibility مالی، policy adopted، treasury operational، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion یا formal verification completion ادعا نشده است. هیچ ثابت پولی (MIN_RESERVE_RATIO، LIQUIDITY_CAP، ANNUAL_BUDGET_CAP) تغییر نکرده است. گام ۱۲ و گام ۱۳ همچنان باز هستند.

</div>
