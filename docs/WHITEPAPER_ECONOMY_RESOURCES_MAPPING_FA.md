<div dir="rtl">

# نگاشت اقتصاد و منابع — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** اقتصاد و منابع  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `signoff`، `policy`، `treasury`، `allocation` و نام فایل‌ها

یادداشت بازبینی و تعمیق این نگاشت در [WHITEPAPER_ECONOMY_RESOURCES_REVIEW_FA.md](WHITEPAPER_ECONOMY_RESOURCES_REVIEW_FA.md) ثبت شده است.

## ۱. هدف

این سند چهارمین نگاشت تفصیلی گام ۱۳ است و فقط workstream «اقتصاد و منابع» را پوشش می‌دهد. هدف آن اتصال مفاهیم اقتصادی، خزانه‌ای، بودجه‌ای و منبعی منشور/سپیدنامه به مسیر ردیابی repo است:

سپیدنامه/منشور → مؤلفه اقتصادی/منبعی → ماژول فنی/حکمرانی → وضعیت اجرا → `evidence/test` → issue/blocker/signoff → اقدام بعدی

این سند هیچ بودجه واقعی، منبع درآمد واقعی، موجودی خزانه، ظرفیت مالی، fiscal feasibility، سیاست اقتصادی تصویب‌شده، برنامه اجرایی، approval یا signoff ایجاد نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ سیاست اقتصادی را تصویب‌شده یا legally adopted ادعا نمی‌کند.
- هیچ سازوکار خزانه، funding یا treasury را operational ادعا نمی‌کند.
- هیچ بودجه، درآمد، treasury balance، fiscal capacity یا fiscal feasibility را ادعا نمی‌کند.
- هیچ برنامه رفاهی/اقتصادی را implemented یا operational ادعا نمی‌کند.
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
- `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`
- `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`
- `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`
- `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md`
- `docs/reports/ARCHITECTURAL_RISK_AND_DOCTRINE_REPORT-v0.1.0-fa.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`
- testهای مرتبط با `PahlaviToken`، `SovereignWealthFund`، `Treasury`، `BudgetAllocation`، `Provincial`، `VelocityFee`، `PriceOracle`، `ProductionOracle`، `AssetFreeze` و `SovereignCrawler`

## ۴. جدول ردیابی اقتصاد و منابع

| مؤلفه اقتصادی/منبعی | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | سند/evidence مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| منابع عمومی و خزانه | منشور و سپیدنامه از خزانه، صندوق ثروت ملی، بودجه و منابع عمومی سخن می‌گویند | `contracts/monetary/`، `Treasury`، `SovereignWealthFund`، `PahlaviToken`، `contracts/CONTRACT_RUNTIME_MAP.md` | ماژول و test وجود دارد؛ treasury readiness، موجودی واقعی یا funding operational ادعا نمی‌شود | `test/02_pahlavi_token.test.js`، `test/03_sovereign_wealth_fund.test.js`، `test/09_Treasury.test.js`، `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md` | audit/formal/custody/deployment evidence pending در #12، #13، #14، #17 | ادعای موجودی خزانه، درآمد واقعی، یا operational funding ممنوع است | تکمیل evidence خزانه‌ای، deployment manifest و بازبینی اقتصادی/مالی |
| شفافیت تخصیص منابع | تخصیص بودجه و منابع باید قابل ردیابی، محدود و قابل ممیزی باشد | `BudgetAllocation`، `Treasury`، `Provincial`، governance docs | مسیرهای فنی و test شده وجود دارند؛ شفافیت production یا audit پذیرفته‌شده ادعا نمی‌شود | `test/09_Treasury.test.js`، `test/16_Provincial.test.js`، `test/17_Budget_Allocation.test.js`، `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` | #12 audit، #17 deployment dry-run، #18 non-claim | ادعای تخصیص اجراشده، بودجه مصرف‌شده، یا readiness خزانه ممنوع است | نگاشت دقیق‌تر هر allocation به سند/test و تعیین evidence مورد نیاز |
| اولویت‌بندی هزینه‌ها | منشور درباره اولویت‌های رفاه، خدمات عمومی، تولید و انضباط مالی صحبت می‌کند | `BudgetAllocation`، `Treasury`، `SovereignWealthFund`، `ProductionOracle` | بخشی/مستند و test شده؛ policy adoption یا برنامه اجرایی ادعا نمی‌شود | `test/17_Budget_Allocation.test.js`، `test/24_Production_Oracle.test.js`، `constitution/constitution-fa.md` | #12، #13، #15، #19 همچنان باز | ادعای policy adopted، fiscal feasibility، یا اجرای اولویت‌بندی ممنوع است | نیازمند بازبین اقتصادی/حقوقی و evidence تصمیم‌گیری حکمرانی |
| نسبت اقتصاد و رفاه/عدالت | منابع اقتصادی در اسناد به رفاه، عدالت توزیعی و خدمات عمومی وصل می‌شوند | `WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`، welfare modules، monetary modules | رابطه مفهومی و بخشی فنی ثبت شده؛ entitlement، پرداخت واقعی یا بودجه در دسترس ادعا نمی‌شود | `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`، testهای welfare و monetary | #12، #13، #14، #17، #19 | ادعای توان پرداخت، حق قانونی جدید، یا برنامه رفاهی اجراشده ممنوع است | تکمیل نگاشت resource-to-welfare بدون claim مالی یا حقوقی |
| تفکیک سیاست اقتصادی از اجرای فنی | کد و test مرزهای فنی را نشان می‌دهند، اما سیاست اقتصادی و تصویب حقوقی جداست | Step-4 docs، Step-7 policy layer، Step-12 non-claim، Step-13 mappings | تفکیک مستند است؛ adopted economic policy یا downstream execution ادعا نمی‌شود | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`، `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | #18 non-claim؛ #19 release signoff | تبدیل mapping یا test به سیاست اقتصادی مصوب یا release approval ممنوع است | حفظ زبان non-claim در تکمیل‌های آتی و لینک هر claim به evidence معتبر |
| داده، شاخص و evidence اقتصادی | قیمت، تولید، بودجه، ذخایر و شاخص‌ها نیازمند داده معتبر و عملیات oracle هستند | `PriceOracle`، `ProductionOracle`، `API3Oracle`، Step-12 oracle packets | test وجود دارد؛ oracle operations evidence و runbook پذیرفته نشده‌اند | `test/23_Price_Oracle.test.js`، `test/24_Production_Oracle.test.js`، `test/09_api3_oracle.test.js`، `STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | #15 oracle ops، #16 oracle runbook، #12 audit | ادعای کفایت داده، منبع درآمد ثابت‌شده، یا oracle signoff ممنوع است | تعیین شاخص‌های اقتصادی، feeder evidence، stale-data rules و reviewer signoff |
| بازبین اقتصادی/مالی/حقوقی/حکمرانی | ادعاهای اقتصادی و منبعی به بررسی تخصصی فراتر از test فنی نیاز دارند | intake plan، governance mapping، Step-12 checklist | نیازمند بازبین؛ هیچ signoff ثبت نشده است | `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`، `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`، `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | issueهای #12 تا #19 بر حسب حوزه | ادعای expert review، legal approval یا financial signoff ممنوع است | جذب بازبین اقتصادی/مالی/حقوقی/حکمرانی و ثبت review قابل ردیابی |
| محدودیت non-claim اقتصادی | نگاشت اقتصاد نباید به claim بودجه، درآمد، خزانه آماده، feasibility یا برنامه اجراشده تبدیل شود | README، roadmap، Step-12 non-claim، Step-13 docs | non-claim ثبت شده؛ acceptance و signoff همچنان pending هستند | `README.md`، `docs/IRAN_OS_ROADMAP.md`، `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | `STEP9-BLOCK-008` issue #18 | ادعای بودجه فراهم، revenue source verified، treasury operational یا feasibility ثابت‌شده ممنوع است | بازبینی همه PRهای آینده برای حفظ non-claim و ثبت نیازهای evidence/signoff |

## ۵. شکاف‌های اقتصاد و منابع که هنوز باید تکمیل شوند

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| بودجه و درآمد واقعی | ثبت نشده | repo اعداد، ثابت‌ها، طراحی و test دارد، اما درآمد واقعی، وصول مالیات یا treasury balance اثبات نمی‌کند | نیازمند evidence مالی، audit، داده منبع و review اقتصادی |
| treasury/funding operational readiness | ثبت نشده | deployment manifest، dry-run، custody و release signoff هنوز پذیرفته نشده‌اند | `STEP9-BLOCK-005` و `STEP9-BLOCK-006` باید با evidence معتبر تکمیل شوند |
| fiscal feasibility | ثبت نشده | feasibility نیازمند مدل اقتصادی، داده و بازبین است؛ test قرارداد کافی نیست | تهیه مدل/سناریوی اقتصادی و review مستقل بدون claim readiness |
| adopted economic policy | ثبت نشده | mapping و docs جایگزین تصویب حقوقی یا governance approval نیستند | نیازمند روند حکمرانی، evidence و signoff جداگانه |
| resource-to-welfare execution | بخشی/نیازمند تکمیل | نگاشت رفاه/عدالت شکاف پرداخت واقعی، entitlement و ظرفیت مالی را حفظ کرده است | تکمیل نگاشت اقتصاد-رفاه با شواهد منابع، نه claim اجرایی |
| accepted evidence و reviewer signoff | ثبت نشده | Step-12 همه evidenceها را draft/pending نگه می‌دارد | issueهای #12 تا #19 باید با packet و signoff معتبر تکمیل شوند |

## ۶. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به سند repo، test، issue یا blocker مشخص وصل باشد.
- وضعیت‌ها با واژه‌های «draft»، «pending»، «بخشی»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند نگاشت بعدی» نوشته شوند.
- هیچ budget، revenue source، treasury balance، fiscal capacity، fiscal feasibility، adopted economic policy، implemented resource allocation، legal guarantee، approval یا signoff اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing و oracle signals non-sovereign باقی بمانند.

</div>
