<div dir="rtl">

# نگاشت evidence / audit / signoff — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** `evidence / audit / signoff`  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `audit`، `formal verification`، `signoff`، `blocker`، `release` و نام فایل‌ها

یادداشت بازبینی و تعمیق این نگاشت در [WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_REVIEW_FA.md](WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_REVIEW_FA.md) ثبت شده است.

## ۱. هدف

این سند هفتمین نگاشت تفصیلی گام ۱۳ است و فقط workstream «evidence / audit / signoff» را پوشش می‌دهد. هدف آن اتصال ادعاهای سپیدنامه و نگاشت‌های گام ۱۳ به مسیر پذیرش evidence، audit، formal verification، custody، deployment، release و signoff در repo است:

سپیدنامه/نگاشت → ادعای قابل بررسی → evidence موردنیاز → issue/blocker → reviewer/signoff → وضعیت پذیرش → اقدام بعدی

این سند هیچ evidenceای را نمی‌پذیرد، هیچ audit یا formal verificationای را کامل اعلام نمی‌کند، هیچ reviewer signoffای ایجاد نمی‌کند، هیچ blockerای را نمی‌بندد و هیچ production readiness یا release approvalای ادعا نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ auditor report، finding register، proof artifact، custody record، deployment manifest، dry-run log، release approval، council minute یا governance approval را اختراع نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، اختیار اوراکل یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۳. نسبت این نگاشت با گام ۱۲

گام ۱۲ همچنان مرحله‌ی اجرای evidence و تعیین disposition برای blockerهای تولیدی است. این سند فقط نشان می‌دهد هر مسیر evidence/audit/signoff در repo به کدام blocker، issue، evidence لازم و signoff لازم وصل می‌شود.

وضعیت همه‌ی موارد زیر در این نگاشت «نیازمند تکمیل»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند signoff» باقی می‌ماند:

- `STEP9-BLOCK-001`: external audit
- `STEP9-BLOCK-002`: formal verification
- `STEP9-BLOCK-003`: custody/key-management
- `STEP9-BLOCK-004`: oracle operations
- `STEP9-BLOCK-005`: deployment dry-run/manifest
- `STEP9-BLOCK-006`: release signoff
- `STEP9-BLOCK-007`: oracle runbook
- `STEP9-BLOCK-008`: non-claim preservation

## ۴. منابع repo که برای این نگاشت بررسی شدند

- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md`
- `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`
- `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`
- `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`
- `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md`
- `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`
- `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP10_PRODUCTION_READINESS_BLOCKER_RESOLUTION_PLAN.md`
- `docs/reports/STEP11_PRODUCTION_READINESS_EVIDENCE_INTAKE.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`
- `docs/reports/STEP12_FORMAL_VERIFICATION_PREP_PACKET.md`
- `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`

## ۵. جدول ردیابی evidence / audit / signoff

| مؤلفه evidence/audit/signoff | توضیح فارسی | جایگاه در repo | وضعیت فعلی | issue/blocker مرتبط | evidence موردنیاز | signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| external audit | حسابرسی بیرونی باید سطح قراردادها، authority، runtime invariants، oracle boundary، adapter non-execution و blockerهای تولیدی را بررسی کند | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`، Step-8/Step-9 reports، `contracts/`، `test/` | draft prep وجود دارد؛ نیازمند evidence و نیازمند بازبین؛ audit کامل نیست | `STEP9-BLOCK-001`، issue #12 | audit scope، auditor identity/engagement، final audit report، finding register، remediation/deferral/accepted-risk disposition | external audit coordinator و auditor یا authorized audit reviewer | ادعای audit complete، finding accepted، remediation complete یا blocker closure ممنوع است | دریافت audit packet واقعی و ثبت disposition قابل review |
| formal verification | راستی‌آزمایی رسمی باید proof target، assumptions، tool output و unresolved obligations را مستند کند | `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md`، Step-4/Step-5 invariant docs، Step-8 report | draft prep وجود دارد؛ نیازمند evidence و نیازمند signoff؛ formal verification کامل نیست | `STEP9-BLOCK-002`، issue #13 | proof scope، target list، tool/config record، assumptions، proof artifacts، failed-obligation یا proof-risk disposition | formal methods owner و formal verification reviewer | ادعای formal verification complete، proof success یا risk acceptance بدون artifact ممنوع است | تعیین toolchain و proof targets و دریافت reviewer signoff |
| custody/key-management | نقش‌های privileged باید custodian، signer، quorum، rotation و compromise response داشته باشند | `STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`، Step-9 role custody doctrine | draft packet وجود دارد؛ production custody نیازمند تکمیل است | `STEP9-BLOCK-003`، issue #14 | custody map، signer list، multisig/quorum rules، key rotation، onboarding/offboarding log، compromised-key response | governance operations lead و release council representative یا governance reviewer | ادعای custody complete، key ownership verified یا production readiness ممنوع است | تکمیل custody packet با custodianهای واقعی و review حکمرانی |
| oracle operations | عملیات اوراکل باید feeder registry، quorum، freshness، deviation، incident و monitoring را پوشش دهد | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`، oracle/signals mapping | draft packet وجود دارد؛ oracle ops evidence پذیرفته نشده است | `STEP9-BLOCK-004`، issue #15 | feeder registry، quorum config، freshness/staleness config، deviation handling، incident runbook، monitoring evidence | oracle operations lead و governance reviewer | ادعای oracle signoff، production data validity یا oracle authority ممنوع است | تکمیل evidence عملیاتی و حفظ non-sovereign signal-only boundary |
| deployment dry-run/manifest | استقرار نیازمند manifest، artifact hashes، constructor args، dependency address book، role assignments و dry-run verification است | `STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md`، Step-9 deployment doctrine | draft packet وجود دارد؛ deployment readiness ادعا نمی‌شود | `STEP9-BLOCK-005`، issue #17 | deployment manifest، artifact hashes، constructor args، dependency addresses، role assignments، dry-run logs، gas estimates، post-run verification | deployment coordinator و engineering maintainer یا deployment reviewer | اختراع address/hash/args، ادعای deploy ready یا release-ready ممنوع است | تهیه manifest و dry-run واقعی با verification و signoff |
| release signoff | release باید پس از upstream blocker disposition و release council review انجام شود | `STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`، roadmap، Step-12 checklist | prep وجود دارد؛ release approval وجود ندارد | `STEP9-BLOCK-006`، issue #19 | upstream blocker disposition summary، release package hash، signer approvals، release council go/no-go minutes | release council | ادعای release approved، production ready یا council approval ممنوع است | release packet فقط پس از evidence upstream و تصمیم council قابل بررسی است |
| oracle runbook | runbook اوراکل باید onboarding، suspension، stale-data، invalidation، deviation، liveness و signal-only review را پوشش دهد | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`، Step-9 oracle doctrine | نیازمند evidence؛ runbook پذیرفته‌شده ثبت نشده است | `STEP9-BLOCK-007`، issue #16 | feeder/data-source attestations، onboarding procedure، suspension procedure، stale-data/invalidation procedures، deviation review، liveness monitoring، signal-only governance review | oracle operations lead و governance reviewer | ادعای runbook accepted، rehearsal complete یا oracle governance signoff ممنوع است | تهیه runbook تولیدی، rehearsal/evidence و review قابل ردیابی |
| non-claim preservation | non-claim باید مانع claimهای unsupported درباره production، release، audit، proof، evidence و signoff شود | `STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`، `STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`، roadmap | evidence recorded است اما accepted/signoff/closure ادعا نمی‌شود | `STEP9-BLOCK-008`، issue #18 | current roadmap/blocker-register non-claim check، release/handoff non-claim excerpt، governance reviewer confirmation | release coordinator و governance reviewer | ادعای accepted evidence، blocker closed، production ready، audit/proof complete یا release approved ممنوع است | ادامه‌ی non-claim review در هر PR و دریافت signoff معتبر |
| Step-13 mapping traceability | هر نگاشت گام ۱۳ باید به source/test/docs/issues وصل شود، اما جایگزین evidence پذیرفته‌شده نیست | همه‌ی `WHITEPAPER_*_MAPPING_FA.md` | نگاشت‌ها draft هستند؛ Step-13 باز می‌ماند | issueهای #12 تا #19 بر حسب حوزه | مسیر repo، test/evidence reference، blocker linkage، gap statement | بازبین حوزه مربوط؛ signoff رسمی در Step-12/Release جداست | تبدیل mapping به evidence accepted یا reviewer signoff ممنوع است | تکمیل تدریجی نگاشت‌ها با زبان محتاطانه و مسیر evidence مشخص |
| tests as supporting context | testها context فنی و regression evidence می‌دهند، اما audit/proof/signoff را جایگزین نمی‌کنند | `test/`، `package.json`، Step-8/Step-12 reports | baseline repo context وجود دارد؛ accepted external evidence نیست | #12، #13، #17 و #18 بر حسب استفاده | test command output، candidate commit، protected diff status، test-to-claim mapping | reviewer مربوط به audit/proof/deployment/release | ادعای اینکه passing tests blockerها را می‌بندد ممنوع است | استفاده از testها فقط به‌عنوان supporting context در packetهای رسمی |

## ۶. شکاف‌های اصلی evidence / audit / signoff

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| final external audit report | نیازمند evidence | prep packet جایگزین auditor report و finding register نیست | دریافت گزارش حسابرس، register یافته‌ها و disposition معتبر |
| formal proof artifacts | نیازمند evidence | candidate properties و tests جایگزین tool output و assumptions پذیرفته‌شده نیستند | اجرای toolchain، ثبت artifacts و review رسمی |
| custody owner records | نیازمند تکمیل | repo نمی‌تواند custodianها، signerها یا quorum تولیدی را اختراع کند | ثبت signer/custodian واقعی، rotation و compromise response |
| oracle operations/runbook evidence | نیازمند evidence و signoff | feeder registry، source attestations، monitoring و runbook پذیرفته‌شده وجود ندارد | تکمیل packetهای #15 و #16 با بازبین oracle/governance |
| deployment manifest/dry-run | نیازمند تکمیل | هیچ address، artifact hash، constructor args یا dry-run پذیرفته‌شده ثبت نشده است | تولید manifest و dry-run log واقعی در packet جداگانه |
| release council approval | نیازمند signoff | release signoff باید پس از upstream evidence و blocker disposition باشد | تهیه release packet و go/no-go minutes فقط با council decision |
| accepted evidence و reviewer signoff | ثبت نشده | Step-12 همه‌ی evidenceها را draft/pending نگه می‌دارد | دریافت evidence معتبر، review و signoff طبق blocker مربوط |

## ۷. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به blocker، issue، evidence packet، source tree، test یا سند مشخص وصل باشد.
- وضعیت‌ها با واژه‌های «draft»، «pending»، «نیازمند تکمیل»، «نیازمند evidence»، «نیازمند بازبین» یا «نیازمند signoff» نوشته شوند.
- هیچ audit report، proof artifact، custody record، deployment manifest، dry-run log، release approval، accepted evidence، reviewer signoff یا blocker closure اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing باقی بماند.
- oracle signals non-sovereign و signal-only باقی بمانند.

</div>
