<div dir="rtl">

# گام ۱۳: نگاشت سپیدنامه به سیستم

**نام گام:** Whitepaper-to-System Mapping  
**دامنه:** سپیدنامه → اصل/بند → ماژول فنی/حکمرانی → وضعیت اجرا → evidence/test → issue/blocker/signoff  
**وضعیت:** باز؛ سند نگاشت و ردیابی، نه سند تأیید نهایی  
**زبان:** فارسی‌محور، با ارجاع‌های فنی انگلیسی در نام فایل‌ها، testها، issueها و blockerها

## ۱. هدف

این سند برای تبدیل سپیدنامه ایران‌اواس به یک سیستم قابل ردیابی ساخته شده است. هر اصل یا بند سپیدنامه باید بتواند به یک یا چند سطح اجرایی وصل شود:

سپیدنامه → اصل/بند → ماژول فنی یا حکمرانی → وضعیت اجرا → evidence/test → issue/blocker/signoff

این نگاشت برای بازبین فارسی‌زبان، مشارکت‌کننده فنی، auditor، بازبین formal verification، و reviewer حکمرانی یک مسیر مشترک می‌سازد تا معلوم باشد هر ادعای سپیدنامه در کجای repo مستند، پیاده‌سازی، تست، یا هنوز باز/نیازمند evidence است.

برای تقسیم کار و دریافت پیشنهادهای کوچک و قابل review، برنامه intake گام ۱۳ در [WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md](WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md) ثبت شده است.

چک‌لیست بازبینی نگاشت‌های گام ۱۳ در [WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md](WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md) ثبت شده است.

خلاصه عمومی فارسی‌محور برای مشارکت‌کنندگان و بازبین‌ها در [WHITEPAPER_MAPPING_COMMUNITY_SUMMARY_FA.md](WHITEPAPER_MAPPING_COMMUNITY_SUMMARY_FA.md) ثبت شده است.

### راهنماها و رجیسترهای کمکی گام ۱۳

برای اینکه مسیر گام ۱۳ برای جامعه فارسی‌زبان، مشارکت‌کنندگان و بازبین‌ها قابل پیدا کردن و قابل پیگیری باشد، اسناد کمکی زیر به این نگاشت وصل می‌شوند:

- راهنمای فارسی بازبینی و ثبت نظر درباره نگاشت سپیدنامه به سیستم: [WHITEPAPER_STEP13_REVIEW_GUIDE_FA.md](WHITEPAPER_STEP13_REVIEW_GUIDE_FA.md)
- جدول اتصال workstreamهای گام ۱۳ به issueهای #12 تا #19: [WHITEPAPER_STEP13_ISSUE_LINKAGE_FA.md](WHITEPAPER_STEP13_ISSUE_LINKAGE_FA.md)
- رجیستر شکاف‌های گام ۱۳: [WHITEPAPER_STEP13_GAP_REGISTER_FA.md](WHITEPAPER_STEP13_GAP_REGISTER_FA.md)
- معیارهای آینده برای بررسی بسته‌شدن گام ۱۳: [WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md](WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md)
- تحویل فنی گام ۱۳ برای اوراکل‌ها، نگهداشت کلید و چندامضایی: [WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md](WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md)
- مینی‌اسپک نگهداشت کلید و چندامضایی: [WHITEPAPER_STEP13_CUSTODY_MULTISIG_MINI_SPEC_FA.md](WHITEPAPER_STEP13_CUSTODY_MULTISIG_MINI_SPEC_FA.md)
- مینی‌اسپک تجمیع داده اوراکل و مرز سیگنال: [WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md](WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md)

این اسناد کمکی فقط برای فهم، ردیابی، بازبینی و مشارکت هستند. آن‌ها گام ۱۲ یا گام ۱۳ را نمی‌بندند و هیچ ادعایی درباره آمادگی تولید، audit کامل، formal verification کامل، بسته‌شدن blocker، پذیرفته‌شدن evidence یا reviewer signoff ایجاد نمی‌کنند.

نخستین نگاشت تفصیلی workstream «اصول بنیادین و منشور» در [WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md](WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md) ثبت شده است.

دومین نگاشت تفصیلی workstream «ساختار حکمرانی» در [WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md](WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md) ثبت شده است.

سومین نگاشت تفصیلی workstream «رفاه و عدالت» در [WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md](WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md) ثبت شده است.

چهارمین نگاشت تفصیلی workstream «اقتصاد و منابع» در [WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md](WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md) ثبت شده است.

پنجمین نگاشت تفصیلی workstream «قراردادها و adapterها» در [WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md](WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md) ثبت شده است.

ششمین نگاشت تفصیلی workstream «اوراکل و سیگنال‌ها» در [WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md](WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md) ثبت شده است.

هفتمین نگاشت تفصیلی workstream «evidence / audit / signoff» در [WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md](WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md) ثبت شده است.

هشتمین نگاشت تفصیلی workstream «مشارکت عمومی فارسی‌زبان» در [WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md](WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md) ثبت شده است.

### چک‌پوینت rollup نگاشت workstreamها

در این چک‌پوینت، هر ۸ workstream برنامه intake گام ۱۳ دارای نگاشت draft اولیه است. این rollup فقط وضعیت ردیابی را ثبت می‌کند و به معنی تکمیل نگاشت سپیدنامه به سیستم نیست.

گام ۱۳ همچنان باز است. گام ۱۲ همچنان باز است. این چک‌پوینت هیچ آمادگی تولید، تأیید انتشار، تکمیل حسابرسی بیرونی، تکمیل formal verification، بسته‌شدن blocker، پذیرفته‌شدن evidence یا reviewer signoff ادعا نمی‌کند. `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است و سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

| workstream | mapping file | status | next action |
| --- | --- | --- | --- |
| اصول بنیادین و منشور | [WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md](WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md) | draft mapping | تکمیل بندبه‌بند و دریافت review بدون claim evidence/signoff |
| ساختار حکمرانی | [WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md](WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md) | draft mapping | تکمیل traceability حکمرانی و اتصال به issueهای custody/release/governance |
| رفاه و عدالت | [WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md](WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md) | draft mapping | تفکیک شکاف‌های اجرایی، حقوقی، رفاهی و evidence موردنیاز |
| اقتصاد و منابع | [WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md](WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md) | draft mapping | تکمیل نگاشت داده/بودجه/منابع بدون ادعای feasibility یا funding |
| قراردادها و adapterها | [WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md](WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md) | draft mapping | ادامه‌ی audit/proof targeting و حفظ adapter non-execution |
| اوراکل و سیگنال‌ها | [WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md](WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md) | draft mapping | تکمیل oracle ops/runbook traceability و حفظ signal-only boundary |
| `evidence / audit / signoff` | [WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md](WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md) | draft mapping | اتصال هر ادعا به evidence، blocker، reviewer و signoff لازم |
| مشارکت عمومی فارسی‌زبان | [WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md](WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md) | draft mapping | هدایت مشارکت فارسی به issueها و PRهای کوچک بدون claim closure |

### چک‌پوینت فاز یک گام ۱۳

فاز یک گام ۱۳ اکنون دارای ۸ نگاشت draft برای workstreamها، rollup نگاشت workstreamها، چک‌لیست بازبینی، و خلاصه عمومی فارسی‌محور برای مشارکت‌کنندگان و بازبین‌ها است. این چک‌پوینت به معنی تکمیل گام ۱۳ یا تکمیل نگاشت سپیدنامه به سیستم نیست.

گام ۱۳ همچنان باز است و وارد فاز بازبینی و تعمیق می‌شود. گام ۱۲ همچنان باز است. این چک‌پوینت هیچ آمادگی تولید، تأیید انتشار، تکمیل حسابرسی بیرونی، تکمیل formal verification، بسته‌شدن blocker، پذیرفته‌شدن evidence یا reviewer signoff ادعا نمی‌کند. `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است و سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

| next-phase item | توضیح | وضعیت |
| --- | --- | --- |
| review/deepen each mapping | بازبینی و تعمیق هر یک از ۸ نگاشت draft بدون ادعای تکمیل | pending |
| collect reviewer comments | گردآوری نظر بازبین‌های فنی، حکمرانی، حقوقی، اقتصادی، audit، formal verification و جامعه فارسی‌زبان | pending |
| connect gaps to issues/evidence | اتصال شکاف‌های هر نگاشت به issueهای #12 تا #19 و evidence/signoff موردنیاز | pending |
| prepare future Step 13 closure criteria | آماده‌سازی معیارهای احتمالی بسته‌شدن آینده‌ی گام ۱۳ بدون بستن آن در این چک‌پوینت | pending |

## ۲. حدود و non-claim

این سند مستندات‌محور است و هیچ قرارداد، test، معماری، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار اوراکل، اختیار freeze، یا رفتار اجرایی `Fargard7PolicyAdapter` را تغییر نمی‌دهد.

این سند هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- آمادگی تولید ادعا نمی‌شود.
- تأیید انتشار ادعا نمی‌شود.
- حسابرسی بیرونی کامل نشده است.
- formal verification کامل نشده است.
- هیچ blocker بسته نشده است.
- هیچ evidence پذیرفته‌شده تلقی نمی‌شود.
- هیچ reviewer signoff ادعا نمی‌شود.
- گام ۱۲ همچنان باز می‌ماند.
- `Fargard7PolicyAdapter` همچنان فقط پیشنهاددهنده و غیر اجرایی است.
- سیگنال‌های اوراکل همچنان غیرحاکمیتی و signal-only هستند.

## ۳. واژه‌نامه وضعیت اجرا

| وضعیت | معنی در این سند |
| --- | --- |
| پیاده‌سازی و تست شده در repo | قرارداد یا test مرتبط در repo وجود دارد؛ این وضعیت به‌تنهایی production readiness یا blocker closure نیست. |
| مستند/طراحی‌شده | سند یا پروتکل وجود دارد، اما اجرای production یا evidence پذیرفته‌شده ادعا نمی‌شود. |
| بخشی/نیازمند تکمیل | سطحی از پیاده‌سازی یا مستندات وجود دارد، اما دامنه کامل سپیدنامه پوشش داده نشده است. |
| proposal-only / غیر اجرایی | مسیر فقط پیشنهاد، توصیه یا design است و downstream execution ندارد. |
| شکاف اجرایی | ادعای سپیدنامه هنوز ماژول اجرایی یا test مستقیم ندارد. |
| evidence pending | برای پذیرش، signoff، audit، proof، custody، deployment، oracle ops یا release evidence هنوز بسته معتبر لازم است. |

## ۴. رجیستر اصلی نگاشت

| سپیدنامه | اصل/بند | ماژول فنی/حکمرانی | وضعیت اجرا | evidence/test | issue/blocker/signoff |
| --- | --- | --- | --- | --- | --- |
| پیش‌آگاهی | ایران‌اواس، زنجیره ارزش ملی، گنجینه ثروت ملی | `contracts/kernel.sol`، `contracts/CONTRACT_RUNTIME_MAP.md`، `contracts/monetary/SovereignWealthFund.sol`، `contracts/monetary/Treasury.sol`، `contracts/monetary/PahlaviToken.sol` | بخشی پیاده‌سازی و تست شده؛ زنجیره ملی production و استقرار واقعی ادعا نمی‌شود | `test/01_kernel.test.js`، `test/02_pahlavi_token.test.js`، `test/03_sovereign_wealth_fund.test.js`، `test/09_Treasury.test.js`، Step-8/Step-12 docs | `STEP9-BLOCK-001` تا `STEP9-BLOCK-008` باز؛ issueهای #12 تا #19 برای evidence/signoff |
| فرابخش Kernel | قفل سه ستون: آرتش غیرسیاسی، فرمول ثروت، ماشه | `contracts/kernel.sol`، `contracts/core/TriggerProtocol.sol`، `contracts/core/ConstitutionGuard.sol`، `protocols/kernel/KERNEL_SPECIFICATION.md` | Kernel/trigger/guard در repo پوشش اجرایی دارند؛ C4I/آرتش production ندارد | `test/01_kernel.test.js`، `test/04_constitution_guard.test.js`، `test/08_Trigger_Protocol.test.js`، `docs/STEP3_RUNTIME_HARDENING_MATRIX.md` | audit و formal verification هنوز کامل نیستند: #12، #13 |
| فرگرد ۱ | سکولاریسم ساختاری، استان‌ها، نمادها، هم‌بست نخبگان | `ConstitutionGuard`، `BudgetAllocation`، `Provincial`، `VotingSystem`، `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md` | بخشی پیاده‌سازی/مستند؛ نمادهای ملی در docs/assets وجود دارد؛ enforcement کامل بودجه مذهبی نیازمند audit/spec تکمیلی است | `test/04_constitution_guard.test.js`، `test/16_Provincial.test.js`، `test/17_Budget_Allocation.test.js`، `test/18_Voting_System.test.js` | evidence/signoff pending؛ #12، #13، #14، #18 |
| فرگرد ۲ | حقوق بنیادین، privacy/ZKP، منع شکنجه/اعدام، آزادی تجمع | `CitizenCard`، `BaseIncome`، `JusticeProtocol`، `PenalLabor`، `ConstitutionGuard`، doctrine docs | هویت/رفاه/دادگستری بخشی پیاده‌سازی شده؛ ZKP production و شبکه آزادی اینترنت شکاف اجرایی دارند | `test/05_citizen_card.test.js`، `test/12_Base_Income.test.js`، `test/19_Justice_Protocol.test.js`، `test/20-Penal_Labor.test.js` | audit/formal/custody evidence pending؛ #12، #13، #14 |
| فرگرد ۳ | نهاد پادشاهی، امضا/داوری، فرماندهی، anti-deadlock | `Parliament`، `VotingSystem`، governance/constitution docs، `protocols/defense-protocol-fa.md` | عمدتاً مستند/حکمرانی؛ اجرای production برای جانشینی، C4I، و دسترسی‌های پادشاهی ادعا نمی‌شود | `test/15_Parliament.test.js`، `test/18_Voting_System.test.js`، docs doctrine | signoff حکمرانی و custody لازم است؛ #14، #18، #19 |
| فرگرد ۴ | قانون‌گذاری، نسخه‌گذاری، بودجه، نقد عمومی | `Parliament`، `VotingSystem`، `BudgetAllocation`، `Treasury` | بخشی پیاده‌سازی و تست شده؛ workflow حقوقی کامل production نیازمند signoff است | `test/15_Parliament.test.js`، `test/17_Budget_Allocation.test.js`، `test/18_Voting_System.test.js`، `test/09_Treasury.test.js` | #12، #13، #14، #19 باز |
| فرگرد ۵ | دولت اجرایی، بودجه، لجستیک، شفافیت | `Treasury`، `BudgetAllocation`، `SovereignWealthFund`، `ProductionOracle` | بودجه/خزانه/SWF بخشی پیاده‌سازی و تست شده؛ لجستیک آرتش production ندارد | `test/03_sovereign_wealth_fund.test.js`، `test/09_Treasury.test.js`، `test/17_Budget_Allocation.test.js`، `test/24_Production_Oracle.test.js` | deployment/custody/oracle evidence pending؛ #14، #15، #17 |
| فرگرد ۶ | دادگستری دیجیتال، داوری، integrity guard، victim economy، penal labor | `JusticeProtocol`، `JurySelection`، `VictimFund`، `PenalLabor`، `AssetFreeze` | لایه‌های اصلی تست دارند؛ اجرای قضایی production و runbook عملیاتی ادعا نمی‌شود | `test/07_jury_selection.test.js`، `test/19_Justice_Protocol.test.js`، `test/20-Penal_Labor.test.js`، `test/21_Victim_Fund.test.js`، `test/06_asset_freeze.test.js` | audit/formal/emergency evidence pending؛ #12، #13، #18 |
| فرگرد ۷ | reclaim، SWF، پهلوی، hard cap، velocity fee، API3، policy layer | `AssetFreeze`، `SovereignCrawler`، `SovereignWealthFund`، `PahlaviToken`، `Treasury`، `VelocityFee`، `PriceOracle`، `API3Oracle`، `Fargard7PolicyAdapter` | مالی/reclaim/oracle بخشی پیاده‌سازی و تست شده؛ `Fargard7PolicyAdapter` proposal-only/non-executing است | `test/02_pahlavi_token.test.js`، `test/03_sovereign_wealth_fund.test.js`، `test/06_asset_freeze.test.js`، `test/11_Velocity_Fee.test.js`، `test/22_Sovereign_Crawler.test.js`، `test/23_Price_Oracle.test.js`، `test/09_api3_oracle.test.js`، `test/25_Step7_Stress.test.js`، `test/26_Step7_PolicyLayer.test.js` | oracle ops و audit/proof pending؛ #12، #13، #15، #16 |
| فرگرد ۸ | اقتدار ملی و آرتش ملی | `protocols/defense-protocol-fa.md`، Kernel/trigger doctrine | عمدتاً مستند/حکمرانی؛ C4I، sentinel، نیروی ذخیره و عملیات نظامی production پیاده‌سازی نشده‌اند | defense protocol، roadmap/doctrine docs | شکاف اجرایی؛ نیازمند governance/security review؛ #12، #13، #18 |
| فرگرد ۹ | مدیریت غیرمتمرکز، fiscal federalism، تنوع فرهنگی | `Provincial`، `BudgetAllocation`، `VotingSystem`، `Parliament`، governance protocol | بخشی پیاده‌سازی و تست شده؛ مشارکت محلی production و داده‌های واقعی ادعا نمی‌شود | `test/16_Provincial.test.js`، `test/17_Budget_Allocation.test.js`، `test/18_Voting_System.test.js`، `test/15_Parliament.test.js` | custody/release/governance signoff pending؛ #14، #18، #19 |
| فرگرد ۱۰ | رفاه، سلامت، کارت رفاه، توان‌خواهان | `CitizenCard`، `BaseIncome`، `HealthCoverage`، `DisabilitySupport` | پیاده‌سازی و تست repo برای سطوح پایه وجود دارد؛ production service یا real-world enrollment ادعا نمی‌شود | `test/05_citizen_card.test.js`، `test/12_Base_Income.test.js`، `test/13_Health_Coverage.test.js`، `test/14_Disability_Support.test.js` | audit/formal/custody evidence pending؛ #12، #13، #14 |
| فرگرد ۱۱ | آموزش، پژوهش، human capital | docs و whitepaper؛ پیوند غیرمستقیم با budget/governance | شکاف اجرایی مستقیم؛ ماژول dedicated آموزش در contracts وجود ندارد | whitepaper، docs/roadmap، BudgetAllocation به‌عنوان ظرفیت عمومی | نیازمند issue/spec آینده؛ Step-12 blocker closure ادعا نمی‌شود |
| فرگرد ۱۲ | محیط زیست، آب، جنگل، انرژی، پسماند | docs و whitepaper؛ پیوند غیرمستقیم با oracle/budget | شکاف اجرایی مستقیم؛ ماژول dedicated environment در contracts وجود ندارد | whitepaper، `ProductionOracle` و `BudgetAllocation` به‌عنوان ظرفیت‌های عمومی | نیازمند issue/spec آینده؛ oracle evidence همچنان pending در #15 و #16 |
| فرگرد ۱۳ | بازنگری، trigger، anti-hijack، blockchain invalidation | `TriggerProtocol`، `ConstitutionGuard`، `Kernel`، `VotingSystem`، doctrine docs | هسته anti-hijack و trigger بخشی پیاده‌سازی/تست شده؛ formal proof کامل نیست | `test/01_kernel.test.js`، `test/04_constitution_guard.test.js`، `test/08_Trigger_Protocol.test.js`، `test/18_Voting_System.test.js`، Step-3/Step-8 docs | formal verification و audit pending؛ #12، #13، #18 |
| پیوست صفر | pre-transition protocol، readiness، deployment | Step-9 تا Step-12 reports، deployment doctrine، evidence packets | مستند/آماده‌سازی؛ dry-run/manifest production پذیرفته نشده است | `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`، `docs/reports/STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md` | `STEP9-BLOCK-005` باز؛ #17 |
| پیوست ۳۶۵ روزه | deployment roadmap و استقرار حکمرانی | roadmap، release doctrine، GitHub evidence workflow | برنامه/مستند؛ release approval ادعا نمی‌شود | `docs/IRAN_OS_ROADMAP.md`، `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`، `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | `STEP9-BLOCK-006` باز؛ #19 |
| فاز صفر / Genesis Call | فراخوان نخبگان و مشارکت متن‌باز | README، contributing، outreach فارسی‌محور | مستند و باز برای مشارکت؛ reviewer signoff ادعا نمی‌شود | `README.md`، `docs/contributing-fa.md`، `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md` | issueهای #12 تا #19 مسیر مشارکت فعلی هستند؛ evidence پذیرفته‌شده ادعا نمی‌شود |

## ۵. نگاشت issue/blocker/signoff فعلی

| blocker | issue | موضوع | وضعیت در گام ۱۳ |
| --- | --- | --- | --- |
| `STEP9-BLOCK-001` | https://github.com/fafa33/Iran-OS/issues/12 | external audit | باز؛ draft packet وجود دارد؛ audit completion و accepted evidence ادعا نمی‌شود. |
| `STEP9-BLOCK-002` | https://github.com/fafa33/Iran-OS/issues/13 | formal verification | باز؛ prep packet وجود دارد؛ formal verification completion ادعا نمی‌شود. |
| `STEP9-BLOCK-003` | https://github.com/fafa33/Iran-OS/issues/14 | custody/key-management | باز؛ production custody و reviewer signoff ادعا نمی‌شود. |
| `STEP9-BLOCK-004` | https://github.com/fafa33/Iran-OS/issues/15 | oracle operations packet | باز؛ oracle ops evidence پذیرفته‌شده ادعا نمی‌شود. |
| `STEP9-BLOCK-005` | https://github.com/fafa33/Iran-OS/issues/17 | deployment dry-run/manifest | باز؛ dry-run/manifest پذیرفته‌شده و deployment readiness ادعا نمی‌شود. |
| `STEP9-BLOCK-006` | https://github.com/fafa33/Iran-OS/issues/19 | release signoff | باز؛ release approval ادعا نمی‌شود. |
| `STEP9-BLOCK-007` | https://github.com/fafa33/Iran-OS/issues/16 | oracle operations runbook | باز؛ runbook پذیرفته‌شده و signoff ادعا نمی‌شود. |
| `STEP9-BLOCK-008` | https://github.com/fafa33/Iran-OS/issues/18 | non-claim preservation | باز؛ non-claim evidence recorded است، اما accepted/signoff/closure ادعا نمی‌شود. |

## ۶. راهنمای مشارکت فارسی‌محور برای تکمیل نگاشت

برای هر پیشنهاد اصلاح یا تکمیل:

۱. بند سپیدنامه را مشخص کنید؛ مثل «فرگرد ۷، بخش ۴۱.۶».  
۲. ماژول فنی/حکمرانی مرتبط را بنویسید؛ اگر ماژول وجود ندارد، آن را «شکاف اجرایی» بنامید.  
۳. evidence یا test موجود را با مسیر فایل ذکر کنید.  
۴. اگر موضوع به production readiness، audit، formal verification، custody، oracle ops، deployment، release، یا non-claim مربوط است، issue مربوط #12 تا #19 را لینک کنید.  
۵. از عبارت‌هایی مثل «blocker بسته شد»، «evidence پذیرفته شد»، «production-ready»، «audit complete»، «formal verification complete»، یا «release approved» استفاده نکنید مگر اینکه evidence پذیرفته‌شده و signoff معتبر واقعاً ثبت و لینک شده باشد.

## ۷. خروجی گام ۱۳

خروجی فعلی گام ۱۳ یک نگاشت قابل ردیابی است، نه تأیید نهایی سیستم. این سند به بازبین‌ها کمک می‌کند از سپیدنامه به کد، test، سند، issue، blocker و signoff مورد نیاز برسند، اما Step-12 را نمی‌بندد و هیچ blocker یا evidence را accepted نمی‌کند.

</div>