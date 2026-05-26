<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت قراردادها و adapterها — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** قراردادها و adapterها  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md](WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه gapها، ابهام‌ها، نیازهای evidence/signoff، نیازهای بازبین، ریسک claimهای ممنوع و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت هیچ قرارداد، test یا package را تغییر نمی‌دهد و هیچ blocker، accepted evidence، signoff، deployment readiness، audit completion، formal verification completion، production readiness یا release approval ادعا نمی‌کند. `Fargard7PolicyAdapter` همچنان proposal-only/non-executing و oracle signals همچنان non-sovereign/signal-only هستند.

## ۲. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| سطح قراردادهای موجود | source tree و runtime map ثبت شده‌اند | mapping همه contract surfaces به audit/proof targets هنوز نیازمند تعمیق است | external audit #12 و formal verification #13 | ادعای contract certification یا production readiness ممنوع است | تکمیل contract-to-risk/proof جدول در PRهای کوچک |
| test baseline | `463 passing` به‌عنوان context آمده است | test baseline ممکن است با accepted evidence یا proof اشتباه شود | برای acceptance باید issueهای #12/#13/#17/#18 مسیر خود را طی کنند | تبدیل passing tests به audit complete، proof result یا blocker closure ممنوع است | حفظ تست‌ها به‌عنوان supporting context فقط |
| `Fargard7PolicyAdapter` | proposal-only/non-executing و `executable=false` ثبت شده است | non-interference باید در audit/proof targets دقیق‌تر trace شود | #12 audit، #13 formal verification، #18 non-claim | ادعای adapter execution capability، policy mutation، subsidy/fee/budget mutation ممنوع است | افزودن targetهای audit/proof برای adapter non-execution |
| deployment manifest/dry-run | draft packet وجود دارد اما accepted نیست | deployed address، artifact hash، constructor args و dry-run logs وجود ندارد | #17 deployment evidence و reviewer signoff؛ release #19 بعد از upstream | اختراع address/hash/args یا deploy ready ممنوع است | نگه داشتن deployment claims به‌صورت pending تا packet واقعی |
| external audit | audit prep موجود است | auditor report، finding register و remediation disposition ثبت نشده است | #12 audit evidence و auditor/reviewer signoff | ادعای audit finding، remediation complete یا audit complete ممنوع است | اتصال سطوح قراردادی به audit scope بدون اختراع finding |
| formal verification | prep packet و candidates موجود است | tool output، assumptions accepted و proof artifacts وجود ندارد | #13 proof artifacts و formal reviewer signoff | ادعای proof result یا formal verification complete ممنوع است | تهیه target-to-contract map برای proof بدون claim نتیجه |

## ۳. اقدام‌های بعدی

- دریافت review از بازبین Solidity، معماری runtime، auditor و formal methods.
- تعمیق مرز adapter non-execution و downstream non-interference.
- اتصال هر contract surface به audit/proof/deployment evidence gap.
- حفظ وضعیت «نیازمند تکمیل»، «نیازمند بازبین»، «نیازمند evidence» و «نیازمند signoff».

</div>
