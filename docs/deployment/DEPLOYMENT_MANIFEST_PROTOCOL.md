<div dir="rtl">

# مانیفست استقرار IranOS — پروتکل مستندسازی

**نسخه:** ۱.۱.۰  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**توسعه به پوشش ۲۵/۲۵:** ۲۴ خرداد ۲۵۸۵ شاهنشاهی / ۱۴ ژوئن ۲۰۲۶ میلادی  
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
> **هیچ اسکریپت استقراری (`deploy/`) وجود ندارد** و هیچ استقراری اجرا نشده است. پوشش مستندیِ نقشه استقرار اکنون **۲۵/۲۵** است، اما نیمه‌ی اجراییِ G-11 (اسکریپت‌ها، اجرای dry-run، هش‌ها، gas) همچنان باز است. `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است و در این سند بسته نمی‌شود.

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
ConstitutionGuard(kernel)
JurySelection(kernel)
JusticeProtocol(kernel)
CitizenCard(kernel)
VictimFund(kernel)

Layer 2 — وابسته به Kernel + Layer 1
──────────────────────────────────────
TriggerProtocol(kernel, treasury, swf)
PahlaviToken(swf, kernel, initialReserves)
PenalLabor(kernel, victimFund)
Provincial(kernel, treasury)
AssetFreeze(kernel, swfTempWallet, swfContract)

Layer 3 — وابسته به چند قرارداد Layer 1/2
───────────────────────────────────────────
PriceOracle(kernel)        ← مستقل از Layer 2
ProductionOracle(kernel)   ← مستقل از Layer 2
```

| قرارداد | آرگومان‌های constructor | وابسته به |
|---------|----------------------|----------|
| `Kernel` | `sovereign, court_1, oracle_initial, swf` | هیچ |
| `Treasury` | `kernel` | Kernel |
| `SovereignWealthFund` | `sovereign, kernel` | Kernel |
| `PahlaviToken` | `swf, kernel, initialReserves` | Kernel، SWF |
| `TriggerProtocol` | `kernel, treasury, swf` | Kernel، Treasury، SWF |
| `API3Oracle` | `kernel, [feeder_1..N]` | Kernel (FEEDER_ROLE در constructor اعطا می‌شود) |
| `ConstitutionGuard` | `kernel` | Kernel |
| `AssetFreeze` | `kernel, swfTempWallet, swfContract` | Kernel، SWF |
| `JurySelection` | `kernel` | Kernel |
| `JusticeProtocol` | `kernel` | Kernel |
| `PenalLabor` | `kernel, victimFund` | Kernel، VictimFund |
| `VictimFund` | `kernel` | Kernel |
| `CitizenCard` | `kernel` | Kernel |
| `Provincial` | `kernel, treasury` | Kernel، Treasury |
| `PriceOracle` | `kernel` | Kernel |
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

4.  deploy VictimFund(KERNEL_ADDRESS)
    → ثبت آدرس: VICTIM_FUND_ADDRESS

5.  deploy API3Oracle(KERNEL_ADDRESS, [FEEDER_1, FEEDER_2, ...])
    → FEEDER_ROLE در constructor اعطا می‌شود — post-deploy grantRole لازم نیست (Codex P1 fix)
    → ثبت آدرس: API3_ORACLE_ADDRESS

6.  deploy ConstitutionGuard(KERNEL_ADDRESS)
    → ثبت آدرس: CONSTITUTION_GUARD_ADDRESS

7.  deploy JurySelection(KERNEL_ADDRESS)
    → ثبت آدرس: JURY_SELECTION_ADDRESS

8.  deploy JusticeProtocol(KERNEL_ADDRESS)
    → ثبت آدرس: JUSTICE_PROTOCOL_ADDRESS

9.  deploy CitizenCard(KERNEL_ADDRESS)
    → ثبت آدرس: CITIZEN_CARD_ADDRESS

10. deploy PriceOracle(KERNEL_ADDRESS)
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
□ npm test پاس می‌شود (693/693)
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
□ kernel.pahlaviToken() == PAHLAVI_TOKEN_ADDRESS   ← تأیید مسیر reserve sync (GAP-MEX-05)
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
□ اسکریپت‌های deploy/ با ترتیب مشخص موجود هستند
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

**ساختار اسکریپت استقرار (پیش از mainnet باید ایجاد شود):**

```
deploy/
├── 01_kernel.js            # deploy Kernel
├── 02_layer1.js            # deploy Treasury, SWF, VictimFund, ...
├── 03_layer2.js            # deploy TriggerProtocol, PahlaviToken, ...
├── 04_court_wiring.js      # grantOfficialAccess × 9
├── 05_trigger_wiring.js    # setTriggerProtocol + KERNEL_ROLE
├── 06_swf_wiring.js        # RECLAIM_ROLE + COUNCIL_ROLE + CRAWLER_ROLE
├── 07_oracle_wiring.js     # grantOfficialAccess(API3Oracle, ORACLE_ROLE) + revokeRole(ORACLE_INITIAL) — FEEDER_ROLE در constructor API3Oracle تنظیم شده
└── 08_verify.js            # تأیید تمام hasRole ها
```

**توجه:** اسکریپت‌های `deploy/` هنوز در مخزن ایجاد نشده‌اند. این یک باقی‌مانده G-11 است که نیاز به اقدام فنی دارد.

---

## ۱۲. اعلام غیرادعا

این سند صرفاً مستندات مرجع استقرار است:

- هیچ استقراری انجام نشده است
- آمادگی تولید یا mainnet اعلام نمی‌شود
- Step 12 یا Step 13 بسته نمی‌شود
- هیچ حسابرسی امنیتی (Slither / Mythril / Echidna) انجام نشده
- هیچ بررسی خارجی یا signoff وجود ندارد
- اسکریپت‌های `deploy/` هنوز ایجاد نشده‌اند (باقی‌مانده G-11 فنی)
- پوشش مستندیِ نقشه استقرار اکنون ۲۵/۲۵ است، اما هیچ آدرس، مقدار سازنده، هش، تخمین gas، یا اجرای dry-run افزوده/انجام نشده و `STEP9-BLOCK-005` همچنان **OPEN/PENDING** است
- این سند نقطه شروع برای بررسی خارجی است، نه تأییدیه آن

</div>
