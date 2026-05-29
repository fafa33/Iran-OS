<div dir="rtl">

# تصمیم Passthrough کرنل TG-01 — گام ۳۸

**نوع سند:** documentation-only / design decision  
**وضعیت:** باز؛ TG-01 بسته یا حل‌شده اعلام نمی‌شود.  
**هد:** `5a5167e` | **تست‌ها:** ۴۸۸ passing | **Step 12:** باز | **Step 13:** باز

## non-claim

این سند production readiness، audit، signoff، blocker closure، یا بسته‌شدن Step 12/13 را ادعا نمی‌کند.

---

## تصمیم

**Option D با EOA-as-kernel تست و مستند شد** (commit `52bf1f2`): kernel EOA صریحاً `Treasury.blockAddressByTrigger(offender)` را پس از trigger activation فراخوانی می‌کند. شکاف TG-01 و مسیر Option D هر دو اثبات شدند.

**Kernel passthrough پیاده‌سازی نشد.** دو گزینه بررسی شد:

| گزینه | ریسک |
|-------|------|
| افزودن فراخوانی Treasury به `_activateTrigger()` | P0 — اگر Treasury revert کند، `signViolation()` بلوک می‌شود و مکانیسم trigger قانون اساسی از کار می‌افتد |
| افزودن فراخوانی Treasury به `executeTrigger()` | P0 — همان مسیر revert؛ `try/catch` ضروری است که خود یک حالت silent failure ایجاد می‌کند |

**توصیه: پیاده‌سازی نشود.** جداسازی فعلی — عمل قانون اساسی (trigger activation) از عمل اداری (Treasury blocking) — طراحی درست‌تری است. سیستم باید در برابر revert قراردادهای downstream مقاوم بماند.

## TG-01 به‌عنوان واقعیت طراحی

TG-01 یک شکاف طراحی مستند است، نه یک نقص. `_activateTrigger()` فاقد `try/catch` است و هر revert در مسیر آن کل فراخوانی `signViolation()` را بلوک می‌کند. افزودن هر external call اضافی بدون `try/catch` این ریسک را تشدید می‌کند.

## شرط تغییر آینده

هر تغییر برای خودکارسازی Treasury blocking نیازمند این موارد است:
- مجوز صریح برای تغییر قرارداد
- audit خارجی
- بازبینی Step 12/13
- تابع مجزا (مثل `kernelBlockTreasury(offender)`) خارج از مسیر trigger activation

</div>
