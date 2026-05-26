<div dir="rtl">

# یادداشت بازبینی و تعمیق نگاشت ساختار حکمرانی — گام ۱۳

**نوع سند:** review/deepening note  
**workstream:** ساختار حکمرانی  
**وضعیت:** باز؛ یادداشت بازبینی برای نگاشت draft، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `release council`، `governance reviewer`، `custody`، `multisig`، `quorum`، `evidence` و `signoff`

## ۱. هدف

این سند یادداشت بازبینی و تعمیق برای [WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md](WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md) است. هدف آن بازنویسی کامل نگاشت نیست؛ بلکه شکاف‌های حکمرانی، نیازهای review، ادعاهای پشتیبانی‌نشده، وابستگی‌های evidence/signoff و اقدام‌های بعدی را مشخص می‌کند.

این یادداشت گام ۱۳ را کامل نمی‌کند، گام ۱۲ را نمی‌بندد، هیچ blockerای را نمی‌بندد، هیچ evidenceای را accepted نمی‌کند، هیچ reviewer signoffای را ادعا نمی‌کند، هیچ governance approval یا release council decision ایجاد نمی‌کند، و هیچ production readiness، release approval، external audit completion یا formal verification completion ادعا نمی‌کند.

`Fargard7PolicyAdapter` همچنان proposal-only/non-executing است. سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۲. دامنه بازبینی

این بازبینی نگاشت ساختار حکمرانی را در برابر محورهای زیر بررسی می‌کند:

- `release council` / شورای انتشار
- `governance reviewer` / بازبین حکمرانی
- `release coordinator` / هماهنگ‌کننده انتشار
- custody/key-management
- signer approvals
- multisig/quorum
- blocker disposition
- evidence acceptance
- reviewer signoff
- مسیر مشارکت‌کننده فارسی‌زبان

## ۳. جدول بازبینی و تعمیق

| محور بازبینی | وضعیت فعلی در mapping | gap یا ابهام | evidence/signoff موردنیاز | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- |
| شورای انتشار / `release council` | به‌عنوان مرجع مورد انتظار برای release signoff و go/no-go در Step-12 release packet آمده است | عضویت، minutes، go/no-go decision، release package hash و approval واقعی ثبت نشده‌اند؛ نیازمند تکمیل و signoff | نیازمند evidence و signoff برای #19: upstream blocker disposition، release package hash، signer approvals، go/no-go minutes | ادعای release approval، release council decision، production readiness یا go/no-go بدون evidence ممنوع است | نگه داشتن وضعیت pending و اتصال هر ادعای release به packet و issue #19 |
| بازبین حکمرانی / `governance reviewer` | در custody، non-claim و oracle/governance review به‌عنوان reviewer لازم آمده است | authority، identity و signoff واقعی هیچ بازبین حکمرانی ثبت نشده است؛ نیازمند بازبین | بسته به حوزه: #14 custody، #18 non-claim، #15/#16 oracle governance review؛ signoff معتبر لازم است | تبدیل اشاره به بازبین یا comment عمومی به reviewer signoff ممنوع است | تعریف reviewer authority در packet مربوط و ثبت signoff فقط با evidence قابل ردیابی |
| هماهنگ‌کننده انتشار / `release coordinator` | در non-claim preservation و release-facing materials به‌عنوان نقش لازم آمده است | release coordinator واقعی، handoff excerpt و confirmation ثبت نشده‌اند؛ نیازمند تکمیل | evidence/signoff مرتبط با #18 و در صورت release با #19 | ادعای non-claim acceptance یا release readiness بدون confirmation معتبر ممنوع است | تهیه handoff/release non-claim excerpt و نگه داشتن وضعیت pending تا signoff |
| custody/key-management | mapping به draft custody packet و Step-9 doctrine وصل شده است | production custodianها، signer registry، key ownership، rotation، onboarding/offboarding و compromised-key response ثبت نشده‌اند | evidence/signoff مربوط به #14: role-to-custodian map، signer registry، quorum rules، rotation plan، offboarding log، compromise response | اختراع signer identities، custodians، key holders، approvals یا custody completion ممنوع است | تکمیل custody packet با داده واقعی و review حکمرانی/انتشار |
| signer approvals | در release packet به‌صورت placeholder و pending آمده است | signer identities، timestamps، approval evidence و release package hash وجود ندارد؛ نیازمند evidence | برای #19: signer approvals، release package hash، go/no-go minutes؛ برای #14: signer registry و custodian attestation | ادعای signer approval یا release signer quorum بدون سند ممنوع است | ثبت approvalها فقط در packet مربوط و پس از upstream blocker disposition |
| multisig/quorum | mapping به factهای repo-supported مانند 7 of 9 برای Kernel trigger و 3 of N برای SWF اشاره دارد | این factها به production signer registry یا approval واقعی تبدیل نشده‌اند؛ quorum policy عملیاتی ناقص است | evidence/signoff مربوط به #14: quorum policy، signer registry، degradation/replacement procedure | تعمیم thresholdهای code/doctrine به production approval یا معرفی quorum واقعی ممنوع است | تفکیک thresholdهای کد از custody production و ثبت شکاف operational quorum |
| blocker disposition | mapping همه issueهای #12 تا #19 را pending/open نگه می‌دارد | مسیر closure هنوز وابسته به accepted evidence و signoff است؛ هیچ disposition نهایی وجود ندارد | هر blocker evidence و reviewer/signoff خودش را لازم دارد؛ طبق Step-12 checklist | بستن blocker با mapping، docs، tests یا comment عمومی ممنوع است | اتصال هر شکاف حکمرانی به blocker مربوط و حفظ وضعیت pending/open |
| evidence acceptance | mapping به Step-12 accepted-evidence checklist ارجاع دارد | draft packetها با accepted evidence اشتباه نشوند؛ معیار stale/authority باید در review برجسته بماند | accepted evidence برای هر issue #12 تا #19 فقط پس از review معتبر و signoff لازم | تبدیل draft evidence packet به accepted evidence ممنوع است | در هر PR حکمرانی عبارت draft/pending و نیاز به signoff حفظ شود |
| reviewer signoff | mapping signoff را precondition می‌داند اما ادعا نمی‌کند | signoff رسمی، reviewer authority و evidence link ثبت نشده‌اند؛ نیازمند signoff | signoff باید در issue/packet مربوط و با scope مشخص ثبت شود | ادعای reviewer signoff از مشارکت عمومی، issue comment یا سند draft ممنوع است | ساختن مسیر signoff قابل ردیابی بدون claim دریافت signoff |
| مسیر مشارکت‌کننده فارسی‌زبان | outreach فارسی و Persian-first principle مسیر مشارکت را باز کرده‌اند | مشارکت فارسی‌زبان signoff رسمی نیست؛ مرز مشارکت عمومی و authority باید حفظ شود | در صورت evidence/signoff باید از issueهای #12 تا #19 بگذرد | تبدیل مشارکت عمومی به accepted evidence، governance approval یا release approval ممنوع است | هدایت مشارکت‌ها به PRهای کوچک و issueهای مناسب با وضعیت draft/pending |

## ۴. موارد نیازمند بازبینی تخصصی

| مورد | وضعیت | مسیر پیشنهادی |
| --- | --- | --- |
| نسبت شورای انتشار با blockerهای upstream | نیازمند تکمیل | فقط پس از evidence/disposition معتبر در #12 تا #18 می‌تواند در #19 بررسی شود |
| authority بازبین حکمرانی | نیازمند بازبین و signoff | reviewer identity و scope باید در packet مربوط ثبت شود، نه در این mapping |
| production custody و signer registry | نیازمند evidence | issue #14 باید با داده واقعی و بدون اختراع signer/custodian تکمیل شود |
| quorum عملیاتی و replacement procedure | نیازمند تکمیل | تفکیک thresholdهای contract/doctrine از procedure تولیدی و signerهای واقعی |
| مشارکت فارسی تا سطح signoff | نیازمند تکمیل | مشارکت عمومی باید از signoff رسمی و accepted evidence جدا بماند |

## ۵. اقدام‌های بعدی پیشنهادی

- افزودن PRهای کوچک برای روشن‌تر کردن مرز release council requirement و نبود decision واقعی.
- اتصال دقیق‌تر custody gaps به `STEP9-BLOCK-003` و release gaps به `STEP9-BLOCK-006`.
- ثبت نیازهای governance reviewer در هر packet بدون ادعای دریافت signoff.
- تفکیک factهای code/doctrine درباره threshold از quorum/custody production.
- هدایت مشارکت‌کنندگان فارسی‌زبان به issueهای #14، #18 و #19 برای governance/custody/release comments بدون claim approval.

## ۶. non-claim

این یادداشت هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- تکمیل گام ۱۳
- بسته‌شدن گام ۱۲
- بسته‌شدن blocker
- پذیرفته‌شدن evidence
- دریافت reviewer signoff
- governance approval
- release council decision
- آمادگی تولید
- تأیید انتشار
- تکمیل حسابرسی بیرونی
- تکمیل formal verification

</div>
