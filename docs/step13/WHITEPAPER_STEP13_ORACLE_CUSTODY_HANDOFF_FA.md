<div dir="rtl">

# تحویل فنی گام ۱۳ برای اوراکل‌ها، نگهداشت کلید و چندامضایی

**نام فنی:** Step 13 Oracle and Custody Handoff  
**نوع سند:** documentation-only / handoff note  
**وضعیت:** باز؛ این سند قرارداد جدید، الگوریتم نهایی، evidence پذیرفته‌شده یا signoff ایجاد نمی‌کند.

## ۱. هدف

این سند یک پل کاری میان گام ۱۳ و گام ۱۲ است.

در گام ۱۳، سپیدنامه به سیستم، issueها، شواهد و شکاف‌ها وصل می‌شود. در گام ۱۲، evidence و signoff برای blockerهای تولیدی بررسی می‌شود.

موضوعاتی مثل چندامضایی، نگهداشت کلید، quorum، اوراکل‌ها، feederها، تازگی داده، انحراف داده و الگوریتم تجمیع سیگنال‌ها باید قبل از هر پیاده‌سازی یا ادعای تولید، به‌صورت شفاف به issueهای evidence و signoff وصل شوند.

## ۲. این سند چه چیزی نیست؟

این سند:

- قرارداد Solidity جدید نیست.
- پیاده‌سازی multisig نیست.
- الگوریتم نهایی oracle aggregation نیست.
- سند production readiness نیست.
- audit یا formal verification کامل‌شده نیست.
- evidence پذیرفته‌شده نیست.
- reviewer signoff نیست.
- Step 12 یا Step 13 را نمی‌بندد.

`Fargard7PolicyAdapter` همچنان proposal-only / non-executing است و oracle signals همچنان signal-only / non-sovereign هستند.

## ۳. مسیرهای اصلی handoff

| حوزه | پرسش اصلی | issue مرتبط | وضعیت |
| --- | --- | --- | --- |
| نگهداشت نقش‌ها و کلیدها | چه کسی چه کلیدی را نگه می‌دارد و با چه حدود اختیاری؟ | #14 | pending / needs evidence |
| چندامضایی و quorum | چه تصمیم‌هایی چندامضایی می‌خواهند و حد نصاب چگونه تعریف می‌شود؟ | #14 | pending / needs spec |
| چرخش و بازیابی کلید | اگر کلید از دست رفت یا compromise شد، مسیر پاسخ چیست؟ | #14 | pending / needs runbook |
| عملیات اوراکل | feederها، registry، freshness، staleness و monitoring چگونه تعریف می‌شوند؟ | #15 | pending / needs evidence |
| runbook اوراکل | onboarding، suspension، invalidation، stale-data و deviation review چگونه انجام می‌شود؟ | #16 | pending / needs runbook |
| تجمیع داده و سیگنال | داده‌های چند منبع چگونه جمع، وزن‌دهی، رد، محدود یا فقط به‌صورت signal استفاده می‌شوند؟ | #15، #16، #18 | pending / needs spec/review |
| حفظ non-claim | هیچ سیگنال یا اوراکلی نباید اختیار حاکمیتی مستقل ایجاد کند. | #18 | pending / needs review |

## ۴. نیازهای بعدی برای نگهداشت کلید و چندامضایی

برای مسیر custody و multisig، موارد زیر باید در آینده به‌صورت spec یا evidence روشن شوند:

- نقشه نقش‌ها و اختیارات
- signer list یا نقش‌های امضاکننده
- حد نصاب quorum برای هر نوع تصمیم
- تفاوت نقش اجرایی، نقش بازبین، نقش اضطراری و نقش release
- برنامه چرخش کلید
- مسیر onboarding و offboarding
- مسیر پاسخ به کلید compromise شده
- حدود اختیار human freeze یا emergency authority
- اثبات اینکه هیچ اختیار جدیدی بدون review و signoff ایجاد نشده است

همه این موارد به #14 وصل می‌شوند و تا زمان ثبت evidence و signoff معتبر، بسته یا پذیرفته محسوب نمی‌شوند.

## ۵. نیازهای بعدی برای اوراکل‌ها و تجمیع داده

برای مسیر oracle و aggregation، موارد زیر باید در آینده روشن شوند:

- feeder registry
- data-source attestation
- freshness window
- staleness rule
- deviation threshold
- invalidation rule
- liveness monitoring
- dispute یا review path برای داده مشکوک
- روش تجمیع داده‌ها، بدون تبدیل اوراکل به اختیار حاکمیتی مستقل
- تفکیک signal از execution
- نقش governance review در پذیرش یا رد سیگنال

این موارد به #15 و #16 وصل می‌شوند. هر بخش که به خطر ادعای حاکمیتی یا اجرای خودکار مربوط شود، باید به #18 هم وصل شود.

## ۶. خط قرمز الگوریتم تجمیع داده

الگوریتم تجمیع داده در Iran-OS نباید به معنی اجرای خودکار سیاست، بودجه، توقیف، mint، freeze، subsidy، fee یا governance action باشد.

اوراکل فقط سیگنال می‌دهد. تصمیم حاکمیتی، اگر روزی وارد مسیر production شود، باید از مسیر governance، evidence، signoff و محدودیت‌های سپیدنامه عبور کند.

بنابراین هر formula یا aggregation rule آینده باید این مرز را حفظ کند:

داده → سیگنال → review → تصمیم مجاز انسانی/حکمرانی

نه:

داده → اجرای خودکار حاکمیتی

## ۷. خروجی مورد انتظار بعدی

گام بعدی بعد از این handoff، کدنویسی فوری نیست. خروجی درست بعدی یکی از این‌هاست:

- spec کوتاه برای custody و multisig
- spec کوتاه برای oracle aggregation و signal-only boundary
- issue comment یا review note برای وصل‌کردن این handoff به #14، #15، #16 و #18
- دریافت نظر بازبین درباره اینکه آیا این handoff با روح سپیدنامه سازگار است یا نه

## ۸. non-claim نهایی

این سند فقط مسیر کار را روشن می‌کند. هیچ blocker بسته نشده، هیچ evidence پذیرفته نشده، هیچ signoff گرفته نشده، هیچ production readiness یا release approval ادعا نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
