<div dir="rtl">

# مانیفست استقرار IranOS — پروتکل مستندسازی

**نسخه:** ۱.۰.۰  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**شناسه شکاف:** G-11  
**نوع:** مستندات استقرار — بدون تغییر قرارداد  
**وضعیت:** راهنمای مرجع پیش از استقرار

---

> **⚠️ این سند مستندات‌محور است.**  
> **[استقرار انجام نمی‌شود | آمادگی تولید اعلام نمی‌شود | Step 12 بسته نمی‌شود | Step 13 بسته نمی‌شود | حسابرسی یا تأیید رسمی نیست]**

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
| `ORACLE_INITIAL` | آدرس اولیه oracle (placeholder تا API3Oracle deploy شود) | اجباری |
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
API3Oracle(kernel)
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
| `API3Oracle` | `kernel` | Kernel |
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

5.  deploy API3Oracle(KERNEL_ADDRESS)
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

### گروه E — سیم‌کشی Oracle (آخر از همه)

```
kernel.grantOfficialAccess(API3_ORACLE_ADDRESS, ORACLE_ROLE)
api3Oracle.grantRole(FEEDER_ROLE, FEEDER_1)
api3Oracle.grantRole(FEEDER_ROLE, FEEDER_2)
...
priceOracle.grantRole(FEEDER_ROLE, PRICE_FEEDER)
productionOracle.grantRole(FEEDER_ROLE, PROD_FEEDER)
```

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
# گام ۱: API3Oracle را به عنوان Oracle در Kernel ثبت کن
kernel.grantOfficialAccess(API3_ORACLE_ADDRESS, kernel.ORACLE_ROLE())

# گام ۲: feeder‌های مجاز را در API3Oracle ثبت کن
# (نیاز به impersonate کردن Kernel یا فراخوانی مستقیم از Kernel دارد)
api3Oracle.grantRole(api3Oracle.FEEDER_ROLE(), FEEDER_ADDRESS)

# گام ۳: feeder‌های PriceOracle و ProductionOracle
priceOracle.grantRole(priceOracle.FEEDER_ROLE(), PRICE_FEEDER)
productionOracle.grantRole(productionOracle.FEEDER_ROLE(), PROD_FEEDER)
```

**توجه:** `grantRole` در API3Oracle نیاز به `DEFAULT_ADMIN_ROLE` دارد که در constructor به `Kernel` اعطا می‌شود. در testnet از `hardhat_impersonateAccount` استفاده کنید (مانند pattern موجود در testها).

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
□ npm test پاس می‌شود (499/499)
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
□ api3Oracle.hasRole(FEEDER_ROLE, FEEDER_N) → true (برای هر feeder)
□ priceOracle.hasRole(FEEDER_ROLE, PRICE_FEEDER) → true
□ productionOracle.hasRole(FEEDER_ROLE, PROD_FEEDER) → true
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
├── 07_oracle_wiring.js     # ORACLE_ROLE + FEEDER_ROLE
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
- این سند نقطه شروع برای بررسی خارجی است، نه تأییدیه آن

</div>
