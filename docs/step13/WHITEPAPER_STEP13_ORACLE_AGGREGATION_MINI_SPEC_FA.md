<div dir="rtl">

# مینی‌اسپک گام ۱۳ برای تجمیع داده اوراکل و مرز سیگنال

**نام فنی:** Step 13 Oracle Aggregation / Signal-only Mini Spec  
**نوع سند:** documentation-only / mini spec for review  
**وضعیت:** باز؛ این سند الگوریتم نهایی، قرارداد جدید، oracle signoff، evidence پذیرفته‌شده یا اجرای خودکار ایجاد نمی‌کند.

## ۱. هدف

این سند چارچوب اولیه برای بررسی آینده‌ی اوراکل‌ها، feederها، تازگی داده، انحراف داده و تجمیع سیگنال‌ها را مشخص می‌کند.

هدف این نیست که یک الگوریتم نهایی برای production تعریف شود. هدف این است که پیش از هر پیاده‌سازی، review یا signoff، مرز میان داده، سیگنال، بررسی انسانی/حکمرانی و اجرای واقعی روشن باشد.

این سند به issueهای زیر وصل است:

- #15 برای oracle operations packet
- #16 برای oracle operations runbook
- #18 برای حفظ non-claim و جلوگیری از تبدیل سیگنال به اختیار حاکمیتی مستقل
- #12 و #13 فقط در صورتی که audit یا formal verification لازم شود

## ۲. این سند چه چیزی نیست؟

این سند:

- الگوریتم نهایی oracle aggregation نیست.
- قرارداد oracle جدید نیست.
- feeder واقعی معرفی نمی‌کند.
- data source واقعی را تأیید نمی‌کند.
- threshold نهایی تعیین نمی‌کند.
- production readiness نیست.
- oracle signoff نیست.
- accepted evidence نیست.
- downstream execution ایجاد نمی‌کند.
- Step 12 یا Step 13 را نمی‌بندد.

## ۳. اصل بنیادین: oracle فقط سیگنال است

در این پروژه، اوراکل نباید اختیار حاکمیتی مستقل داشته باشد.

یعنی مسیر مجاز چنین است:

داده → سیگنال → review → تصمیم مجاز حکمرانی/انسانی

و مسیر ممنوع چنین است:

داده → اجرای خودکار سیاست، بودجه، freeze، mint، fee، subsidy یا governance action

هر فرمول آینده برای aggregation باید این مرز را حفظ کند.

## ۴. اجزای اولیه اوراکل

| جزء | توضیح | وضعیت |
| --- | --- | --- |
| feeder | منبع یا نقش ارسال داده | تعریف نشده / needs review |
| source attestation | اثبات یا توضیح منبع داده | pending |
| freshness window | بازه زمانی معتبر بودن داده | نهایی نشده |
| staleness rule | قاعده برخورد با داده قدیمی | نهایی نشده |
| deviation rule | قاعده برخورد با داده پرت یا متضاد | نهایی نشده |
| aggregation method | روش ترکیب داده‌های چند منبع | نهایی نشده |
| review path | مسیر بررسی انسانی/حکمرانی سیگنال | pending |
| invalidation path | مسیر رد یا تعلیق سیگنال مشکوک | pending |

## ۵. انواع داده و سیگنال

| نوع داده | مثال مفهومی | ریسک اصلی | وضعیت |
| --- | --- | --- | --- |
| داده قیمت | قیمت، شاخص، نرخ مرجع | دستکاری، تأخیر، deviation | فقط برای review آینده |
| داده تولید | تولید، ظرفیت، موجودی | منبع نامعتبر، تأخیر، overclaim | فقط برای review آینده |
| داده بودجه/منابع | منابع، treasury، allocation signal | تبدیل ناخواسته به اختیار بودجه‌ای | فقط برای review آینده |
| داده رفاهی | نیاز، پوشش، eligibility signal | تبدیل به entitlement اجرایی بدون evidence | فقط برای review آینده |
| داده بحران | incident، emergency، freeze signal | اجرای اضطراری بدون governance | فقط برای review آینده |

هیچ‌کدام از این داده‌ها در این سند به اجرای واقعی وصل نمی‌شوند.

## ۶. چارچوب اولیه aggregation

هر روش آینده برای تجمیع داده باید حداقل این پرسش‌ها را پاسخ دهد:

- چند feeder لازم است؟
- آیا feederها هم‌وزن هستند یا وزن متفاوت دارند؟
- داده قدیمی چگونه رد می‌شود؟
- داده پرت چگونه شناسایی می‌شود؟
- اگر منابع اختلاف شدید داشتند، سیگنال suspend می‌شود یا به review می‌رود؟
- آیا خروجی فقط signal است یا downstream effect دارد؟
- چه کسی خروجی را review می‌کند؟
- چه evidenceای برای پذیرش لازم است؟
- آیا non-claim در #18 بررسی شده است؟

تا قبل از پاسخ به این پرسش‌ها، هیچ aggregation rule نهایی نیست.

## ۷. freshness و staleness

هر داده اوراکل باید نسبت زمانی خود را روشن کند:

| وضعیت داده | معنی | رفتار پیشنهادی برای review آینده |
| --- | --- | --- |
| fresh | داده در بازه اعتبار است | فقط می‌تواند سیگنال بسازد، نه اجرای خودکار |
| near-stale | داده نزدیک به انقضاست | نیازمند احتیاط یا review |
| stale | داده منقضی شده است | نباید برای تصمیم حساس استفاده شود |
| unknown | زمان یا منبع روشن نیست | باید رد یا suspend شود |

بازه‌های زمانی در این سند نهایی نمی‌شوند.

## ۸. deviation و داده پرت

اگر داده‌ها با هم اختلاف شدید داشته باشند، خروجی نباید خودکار اجرا شود.

رفتار امن آینده می‌تواند یکی از این‌ها باشد:

- suspend signal
- flag for review
- require additional feeder
- require human/governance review
- connect to issue #15 یا #16
- check non-claim in #18

این سند هیچ deviation threshold نهایی تعیین نمی‌کند.

## ۹. مرز با Fargard7PolicyAdapter

`Fargard7PolicyAdapter` همچنان proposal-only / non-executing است.

هیچ aggregation خروجی نباید باعث شود که adapter به‌صورت خودکار policy mutation، freeze، mint، budget allocation، fee change یا governance action ایجاد کند.

اگر در آینده خروجی اوراکل به policy layer وصل شود، باید از مسیر review، evidence، signoff و محدودیت‌های سپیدنامه عبور کند.

## ۱۰. نیازهای evidence و signoff

پیش از هر ادعای production یا acceptance، موارد زیر لازم است:

- oracle operations packet در #15
- oracle runbook در #16
- non-claim preservation review در #18
- audit در #12 اگر claim امنیتی یا production مطرح شود
- formal verification در #13 اگر claim رسمی proof مطرح شود

تا زمانی که این‌ها ثبت و پذیرفته نشده‌اند، هیچ evidence یا signoff ادعا نمی‌شود.

## ۱۱. خروجی مورد انتظار بعدی

گام بعدی پس از این mini spec می‌تواند یکی از موارد زیر باشد:

- لینک‌دادن این سند به سند مادر گام ۱۳
- ثبت comment روی issueهای #15، #16 یا #18
- ساخت checklist تفصیلی oracle evidence
- دریافت نظر بازبین oracle/governance درباره signal-only boundary

## ۱۲. non-claim نهایی

این سند فقط چارچوب اولیه برای review آینده است. هیچ feeder واقعی معرفی نشده، هیچ aggregation rule نهایی تصویب نشده، هیچ قرارداد oracle ساخته نشده، هیچ downstream execution فعال نشده، هیچ blocker بسته نشده، هیچ evidence پذیرفته نشده، هیچ signoff گرفته نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
