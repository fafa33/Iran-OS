<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت اصول بنیادین — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** اصول بنیادین و منشور  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `audit`، `formal verification`، `signoff`، `non-claim` و نام فایل‌ها

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md](WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه شکاف‌ها، نیازهای review، ادعاهای پشتیبانی‌نشده، evidence/signoff موردنیاز و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت گام ۱۳ را کامل نمی‌کند، گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند، هیچ reviewer signoffای را ادعا نمی‌کند، و هیچ production readiness، release approval، external audit completion یا formal verification completion ایجاد نمی‌کند.

`Fargard7PolicyAdapter` همچنان proposal-only/non-executing است. سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۲. دامنه بازبینی

این بازبینی نگاشت اصول بنیادین را در برابر محورهای زیر بررسی می‌کند:

- حاکمیت قانون و مشروطه‌گرایی
- سکولاریسم نهادی
- رفاه و عدالت
- شفافیت و قابلیت ممیزی
- عدم تمرکز و کنترل‌پذیری قدرت
- discipline مربوط به `non-claim`
- proposal-only/non-executing بودن adapter
- non-sovereign/signal-only بودن سیگنال‌های اوراکل

## ۳. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| حاکمیت قانون و مشروطه‌گرایی | به منشور، Kernel، ConstitutionGuard و TriggerProtocol وصل شده و وضعیت «مستند و بخشی پیاده‌سازی/تست شده» دارد | نگاشت بندبه‌بند منشور به سطح اجرا هنوز نیازمند تکمیل است؛ محدوده proof و audit برای هر اصل جدا نشده است | نیازمند evidence و signoff از مسیر #12 external audit و #13 formal verification در صورت ادعای enforcement/proof | ادعای اجرای کامل منشور، تغییرناپذیری اثبات‌شده، constitutional approval یا formal verification complete ممنوع است | تکمیل جدول بندبه‌بند منشور و تعیین audit/proof targets بدون claim تکمیل |
| سکولاریسم نهادی | به منشور، trigger، ConstitutionGuard و BudgetAllocation وصل شده است | دامنه «enforcement کامل» در بودجه، governance و مسیرهای غیرقراردادی روشن نیست و نیازمند بازبین حقوقی/حکمرانی است | نیازمند بازبین و در صورت ادعای پوشش کامل، evidence مرتبط با #12، #13 و non-claim review #18 | ادعای کنترل کامل همه مسیرهای مذهبی/مالی/اداری یا accepted evidence ممنوع است | تفکیک پوشش مستند، پوشش تست‌شده و شکاف اجرایی برای سکولاریسم نهادی |
| رفاه و عدالت | به welfare/justice modules و testهای مرتبط ارجاع دارد و جزئیات را به workstream رفاه و عدالت منتقل می‌کند | مرز میان اصل بنیادین، entitlement حقوقی، اجرای اجتماعی و service production باید روشن‌تر بماند | نیازمند بازبین حقوقی/رفاهی؛ claims اجرایی نیازمند evidence و signoff مرتبط با #12، #13، #14 و در صورت release با #19 | ادعای real-world enrollment، اجرای قضایی نهایی، entitlement operational یا production service readiness ممنوع است | حفظ این سند در سطح اصول و ارجاع جزئیات اجرایی به نگاشت رفاه/عدالت |
| شفافیت و قابلیت ممیزی | به runtime map، Step-8، Step-12 و test baseline وصل شده است | test baseline و مستندات داخلی ممکن است با accepted evidence اشتباه گرفته شوند؛ این مرز باید برجسته‌تر بماند | نیازمند evidence پذیرفته‌شده و signoff مربوط برای هر blocker از #12 تا #19؛ فعلاً همه pending هستند | تبدیل test، docs یا mapping به audit completion، accepted evidence یا blocker closure ممنوع است | افزودن ارجاع مداوم به checklist evidence و تفکیک supporting context از accepted evidence |
| عدم تمرکز و کنترل‌پذیری قدرت | به role boundaries، governance، trigger و custody/release blockers وصل شده است | custody تولیدی، signer registry، quorum و release authority در repo پذیرفته‌شده نیستند | نیازمند evidence و signoff مربوط به #14 custody، #18 non-claim و #19 release | ادعای governance signoff، custody completion، release approval یا کنترل‌پذیری production ممنوع است | اتصال دقیق‌تر role/custody gaps به نگاشت ساختار حکمرانی و evidence/audit/signoff |
| `non-claim` discipline | non-claimها در mapping صریح هستند و Step-12/Step-13 باز مانده‌اند | باید در هر توسعه بعدی نگاشت نیز از claimهای ضمنی جلوگیری شود | نیازمند بازبین non-claim و در صورت پذیرش رسمی، مسیر #18؛ فعلاً signoff ادعا نمی‌شود | production ready، release approved، audit complete، formal verification complete، blocker closed، evidence accepted یا reviewer signoff ممنوع است | استفاده از review checklist برای هر PR و ثبت هر claim حساس در issue مربوط |
| adapter proposal-only/non-executing | mapping مرز non-execution را برای `Fargard7PolicyAdapter` حفظ کرده است | جزئیات non-interference بهتر است در workstream قراردادها/adapterها و formal targets ردیابی شود | نیازمند audit/proof evidence مرتبط با #12 و #13 و non-claim review #18 در صورت ادعای اثبات | ادعای downstream execution، subsidy/fee/wage/budget mutation یا governance execution ممنوع است | ارجاع متقابل به نگاشت قراردادها و adapterها و ثبت نیازهای proof/audit |
| oracle signals non-sovereign/signal-only | mapping تصریح می‌کند اوراکل‌ها authority حاکمیتی ندارند | مسیرهای oracle ops، runbook، feeder registry و data-source attestation در این سند تفصیلی نیستند | نیازمند evidence/signoff مربوط به #15 oracle operations و #16 oracle runbook؛ در صورت audit/proof claims #12 و #13 | ادعای oracle authority برای freeze، mint، burn، transfer، spend، classify، budget، wage، subsidy یا governance ممنوع است | ارجاع شکاف‌های اوراکل به نگاشت اوراکل و سیگنال‌ها و حفظ زبان signal-only |

## ۴. موارد نیازمند بازبینی تخصصی

| مورد | وضعیت | مسیر پیشنهادی |
| --- | --- | --- |
| دقت مفهومی رابطه منشور و Kernel | نیازمند بازبین | بازبین حقوقی/قانون اساسی و بازبین فنی باید سطح «مستند»، «پیاده‌سازی‌شده» و «نیازمند proof» را جدا کنند |
| دامنه سکولاریسم نهادی در بودجه و governance | نیازمند تکمیل | ثبت شکاف‌ها بدون ادعای enforcement کامل و ارجاع به #12، #13 و #18 |
| مرز رفاه/عدالت به‌عنوان اصل و به‌عنوان خدمت اجرایی | نیازمند بازبین | اتصال به نگاشت رفاه و عدالت و پرهیز از ادعای entitlement عملیاتی |
| claims مربوط به شفافیت و ممیزی | نیازمند evidence | تفکیک test/docs از accepted audit evidence در همه ارجاع‌ها |
| معیارهای آینده برای بستن گام ۱۳ | نیازمند signoff آینده | تهیه معیارها در فاز بعد، بدون بستن گام ۱۳ در این یادداشت |

## ۵. اقدام‌های بعدی پیشنهادی

- افزودن PRهای کوچک برای نگاشت بندبه‌بند منشور به source/test/docs/issue.
- دریافت comment از بازبین حقوقی/قانون اساسی درباره دقت مفاهیم حاکمیت قانون، مشروطه سکولار و سکولاریسم نهادی.
- دریافت comment از بازبین فنی درباره مرز پیاده‌سازی‌شده، مستند و شکاف اجرایی.
- اتصال هر gap به issueهای #12 تا #19 فقط به‌عنوان مسیر evidence/signoff، نه closure.
- حفظ ارجاع مداوم به proposal-only/non-executing بودن adapter و non-sovereign/signal-only بودن oracle signals.

## ۶. non-claim

این یادداشت هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- تکمیل گام ۱۳
- بسته‌شدن گام ۱۲
- بسته‌شدن blocker
- پذیرفته‌شدن evidence
- دریافت reviewer signoff
- آمادگی تولید
- تأیید انتشار
- تکمیل حسابرسی بیرونی
- تکمیل formal verification

</div>
