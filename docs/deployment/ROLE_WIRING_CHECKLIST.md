<div dir="rtl">

# چک‌لیست سیم‌کشی نقش‌های بین قراردادی — استقرار IranOS

**نسخه:** 1.5  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**افزودن بخش‌های ح/ط (setPahlaviToken و RecognizedReserveBacking):** ۱۴ تیر ۲۵۸۵ شاهنشاهی / ۵ ژوئیه ۲۰۲۶ میلادی  
**به‌روزرسانی وضعیت اسکریپت‌های deploy/ (۶/۲۵ قرارداد پیاده‌سازی شد):** ۱۴ تیر ۲۵۸۵ شاهنشاهی / ۵ ژوئیه ۲۰۲۶ میلادی  
**مرجع:** CLC-04 (Step 43) — CLC-05 (Step 45) — COURT-01 — G-11 — GAP-MEX-05  
**وضعیت:** مستندات استقرار — بدون تغییر قرارداد

---

## فهرست مطالب

1. [یافته CLC-04](#یافته-cLC-04)
2. [یافته CLC-05](#یافته-cLC-05)
3. [یافته COURT-01](#یافته-court-01)
4. [یافته G-11](#یافته-g-11)
5. [نقش‌های سازنده — خودکار](#نقش‌های-سازنده--خودکار)
6. [پیکربندی پس از استقرار — اجباری دستی](#پیکربندی-پس-از-استقرار--اجباری-دستی)
7. [چک‌لیست تأیید پس از استقرار](#چک‌لیست-تأیید-پس-از-استقرار)

---

## یافته CLC-04

`SovereignWealthFund.RECLAIM_ROLE` در هیچ سازنده‌ای به آدرس `AssetFreeze` اعطا نمی‌شود. هر فراخوانی `transferToSWF()` تا پیش از اجرای این اعطا با خطای AccessControl revert می‌شود. رفتار قرارداد صحیح است (revert اتمی، بدون وضعیت یتیم)؛ شکاف در روش استقرار است.

**شواهد:** `test/06_asset_freeze.test.js:38` — اعطای دستی در `beforeEach`؛ `test/06_asset_freeze.test.js:194` — تأیید صریح revert در صورت نبود نقش.

---

## یافته CLC-05

`Kernel.triggerProtocol` در سازنده به `address(0)` مقداردهی می‌شود و هیچ گاردی وجود ندارد که از فراخوانی `flagViolation()` پیش از سیم‌کشی TriggerProtocol جلوگیری کند. اگر تخلف TR-01/02/03 پیش از `setTriggerProtocol()` رخ دهد، ماشه **به صورت ناقص و بدون اطلاع** اجرا می‌شود:

- نقش‌های مقام خاطی داخلاً لغو می‌شوند ✓
- قفل اضطراری فعال می‌شود ✓
- **لایه اجرای TriggerProtocol به طور ساکت رد می‌شود** — خزانه مسدود نمی‌شود، رویداد `TriggerExecuted` صادر نمی‌شود، جانشین موقت فعال نمی‌شود

**شواهد:** `kernel.sol:330` — `if (triggerProtocol != address(0))` بدون emit یا revert در مسیر else.

**رفتار قرارداد:** طراحی صحیح است؛ شکاف در ترتیب استقرار است.

---

## یافته COURT-01

سازنده Kernel تنها یک عضو `COURT_ROLE` ثبت می‌کند (`_court`). `MULTISIG_THRESHOLD = 7` یعنی حداقل ۷ عضو مجزا باید `signViolation()` را امضا کنند تا ماشه فعال شود. با یک عضو، این مسیر برای همیشه مسدود است.

**محدودیت بحرانی:** `grantOfficialAccess()` modifier `notLocked` دارد. اگر هر تخلف TR-01/02/03 پیش از ثبت ۹ عضو دادگاه اتفاق بیفتد، قفل اضطراری فعال می‌شود و دیگر امکان افزودن عضو جدید وجود ندارد — مسیر ماشه برای همیشه غیرفعال می‌ماند.

**راه‌حل:** ۹ عضو دادگاه باید **پیش از** اعطای `ORACLE_ROLE` و **پیش از** فراخوانی `setTriggerProtocol()` ثبت شوند.

**مرجع کامل:** `docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md`

---

## یافته G-11

هیچ `hardhat.config.js`، اسکریپت `deploy/`، یا فایل artifacts مستندی در مخزن وجود ندارد. بدون اینها، هیچ بررسی‌کننده خارجی نمی‌تواند استقرار را تکرار، تأیید، یا audit کند.

**راه‌حل:** مانیفست استقرار مستند شده در `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`. اسکریپت‌های `deploy/` باقی‌مانده G-11 فنی هستند که پیش از testnet باید ایجاد شوند.

**مرجع کامل:** `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`

---

## نقش‌های سازنده — خودکار

نقش‌های زیر در سازنده قراردادها اعطا می‌شوند و نیازی به اقدام دستی ندارند:

| قرارداد | نقش | دریافت‌کننده | سازنده |
|---------|-----|-------------|--------|
| `Kernel` | `DEFAULT_ADMIN_ROLE` | `sovereign` | `kernel.sol:215` |
| `Kernel` | `SOVEREIGN_ROLE` | `sovereign` | `kernel.sol:216` |
| `Kernel` | `COURT_ROLE` | `court` | `kernel.sol:217` |
| `Kernel` | `ORACLE_ROLE` | `oracle` (اولیه) | `kernel.sol:218` |
| `SovereignWealthFund` | `DEFAULT_ADMIN_ROLE` | `sovereign` | `SovereignWealthFund.sol:65` |
| `SovereignWealthFund` | `SOVEREIGN_ROLE` | `sovereign` | `SovereignWealthFund.sol:66` |
| `SovereignWealthFund` | `KERNEL_ROLE` | `kernel` | `SovereignWealthFund.sol:67` |
| `PahlaviToken` | `DEFAULT_ADMIN_ROLE` | `kernel` | `PahlaviToken.sol:114` |
| `PahlaviToken` | `KERNEL_ROLE` | `kernel` | `PahlaviToken.sol:115` |
| `PahlaviToken` | `MINTER_ROLE` | `swf` | `PahlaviToken.sol:116` |
| `PahlaviToken` | `BURNER_ROLE` | `swf` | `PahlaviToken.sol:117` |
| `PahlaviToken` | `PAUSER_ROLE` | `kernel` | `PahlaviToken.sol:118` |

---

## پیکربندی پس از استقرار — اجباری دستی

موارد زیر **در هیچ سازنده‌ای اجرا نمی‌شوند** و باید پس از استقرار توسط مقام مجاز اجرا شوند.

### الف — بحرانی‌ترین: تکمیل ترکیب دادگاه (COURT-01)

⚠️ **باید پیش از هر چیز دیگری — پیش از ORACLE_ROLE و پیش از setTriggerProtocol — اجرا شود.**  
بدون ۹ عضو فعال دادگاه، مسیر اجرای ماشه برای همیشه مسدود است.

| # | فراخوان | قرارداد هدف | متد | تعداد |
|---|---------|------------|-----|-------|
| — | `sovereign` | `Kernel` | `grantOfficialAccess(court_N, COURT_ROLE)` | ۸ بار (اعضای ۲ تا ۹) |

```
kernel.grantOfficialAccess(court_2, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_3, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_4, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_5, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_6, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_7, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_8, kernel.COURT_ROLE())
kernel.grantOfficialAccess(court_9, kernel.COURT_ROLE())
```

پس از اجرا: `kernel.hasRole(kernel.COURT_ROLE(), court_N)` باید برای همه ۹ عضو `true` باشد.

---

### ب — بحرانی: سیم‌کشی TriggerProtocol به Kernel (CLC-05)

⚠️ **باید پیش از هر فراخوانی `flagViolation()` اجرا شود.** بدون این پیکربندی، فعال‌سازی ماشه ناقص و بدون اطلاع خواهد بود.

| # | فراخوان | قرارداد هدف | متد | آرگومان | بدون این پیکربندی |
|---|---------|------------|-----|---------|-----------------|
| 0 | `sovereign` | `Kernel` | `setTriggerProtocol(address)` | آدرس `TriggerProtocol` | ماشه بدون مسدودسازی خزانه و رویداد `TriggerExecuted` اجرا می‌شود |

```
kernel.setTriggerProtocol(triggerProtocolAddress)
```

---

### ج — بحرانی: خط لوله AssetFreeze → SWF (CLC-04)

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 1 | `sovereign` | `SovereignWealthFund` | `RECLAIM_ROLE` | آدرس `AssetFreeze` | تمام `transferToSWF()` با AccessControl revert می‌شود |

```
swf.grantRole(swf.RECLAIM_ROLE(), assetFreezeAddress)
```

### د — اجباری: اوراکل API3 به Kernel

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 2 | `sovereign` | `Kernel` | `ORACLE_ROLE` | آدرس `API3Oracle` | `flagViolation()` با "Kernel: caller is not an Oracle" revert |

```
kernel.grantOfficialAccess(api3OracleAddress, kernel.ORACLE_ROLE())
```

### ه — اجباری: Feeder‌های API3Oracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 3 | deployer (در constructor) | `API3Oracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز (آرایه در constructor) | `updateData()` و `flagViolation()` revert |

```
// Codex P1 fix: FEEDER_ROLE در زمان deploy از طریق پارامتر initialFeeders اعطا می‌شود.
// impersonate کردن Kernel لازم نیست.
new API3Oracle(kernelAddress, [feeder1, feeder2, ...])
```

**توجه:** پس از deploy، برای افزودن feeder جدید به اجرای post-deployment مستقل نیاز است (در نسخه فعلی `grantRole` در API3Oracle فقط توسط `DEFAULT_ADMIN_ROLE` (Kernel) قابل فراخوانی است). این در scope Codex P1 نیست.

### و — اجباری: AssetFreeze داخلی

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 4 | `kernel` | `AssetFreeze` | `CRAWLER_ROLE` | آدرس Crawler | `freezeAsset()` revert |
| 5 | `kernel` | `AssetFreeze` | `COUNCIL_ROLE` | هر عضو شورا (حداقل ۳) | `signConfirmation()` و `transferToSWF()` revert |

```
freeze.grantRole(freeze.CRAWLER_ROLE(), crawlerAddress)
freeze.grantRole(freeze.COUNCIL_ROLE(), council1)
freeze.grantRole(freeze.COUNCIL_ROLE(), council2)
freeze.grantRole(freeze.COUNCIL_ROLE(), council3)
```

### ز — اجباری: Feeder‌های PriceOracle و ProductionOracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده |
|---|---------|------------|-----|-------------|
| 6 | `kernel` | `PriceOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |
| 7 | `kernel` | `ProductionOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |

### ح — بحرانی: پیوند آدرس PahlaviToken به Kernel (GAP-MEX-05)

⚠️ **باید بلافاصله پس از deploy PahlaviToken اجرا شود.** بدون این گام، `kernel.pahlaviToken()` صفر می‌ماند و `syncReserves`، `setPahlaviRecognizedReserveBacking`، و `syncRecognizedBackingTotal` برای همیشه با `"Kernel: pahlaviToken not set"` revert می‌کنند. این گام در سازنده هیچ قراردادی اجرا نمی‌شود و پیش از این نسخه در این چک‌لیست غایب بود.

| # | فراخوان | قرارداد هدف | متد | آرگومان | بدون این فراخوانی |
|---|---------|------------|-----|---------|-------------------|
| 8 | `sovereign` | `Kernel` | `setPahlaviToken(address)` | آدرس `PahlaviToken` | تمام مسیرهای ذخایر (اوراکل و پشتوانه شناخته‌شده) revert می‌کنند |

```
kernel.setPahlaviToken(pahlaviTokenAddress)
```

### ط — اجباری (در صورت فعال‌سازی مسیر پشتوانه شناخته‌شده): RecognizedReserveBacking

تنها مسیر تولیدی شناخته‌شده برای تبدیل هویت‌های ثبت‌شده به پشتوانه پولی توکن. نیازمند تکمیل بخش ح.

| # | فراخوان | قرارداد هدف | متد | آرگومان | بدون این فراخوانی |
|---|---------|------------|-----|---------|-------------------|
| 9 | deployer (در constructor) | `RecognizedReserveBacking` | — | `(sovereign, recognizerAddress)` | `RECOGNIZER_ROLE` اعطا نمی‌شود؛ `recordIdentity()` revert می‌کند |
| 10 | `sovereign` | `Kernel` | `setPahlaviRecognizedReserveBacking(address)` | آدرس `RecognizedReserveBacking` | `PahlaviToken.totalReserves` هرگز با `recognizedBackingTotal` همگام نمی‌شود |

```
new RecognizedReserveBacking(sovereignAddress, recognizerAddress)
kernel.setPahlaviRecognizedReserveBacking(recognizedReserveBackingAddress)
```

**توجه:** فراخوانی بالا اتمیک است — هم پیوند را برقرار می‌کند و هم بلافاصله `totalReserves` را با `recognizedBackingTotal` همگام می‌کند. `PahlaviToken.updateReserves()` (مسیر اوراکل) از زمان اجرای سیاست طبقه‌بندی پشتوانه (PR #113) دیگر `totalReserves` را تغییر نمی‌دهد — این وضعیت پیش از این فراخوانی هم برقرار است؛ `DEPLOYMENT_MANIFEST_PROTOCOL.md` بخش ۶ را ببینید.

---

## چک‌لیست تأیید پس از استقرار

پس از اجرای تمام اعطاهای دستی، موارد زیر را تأیید کنید.

### گروه اول — دادگاه (باید پیش از همه چیز کامل باشد — COURT-01)

- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_1)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_2)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_3)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_4)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_5)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_6)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_7)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_8)` → `true`
- [ ] `kernel.hasRole(kernel.COURT_ROLE(), court_9)` → `true`
- [ ] `kernel.emergencyLockActive()` → `false` ⚠️ **اگر true است، اعطای نقش دیگر ممکن نیست**

### گروه دوم — سیم‌کشی قراردادها

- [ ] `kernel.triggerProtocol()` ≠ `address(0)` ⚠️ **پس از تکمیل گروه اول**
- [ ] `swf.hasRole(swf.RECLAIM_ROLE(), assetFreezeAddress)` → `true`
- [ ] `kernel.hasRole(kernel.ORACLE_ROLE(), api3OracleAddress)` → `true` ⚠️ **آخرین مرحله**
- [ ] `api3Oracle.hasRole(api3Oracle.FEEDER_ROLE(), feeder)` → `true` برای هر feeder
- [ ] `freeze.hasRole(freeze.CRAWLER_ROLE(), crawlerAddress)` → `true`
- [ ] `freeze.hasRole(freeze.COUNCIL_ROLE(), council1)` → `true` (حداقل ۳ عضو)
- [ ] `priceOracle.hasRole(priceOracle.FEEDER_ROLE(), feeder)` → `true`
- [ ] `productionOracle.hasRole(productionOracle.FEEDER_ROLE(), feeder)` → `true`
- [ ] `kernel.pahlaviToken()` == `pahlaviTokenAddress` ⚠️ **بخش ح — پیش‌نیاز تمام مسیرهای ذخایر (GAP-MEX-05)**
- [ ] `recognizedReserveBacking.hasRole(recognizedReserveBacking.RECOGNIZER_ROLE(), recognizerAddress)` → `true` (در صورت فعال‌سازی بخش ط)
- [ ] `token.recognizedReserveBacking()` == `recognizedReserveBackingAddress` (در صورت فعال‌سازی بخش ط)
- [ ] `token.totalReserves()` == `recognizedReserveBacking.recognizedBackingTotal()` (در صورت فعال‌سازی بخش ط — تأیید همگام‌سازی اتمیک)

### گروه سوم — وضعیت سیستم

- [ ] `api3Oracle.violationFlagCount()` = 0 (سیستم پاک شروع می‌شود)
- [ ] `swf.totalAssets()` با موجودی L1+L2+L3 اولیه مطابقت دارد

### تأیید مانیفست استقرار (G-11)

- [ ] `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` مطالعه شده
- [ ] ترتیب اجباری استقرار (بخش ۳) دنبال شده
- [ ] کتاب آدرس کامل و در جای امن ذخیره شده
- [ ] `npx hardhat compile` بدون خطا اجرا می‌شود
- [ ] اسکریپت‌های `deploy/` برای قراردادهای هدف این استقرار وجود دارند — برای ۶ قرارداد مسیر اصلی پولی/پشتوانه در مخزن پیاده‌سازی شده‌اند (`deploy/README.md`)؛ برای ۱۹ قرارداد باقی‌مانده هنوز ایجاد نشده‌اند (باقی‌مانده G-11 فنی)
- [ ] bytecode deploy‌شده با کد مخزن مطابقت دارد

**توجه:** Steps 12 و 13 (شواهد خارجی و بررسی ردپذیری) همچنان باز هستند.

</div>
