<div dir="rtl">

# نگاشت رفاه و عدالت — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** رفاه و عدالت  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `signoff`، `policy`، `allocation` و نام فایل‌ها

یادداشت بازبینی و تعمیق این نگاشت در [WHITEPAPER_WELFARE_JUSTICE_REVIEW_FA.md](WHITEPAPER_WELFARE_JUSTICE_REVIEW_FA.md) ثبت شده است.

## ۱. هدف

این سند سومین نگاشت تفصیلی گام ۱۳ است و فقط workstream «رفاه و عدالت» را پوشش می‌دهد. هدف آن اتصال مفاهیم رفاهی و عدالتی منشور/سپیدنامه به مسیر ردیابی repo است:

سپیدنامه/منشور → اصل یا مؤلفه رفاهی/عدالتی → ماژول فنی/حکمرانی → وضعیت اجرا → `evidence/test` → issue/blocker/signoff → اقدام بعدی

این سند هیچ سیاست رفاهی تصویب‌شده، برنامه اجرایی، ظرفیت مالی، حق قانونی جدید، بودجه در دسترس، fiscal feasibility، approval یا signoff ایجاد نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ سیاست رفاهی را تصویب‌شده یا legally adopted ادعا نمی‌کند.
- هیچ برنامه رفاهی را implemented یا operational ادعا نمی‌کند.
- هیچ بودجه، ظرفیت مالی، fiscal feasibility یا امکان پرداخت واقعی را ادعا نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار خزانه، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۳. منابع repo که برای این نگاشت بررسی شدند

- `constitution/constitution-fa.md`
- `whitepaper/README.md`
- `whitepaper/whitepaper-fa.md`
- `contracts/CONTRACT_RUNTIME_MAP.md`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/reports/ARCHITECTURAL_RISK_AND_DOCTRINE_REPORT-v0.1.0-fa.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`
- `README.md`
- testهای مرتبط با `CitizenCard`، `BaseIncome`، `HealthCoverage`، `DisabilitySupport`، `JusticeProtocol`، `JurySelection`، `PenalLabor`، `VictimFund`، `Treasury` و `BudgetAllocation`

## ۴. جدول ردیابی رفاه و عدالت

| اصل یا مؤلفه رفاهی/عدالتی | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | سند/evidence مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| کرامت انسانی و حداقل حمایت اجتماعی | منشور بر کرامت شهروند و سپیدنامه/اسناد repo بر کف حمایت اجتماعی و رفاهی اشاره دارند | `contracts/welfare/`، `CitizenCard`، `BaseIncome`، `HealthCoverage`، `DisabilitySupport` | ماژول و test وجود دارد؛ پرداخت واقعی، enrollment واقعی، یا اجرای اجتماعی production ادعا نمی‌شود | `test/05_citizen_card.test.js`، `test/12_Base_Income.test.js`، `test/13_Health_Coverage.test.js`، `test/14_Disability_Support.test.js` | audit/formal/custody evidence pending در #12، #13، #14 | ادعای entitlement قانونی، پرداخت واقعی، یا برنامه رفاهی اجراشده ممنوع است | تکمیل نگاشت بندهای سپیدنامه به test و تعیین نیازهای evidence اقتصادی/حقوقی |
| عدالت توزیعی | توزیع منابع و حمایت‌ها باید قابل ردیابی و محدود به مسیرهای حکمرانی/بودجه باشد | `SovereignWealthFund`، `Treasury`، `BudgetAllocation`، `Provincial`، welfare modules | بخشی پیاده‌سازی و تست شده؛ مسیر کامل انتقال رفاه از منابع به شهروندان و fiscal feasibility ادعا نمی‌شود | `test/03_sovereign_wealth_fund.test.js`، `test/09_Treasury.test.js`، `test/16_Provincial.test.js`، `test/17_Budget_Allocation.test.js`، گزارش معماری v0.1.0-fa | #12، #13، #14، #17، #19 بسته نشده‌اند | ادعای بودجه در دسترس، پایداری مالی، یا تصویب سیاست توزیعی ممنوع است | نیازمند بازبین اقتصادی و نگاشت دقیق منابع، سقف‌ها، شکاف‌های پرداخت و evidence مالی |
| شفافیت تخصیص منابع | قراردادها و گزارش‌ها مسیرهای بودجه، خزانه و تخصیص را مستند/تست می‌کنند | `Treasury`، `BudgetAllocation`، `contracts/CONTRACT_RUNTIME_MAP.md` | مسیرهای test شده در repo وجود دارد؛ شفافیت production، manifest استقرار یا audit پذیرفته‌شده وجود ندارد | `test/09_Treasury.test.js`، `test/17_Budget_Allocation.test.js`، `docs/reports/STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md` | `STEP9-BLOCK-005` issue #17؛ audit #12 | ادعای شفافیت عملیاتی production یا deployment readiness ممنوع است | تکمیل deployment manifest، dry-run evidence و audit review پیش از هر claim عملیاتی |
| پاسخ‌گویی نهادی در عدالت | فرگردهای منشور درباره دادگستری، منع شکنجه/اعدام، جبران خسارت و دادرسی به ماژول‌های justice وصل می‌شوند | `JusticeProtocol`، `JurySelection`، `PenalLabor`، `VictimFund`، `ConstitutionGuard` | ماژول‌ها و testها وجود دارند؛ اجرای قضایی واقعی یا legal adoption ادعا نمی‌شود | `test/04_constitution_guard.test.js`، `test/07_jury_selection.test.js`، `test/19_Justice_Protocol.test.js`، `test/20-Penal_Labor.test.js`، `test/21_Victim_Fund.test.js` | audit/formal/governance signoff pending در #12، #13، #18 | ادعای اجرای نهایی قضایی، اعتبار قانونی حکم، یا پذیرش حقوقی ممنوع است | نیازمند بازبین حقوقی و نگاشت بندهای دادگستری به شکاف‌های policy و evidence |
| تفکیک سیاست‌گذاری از اجرای فنی | کد و test می‌توانند ظرفیت فنی یا boundary را نشان دهند، اما تصویب سیاست و اجرای اجتماعی جداست | Step-13 docs، Step-12 evidence workflow، `Fargard7PolicyAdapter` doctrine | تفکیک مستند است؛ policy adopted یا downstream execution ادعا نمی‌شود | `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`، `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`، Step-7/Step-12 docs | #18 non-claim preservation؛ #19 release signoff | تبدیل test یا mapping به سیاست مصوب، release approval یا برنامه اجراشده ممنوع است | حفظ زبان non-claim در هر PR رفاه/عدالت و لینک به issueهای blocker مرتبط |
| نیاز به داده/شاخص/evidence | رفاه، سلامت، بودجه و عدالت برای ارزیابی نیازمند داده، شاخص، audit و signoff هستند | oracle docs، budget/welfare/justice tests، Step-12 checklist | testهای repo وجود دارد؛ داده واقعی، شاخص production، oracle ops accepted evidence یا signoff وجود ندارد | `STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`، `STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`، oracle/runbook packets | #15 و #16 برای oracle ops/runbook؛ #12 و #13 برای audit/proof | ادعای adequacy داده، اثبات کفایت شاخص، یا oracle signoff ممنوع است | تعیین شاخص‌های مورد نیاز و evidence packetهای جداگانه برای داده و عملیات |
| نیاز به بازبین اقتصادی/حقوقی/حکمرانی | رفاه و عدالت به بررسی چندرشته‌ای نیاز دارند، نه صرفاً test فنی | intake plan و Step-12 checklist | نیازمند بازبین؛ هیچ reviewer signoff ادعا نشده است | `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`، `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | #12 تا #19 بر حسب حوزه | ادعای expert review یا signoff بدون ثبت معتبر ممنوع است | جذب بازبین اقتصادی، حقوقی و حکمرانی و ثبت review در issue/packet مربوط |
| محدودیت non-claim رفاهی | نگاشت رفاه/عدالت نباید به claim اجرای سیاست، entitlement، بودجه یا readiness تبدیل شود | README، roadmap، Step-12 non-claim packet، Step-13 mapping docs | non-claim ثبت شده؛ acceptance و signoff همچنان pending هستند | `README.md`، `docs/IRAN_OS_ROADMAP.md`، `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | `STEP9-BLOCK-008` issue #18 | ادعای «سیاست رفاهی اجرا شد»، «حق قانونی ایجاد شد»، یا «بودجه فراهم است» ممنوع است | بازبینی هر تکمیل آتی برای حفظ non-claim و ثبت نیازهای evidence/signoff |

## ۵. شکاف‌های رفاه و عدالت که هنوز باید تکمیل شوند

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| تصویب حقوقی سیاست‌های رفاهی | ثبت نشده | repo سند فنی/نگاشت دارد، نه قانون مصوب یا adoption حقوقی | نیازمند review حقوقی و سند جداگانه در صورت ارائه evidence معتبر |
| اجرای برنامه رفاهی در production | ثبت نشده | testهای قرارداد جایگزین اجرای اجتماعی، enrollment، پرداخت واقعی یا عملیات production نیستند | نیازمند deployment evidence، custody، audit، oracle ops و release signoff |
| ظرفیت مالی و fiscal feasibility | ثبت نشده | اسناد repo ظرفیت‌ها و ثابت‌ها را توصیف می‌کنند، اما توان پرداخت واقعی یا پایداری بودجه را اثبات نمی‌کنند | نیازمند بازبین اقتصادی، داده منابع، سناریوی بودجه و evidence قابل بررسی |
| مسیر پرداخت کامل از منابع به شهروندان | بخشی/نیازمند تکمیل | گزارش معماری به شکاف مسیر پرداخت رفاهی و SWF-to-citizen اشاره می‌کند | نگاشت بعدی باید شکاف را بدون claim اجرا یا entitlement ثبت کند |
| شواهد پذیرفته‌شده و signoff | ثبت نشده | Step-12 همه evidenceها را draft/pending نگه می‌دارد | issueهای #12 تا #19 باید با packet و signoff معتبر تکمیل شوند |

## ۶. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به سند repo، test، issue یا blocker مشخص وصل باشد.
- وضعیت‌ها با واژه‌های «draft»، «pending»، «بخشی»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند نگاشت بعدی» نوشته شوند.
- هیچ entitlement، بودجه، ظرفیت مالی، برنامه رفاهی اجراشده، policy adopted، legal adoption، release approval، accepted evidence یا reviewer signoff اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing و oracle signals non-sovereign باقی بمانند.

</div>
