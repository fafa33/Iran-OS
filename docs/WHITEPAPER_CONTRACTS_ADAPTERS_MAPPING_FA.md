<div dir="rtl">

# نگاشت قراردادها و adapterها — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** قراردادها و adapterها  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `contracts`، `adapter`، `evidence`، `signoff`، `deployment manifest` و نام فایل‌ها

## ۱. هدف

این سند پنجمین نگاشت تفصیلی گام ۱۳ است و فقط workstream «قراردادها و adapterها» را پوشش می‌دهد. هدف آن اتصال مفاهیم قراردادی و adapterی سپیدنامه/اسناد فنی به مسیر ردیابی repo است:

سپیدنامه/سند فنی → مؤلفه قراردادی یا adapter → جایگاه در repo → وضعیت اجرا → `evidence/test` → issue/blocker/signoff → اقدام بعدی

این سند هیچ deployed address، artifact hash، constructor args، deployment readiness، adapter execution capability، audit finding، proof result، approval یا signoff ایجاد نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- آمادگی deployment را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ deployed address، artifact hash، constructor args، dry-run output، audit finding، proof result یا approval را اختراع نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۳. منابع repo که برای این نگاشت بررسی شدند

- `contracts/`
- `contracts/CONTRACT_RUNTIME_MAP.md`
- `contracts/governance/Fargard7PolicyAdapter.sol`
- `test/`
- `test/26_Step7_PolicyLayer.test.js`
- `README.md`
- `package.json`
- `hardhat.config.js`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`
- `docs/reports/STEP12_FORMAL_VERIFICATION_PREP_PACKET.md`
- `docs/reports/STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`

## ۴. جدول ردیابی قراردادها و adapterها

| مؤلفه فنی / قراردادی | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | سند/evidence مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| قراردادهای هوشمند موجود | سطح قراردادی repo شامل Kernel، core، monetary، governance، welfare، justice، reclaim و oracle است | `contracts/`، `contracts/CONTRACT_RUNTIME_MAP.md`، `contracts/README.md` | source tree و نگاشت runtime موجود است؛ deployment readiness یا audit completion ادعا نمی‌شود | `contracts/CONTRACT_RUNTIME_MAP.md`، `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` | audit #12، formal verification #13، deployment #17 | ادعای deployed address، production readiness یا contract certification ممنوع است | تکمیل نگاشت هر سطح قراردادی به evidence، audit scope و proof target |
| پوشش تست و وضعیت `463 passing` | test suite فعلی رفتارهای repo را در Hardhat پوشش می‌دهد | `test/`، `package.json`، Step-12 prep packets | `npm test` در این checkpoint برابر `463 passing` است؛ تست‌ها جایگزین audit/proof/signoff نیستند | `test/`، `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`، `docs/reports/STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | #12 و #13 همچنان pending/open | تبدیل passing tests به accepted evidence، external audit یا formal verification ممنوع است | حفظ test baseline و لینک دادن testها به audit/proof candidates بدون claim تکمیل |
| adapterها و نگاشت سیاست | adapter سطح اتصال سیگنال/تحلیل به پیشنهاد policy است، نه اجرای downstream | `contracts/governance/Fargard7PolicyAdapter.sol`، Step-7 policy tests/docs | adapter موجود است؛ مسیر اجرای downstream یا policy mutation ندارد | `test/26_Step7_PolicyLayer.test.js`، `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md` | #12، #13، #18؛ evidence/signoff pending | ادعای adapter execution capability یا policy adoption ممنوع است | مستندسازی دقیق‌تر مرز adapter و downstream non-interference برای audit/proof |
| `Fargard7PolicyAdapter` proposal-only/non-executing | recommendationها snapshot و review metadata هستند؛ فیلد `executable` در ایجاد recommendation برابر false است | `contracts/governance/Fargard7PolicyAdapter.sol` | proposal-only/non-executing در source و tests پشتیبانی شده؛ signoff رسمی وجود ندارد | `test/26_Step7_PolicyLayer.test.js`، Step-9 doctrine، Step-12 non-claim packet | #18 non-claim؛ #12 audit؛ #13 proof | ادعای executable adapter، subsidy/fee/budget mutation یا release approval ممنوع است | افزودن آن به audit/proof targetهای قابل review و حفظ non-claim |
| deployment dry-run و manifest | deployment نیازمند manifest، constructor args، dependency addresses، role assignments، artifact hashes و dry-run است | `docs/reports/STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md`، Hardhat config | draft evidence packet وجود دارد؛ manifest و dry-run accepted وجود ندارد | `STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md` | `STEP9-BLOCK-005`، issue #17؛ deployment reviewer signoff pending | اختراع deployed addresses، artifact hashes، constructor args یا deployment readiness ممنوع است | تهیه deployment manifest واقعی و dry-run logs فقط در packet جداگانه و با signoff |
| formal verification | proof برای authority، accounting، oracle و adapter non-interference نیازمند tool output و reviewer است | `docs/reports/STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | prep packet و proof candidates وجود دارد؛ proof evidence و signoff وجود ندارد | `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | `STEP9-BLOCK-002`، issue #13 | ادعای formal verification complete یا proof result ممنوع است | تعیین toolchain، targets، assumptions، artifacts و formal reviewer signoff |
| external audit | critical contract surfaces و adapter behavior باید audit شوند | `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` | draft audit prep وجود دارد؛ auditor report، findings و signoff ثبت نشده است | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` | `STEP9-BLOCK-001`، issue #12 | اختراع audit finding، remediation status، auditor approval یا audit completion ممنوع است | دریافت audit scope/report/finding register و reviewer disposition معتبر |
| release approval | release approval پس از blocker disposition، release package hash، signer approvals و council minutes ممکن است بررسی شود | `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`، roadmap | release approval ادعا نشده؛ release signoff pending است | `STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | `STEP9-BLOCK-006`، issue #19 | ادعای release approved، release council decision یا signer approval ممنوع است | تکمیل release packet بعد از upstream evidence، نه از طریق این mapping |
| production readiness | production readiness تا زمان evidence و signoff همه gateها non-claim است | README، roadmap، Step-12 non-claim packet | production readiness ادعا نشده؛ همه blockers مربوط open/pending هستند | `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`، `docs/IRAN_OS_ROADMAP.md` | `STEP9-BLOCK-008`، issue #18 | استفاده از contract/test/mapping برای claim آمادگی تولید ممنوع است | حفظ non-claim در هر PR قراردادی/adapterی و لینک به issueهای Step-12 |

## ۵. شکاف‌های قراردادی و adapterی که هنوز باید تکمیل شوند

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| deployment manifest و dry-run | ثبت نشده/accepted نیست | packet فعلی فقط draft است و address، args، hashes یا dry-run accepted ندارد | `STEP9-BLOCK-005` باید با manifest و logs واقعی تکمیل شود |
| artifact hashes و release package | ثبت نشده | هیچ artifact hash یا release package hash پذیرفته‌شده وجود ندارد | پس از candidate freeze و build reproducibility، evidence جداگانه لازم است |
| formal proof results | ثبت نشده | formal prep packet proof output یا tool config accepted ندارد | `STEP9-BLOCK-002` نیازمند tool output، assumptions و reviewer signoff است |
| external audit findings/disposition | ثبت نشده | audit prep packet auditor report یا finding register ندارد | `STEP9-BLOCK-001` باید audit report و disposition معتبر بگیرد |
| adapter execution capability | عمداً non-executing | repo فعلی فقط proposal/review metadata دارد و نباید downstream execution ادعا شود | هر اجرای آینده نیازمند design، code، tests، audit/proof و non-claim review جداگانه است |
| accepted evidence و reviewer signoff | ثبت نشده | Step-12 همه evidenceها را draft/pending نگه می‌دارد | issueهای #12 تا #19 باید با packet و signoff معتبر تکمیل شوند |

## ۶. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به source tree، test، سند evidence یا issue/blocker مشخص وصل باشد.
- وضعیت‌ها با واژه‌های «draft»، «pending»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند نگاشت بعدی» نوشته شوند.
- هیچ deployed address، artifact hash، constructor args، deployment readiness، adapter execution capability، audit finding، proof result، approval یا signoff اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing و oracle signals non-sovereign باقی بمانند.

</div>
