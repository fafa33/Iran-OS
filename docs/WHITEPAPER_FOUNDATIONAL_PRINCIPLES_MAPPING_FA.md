<div dir="rtl">

# نگاشت اصول بنیادین و منشور — گام ۱۳

**workstream:** اصول بنیادین و منشور  
**وضعیت:** draft mapping؛ باز و نیازمند بازبینی  
**زبان:** فارسی‌محور، با ارجاع‌های کوتاه انگلیسی فقط برای نام فایل‌ها، `evidence`، `audit`، `signoff`، issue و blocker

## ۱. هدف

این سند نخستین نگاشت تفصیلی گام ۱۳ برای workstream «اصول بنیادین و منشور» است. هدف آن اتصال اصول بنیادین سپیدنامه و منشور به جایگاه‌های قابل ردیابی در repo است، بدون اینکه تکمیل اجرا، پذیرش evidence، signoff، آمادگی تولید یا تأیید انتشار ادعا شود.

مسیر نگاشت:

سپیدنامه / منشور → اصل بنیادین → جایگاه در سیستم یا repo → وضعیت فعلی → سند یا test مرتبط → issue / blocker / signoff → ریسک ادعایی → اقدام بعدی

## ۲. حدود و non-claim

این سند یک draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را accepted علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only / غیر اجرایی است.
- سیگنال‌های اوراکل همچنان غیرحاکمیتی و signal-only هستند.

## ۳. منابع repo که این نگاشت به آن‌ها تکیه می‌کند

- `constitution/constitution-fa.md`
- `whitepaper/whitepaper-fa.md`
- `whitepaper/README.md`
- `README.md`
- `protocols/kernel/KERNEL_SPECIFICATION.md`
- `protocols/trigger-protocol-fa.md`
- `protocols/governance-protocol-fa.md`
- `contracts/CONTRACT_RUNTIME_MAP.md`
- `docs/IRAN_OS_ROADMAP.md`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`

## ۴. جدول نگاشت اصول بنیادین

| اصل یا بند بنیادین | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | evidence یا سند مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| حاکمیت قانون و مشروطه‌گرایی | منشور، قانون و محدودیت‌های بنیادین باید بالاتر از اشخاص و نهادها باشند. | `constitution/constitution-fa.md`، `whitepaper/whitepaper-fa.md`، `protocols/kernel/KERNEL_SPECIFICATION.md`، `contracts/kernel.sol`، `contracts/core/ConstitutionGuard.sol`، `contracts/core/TriggerProtocol.sol` | مستند و بخشی پیاده‌سازی/تست شده؛ اجرای کامل منشور یا proof کامل ادعا نمی‌شود. | `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`، `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`، `test/01_kernel.test.js`، `test/04_constitution_guard.test.js`، `test/08_Trigger_Protocol.test.js` | `STEP9-BLOCK-001`، `STEP9-BLOCK-002`، issueهای #12 و #13 برای audit و formal verification | ادعای اجرای کامل منشور، تغییرناپذیری اثبات‌شده، audit complete یا formal verification complete ممنوع است. | تکمیل نگاشت بند به بند منشور به Kernel/Guard/Trigger و تعیین proof/audit targets بدون ادعای closure. |
| سکولاریسم نهادی | منشور و سپیدنامه بر جدایی دین از حکومت و منع ردیف/برچسب مذهبی در سیستم تأکید دارند. | `constitution/constitution-fa.md`، `whitepaper/whitepaper-fa.md`، `protocols/trigger-protocol-fa.md`، `contracts/core/ConstitutionGuard.sol`، `contracts/governance/BudgetAllocation.sol` | مستند و بخشی پیاده‌سازی شده؛ enforcement کامل بودجه مذهبی نیازمند نگاشت و review بیشتر است. | `test/04_constitution_guard.test.js`، `test/17_Budget_Allocation.test.js`، `protocols/trigger-protocol-fa.md` با TR-02 | `STEP9-BLOCK-001`، `STEP9-BLOCK-002`، `STEP9-BLOCK-008`؛ issueهای #12، #13، #18 | ادعای کنترل کامل همه مسیرهای مالی/اداری یا پذیرفته‌شدن evidence ممنوع است. | استخراج بندهای سکولاریسم از منشور/سپیدنامه و ثبت سطح پوشش فعلی و شکاف‌های اجرایی. |
| رفاه و عدالت | منشور و سپیدنامه پروژه را به رفاه، حقوق بنیادین، سلامت، عدالت و جبران خسارت پیوند می‌دهند. | `constitution/constitution-fa.md`، `whitepaper/whitepaper-fa.md`، `contracts/welfare/`، `contracts/justice/` | بخشی پیاده‌سازی/تست شده؛ اجرای اجتماعی یا production service ادعا نمی‌شود. | `test/05_citizen_card.test.js`، `test/12_Base_Income.test.js`، `test/13_Health_Coverage.test.js`، `test/14_Disability_Support.test.js`، `test/19_Justice_Protocol.test.js`، `test/21_Victim_Fund.test.js` | `STEP9-BLOCK-001`، `STEP9-BLOCK-002`، `STEP9-BLOCK-003`؛ issueهای #12، #13، #14 | ادعای آمادگی خدمات عمومی، enrollment واقعی، اجرای قضایی نهایی یا reviewer signoff ممنوع است. | انتقال جزئیات رفاه/عدالت به workstream «رفاه و عدالت» و نگهداری این سند در سطح اصول بنیادین. |
| شفافیت و قابلیت ممیزی | repo باید مسیرهای مستند، رخدادها، evidence، test و audit را قابل ردیابی نگه دارد. | `contracts/CONTRACT_RUNTIME_MAP.md`، `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`، `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`، `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md` | مستندات و test baseline وجود دارد؛ audit بیرونی کامل نشده و evidence پذیرفته نشده است. | `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`، `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`، `npm test` baseline: 463 passing | همه `STEP9-BLOCK-001` تا `STEP9-BLOCK-008` باز؛ issueهای #12 تا #19 | تبدیل test baseline یا مستندات داخلی به accepted evidence، audit completion یا blocker closure ممنوع است. | تکمیل ستون‌های `evidence/test` و `issue/blocker/signoff` برای هر اصل بدون تغییر وضعیت پذیرش. |
| عدم تمرکز و کنترل‌پذیری قدرت | هیچ قرارداد یا نهاد منفرد نباید کنترل کامل سیستم را داشته باشد؛ نقش‌ها و emergency boundaries باید قابل audit باشند. | `contracts/CONTRACT_RUNTIME_MAP.md`، `contracts/kernel.sol`، `protocols/governance-protocol-fa.md`، `protocols/trigger-protocol-fa.md` | بخشی مستند و تست شده؛ custody production و governance signoff نداریم. | `test/01_kernel.test.js`، `test/15_Parliament.test.js`، `test/16_Provincial.test.js`، `test/18_Voting_System.test.js`، Step-9/Step-12 reports | `STEP9-BLOCK-003`، `STEP9-BLOCK-006`، `STEP9-BLOCK-008`؛ issueهای #14، #19، #18 | ادعای custody completion، release approval یا governance signoff ممنوع است. | تکمیل نگاشت role/custody و governance boundaries در workstream ساختار حکمرانی. |
| عدم ادعای آمادگی تولید | پروژه تا زمان evidence و signoff معتبر، production readiness را ادعا نمی‌کند. | `README.md`، `docs/IRAN_OS_ROADMAP.md`، Step-10 تا Step-12 reports، Step-13 docs | صراحتاً non-claim ثبت شده؛ Step-12 و Step-13 باز هستند. | `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`، `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | `STEP9-BLOCK-008`، issue #18 | هر عبارت مستقیم یا ضمنی درباره production-ready بودن ممنوع است. | حفظ non-claim در همه PRهای گام ۱۳ و ارجاع به issue #18 برای review. |
| عدم ادعای انتشار یا release approval | تأیید انتشار نیازمند release packet و approval معتبر است و در گام ۱۳ ادعا نمی‌شود. | `README.md`، `docs/IRAN_OS_ROADMAP.md`، `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | release approval ادعا نشده؛ release signoff pending/open است. | `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`، `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | `STEP9-BLOCK-006`، issue #19 | ادعای release approved، release readiness یا go/no-go approval ممنوع است. | هر نگاشت مرتبط با انتشار باید فقط به draft/pending بودن signoff اشاره کند. |
| `Fargard7PolicyAdapter` proposal-only / غیر اجرایی | adapter فقط recommendation/review تولید می‌کند و downstream execution ندارد. | `contracts/governance/Fargard7PolicyAdapter.sol`، `docs/IRAN_OS_ROADMAP.md`، Step-7/Step-8 reports، `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md` | proposal-only/non-executing ثبت شده؛ downstream policy mutation ادعا یا پیاده‌سازی نمی‌شود. | `test/26_Step7_PolicyLayer.test.js`، Step-7/Step-8 roadmap entries | `STEP9-BLOCK-001`، `STEP9-BLOCK-002`، `STEP9-BLOCK-008`; issueهای #12، #13، #18 | ادعای spending، subsidy، fee، wage، budget، classification یا governance execution خودکار ممنوع است. | در workstream قراردادها و adapterها مرز non-execution را دقیق‌تر ثبت کنید. |
| سیگنال‌های اوراکل غیرحاکمیتی | اوراکل‌ها داده و signal می‌دهند، نه اختیار حاکمیتی برای freeze، mint، burn، spend یا governance execution. | `contracts/oracles/`، `protocols/trigger-protocol-fa.md`، `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`، `docs/IRAN_OS_ROADMAP.md` | signal-only/non-sovereign بودن ثبت شده؛ oracle ops evidence و runbook پذیرفته نشده‌اند. | `test/09_api3_oracle.test.js`، `test/23_Price_Oracle.test.js`، `test/24_Production_Oracle.test.js`، Step-12 oracle packets | `STEP9-BLOCK-004`، `STEP9-BLOCK-007`، `STEP9-BLOCK-008`; issueهای #15، #16، #18 | ادعای اختیار مستقل اوراکل برای freeze/unfreeze/mint/burn/transfer/spend/classify/subsidize/fee/wage/budget/governance ممنوع است. | در workstream اوراکل و سیگنال‌ها هر oracle path را جداگانه به signal-only boundary وصل کنید. |

## ۵. شکاف‌های نگاشت که باید جداگانه تکمیل شوند

| شکاف | وضعیت | مسیر پیشنهادی |
| --- | --- | --- |
| نگاشت بند به بند همه اصول منشور | نیازمند تکمیل | PR کوچک برای هر فرگرد منشور یا هر اصل بنیادین |
| تفکیک «مستند» از «پیاده‌سازی‌شده» برای هر اصل | نیازمند بازبین | reviewer فنی و حقوقی باید سطح پوشش را بررسی کند |
| اتصال هر اصل به audit/formal verification target | نیازمند evidence/signoff | issueهای #12 و #13 و Step-8/Step-12 reports |
| تعیین شکاف‌های اجرایی در حوزه‌های غیرقراردادی | نیازمند نگاشت بعدی | ارجاع به workstreamهای governance، welfare، oracle و public participation |

## ۶. معیار review برای این workstream

یک تغییر در این workstream فقط زمانی قابل review است که:

- اصل یا بند بنیادین از سند موجود repo پشتیبانی شود.
- مسیر فایل یا سند مرتبط مشخص باشد.
- وضعیت اجرا با واژه‌های غیرادعایی ثبت شود.
- اگر evidence یا signoff لازم است، pending بودن آن حفظ شود.
- Step-12 و Step-13 همچنان open بمانند.
- هیچ production readiness، release approval، audit completion، formal verification completion، blocker closure، accepted evidence یا reviewer signoff ادعا نشود.

</div>
