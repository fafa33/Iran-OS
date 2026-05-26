<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت اوراکل و سیگنال‌ها — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** اوراکل و سیگنال‌ها  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md](WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه gapها، ابهام‌ها، نیازهای evidence/signoff، نیازهای بازبین، ریسک claimهای ممنوع و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت گام ۱۳ یا گام ۱۲ را نمی‌بندد، هیچ evidence یا signoff را accepted نمی‌کند، و هیچ oracle authority، production readiness، release approval، audit completion یا formal verification completion ادعا نمی‌کند. oracle signals همچنان non-sovereign/signal-only هستند و `Fargard7PolicyAdapter` proposal-only/non-executing باقی می‌ماند.

## ۲. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| مرز signal-only | مرز غیرحاکمیتی اوراکل صریح است | باید در همه مسیرهای downstream و adapter تکرار و trace شود | #18 non-claim؛ در صورت audit/proof #12/#13 | ادعای oracle sovereign authority یا execution خودکار ممنوع است | افزودن cross-reference به adapter/contract review |
| `PriceOracle` و freshness/quorum | source/test وجود دارد | production feeder set، source ownership و quorum ops policy ثبت نشده است | #15 oracle ops و #16 runbook | ادعای production price validity یا oracle signoff ممنوع است | ثبت feeder registry و stale-data gaps به‌عنوان pending |
| deviation/invalidation | event و role-gated invalidation تست شده‌اند | severity model، review notes و incident runbook پذیرفته‌شده نیستند | #15/#16 و در صورت audit #12 | ادعای incident procedure accepted ممنوع است | تعریف template برای deviation review و invalidation checklist |
| `API3Oracle` و confidence | data type/confidence در source وجود دارد | methodology، source-change control و confidence attestation نداریم | #15/#16؛ proof/audit در #12/#13 | ادعای source approval یا confidence کافی برای authority ممنوع است | ثبت attestation نیازمند evidence |
| `ProductionOracle` | production signals و eligibility paths map شده‌اند | data source، real-world enrollment و loan/subsidy ops readiness وجود ندارد | #15/#16 و مرتبط با #12/#13/#18 | ادعای تأیید وام، یارانه واقعی، productivity verified یا budget mutation ممنوع است | تفکیک data signal از تصمیم مالی/حقوقی |
| oracle runbook | runbook requirement ثبت شده است | onboarding، suspension، liveness، stale-data و signal-only governance review پذیرفته نشده‌اند | #16 oracle runbook و governance reviewer signoff | ادعای runbook accepted یا rehearsal complete ممنوع است | تکمیل runbook evidence packet آینده |

## ۳. اقدام‌های بعدی

- دریافت review از oracle ops، governance و data reviewer.
- اتصال هر feed/signal به feeder/source/runbook evidence gap.
- حفظ non-sovereign/signal-only در همه PRهای آینده.
- حفظ وضعیت «نیازمند تکمیل»، «نیازمند بازبین»، «نیازمند evidence» و «نیازمند signoff».

</div>
