<div dir="rtl">

# نگاشت ساختار حکمرانی — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** ساختار حکمرانی  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `evidence`، `signoff`، `release council`، `governance reviewer`، `multisig` و نام فایل‌ها

یادداشت بازبینی و تعمیق این نگاشت در [WHITEPAPER_GOVERNANCE_STRUCTURE_REVIEW_FA.md](WHITEPAPER_GOVERNANCE_STRUCTURE_REVIEW_FA.md) ثبت شده است.

بازبینی ردیابی تفصیلی workstream ۲ (پایه commit `6c4202d`) در [docs/step13/WHITEPAPER_STEP13_WS2_GOVERNANCE_STRUCTURE_TRACEABILITY_REVIEW_FA.md](step13/WHITEPAPER_STEP13_WS2_GOVERNANCE_STRUCTURE_TRACEABILITY_REVIEW_FA.md) ثبت شده است. این بازبینی AI-assisted و documentation-only است و نیازمند review انسانی/حکمرانی است.

## ۱. هدف

این سند دومین نگاشت تفصیلی گام ۱۳ است و فقط workstream «ساختار حکمرانی» را پوشش می‌دهد. هدف آن اتصال مفاهیم حکمرانی سپیدنامه و اسناد repo به مسیر ردیابی زیر است:

سپیدنامه/سند حکمرانی → مؤلفه حکمرانی → جایگاه در repo → وضعیت اجرا → `evidence/signoff` → issue/blocker → اقدام بعدی

این سند نهاد، اختیار قانونی، امضاکننده، تصمیم شورای انتشار، نصاب production، approval یا signoff جدید ایجاد نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ governance approval یا تصمیم شورای انتشار را ادعا یا اختراع نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۳. منابع repo که برای این نگاشت بررسی شدند

- `README.md`
- `docs/IRAN_OS_ROADMAP.md`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`
- `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`
- `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md`
- `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`
- `protocols/governance-protocol-fa.md`
- `contracts/CONTRACT_RUNTIME_MAP.md`

## ۴. جدول ردیابی ساختار حکمرانی

| مؤلفه حکمرانی | توضیح کوتاه فارسی | جایگاه در سیستم / repo | وضعیت فعلی | سند/evidence مرتبط | issue/blocker/signoff مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| شورای انتشار / `release council` | مرجع مورد انتظار برای go/no-go و release approval پس از تعیین تکلیف blockerهای upstream | در Step-9 doctrine و Step-12 release signoff packet به‌عنوان نیاز release ثبت شده است، نه تصمیم انجام‌شده | نیازمند evidence/signoff؛ هیچ تصمیم شورای انتشار ثبت نشده است | `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md`، `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | `STEP9-BLOCK-006`، issue #19؛ release council signoff pending | ادعای release approval، production readiness، یا go/no-go بدون minutes و signer approvals ممنوع است | تهیه release packet واقعی فقط پس از upstream blocker disposition و شواهد پذیرفته‌شده |
| بازبین حکمرانی / `governance reviewer` | نقش بازبینی برای custody، oracle/non-claim، و حفظ مرزهای حکمرانی | در checklist و draft packets به‌عنوان required reviewer آمده است | نیازمند بازبین؛ signoff ثبت نشده است | `STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`، `STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | #14، #18؛ reviewer signoff pending | تبدیل اشاره به «بازبین» به signoff واقعی ممنوع است | تعیین نقش/هویت بازبین در بسته‌های evidence آینده و ثبت signoff معتبر |
| هماهنگ‌کننده انتشار / `release coordinator` | نقش هماهنگی non-claim و release-facing materials پیش از انتشار | در Step-12 non-claim packet برای پذیرش non-claim preservation لازم دانسته شده است | نیازمند تکمیل؛ signoff یا acceptance وجود ندارد | `docs/reports/STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | `STEP9-BLOCK-008`، issue #18 | ادعای پذیرش non-claim یا release readiness بدون release coordinator signoff ممنوع است | تهیه excerptهای handoff/release و دریافت confirmation معتبر |
| نگهداری نقش‌ها و مدیریت کلید / custody/key-management | مستندسازی custodianها، signerها، rotation، offboarding و compromised-key response | Step-9 doctrine و Step-12 custody packet این حوزه را blocker تولید می‌دانند | draft evidence packet وجود دارد؛ production custody evidence وجود ندارد | `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`، `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md` | `STEP9-BLOCK-003`، issue #14؛ governance/release signoff pending | اختراع signer identities، key holders، custody facts، یا approval ممنوع است | تکمیل signer registry، role-to-custodian map، rotation plan، offboarding log و compromise response |
| تأیید امضاکنندگان / signer approvals | approvalهای لازم برای release package، custody و governance-sensitive actions | در release signoff packet به‌صورت placeholder و pending آمده است | هیچ signer approval ثبت نشده است | `docs/reports/STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | `STEP9-BLOCK-006`، issue #19 | ادعای signer approval، timestamp، quorum یا release package hash ممنوع است | ثبت approvals واقعی در release packet آینده، با evidence و reviewer authority |
| چندامضایی و نصاب / `multisig/quorum` | نصاب‌های repo-supported برای برخی مسیرهای contract/doctrine و شکاف production quorum | custody packet به 7 of 9 برای Kernel trigger و 3 of N برای SWF withdrawals به‌عنوان fact مستند اشاره می‌کند؛ production signer registry pending است | factهای کد/دکترین ثبت شده‌اند؛ production quorum/custody evidence کامل نیست | `docs/reports/STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`، `docs/reports/ARCHITECTURAL_RISK_AND_DOCTRINE_REPORT-v0.1.0-fa.md` | #14؛ custody evidence/signoff pending | تعمیم نصاب‌های کد به production approval یا معرفی signerهای واقعی ممنوع است | تکمیل quorum policy، signer registry، degradation/replacement procedure و reviewer signoff |
| تعیین تکلیف blockerها / blocker disposition | مسیر رسمی برای باز ماندن یا بسته شدن blockerها بر اساس evidence پذیرفته‌شده | Step-12 disposition register همه `STEP9-BLOCK-001` تا `STEP9-BLOCK-008` را open نگه می‌دارد | همه blockerها open/pending هستند | `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`، `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md` | issueهای #12 تا #19 | بستن blocker با docs، tests، یا نگاشت Step-13 ممنوع است | ادامه evidence acquisition و review برای هر blocker جداگانه |
| پذیرش evidence / evidence acceptance | معیار پذیرش evidence برای audit، formal verification، custody، oracle، deployment، release و non-claim | Step-12 checklist معیارها را تعریف کرده است | هیچ evidence پذیرفته‌شده ادعا نشده است | `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | همه issueهای #12 تا #19 | تبدیل draft packet به accepted evidence بدون reviewer/signoff ممنوع است | دریافت packetهای واقعی، بررسی stale/authority، و ثبت disposition معتبر |
| تأیید بازبین / reviewer signoff | signoff تخصصی برای audit، proof، custody، oracle، deployment، non-claim و release | در Step-12 checklist و draft packets به‌عنوان precondition آمده است | reviewer signoff ثبت نشده است | `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`، draft packetهای Step-12 | #12 تا #19 | ادعای signoff از مشارکت عمومی، issue comment، یا draft docs ممنوع است | تعیین reviewer authority و ثبت signoff قابل ردیابی در issue/packet مربوط |
| مسیر مشارکت فارسی‌زبان | مسیر عمومی برای مشارکت‌کنندگان و بازبین‌های فارسی‌زبان بدون تبدیل مشارکت به signoff رسمی | اصل Persian-first در roadmap و README ثبت شده؛ outreach فارسی وجود دارد | مستند و باز؛ نیازمند مشارکت بیشتر؛ signoff نیست | `README.md`، `docs/IRAN_OS_ROADMAP.md`، `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`، `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md` | در صورت ارتباط با blockerها باید issueهای #12 تا #19 استفاده شوند | برابر دانستن مشارکت عمومی با accepted evidence یا reviewer signoff ممنوع است | افزودن PRهای کوچک، فارسی‌محور و قابل review برای تکمیل نگاشت |

## ۵. شکاف‌های حکمرانی که هنوز باید تکمیل شوند

| شکاف | وضعیت فعلی | چرا نمی‌توان ادعای تکمیل کرد | مسیر بعدی |
| --- | --- | --- | --- |
| release council decision | ثبت نشده | repo فقط placeholder و requirement دارد، نه minutes یا go/no-go | `STEP9-BLOCK-006` باید با upstream disposition، signer approvals و minutes واقعی تکمیل شود |
| production custody map | ثبت نشده | draft packet custodianها و signerهای واقعی را عمداً اختراع نمی‌کند | `STEP9-BLOCK-003` باید signer registry و role-to-custodian map معتبر بگیرد |
| governance reviewer signoff | ثبت نشده | checklist نقش بازبین را لازم می‌داند اما signoff ارائه نشده است | signoff باید در issue/packet مربوط و با authority روشن ثبت شود |
| evidence acceptance | ثبت نشده | همه Step-12 packetها draft/pending هستند | هر evidence باید معیارهای Step-12 را پاس کند و accepted شود |
| Persian-speaking contributor pathway تا سطح signoff | مشارکت عمومی مستند است، signoff رسمی نیست | مشارکت فارسی‌زبان جایگزین reviewer authority نمی‌شود | مسیر PR/issue فارسی‌محور حفظ شود و signoff جداگانه ثبت شود |

## ۶. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر ردیف به سند repo یا issue/blocker مشخص وصل باشد.
- واژه‌های «draft»، «pending»، «نیازمند evidence»، «نیازمند بازبین» و «نیازمند signoff» حفظ شوند.
- هیچ نهاد، signer، quorum production، release council decision، legal authority یا approval جدید اختراع نشود.
- Step-12 و Step-13 باز بمانند.
- هیچ production readiness، release approval، external audit completion، formal verification completion، blocker closure، accepted evidence یا reviewer signoff ادعا نشود.

</div>
