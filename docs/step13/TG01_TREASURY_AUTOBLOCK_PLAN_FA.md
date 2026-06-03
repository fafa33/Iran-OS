<div dir="rtl">

# TG-01 — برنامه مسدودسازی خودکار خزانه‌داری
## Treasury Auto-Block Implementation Plan (Documentation Only)

**نسخه:** ۱.۱.۰  
**تاریخ اولیه:** ۱۴۰۵-۰۳-۱۳ (برنامه‌ریزی)  
**تاریخ به‌روزرسانی:** ۱۴۰۵-۰۳-۱۳ (چک‌پوینت پس از ادغام)  
**وضعیت:** **IMPLEMENTED — PR #36 ادغام‌شده — commit `48f5ffa`**  
**هدف:** ~~step38~~ **تکمیل‌شده**

---

> **✅ به‌روزرسانی وضعیت — پس از ادغام PR #36:**  
> TG-01 **پیاده‌سازی شد** و در commit `48f5ffa` در main ادغام گردید. گزینه الف (رابط مستقیم) پیاده‌سازی شد. ۴۹۹/۴۹۹ تست passing است.  
>  
> **الزام استقرار:** `treasury.grantRole(treasury.KERNEL_ROLE(), address(triggerProtocol))` باید پس از deploy اجرا شود.  
>  
> این سند اکنون سابقه تاریخی برنامه‌ریزی است — هیچ اقدام باقی‌مانده‌ای ندارد.  
> **[Step 12 یا Step 13 بسته نمی‌شود | حسابرسی یا آمادگی تولید نیست]**

---

## ۱. مبنای قانون اساسی

**فرگرد ۱۳، بند ۸۱ منشور:**

> "دسترسی مقام خطاکار به خزانه‌داری... **به صورت خودکار**... قطع می‌شود"

کلمه **"خودکار"** تعهد صریح لایه ۱ است. این عبارت به معنای عدم نیاز به تأیید انسانی پس از فعال‌سازی تریگر است.

**سپیدنامه، فرگرد ۴ (مکانیزم اجرا):**  
مکانیزم تریگر باید زنجیره‌ای کامل داشته باشد: تشخیص → تأیید → قفل اضطراری → **قطع دسترسی مالی**.

---

## ۲. رفتار فعلی (پس از ادغام PR #36)

```
flagViolation()          ← اوراکل
  → ViolationFlagged     ← رویداد
  → emergencyLockActive  ← قفل اضطراری (TR-01/02/03)

signViolation()          ← اعضای دادگاه
  → signaturesCount ≥ 7
  → _activateTrigger()
  → TriggerProtocol.executeTrigger()
     → blockedFromTreasury[offender] = true
     → ITreasury(treasury).blockAddressByTrigger(offender)  ✅ فراخوانی می‌شود
     → TriggerActivated (رویداد)
     → TriggerExecuted (رویداد)
```

**نتیجه:** مقام خطاکار پس از فعال‌سازی تریگر **در همان تراکنش** از دسترسی مالی محروم می‌شود. الزام "خودکار" منشور برآورده شده است.

> **رفتار پیش از PR #36 (تاریخی):**  
> `Treasury.blockAddressByTrigger()` هرگز فراخوانی نمی‌شد. مقام خطاکار دسترسی مالی داشت تا زمانی که انسان مداخله کند.

---

## ۳. رفتار مطلوب

```
_activateTrigger()
  → TriggerProtocol.executeTrigger(violatingAddress)
     → _revokeOfficialAccess()
     → ITreasury(treasuryAddress).blockAddressByTrigger(violatingAddress)  ← افزودنی
     → TriggerActivated (رویداد)
```

**الزامات:**
- `blockAddressByTrigger(address)` باید در رابط خزانه‌داری وجود داشته باشد
- فقط `TriggerProtocol` یا `KERNEL_ROLE` مجاز به فراخوانی باشند
- فراخوانی باید در همان تراکنش `executeTrigger()` انجام شود — نه در تراکنش جداگانه
- در صورت عدم وجود خزانه‌داری (آدرس صفر)، باید gracefully رد شود یا revert کند

---

## ۴. گزینه‌های پیاده‌سازی ایمن

### گزینه الف — رابط مستقیم (توصیه‌شده)

```
interface ITreasury {
    function blockAddressByTrigger(address target) external;
}
```

`TriggerProtocol` آدرس خزانه‌داری را در constructor دریافت می‌کند.  
`executeTrigger()` پس از `_revokeOfficialAccess()` آن را فراخوانی می‌کند.

**مزایا:** ساده، قابل آزمون، بدون وابستگی دایره‌ای  
**معایب:** خزانه‌داری باید پیش از `TriggerProtocol` deploy شده باشد

---

### گزینه ب — رویداد + Executor خارجی

`TriggerProtocol` رویداد `TreasuryBlockRequired(address)` منتشر می‌کند.  
یک قرارداد Executor مجزا رویداد را رصد و مسدودسازی را انجام می‌دهد.

**مزایا:** جداسازی نگرانی‌ها  
**معایب:** تراکنش جداگانه — "خودکار بودن" را در همان بلاک تضمین نمی‌کند — **با منشور ناسازگار**

---

### گزینه ج — Push از Kernel به Treasury مستقیم

`kernel.sol` مستقیماً `ITreasury.blockAddressByTrigger()` را صدا می‌زند.

**مزایا:** کوتاه‌ترین مسیر  
**معایب:** Kernel باید آدرس خزانه‌داری را بداند — وابستگی در هسته — ریسک معماری بالاتر

---

## ۵. گزینه توصیه‌شده

**گزینه الف** — رابط مستقیم از طریق `TriggerProtocol`.

دلایل:
- هسته (kernel) بدون تغییر باقی می‌ماند
- `TriggerProtocol` مسئول اجرا است — جداسازی نگرانی‌ها حفظ می‌شود
- در همان تراکنش اجرا می‌شود — الزام "خودکار" منشور را تأمین می‌کند
- قابل آزمون به صورت مستقل

---

## ۶. آزمون‌های لازم پیش از پیاده‌سازی

| شناسه تست | توضیح |
|-----------|--------|
| T-TG01-01 | پس از `executeTrigger()` آدرس مسدود شده باشد |
| T-TG01-02 | فراخوانی `blockAddressByTrigger()` در همان تراکنش انجام شده باشد |
| T-TG01-03 | فقط `TriggerProtocol` مجاز به فراخوانی `blockAddressByTrigger()` باشد |
| T-TG01-04 | در صورت آدرس خزانه‌داری صفر — رفتار مشخص (revert یا skip) |
| T-TG01-05 | مسدودسازی برگشت‌ناپذیر بدون تأیید شورا نباشد |
| T-TG01-06 | اجرای مکرر `executeTrigger()` منجر به خرابی حالت نشود |

هدف پوشش تست: حداقل ۹۵٪ (طبق CLAUDE.md)

---

## ۷. اعلام غیرادعا

- این سند پیاده‌سازی را کامل نمی‌کند
- TG-01 را نمی‌بندد
- Step 12 یا Step 13 را نمی‌بندد
- جایگزین حسابرسی امنیتی (Slither / Mythril / Echidna) نیست
- جایگزین بررسی انسانی متخصصان Solidity نیست
- آمادگی تولید اعلام نمی‌کند

</div>
