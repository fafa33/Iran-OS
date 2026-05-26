<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت رفاه و عدالت — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** رفاه و عدالت  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md](WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه gapها، ابهام‌ها، نیازهای evidence/signoff، نیازهای بازبین، ریسک claimهای ممنوع و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت گام ۱۳ را کامل نمی‌کند، گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند، هیچ reviewer signoffای را ادعا نمی‌کند، و هیچ production readiness، release approval، external audit completion یا formal verification completion ایجاد نمی‌کند. `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است و oracle signals همچنان non-sovereign/signal-only هستند.

## ۲. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| کرامت انسانی و حداقل حمایت اجتماعی | به welfare modules و testها وصل شده و non-claim پرداخت واقعی را حفظ می‌کند | مرز میان ظرفیت فنی، entitlement حقوقی و اجرای اجتماعی نیازمند تکمیل است | نیازمند بازبین حقوقی/رفاهی؛ claims اجرایی نیازمند evidence و signoff مرتبط با #12، #13، #14 و در صورت release #19 | ادعای welfare program implementation، پرداخت واقعی، enrollment واقعی یا legal adoption ممنوع است | تفکیک «مستند»، «تست‌شده» و «نیازمند اجرای اجتماعی» در تکمیل بعدی |
| عدالت توزیعی و منابع | به SWF، Treasury، BudgetAllocation و Provincial وصل شده است | مسیر کامل resource-to-welfare و ظرفیت مالی روشن نیست | نیازمند evidence اقتصادی/مالی و بازبین؛ برای deployment/release به #17 و #19 وابسته است | ادعای بودجه، revenue، treasury balance، fiscal feasibility یا پایداری مالی ممنوع است | اتصال شکاف منابع به نگاشت اقتصاد و منابع و issueهای evidence |
| عدالت قضایی و جبران خسارت | به JusticeProtocol، JurySelection، PenalLabor و VictimFund وصل شده است | اعتبار حقوقی/قضایی production و adoption قانونی ثبت نشده است | نیازمند بازبین حقوقی/قانون اساسی؛ audit/proof evidence در #12 و #13 | ادعای اجرای قضایی نهایی، حکم معتبر production یا legal adoption ممنوع است | ثبت شکاف‌های حقوقی جدا از شکاف‌های فنی و ارجاع به بازبین حقوقی |
| شفافیت تخصیص رفاهی | به Treasury/BudgetAllocation و Step-12 evidence مسیر دارد | شفافیت تست‌شده با شفافیت production و audit accepted یکی نیست | نیازمند audit/deployment evidence در #12 و #17 و signoff مربوط | تبدیل test/docs به accepted evidence یا operational transparency ممنوع است | برجسته کردن مرز supporting tests و accepted evidence |
| داده و شاخص رفاه/عدالت | به oracle/runbook و evidence checklist ارجاع دارد | داده واقعی، شاخص production و oracle ops signoff وجود ندارد | نیازمند #15 oracle operations، #16 oracle runbook، و در صورت audit/proof #12/#13 | ادعای data adequacy، oracle signoff یا شاخص اثبات‌شده ممنوع است | تعریف شاخص‌ها و منبع داده به‌عنوان gap، نه evidence accepted |
| non-claim رفاهی | mapping claimهای رفاهی را محدود کرده است | هر تکمیل آینده ممکن است به‌صورت ضمنی entitlement یا readiness القا کند | نیازمند review non-claim در #18 و در صورت release #19 | ادعای برنامه اجراشده، حق قانونی جدید، release approval یا production readiness ممنوع است | استفاده از review checklist برای هر PR رفاه/عدالت |

## ۳. اقدام‌های بعدی

- دریافت comment از بازبین حقوقی/قانون اساسی و بازبین رفاه درباره مرز حق، سیاست، و اجرای اجتماعی.
- اتصال شکاف‌های مالی و پرداخت واقعی به نگاشت اقتصاد و منابع.
- ارجاع هر claim اجرایی به issueهای #12 تا #19 بدون ادعای closure.
- حفظ وضعیت «نیازمند تکمیل»، «نیازمند بازبین»، «نیازمند evidence» و «نیازمند signoff» برای موارد unresolved.

</div>
