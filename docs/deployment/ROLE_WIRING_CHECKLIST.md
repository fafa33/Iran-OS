<div dir="rtl">

# چک‌لیست سیم‌کشی نقش‌های بین قراردادی — استقرار IranOS

**نسخه:** 1.1  
**تاریخ:** ۱۴۰۵-۰۳-۰۸  
**مرجع:** CLC-04 (Step 43) — CLC-05 (Step 45)  
**وضعیت:** مستندات استقرار — بدون تغییر قرارداد

---

## فهرست مطالب

1. [یافته CLC-04](#یافته-cLC-04)
2. [یافته CLC-05](#یافته-cLC-05)
3. [نقش‌های سازنده — خودکار](#نقش‌های-سازنده--خودکار)
4. [پیکربندی پس از استقرار — اجباری دستی](#پیکربندی-پس-از-استقرار--اجباری-دستی)
5. [چک‌لیست تأیید پس از استقرار](#چک‌لیست-تأیید-پس-از-استقرار)

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

### الف — بحرانی: سیم‌کشی TriggerProtocol به Kernel (CLC-05)

⚠️ **باید پیش از هر فراخوانی `flagViolation()` اجرا شود.** بدون این پیکربندی، فعال‌سازی ماشه ناقص و بدون اطلاع خواهد بود.

| # | فراخوان | قرارداد هدف | متد | آرگومان | بدون این پیکربندی |
|---|---------|------------|-----|---------|-----------------|
| 0 | `sovereign` | `Kernel` | `setTriggerProtocol(address)` | آدرس `TriggerProtocol` | ماشه بدون مسدودسازی خزانه و رویداد `TriggerExecuted` اجرا می‌شود |

```
kernel.setTriggerProtocol(triggerProtocolAddress)
```

---

### ب — بحرانی: خط لوله AssetFreeze → SWF (CLC-04)

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 1 | `sovereign` | `SovereignWealthFund` | `RECLAIM_ROLE` | آدرس `AssetFreeze` | تمام `transferToSWF()` با AccessControl revert می‌شود |

```
swf.grantRole(swf.RECLAIM_ROLE(), assetFreezeAddress)
```

### ج — اجباری: اوراکل API3 به Kernel

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 2 | `sovereign` | `Kernel` | `ORACLE_ROLE` | آدرس `API3Oracle` | `flagViolation()` با "Kernel: caller is not an Oracle" revert |

```
kernel.grantOfficialAccess(api3OracleAddress, kernel.ORACLE_ROLE())
```

### د — اجباری: Feeder‌های API3Oracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 3 | `kernel` (impersonate) | `API3Oracle` | `FEEDER_ROLE` | هر آدرس feeder مجاز | `updateData()` و `flagViolation()` revert |

```
api3Oracle.grantRole(api3Oracle.FEEDER_ROLE(), feederAddress)
```

### ه — اجباری: AssetFreeze داخلی

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

### و — اجباری: Feeder‌های PriceOracle و ProductionOracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده |
|---|---------|------------|-----|-------------|
| 6 | `kernel` | `PriceOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |
| 7 | `kernel` | `ProductionOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |

---

## چک‌لیست تأیید پس از استقرار

پس از اجرای تمام اعطاهای دستی، موارد زیر را تأیید کنید:

- [ ] `kernel.triggerProtocol()` ≠ `address(0)` ⚠️ **باید اول تأیید شود**
- [ ] `swf.hasRole(swf.RECLAIM_ROLE(), assetFreezeAddress)` → `true`
- [ ] `kernel.hasRole(kernel.ORACLE_ROLE(), api3OracleAddress)` → `true`
- [ ] `api3Oracle.hasRole(api3Oracle.FEEDER_ROLE(), feeder)` → `true` برای هر feeder
- [ ] `freeze.hasRole(freeze.CRAWLER_ROLE(), crawlerAddress)` → `true`
- [ ] `freeze.hasRole(freeze.COUNCIL_ROLE(), council1)` → `true` (حداقل ۳ عضو)
- [ ] `priceOracle.hasRole(priceOracle.FEEDER_ROLE(), feeder)` → `true`
- [ ] `productionOracle.hasRole(productionOracle.FEEDER_ROLE(), feeder)` → `true`
- [ ] `api3Oracle.violationFlagCount()` = 0 (سیستم پاک شروع می‌شود)
- [ ] `swf.totalAssets()` با موجودی L1+L2+L3 اولیه مطابقت دارد

**توجه:** Steps 12 و 13 (شواهد خارجی و بررسی ردپذیری) همچنان باز هستند.

</div>
