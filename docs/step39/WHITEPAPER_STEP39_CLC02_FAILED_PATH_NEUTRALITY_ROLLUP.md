<div dir="rtl">

# رول‌آپ بی‌طرفی مسیر شکست CLC-02 — گام ۳۹

**نوع سند:** documentation-only / integration boundary rollup  
**وضعیت:** باز؛ این سند CLC-02 را بسته یا حل‌شده اعلام نمی‌کند.  
**تاریخ:** فروردین ۲۵۸۵ شاهنشاهی / مارس–آوریل ۲۰۲۶ میلادی  
**هد اصلی:** `77c6048`  
**تعداد تست‌ها:** ۴۸۹ passing

## non-claim

این سند هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- CLC-02 حل شده یا بسته است
- production readiness
- release approval
- completed external audit
- completed formal verification
- blocker closure
- accepted evidence
- reviewer signoff
- completion of Step 12
- completion of Step 13

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

---

## ۱. هدف CLC-02

**CLC-02** یکی از invariantهای ماتریس Step 5 است:

> مسیرهای cross-contract ناموفق نباید state قرارداد remote را تغییر دهند.

مرز مورد بررسی در این گام: **`AssetFreeze.transferToSWF()` → `SovereignWealthFund`**

---

## ۲. مرز یکپارچگی AssetFreeze → SWF

```
[AssetFreeze.transferToSWF(assetId)]
    ↓
    require(asset.status == Confirmed)   ← guard
    ↓ (if not confirmed → revert)
    swf.reclaimAsset(assetId, value)    ← فراخوانی cross-contract
```

اگر دارایی در وضعیت `Active` (نه `Confirmed`) باشد، guard قبل از هر فراخوانی cross-contract fire می‌شود. هیچ تغییری در `SovereignWealthFund` رخ نمی‌دهد.

---

## ۳. مسیر `transferToSWF()` شکست‌خورده — آنچه تست اثبات کرد

تست `test/06_asset_freeze.test.js` (commit `77c6048`) موارد زیر را اثبات کرد:

| مرحله | عملیات | نتیجه |
|-------|---------|-------|
| A | freeze کردن دارایی `unconfirmedId` (status = Active) | موفق |
| B | snapshot گرفتن از `swf.layerL1()`, `swf.totalAssets()`, `swf.txCount()` | ثبت شد |
| C | `freeze.transferToSWF(unconfirmedId)` | revert: `"AssetFreeze: not confirmed"` |
| D | بررسی `swf.layerL1().balance` | برابر snapshot — بدون تغییر |
| E | بررسی `swf.layerL1().totalDeposited` | برابر snapshot — بدون تغییر |
| F | بررسی `swf.totalAssets()` | برابر snapshot — بدون تغییر |
| G | بررسی `swf.txCount()` | برابر snapshot — بدون تغییر |

**نتیجه:** guard در `AssetFreeze` قبل از هر تعامل با `SovereignWealthFund` اجرا می‌شود. state remote به‌صورت اتمیک محافظت می‌شود.

---

## ۴. اهمیت

`swf.txCount` تنها زمانی افزایش می‌یابد که `reclaimAsset()` با موفقیت فراخوانی شود. یک `transferToSWF()` ناموفق نه `txCount`، نه `layerL1.balance`، نه `layerL1.totalDeposited`، و نه `totalAssets` را تغییر نمی‌دهد — این رفتار اتمیک طراحی مورد انتظار است.

---

## ۵. خلاصه تست‌ها

| نقطه | تعداد تست |
|------|-----------|
| شروع گام ۳۹ | ۴۸۸ |
| پس از تست CLC-02 | **۴۸۹** |

**commit مرتبط:** `77c6048` — `test(clc): cover asset freeze SWF failed-path neutrality`

---

## ۶. تغییرات انجام‌شده در گام ۳۹

| نوع | توضیح |
|-----|-------|
| تست | یک تست cross-contract در `test/06_asset_freeze.test.js` (+20 خط) |
| قرارداد | بدون تغییر |
| دکترین | بدون تغییر |
| ثوابت/آستانه‌ها | بدون تغییر |
| authority | بدون تغییر |

---

## ۷. وضعیت Step 12 و Step 13

**Step 12 باز می‌ماند.** این سند Step 12 را نمی‌بندد.

**Step 13 باز می‌ماند.** رجیستر شکاف‌های Step 13 در `docs/step13/WHITEPAPER_STEP13_GAP_REGISTER_FA.md` همچنان pending/needs-review است. این سند Step 13 را نمی‌بندد.

---

## ۸. مرحله بعدی پیشنهادی

با تکمیل CLC-02 به‌عنوان یک واقعیت طراحی مستند، سه مسیر ممکن برای Step 40 وجود دارد:

1. **CLC-03 integration test:** بررسی مسیر شکست `Provincial.distributeRevenue()` → Treasury — آیا state Treasury بدون تغییر می‌ماند؟
2. **DG-01 integration test:** مشابه TG-01، اثبات اینکه `executeTrigger()` `SWF.COUNCIL_ROLE` را باز نمی‌گیرد (قبلاً به‌صورت جزئی در تست trigger activation تأیید شده).
3. **مرحله مستندسازی:** تهیه سند یکپارچه cross-contract که TG-01، DG-01، و CLC-02 را در یک مرجع واحد جمع‌بندی کند.

**توصیه:** گزینه ۱ (CLC-03) — به‌دلیل اهمیت بالا در ماتریس Step 5 و پوشش نداشتن مسیر `Provincial → Treasury`.

</div>
