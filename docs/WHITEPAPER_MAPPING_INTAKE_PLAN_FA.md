<div dir="rtl">

# برنامه دریافت و تقسیم کار نگاشت سپیدنامه — گام ۱۳

**نوع سند:** intake / planning  
**وضعیت:** باز؛ برنامه تقسیم کار برای تکمیل تدریجی نگاشت، نه خروجی نهایی گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `audit`، `signoff` و نام فایل‌ها

## ۱. هدف

این سند مسیر دریافت، تقسیم، بازبینی و تکمیل نگاشت سپیدنامه به سیستم را به بخش‌های کوچک و قابل review تقسیم می‌کند. هدف آن است که گام ۱۳ بدون ادعای بیش از حد و بدون بستن گام ۱۲، از یک نگاشت اولیه به یک رجیستر دقیق‌تر و قابل مشارکت برسد.

مسیر نگاشت همچنان این است:

سپیدنامه → اصل/بند → ماژول فنی/حکمرانی → وضعیت اجرا → `evidence/test` → `issue/blocker/signoff`

## ۲. حدود و non-claim

این سند فقط برنامه دریافت و تقسیم کار است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان فقط پیشنهاددهنده و غیر اجرایی است.
- سیگنال‌های اوراکل همچنان غیرحاکمیتی و signal-only هستند.

## ۳. شیوه دریافت تغییرات

هر پیشنهاد برای تکمیل نگاشت باید کوچک و قابل review باشد:

۱. فقط یک workstream یا یک بخش محدود از سپیدنامه را پوشش دهد.  
۲. بند یا فرگرد سپیدنامه را دقیق ذکر کند.  
۳. مسیر فایل‌های repo را با نام دقیق بیاورد.  
۴. وضعیت را با واژه‌های محتاطانه بنویسد: «مستند»، «بخشی پیاده‌سازی شده»، «شکاف اجرایی»، «نیازمند evidence»، یا «نیازمند signoff».  
۵. اگر به production readiness، audit، formal verification، custody، oracle ops، deployment، release، یا non-claim مربوط است، issue یا blocker مربوط را لینک کند.  
۶. از claimهای غیرمجاز مانند «آماده تولید»، «release approved»، «audit complete»، «formal verification complete»، «blocker closed»، «accepted evidence»، یا «reviewer signoff received» استفاده نکند مگر اینکه evidence پذیرفته‌شده و signoff معتبر واقعاً ثبت شده باشد.

## ۴. Workstreamهای گام ۱۳

| workstream | هدف نگاشت | ورودی‌های مورد نیاز از سپیدنامه | خروجی مورد انتظار در repo | وضعیت فعلی | ریسک‌های ادعایی/غیرمجاز | نیاز به بازبین یا مشارکت‌کننده |
| --- | --- | --- | --- | --- | --- | --- |
| اصول بنیادین و منشور | اتصال اصول بنیادین سپیدنامه، فرابخش Kernel، و بندهای منشور به محدودیت‌های سیستم | پیش‌آگاهی، فرابخش Kernel، فرگرد ۱، فرگرد ۱۳، منشور | تکمیل ردیف‌های نگاشت در `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md` و ارجاع به `constitution/constitution-fa.md`، `contracts/kernel.sol`، `contracts/core/ConstitutionGuard.sol`، `contracts/core/TriggerProtocol.sol` | نگاشت تفصیلی draft در `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md` ثبت شده؛ جزئیات بند به بند هنوز کامل نیست | ادعای اجرای کامل منشور، ادعای تغییرناپذیری اثبات‌شده، یا ادعای formal verification کامل ممنوع است | بازبین منشور، بازبین حکمرانی، بازبین امنیتی |
| ساختار حکمرانی | نگاشت مجلس، رأی‌گیری، استان‌ها، بودجه عمومی، و سازوکارهای تصمیم‌گیری | فرگردهای ۱، ۳، ۴، ۵، ۹ و پیوست‌های حکمرانی | ردیف‌های دقیق‌تر برای `Parliament`، `VotingSystem`، `Provincial`، `BudgetAllocation` و اسناد governance | نگاشت تفصیلی draft در `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` ثبت شده؛ production governance، custody evidence و signoff همچنان pending هستند | ادعای governance signoff، release approval، یا custody completion ممنوع است | بازبین governance، مشارکت‌کننده DAO/multisig، reviewer قانون‌گذاری |
| رفاه و عدالت | اتصال حقوق بنیادین، دادگستری، سلامت، درآمد پایه، توان‌خواهان و قربانیان به ماژول‌های اجرایی | فرگردهای ۲، ۶، ۱۰ و بخش‌های رفاهی سپیدنامه | تکمیل نگاشت `CitizenCard`، `BaseIncome`، `HealthCoverage`، `DisabilitySupport`، `JusticeProtocol`، `JurySelection`، `PenalLabor`، `VictimFund` | نگاشت تفصیلی draft در `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` ثبت شده؛ اجرای اجتماعی/production، entitlement حقوقی و fiscal feasibility ادعا نمی‌شود | ادعای real-world enrollment، اجرای قضایی نهایی، یا readiness خدمات عمومی ممنوع است | بازبین رفاه، بازبین حقوقی، مشارکت‌کننده تست و مستندسازی |
| اقتصاد و منابع | نگاشت صندوق ثروت ملی، پهلوی، خزانه، hard cap، velocity fee و reclaim | پیش‌آگاهی، فرگرد ۵، فرگرد ۷، بخش‌های پولی و بودجه‌ای | ردیف‌های دقیق‌تر برای `PahlaviToken`، `Treasury`، `SovereignWealthFund`، `VelocityFee`، `AssetFreeze`، `SovereignCrawler` | نگاشت تفصیلی draft در `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` ثبت شده؛ audit، proof، بودجه واقعی، revenue evidence و fiscal feasibility ادعا نمی‌شود | ادعای ثبات اقتصادی production، پشتوانه واقعی، audit complete یا blocker closure ممنوع است | اقتصاددان فنی، auditor، بازبین formal methods |
| قراردادها و adapterها | تعیین مرز اجرای قراردادها و تفکیک adapterهای غیر اجرایی از ماژول‌های اجرایی | بخش‌های فنی سپیدنامه، Step-7 و Step-8 docs، نگاشت قراردادها | به‌روزرسانی نگاشت برای `contracts/CONTRACT_RUNTIME_MAP.md` و تأکید بر proposal-only بودن `Fargard7PolicyAdapter` | نگاشت تفصیلی draft در `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md` ثبت شده؛ adapter همچنان غیر اجرایی است و deployment/audit/proof evidence پذیرفته نشده است | ادعای downstream execution، سیاست‌گذاری خودکار، subsidy/fee/budget mutation خودکار ممنوع است | بازبین Solidity، بازبین معماری runtime، بازبین policy layer |
| اوراکل و سیگنال‌ها | نگاشت API3، PriceOracle، ProductionOracle و مرز signal-only بودن داده‌ها | فرگرد ۷، فرگرد ۱۲، بخش‌های API3 و oracle در سپیدنامه | ردیف‌های دقیق‌تر برای `API3Oracle`، `PriceOracle`، `ProductionOracle`، issueهای oracle ops و runbook | نگاشت تفصیلی draft در `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` ثبت شده؛ oracle ops evidence و runbook پذیرفته نشده‌اند | ادعای اختیار حاکمیتی اوراکل، freeze/mint/budget خودکار، یا oracle signoff ممنوع است | بازبین oracle ops، بازبین داده، بازبین governance |
| `evidence / audit / signoff` | اتصال هر ادعای نگاشت به evidence، test، issue، blocker و signoff مورد نیاز | Step-8 تا Step-12 reports، issueهای #12 تا #19، draft packetها | تکمیل ستون `evidence/test` و `issue/blocker/signoff` بدون claim پذیرش | نگاشت تفصیلی draft در `docs/WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md` ثبت شده؛ همه packetها draft/pending هستند و هیچ evidence accepted نیست | ادعای accepted evidence، reviewer signoff، audit complete، formal verification complete، release approval یا blocker closure ممنوع است | auditor، formal verification reviewer، release/governance reviewer |
| مشارکت عمومی فارسی‌زبان | تبدیل نگاشت به مسیر قابل فهم برای مشارکت‌کنندگان فارسی‌زبان | سپیدنامه، README، راهنمای مشارکت، outreach فارسی | راهنمای کوچک برای PRهای نگاشت و پیشنهادهای بند به بند در همین سند و لینک از docs | نگاشت تفصیلی draft در `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md` ثبت شده؛ intake عمومی نیازمند مشارکت بیشتر است | تبدیل مشارکت عمومی به signoff رسمی یا evidence accepted ممنوع است | مشارکت‌کننده فارسی‌زبان، ویراستار فنی، reviewer جامعه |

## ۵. ترتیب پیشنهادی تکمیل

۱. اصول بنیادین و منشور  
۲. ساختار حکمرانی  
۳. رفاه و عدالت  
۴. اقتصاد و منابع  
۵. قراردادها و adapterها  
۶. اوراکل و سیگنال‌ها  
۷. `evidence / audit / signoff`  
۸. مشارکت عمومی فارسی‌زبان

این ترتیب الزام‌آور نیست، اما از ادعاهای کلی به سمت نگاشت‌های قابل بررسی و سپس evidence/signoff حرکت می‌کند.

چک‌لیست بازبینی ۸ workstream نگاشت‌شده در `docs/WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md` ثبت شده است. این چک‌لیست برای review است و هیچ evidence، signoff، audit، formal verification، release یا blocker closure را complete یا accepted اعلام نمی‌کند.

### چک‌پوینت rollup workstreamها

در وضعیت فعلی، هر ۸ workstream این intake plan دارای نگاشت draft اولیه است. این وضعیت فقط نشان می‌دهد تقسیم کار اولیه به فایل‌های قابل review تبدیل شده است؛ گام ۱۳ را کامل نمی‌کند، گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند و هیچ reviewer signoffای را ادعا نمی‌کند.

| workstream | mapping file | status | next action |
| --- | --- | --- | --- |
| اصول بنیادین و منشور | `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md` | draft mapping | تکمیل بندبه‌بند و review فارسی/فنی |
| ساختار حکمرانی | `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` | draft mapping | تکمیل traceability governance/custody/release |
| رفاه و عدالت | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` | draft mapping | تکمیل شکاف‌های حقوقی، رفاهی و اجرایی |
| اقتصاد و منابع | `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` | draft mapping | تکمیل resource-to-evidence بدون claim مالی |
| قراردادها و adapterها | `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md` | draft mapping | حفظ adapter proposal-only/non-executing و تکمیل audit/proof targets |
| اوراکل و سیگنال‌ها | `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` | draft mapping | حفظ oracle signal-only/non-sovereign و تکمیل ops/runbook مسیرها |
| `evidence / audit / signoff` | `docs/WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md` | draft mapping | تکمیل evidence/signoff مسیرها بدون claim پذیرش |
| مشارکت عمومی فارسی‌زبان | `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md` | draft mapping | هدایت مشارکت عمومی به issueها و PRهای کوچک |

## ۶. معیار پذیرش برای هر بخش نگاشت

هر بخش پیشنهادی زمانی آماده review است که:

- بند سپیدنامه و مسیر repo مشخص باشد.
- وضعیت اجرا با واژه‌های غیرادعایی ثبت شده باشد.
- اگر شکاف اجرایی وجود دارد، به‌صراحت «شکاف اجرایی» نوشته شود.
- اگر evidence یا signoff لازم است، draft/pending بودن آن حفظ شود.
- Step-12 و Step-13 همچنان open بمانند.
- هیچ blocker، evidence، signoff، audit، formal verification، release یا production claim جدیدی ایجاد نشود.

## ۷. خروجی مورد انتظار

خروجی این intake plan مجموعه‌ای از PRهای کوچک و قابل بررسی است که نگاشت اصلی گام ۱۳ را دقیق‌تر می‌کنند. این سند به‌تنهایی Step-13 را کامل نمی‌کند و هیچ وضعیت production یا release را تغییر نمی‌دهد.

</div>
