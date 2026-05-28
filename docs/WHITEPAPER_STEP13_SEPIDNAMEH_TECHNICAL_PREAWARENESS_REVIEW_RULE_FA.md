<div dir="rtl">

# قاعده پیش‌آگاهی فنی سپیدنامه برای review معتبر گام ۱۳

**نام فنی:** Step 13 Sepidnameh Technical Pre-Awareness Review Rule  
**نوع سند:** documentation-only / review-entry-condition / canonical-source-rule  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند قاعده‌ای را ثبت می‌کند که از متن واقعی سپیدنامه ناشی می‌شود: پیش از هر review معماری درباره ایران‌اواس، reviewer باید بخش «پیش‌آگاهی: ارکان فنی حاکمیت نوین ایران» و «فرابخش: معماری هسته سخت در لایه صفر» را بخواند و نشان دهد که آن‌ها را فهمیده است.

هدف این سند افزودن ادعای جدید به سپیدنامه نیست؛ هدف این است که پیش‌آگاهی فنی موجود در سپیدنامه به شرط ورود به review معتبر تبدیل شود.

## ۲. اصل پایه

```text
No architecture review without Sepidnameh technical pre-awareness.
No kernel/layer-zero/no-admin/smart-trigger finding without reading and applying the technical pre-awareness section.
```

فارسی:

```text
هیچ review معماری معتبر نیست مگر اینکه reviewer ابتدا پیش‌آگاهی فنی سپیدنامه را خوانده و اعمال کرده باشد.
هیچ finding درباره هسته سخت، لایه صفر، no-admin یا ماشه هوشمند معتبر نیست مگر اینکه reviewer ابتدا بخش پیش‌آگاهی فنی را بررسی کرده باشد.
```

## ۳. عناصر الزامی پیش‌آگاهی فنی

Reviewer باید پیش از هر finding معماری، این عناصر را به‌عنوان چارچوب فهم سیستم ثبت کند:

1. `IranOS` یا سیستم‌عامل ایران به‌عنوان لایه نرم‌افزاری و رابط اجرای دستورات حقوقی منشور؛
2. `National Value Chain` یا زنجیره ارزش ملی به‌عنوان زیرساخت ثبت تغییرناپذیر قوانین، دارایی‌ها و حقوق شهروندی؛
3. `National Wealth Treasury` یا گنجینه/صندوق ثروت ملی به‌عنوان دارایی مشترک ملت و منبع هزینه‌کرد محدود به مسیرهای منشور؛
4. `Layer-Zero Kernel` یا هسته سخت در لایه صفر؛
5. سه ستون hard-coded شامل جایگاه آرتش، فرمول ریاضی ثروت ملی و الگوریتم ماشه؛
6. `Smart Trigger` به‌عنوان سازوکار خودکار برخورد با تخلف از منشور، نه AI خودسر؛
7. `No Admin Access` به‌عنوان حذف دسترسی مدیریتی برای تغییر، حذف یا اصلاح کدهای بنیادین، نه admin پنهان؛
8. ابطال خودکار دستورات ناسازگار با سه ستون بنیادین؛
9. صیانت از منشور و جلوگیری از دست‌اندازی سیاسی یا انسانی آینده.

## ۴. خطاهای تفسیری ممنوع در review معتبر

اگر reviewer بدون بررسی پیش‌آگاهی فنی، یکی از برداشت‌های زیر را مطرح کند، finding معتبر نیست و باید `traditional/partial misunderstanding note` یا `non-canonical-source-checked note` برچسب بخورد:

| برداشت نادرست | تفسیر canonical لازم |
| --- | --- |
| no-admin یعنی admin پنهان یا قدرت نویسنده | no-admin یعنی حذف دسترسی مدیریتی متمرکز برای جلوگیری از دست‌اندازی |
| هسته سخت یعنی تمرکز قدرت | هسته سخت یعنی قفل‌کردن ستون‌های ضدفساد و ضدتصاحب در لایه صفر |
| ماشه هوشمند یعنی AI خودسر | ماشه یعنی اجرای قاعده ازپیش‌تعریف‌شده در برابر تخلف از منشور |
| hard-coded یعنی استبداد فنی | hard-coded یعنی جلوگیری از تغییر سیاسی/انسانیِ ستون‌های بنیادین |
| نویسنده اولیه یعنی صاحب قدرت | authority فقط از مسیر معتبر مشروطه‌ای/مؤسس/عمومی/حکمرانی می‌آید، نه از نویسنده |

## ۵. قاعده برای نقد بیرونی

نقد بیرونی با نظریه‌های سنتی حکمرانی ممنوع نیست، اما باید برچسب درست داشته باشد.

اگر reviewer از چارچوب‌هایی مثل admin governance، discretionary human override، institutional veto، conventional constitutional amendment یا traditional political control استفاده می‌کند، باید صریحاً بنویسد:

```text
This is an external/traditional-framework critique, not an internal Iran-OS defect claim, unless the canonical technical pre-awareness has been checked and the contradiction remains unresolved.
```

فارسی:

```text
این نقد از چارچوب بیرونی/سنتی است و نقص داخلی ایران‌اواس محسوب نمی‌شود، مگر اینکه پیش‌آگاهی فنی canonical بررسی شده باشد و تناقض همچنان حل‌نشده باقی بماند.
```

## ۶. قالب الزامی برای findings معماری آینده

هر finding معماری آینده باید این بخش را داشته باشد:

```yaml
technical_preawareness_check:
  iran_os_checked: true_or_false
  national_value_chain_checked: true_or_false
  national_wealth_treasury_checked: true_or_false
  layer_zero_kernel_checked: true_or_false
  hard_coded_pillars_checked: true_or_false
  smart_trigger_checked: true_or_false
  no_admin_checked: true_or_false
  automatic_invalidation_checked: true_or_false
  external_framework_used: true_or_false
  if_external_framework_used_label_as_external: true_or_false
  internal_defect_claim_allowed: true_or_false
  reason_if_still_unresolved: "required-if-finding-remains"
```

اگر این بخش وجود نداشته باشد، finding معماری فقط draft note است و نباید به defect، blocker، validation failure، alignment failure یا project weakness تبدیل شود.

## ۷. نسبت با AI review

این قاعده برای AI و انسان یکسان است. اگر AI یا انسان این پیش‌آگاهی فنی را نادیده بگیرد، خروجی او برای داوری معماری معتبر نیست.

AI همچنان فقط analyzer / reviewer / risk detector / proposal generator است و هیچ sovereign authority، signoff، accepted evidence یا downstream execution ایجاد نمی‌کند.

## ۸. non-claim نهایی

این سند فقط قاعده ورود به review معماری است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، canonical-source-checked review completion، downstream execution یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
