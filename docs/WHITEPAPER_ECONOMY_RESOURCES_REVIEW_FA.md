<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت اقتصاد و منابع — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** اقتصاد و منابع  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md](WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه gapها، ابهام‌ها، نیازهای evidence/signoff، نیازهای بازبین، ریسک claimهای ممنوع و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت گام ۱۳ و گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند، هیچ reviewer signoffای را ادعا نمی‌کند، و هیچ production readiness، release approval، audit completion یا formal verification completion ایجاد نمی‌کند. `Fargard7PolicyAdapter` proposal-only/non-executing و oracle signals non-sovereign/signal-only باقی می‌مانند.

## ۲. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| منابع عمومی و خزانه | به Treasury، SWF و PahlaviToken وصل شده است | درآمد واقعی، treasury balance، funding و operational readiness ثبت نشده‌اند | نیازمند evidence مالی، custody #14، deployment #17، audit #12 و release #19 | ادعای revenue source، موجودی خزانه، operational funding یا production readiness ممنوع است | افزودن gapهای مالی با وضعیت نیازمند evidence و بازبین اقتصادی |
| شفافیت تخصیص منابع | به BudgetAllocation، Treasury و Provincial متصل است | تخصیص تست‌شده با تخصیص اجراشده یا بودجه مصرف‌شده یکی نیست | audit/deployment evidence در #12 و #17؛ non-claim review در #18 | ادعای تخصیص اجراشده، budget spent یا treasury readiness ممنوع است | تفکیک مسیر contract/test از عملیات production |
| fiscal feasibility | mapping صریحاً feasibility را claim نمی‌کند | مدل اقتصادی، سناریوی درآمد، داده و reviewer مستقل وجود ندارد | نیازمند بازبین اقتصادی/مالی، داده، مدل و signoff معتبر؛ فعلاً pending | ادعای fiscal feasibility ثابت‌شده یا توان پرداخت واقعی ممنوع است | ثبت feasibility به‌عنوان work item آینده، نه نتیجه |
| سیاست اقتصادی و legal adoption | تفکیک سیاست از اجرای فنی حفظ شده است | هیچ adopted economic policy یا approval حکمرانی ثبت نشده است | نیازمند governance process و signoff مرتبط؛ در release با #19 | ادعای policy adopted، legal adoption یا approval ممنوع است | حفظ زبان draft/pending در تکمیل‌های بعدی |
| داده، شاخص و اوراکل | به PriceOracle/ProductionOracle/API3 و oracle blockers وصل شده است | feeder registry، source attestations و runbook پذیرفته‌شده وجود ندارد | #15 oracle ops، #16 oracle runbook، و در صورت proof/audit #12/#13 | ادعای source verified، oracle signoff یا data adequacy ممنوع است | ارجاع شکاف داده به نگاشت اوراکل و packetهای Step-12 |
| نسبت اقتصاد و رفاه | به نگاشت رفاه و عدالت ارجاع دارد | resource-to-welfare execution و capacity مالی روشن نیست | evidence اقتصادی، deployment/custody/release signoff در #14، #17، #19 | ادعای entitlement، payment capacity یا welfare implementation ممنوع است | تکمیل cross-reference اقتصاد-رفاه با gapهای مشخص |

## ۳. اقدام‌های بعدی

- دریافت review از بازبین اقتصادی/مالی و بازبین حکمرانی.
- افزودن نیازهای evidence برای budget، revenue، treasury و feasibility بدون claim.
- اتصال شکاف‌های داده به oracle ops/runbook.
- حفظ وضعیت «نیازمند تکمیل»، «نیازمند بازبین»، «نیازمند evidence» و «نیازمند signoff».

</div>
