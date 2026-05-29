<div dir="rtl">

# چک‌لیست سیم‌کشی نقش‌های بین قراردادی — استقرار IranOS

**نسخه:** 1.0  
**تاریخ:** ۱۴۰۵-۰۳-۰۸  
**مرجع:** CLC-04 (Step 43)  
**وضعیت:** مستندات استقرار — بدون تغییر قرارداد

---

## فهرست مطالب

1. [یافته CLC-04](#یافته-cLC-04)
2. [نقش‌های سازنده — خودکار](#نقش‌های-سازنده--خودکار)
3. [نقش‌های پس از استقرار — اجباری دستی](#نقش‌های-پس-از-استقرار--اجباری-دستی)
4. [چک‌لیست تأیید پس از استقرار](#چک‌لیست-تأیید-پس-از-استقرار)

---

## یافته CLC-04

`SovereignWealthFund.RECLAIM_ROLE` در هیچ سازنده‌ای به آدرس `AssetFreeze` اعطا نمی‌شود. هر فراخوانی `transferToSWF()` تا پیش از اجرای این اعطا با خطای AccessControl revert می‌شود. رفتار قرارداد صحیح است (revert اتمی، بدون وضعیت یتیم)؛ شکاف در روش استقرار است.

**شواهد:** `test/06_asset_freeze.test.js:38` — اعطای دستی در `beforeEach`؛ `test/06_asset_freeze.test.js:194` — تأیید صریح revert در صورت نبود نقش.

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

## نقش‌های پس از استقرار — اجباری دستی

نقش‌های زیر **در هیچ سازنده‌ای اعطا نمی‌شوند** و باید پس از استقرار توسط مقام دارای `DEFAULT_ADMIN_ROLE` اجرا شوند.

### الف — بحرانی: خط لوله AssetFreeze → SWF (CLC-04)

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 1 | `sovereign` | `SovereignWealthFund` | `RECLAIM_ROLE` | آدرس `AssetFreeze` | تمام `transferToSWF()` با AccessControl revert می‌شود |

```
swf.grantRole(swf.RECLAIM_ROLE(), assetFreezeAddress)
```

### ب — اجباری: اوراکل API3 به Kernel

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 2 | `sovereign` | `Kernel` | `ORACLE_ROLE` | آدرس `API3Oracle` | `flagViolation()` با "Kernel: caller is not an Oracle" revert |

```
kernel.grantOfficialAccess(api3OracleAddress, kernel.ORACLE_ROLE())
```

### ج — اجباری: Feeder‌های API3Oracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده | بدون این اعطا |
|---|---------|------------|-----|-------------|--------------|
| 3 | `kernel` (impersonate) | `API3Oracle` | `FEEDER_ROLE` | هر آدرس feeder مجاز | `updateData()` و `flagViolation()` revert |

```
api3Oracle.grantRole(api3Oracle.FEEDER_ROLE(), feederAddress)
```

### د — اجباری: AssetFreeze داخلی

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

### ه — اجباری: Feeder‌های PriceOracle و ProductionOracle

| # | فراخوان | قرارداد هدف | نقش | دریافت‌کننده |
|---|---------|------------|-----|-------------|
| 6 | `kernel` | `PriceOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |
| 7 | `kernel` | `ProductionOracle` | `FEEDER_ROLE` | آدرس‌های feeder مجاز |

---

## چک‌لیست تأیید پس از استقرار

پس از اجرای تمام اعطاهای دستی، موارد زیر را تأیید کنید:

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
