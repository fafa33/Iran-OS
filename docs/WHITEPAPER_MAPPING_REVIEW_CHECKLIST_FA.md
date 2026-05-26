<div dir="rtl">

# چک‌لیست بازبینی نگاشت‌های گام ۱۳

**نوع سند:** review checklist  
**وضعیت:** باز؛ چک‌لیست بازبینی برای نگاشت‌های draft، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `audit`، `formal verification`، `signoff`، `review` و نام فایل‌ها

## ۱. هدف

این سند چک‌لیست بازبینی برای ۸ workstream نگاشت‌شده‌ی گام ۱۳ است. هدف آن این است که بازبین‌ها بدانند برای هر نگاشت چه نوع review، چه evidence/signoff احتمالی، چه claimهای ممنوع و چه اقدام بعدی لازم است.

این سند فقط documentation است. گام ۱۳ را کامل نمی‌کند، گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند، هیچ reviewer signoffای را ادعا نمی‌کند، و هیچ production readiness، release approval، external audit completion یا formal verification completion ایجاد نمی‌کند.

`Fargard7PolicyAdapter` همچنان proposal-only/non-executing است. سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۲. قواعد عمومی بازبینی

هر بازبین باید بررسی کند که:

- مسیر سپیدنامه به repo، test، evidence، issue، blocker یا signoff روشن باشد.
- وضعیت‌ها با واژه‌های محتاطانه مانند «draft mapping»، «نیازمند review»، «نیازمند evidence»، «نیازمند signoff» یا «نیازمند تکمیل» نوشته شده باشند.
- هیچ ادعای unsupported درباره آمادگی تولید، release approval، audit completion، formal verification completion، blocker closure، accepted evidence یا reviewer signoff ایجاد نشده باشد.
- پیشنهادهای editorial از پیشنهادهای سیاسی/حقوقی/فنی substantive جدا شوند.
- هیچ تغییر پیشنهادی معنی سیاسی، حقوقی یا constitutional متن را تضعیف، تشدید یا منحرف نکند.
- هر claim مرتبط با گام ۱۲ به issue یا blocker مربوط وصل باشد.

## ۳. جدول چک‌لیست workstreamها

| workstream | mapping file | reviewer type needed | evidence/signoff needed, if any | forbidden claims | next review action | status |
| --- | --- | --- | --- | --- | --- | --- |
| اصول بنیادین و منشور | `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md`؛ review note: `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_REVIEW_FA.md` | بازبین منشور، بازبین حکمرانی، بازبین حقوقی/قانون اساسی، بازبین امنیتی | در صورت ادعای enforcement یا proof: evidence مربوط به #12، #13 یا #18 و signoff معتبر لازم است | اجرای کامل منشور، formal verification complete، constitutional approval، blocker closure، accepted evidence | بررسی دقت مفهومی، ثبات واژگان و اتصال هر اصل به repo/issue بدون claim تکمیل | draft mapping / needs review |
| ساختار حکمرانی | `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`؛ review note: `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_REVIEW_FA.md` | بازبین حکمرانی، بازبین DAO/multisig، بازبین حقوقی/قانون‌گذاری، بازبین custody | برای governance/custody/release claims: evidence و signoff مربوط به #14، #18، #19 لازم است | governance signoff، custody completion، release approval، production governance ready، blocker closure | بررسی نقش‌ها، authority، محدودیت‌ها و اتصال به issueهای custody/release/non-claim | draft mapping / needs review |
| رفاه و عدالت | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` | بازبین حقوقی/قانون اساسی، بازبین رفاه، بازبین عدالت، بازبین فنی | برای claims اجرایی یا حقوقی: audit/formal/custody evidence و signoff مرتبط با #12، #13، #14 لازم است | real-world enrollment، entitlement operational، اجرای قضایی نهایی، production service readiness، accepted evidence | تفکیک editorial از substantive و بررسی شکاف‌های اجرایی/حقوقی/رفاهی | draft mapping / needs review |
| اقتصاد و منابع | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` | بازبین اقتصادی/رفاهی، بازبین خزانه، auditor، بازبین formal methods | برای budget، revenue، treasury یا feasibility claims: evidence و signoff مرتبط با #12، #13، #17، #19 لازم است | fiscal feasibility ثابت‌شده، بودجه واقعی، treasury operational، resource verified، audit complete، release ready | بررسی اینکه ادعاهای اقتصادی فقط mapping هستند و به evidence/signoff لازم وصل شده‌اند | draft mapping / needs review |
| قراردادها و adapterها | `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md` | بازبین Solidity، بازبین معماری runtime، auditor، بازبین formal verification، بازبین policy layer | audit/proof/deployment evidence مرتبط با #12، #13، #17 و non-claim review #18 لازم است | downstream execution، adapter execution capability، policy mutation، deployment readiness، audit/proof complete | بررسی boundary قراردادها و تأکید دوباره بر proposal-only/non-executing بودن adapter | draft mapping / needs review |
| اوراکل و سیگنال‌ها | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` | بازبین oracle ops، بازبین داده، بازبین governance، بازبین امنیتی/audit | oracle ops/runbook evidence و signoff مربوط به #15 و #16؛ در صورت audit/proof claims #12 و #13 | oracle sovereign authority، oracle signoff، production data validity، freeze/mint/budget/governance خودکار | بررسی feeder/freshness/deviation/runbook traceability و حفظ non-sovereign signal-only boundary | draft mapping / needs review |
| `evidence / audit / signoff` | `docs/WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md` | auditor، بازبین formal verification، release/governance reviewer، بازبین custody و deployment | همه evidence/signoffها وابسته به blocker مربوط #12 تا #19 هستند و هیچ‌کدام accepted فرض نمی‌شوند | accepted evidence، reviewer signoff received، audit complete، formal verification complete، release approved، blocker closed | بررسی اینکه هر مسیر evidence به blocker، issue، reviewer و signoff لازم وصل است | draft mapping / needs review |
| مشارکت عمومی فارسی‌زبان | `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md` | مشارکت‌کننده مستندات فارسی، outreach/community reviewer، بازبین حکمرانی، بازبین حقوقی | مشارکت عمومی به‌تنهایی signoff نیست؛ هر evidence/signoff باید از issueهای #12 تا #19 بگذرد | تبدیل حمایت عمومی به approval، accepted evidence، reviewer signoff، blocker closure یا production readiness | بررسی خوانایی، مسیر مشارکت، تفکیک نقش عمومی از signoff رسمی و ارجاع به outreach گام ۱۲ | draft mapping / needs review |

## ۴. چک‌لیست claimهای ممنوع

در هیچ review، PR، issue یا سند تکمیلی گام ۱۳ نباید بدون evidence و signoff معتبر ادعا شود:

- production readiness
- release approval
- completed external audit
- completed formal verification
- blocker closure
- accepted evidence
- reviewer signoff
- deployment readiness
- custody completion
- oracle operations signoff
- adapter downstream execution
- oracle sovereign authority

## ۵. خروجی مورد انتظار review

خروجی review هر workstream باید یکی از این حالت‌ها باشد:

- پیشنهاد editorial با حفظ معنی سیاسی، حقوقی و فنی.
- پیشنهاد تکمیل traceability به source، docs، test، issue یا blocker.
- ثبت شکاف اجرایی، evidence gap یا signoff gap.
- ارجاع به issue مربوط #12 تا #19 برای evidence/signoff.
- درخواست بازبینی تخصصی بیشتر.

این چک‌لیست هیچ review را complete، accepted یا signed-off اعلام نمی‌کند.

</div>
