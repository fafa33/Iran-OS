<div dir="rtl">

# نگاشت اوراکل و سیگنال‌ها — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** اوراکل و سیگنال‌ها  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `oracle`، `signal-only`، `feeder`، `runbook`، `evidence`، `signoff` و نام فایل‌ها

## ۱. هدف

این سند ششمین نگاشت تفصیلی گام ۱۳ است و فقط workstream «اوراکل و سیگنال‌ها» را پوشش می‌دهد. هدف آن اتصال مفاهیم داده، شاخص، feeder، freshness، deviation، confidence، API3، PriceOracle و ProductionOracle به مسیر ردیابی repo است:

سپیدنامه/سند فنی → داده یا سیگنال اوراکل → ماژول فنی/حکمرانی → وضعیت اجرا → `evidence/test` → issue/blocker/signoff → اقدام بعدی

این سند هیچ feeder registry تولیدی، data-source attestation، oracle runbook پذیرفته‌شده، monitoring evidence، oracle operations signoff، source approval، production address، deployment readiness، audit finding، proof result، approval یا blocker closure ایجاد نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ feeder، data source، operator، custodian، source owner، oracle address، monitoring dashboard یا runbook تولیدی را اختراع نمی‌کند.
- هیچ oracle operations readiness یا oracle runbook acceptance را ادعا نمی‌کند.
- هیچ اختیار حاکمیتی برای اوراکل ایجاد نمی‌کند.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.
- سیگنال‌های اوراکل نمی‌توانند به‌طور مستقل freeze، unfreeze، mint، burn، transfer، spend، classify، subsidize، apply fees، change wages، alter budgets، approve loans، mutate provincial balances یا execute governance انجام دهند.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- آمادگی تولید، تأیید انتشار، تکمیل حسابرسی بیرونی یا تکمیل formal verification ادعا نمی‌شود.

## ۳. منابع repo که برای این نگاشت بررسی شدند

- `contracts/oracles/PriceOracle.sol`
- `contracts/oracles/API3Oracle.sol`
- `contracts/oracles/ProductionOracle.sol`
- `contracts/governance/Fargard7PolicyAdapter.sol`
- `contracts/CONTRACT_RUNTIME_MAP.md`
- `test/09_api3_oracle.test.js`
- `test/23_Price_Oracle.test.js`
- `test/24_Production_Oracle.test.js`
- `test/25_Step7_Stress.test.js`
- `test/26_Step7_PolicyLayer.test.js`
- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`
- `docs/STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md`
- `docs/STEP5_3_RUNTIME_ENFORCEMENT_PLANNING.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`

## ۴. جدول ردیابی اوراکل و سیگنال‌ها

| مؤلفه اوراکل/سیگنال | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | سند/evidence مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| مرز signal-only اوراکل | داده اوراکل ورودی اطلاعاتی و audit/review است، نه اختیار حاکمیتی | Step-4/Step-5/Step-9 doctrine، `contracts/oracles/`، `Fargard7PolicyAdapter` | مرز در docs و tests پشتیبانی شده؛ signoff تولیدی وجود ندارد | `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`، `docs/STEP5_3_RUNTIME_ENFORCEMENT_PLANNING.md`، `test/23_Price_Oracle.test.js`، `test/09_api3_oracle.test.js`، `test/26_Step7_PolicyLayer.test.js` | #15 oracle ops، #16 oracle runbook، #18 non-claim | تبدیل سیگنال به freeze/mint/budget/governance authority ممنوع است | افزودن مرز signal-only به oracle ops review و non-claim checklist |
| `PriceOracle` | اوراکل قیمت، quorum، freshness، invalidation و deviation برای کلیدهایی مانند `PAH_USD`، `USD_GOLD`، `OIL_USD`، `GAS_USD`، `GLOBAL_CPI` و `L2_YIELD_RATE` | `contracts/oracles/PriceOracle.sol` | source و test وجود دارد؛ production feeder set یا operations evidence پذیرفته نشده است | `test/23_Price_Oracle.test.js`، `test/25_Step7_Stress.test.js`، `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | `STEP9-BLOCK-004` issue #15؛ `STEP9-BLOCK-007` issue #16 | ادعای data adequacy، production price validity یا oracle signoff ممنوع است | تکمیل feeder registry، source attestation، stale-data/deviation runbook و monitoring evidence |
| quorum و feeder freshness | `MIN_FEEDERS` و `STALENESS_THRESHOLD` رفتار code-level را مشخص می‌کنند | `PriceOracle`، stress tests | ثابت‌های repo ثبت شده‌اند؛ policy عملیاتی تولیدی و feeder identity وجود ندارد | `test/23_Price_Oracle.test.js`، `test/25_Step7_Stress.test.js`، Step-12 oracle packet | #15 و #16 pending/open | استفاده از quorum تستی به‌عنوان production operations approval ممنوع است | نگاشت feederهای تولیدی، مالک داده، custody و procedure جایگزینی feeder |
| deviation و invalidation | deviation event و invalidation role-gated برای تشخیص و بی‌اعتبارسازی داده مشکوک استفاده می‌شوند | `PriceOracle.submitPrice`، `PriceOracle.invalidatePrice` | test شده؛ runbook عملیاتی و review notes پذیرفته نشده‌اند | `test/23_Price_Oracle.test.js`، Step-9 doctrine، Step-12 oracle packet | #15، #16، #12 | ادعای incident procedure accepted یا automated policy mutation ممنوع است | تهیه deviation review template، invalidation checklist و post-incident evidence |
| `API3Oracle` | پل داده و violation flag با feeder role، data type، confidence و Kernel propagation | `contracts/oracles/API3Oracle.sol` | source و test وجود دارد؛ API3 production ops یا attestation پذیرفته نشده است | `test/09_api3_oracle.test.js`، Step-12 oracle packet | #15، #16، #12، #13 | تبدیل feeder report به اختیار مستقل Kernel، freeze یا governance ممنوع است | ثبت feeder/data-source attestations و atomic failure/replay review برای audit/proof |
| confidence و data type | داده‌ها با type و confidence ثبت می‌شوند، اما confidence به‌تنهایی authority نیست | `API3Oracle.getDataWithConfidence`، docs Step-12 | مستند و قابل خواندن از source؛ production methodology یا source governance ثبت نشده است | `contracts/oracles/API3Oracle.sol`، `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | #15 و #16 | ادعای اعتمادپذیری production یا source approval بدون evidence ممنوع است | تعریف methodology، source-change control و confidence attestation |
| `ProductionOracle` | سیگنال‌های تولید و بهره‌وری، category و eligibilityهای وابسته به نقش | `contracts/oracles/ProductionOracle.sol` | source و test وجود دارد؛ real-world enrollment، data source یا loan/subsidy operations readiness ادعا نمی‌شود | `test/24_Production_Oracle.test.js`، Step-9 doctrine، economy mapping | #12، #13، #15، #16، #18 | ادعای تأیید وام، یارانه واقعی، productivity source verified یا budget mutation ممنوع است | تفکیک داده تولیدی از تصمیم حقوقی/مالی و تهیه source attestation/runbook |
| `Fargard7PolicyAdapter` و سیگنال‌ها | adapter از snapshotهای `GLOBAL_CPI`، `USD_GOLD` و `GAS_USD` برای recommendation استفاده می‌کند | `contracts/governance/Fargard7PolicyAdapter.sol`، `test/26_Step7_PolicyLayer.test.js` | proposal-only/non-executing؛ recommendationها downstream mutation ندارند | contracts/adapters mapping، Step-7 tests، Step-12 non-claim packet | #18 non-claim، #12 audit، #13 formal verification | ادعای اجرای خودکار سیاست، subsidy، fee، wage یا budget change ممنوع است | حفظ adapter non-interference در audit/proof targetها و review checklist |
| oracle operations packet | packet گام ۱۲ شکاف‌های feeder registry، quorum، freshness، deviation، incident و monitoring را جدا می‌کند | `docs/reports/STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | draft؛ not accepted evidence؛ no signoff | Step-12 oracle packet، accepted evidence checklist | `STEP9-BLOCK-004` issue #15 | ادعای blocker closure یا accepted evidence ممنوع است | دریافت evidence واقعی و signoff از oracle operations lead و governance reviewer |
| oracle runbook | runbook باید onboarding، suspension، stale-data، invalidation، deviation، liveness و signal-only review را پوشش دهد | Step-9 doctrine، Step-12 oracle packet | نیازمند evidence؛ runbook پذیرفته‌شده وجود ندارد | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`، `STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | `STEP9-BLOCK-007` issue #16 | ادعای procedure accepted، rehearsal complete یا operator signoff ممنوع است | تهیه runbook production، rehearsal record، owner map و reviewer signoff |
| audit و formal verification اوراکل | oracle behavior باید در audit/proof targets برای quorum، staleness، authority و non-interference بررسی شود | Step-8/Step-12 audit و formal packets | prep وجود دارد؛ audit/proof complete نیست | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`، `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | #12 و #13 | ادعای audit complete یا formal verification complete ممنوع است | تعیین targetهای PriceOracle/API3/ProductionOracle/adapter و ثبت artifact واقعی |

## ۵. شکاف‌های oracle operations و signals که هنوز باید تکمیل شوند

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| production feeder registry | ثبت نشده | source و tests feeder role را نشان می‌دهند، اما feeder identity، custody owner و source ownership تولیدی وجود ندارد | تهیه registry، custody map و governance review |
| data-source attestation | ثبت نشده | هیچ source owner، methodology، source-change control یا confidence attestation پذیرفته‌شده ثبت نشده است | evidence packet مستقل برای data source و feeder attestations |
| stale-data و invalidation runbook | draft/pending | tests رفتار code-level را پوشش می‌دهند، اما procedure عملیاتی و reviewer signoff وجود ندارد | runbook عملیاتی، escalation path و post-action review |
| deviation review | draft/pending | event و tests وجود دارد، اما severity model، review notes و incident disposition پذیرفته نشده است | deviation template، incident log و governance/oracle ops signoff |
| liveness monitoring | ثبت نشده | هیچ dashboard، alert rule، alert history، monitoring owner یا rehearsal evidence ثبت نشده است | monitoring evidence و alert response record |
| oracle-to-policy non-interference | مستند و تست‌شده در سطح repo؛ signoff pending | تست‌ها جایگزین audit/proof/signoff تولیدی نیستند | افزودن non-interference به audit، formal verification و release checklist |
| accepted evidence و reviewer signoff | ثبت نشده | Step-12 همه evidenceها را draft/pending نگه می‌دارد | issueهای #15 و #16، و در صورت ارتباط #12، #13، #18 باید با evidence و signoff معتبر تکمیل شوند |

## ۶. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به source tree، test، سند evidence یا issue/blocker مشخص وصل باشد.
- وضعیت‌ها با واژه‌های «draft»، «pending»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند نگاشت بعدی» نوشته شوند.
- هیچ feeder identity، data source، oracle address، monitoring evidence، runbook acceptance، oracle operations signoff، audit finding، proof result، approval یا blocker closure اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- oracle signals non-sovereign و signal-only باقی بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing باقی بماند.

</div>
