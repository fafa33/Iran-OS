<div dir="rtl">

## بسته دعوت از بازبین و مشارکت‌کننده فارسی‌زبان — گام ۱۲ ایران‌اواس

**وضعیت:** دعوت برای مشارکت و بازبینی؛ نه شواهد پذیرفته‌شده، نه تأیید بازبین، نه بستن blocker، نه آمادگی تولید

## هدف دعوت

ایران‌اواس در گام ۱۲ به مرحله‌ی گردآوری شواهد، بازبینی، و آماده‌سازی مسیر تصمیم‌گیری رسیده است. هدف این دعوت این است که مشارکت‌کنندگان و بازبین‌های فارسی‌زبان، به‌ویژه ایرانیان متخصص در قرارداد هوشمند، امنیت، حکمرانی، روش‌های صوری، عملیات اوراکل، deployment، حقوق عمومی، و مستندسازی، بتوانند از مسیر درست وارد شوند و برای هر blocker شواهد، پرسش، بازبینی، یا اصلاح مستند ارائه کنند.

این سند برای جذب بازبین و مشارکت‌کننده است. این سند هیچ blockerای را نمی‌بندد، هیچ شواهدی را پذیرفته‌شده اعلام نمی‌کند، و هیچ تأیید یا مجوز انتشار ایجاد نمی‌کند.

## پروژه در چه وضعیتی است

- گام ۱۲ همچنان باز است.
- برای همه‌ی `STEP9-BLOCK-001` تا `STEP9-BLOCK-008` issue در GitHub باز شده است.
- برای همه‌ی blockerها draft evidence/prep packet ثبت شده است.
- همه‌ی شواهد فعلاً draft/pending هستند.
- هیچ reviewer signoff ثبت نشده است.
- هیچ blocker بسته نشده است.

## چه چیزی هنوز ادعا نمی‌شود

- آمادگی تولید ادعا نمی‌شود.
- حسابرسی بیرونی کامل نشده است.
- راستی‌آزمایی رسمی کامل نشده است.
- تأیید انتشار انجام نشده است.
- هیچ blockerای بدون شواهد پذیرفته‌شده و signoff لازم بسته نمی‌شود.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign هستند و حق اجرای مستقل freeze، unfreeze، mint، burn، transfer، spend، classify، subsidize، apply fees، تغییر wage، تغییر budget، approve loans، تغییر provincial balances، یا اجرای governance را ندارند.

## چه نقش‌هایی نیاز داریم

- بازبین قرارداد هوشمند / Solidity
- بازبین امنیتی یا audit-minded developer
- بازبین formal verification یا روش‌های صوری
- بازبین حکمرانی / DAO / multisig
- بازبین custody و مدیریت کلید
- بازبین عملیات اوراکل
- بازبین deployment / DevOps
- بازبین حقوقی/قانون اساسی/سیاست رفاه
- مشارکت‌کننده فارسی برای مستندسازی و روایت

## چگونه مشارکت کنیم

۱. issue مربوط به حوزه‌ی تخصصی خود را از جدول پایین انتخاب کنید.

۲. draft packet مربوط به همان blocker را بخوانید و اگر شواهد، پرسش، ایراد، پیشنهاد اصلاح، یا signoff واجد شرایط دارید، در همان issue ثبت کنید.

۳. هنگام ارسال شواهد، شناسه‌ی دقیق blocker را بنویسید؛ مثل `STEP9-BLOCK-003`.

۴. اگر شواهد هنوز کامل یا پذیرفته‌شده نیست، آن را با وضعیت draft، submitted، یا reviewed توضیح دهید؛ accepted فقط وقتی استفاده شود که معیارهای پذیرش و signoff لازم واقعاً ارائه شده باشند.

۵. اگر Pull Request می‌فرستید، claim مربوط به readiness، audit completion، formal verification completion، release approval، یا blocker closure را فقط زمانی بنویسید که شواهد پذیرفته‌شده و signoff لازم پیوست یا لینک شده باشد.

## هر نقش از کدام issue شروع کند

| نقش یا حوزه | blocker | issue | مسیر شروع |
| --- | --- | --- | --- |
| بازبین امنیتی، auditor، یا audit-minded developer | `STEP9-BLOCK-001` external audit | https://github.com/fafa33/Iran-OS/issues/12 | scope حسابرسی، سطح‌بندی findingها، register یافته‌ها، remediation/deferral/accepted-risk |
| بازبین formal verification یا روش‌های صوری | `STEP9-BLOCK-002` formal verification | https://github.com/fafa33/Iran-OS/issues/13 | proof scope، target list، assumptions، tool/config، proof artifacts، failed obligations |
| بازبین governance، DAO، multisig، custody، یا key management | `STEP9-BLOCK-003` custody/key-management | https://github.com/fafa33/Iran-OS/issues/14 | custody map، signer list، quorum rules، rotation، onboarding/offboarding، compromised-key response |
| بازبین عملیات اوراکل | `STEP9-BLOCK-004` oracle operations | https://github.com/fafa33/Iran-OS/issues/15 | feeder registry، quorum، freshness/staleness، deviation handling، incident runbook، monitoring |
| بازبین deployment / DevOps | `STEP9-BLOCK-005` deployment dry-run/manifest | https://github.com/fafa33/Iran-OS/issues/17 | deployment manifest، artifact hashes، constructor args، address book، dry-run logs، gas estimates، verification |
| بازبین release و governance council | `STEP9-BLOCK-006` release signoff | https://github.com/fafa33/Iran-OS/issues/19 | upstream blocker disposition، release package hash، signer approvals، go/no-go minutes |
| بازبین oracle runbook و operations | `STEP9-BLOCK-007` oracle operations runbook | https://github.com/fafa33/Iran-OS/issues/16 | onboarding، suspension، stale-data/invalidation، deviation review، liveness monitoring، signal-only governance review |
| بازبین non-claim، governance، release coordination، و مستندسازی | `STEP9-BLOCK-008` non-claim preservation | https://github.com/fafa33/Iran-OS/issues/18 | non-claim check، handoff excerpt، governance reviewer confirmation |

## قاعده‌ی عدم‌ادعا و عدم‌بستن blocker

لطفاً در Issue یا Pull Request ادعای بسته‌شدن blocker، آمادگی تولید، تکمیل audit، تکمیل formal verification، یا تأیید انتشار نکنید، مگر اینکه شواهد پذیرفته‌شده و signoff لازم ضمیمه شده یا به‌روشنی لینک شده باشد.

اگر شواهد شما هنوز draft یا در حال بررسی است، همان را صریح بنویسید. شواهد draft ارزشمند است، اما blocker را نمی‌بندد.

## پیام برای افراد یا گروه‌های فارسی‌زبان

درود بر شما،

پروژه‌ی Iran-OS وارد گام ۱۲ شده: مرحله‌ی گردآوری شواهد و بازبینی برای blockerهای تولید، audit، formal verification، custody، oracle operations، deployment، release signoff و non-claim preservation.

ما به بازبین‌های فارسی‌زبان نیاز داریم: Solidity/security، audit-minded developers، formal verification، DAO/multisig governance، custody/key management، oracle operations، deployment/DevOps، حقوق عمومی/قانون اساسی/سیاست رفاه، و مستندسازی فارسی.

نکته مهم: پروژه هنوز production-ready نیست؛ audit کامل نشده؛ formal verification کامل نشده؛ release approval نداریم؛ هیچ blockerای بسته نشده است. مشارکت‌ها باید از طریق issueهای `STEP9-BLOCK-*` ثبت شوند و فقط با شواهد پذیرفته‌شده و signoff معتبر می‌توان درباره‌ی closure یا approval حرف زد.

نقطه شروع فارسی:
https://github.com/fafa33/Iran-OS/blob/main/docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md

issueهای گام ۱۲:
- audit: https://github.com/fafa33/Iran-OS/issues/12
- formal verification: https://github.com/fafa33/Iran-OS/issues/13
- custody/key-management: https://github.com/fafa33/Iran-OS/issues/14
- oracle operations: https://github.com/fafa33/Iran-OS/issues/15
- oracle runbook: https://github.com/fafa33/Iran-OS/issues/16
- deployment dry-run: https://github.com/fafa33/Iran-OS/issues/17
- non-claim preservation: https://github.com/fafa33/Iran-OS/issues/18
- release signoff: https://github.com/fafa33/Iran-OS/issues/19

</div>

<div dir="ltr">

## English Companion Note

Iran-OS Step 12 is open for evidence acquisition and reviewer/contributor outreach. All `STEP9-BLOCK-001` through `STEP9-BLOCK-008` have GitHub Issues and draft evidence/prep packets, but all evidence remains draft/pending.

The project does not claim production readiness, release approval, completed external audit, completed formal verification, blocker closure, accepted evidence, or reviewer signoff. `Fargard7PolicyAdapter` remains proposal-only/non-executing, and oracle signals remain non-sovereign.

### Short English Outreach Message

Iran-OS Step 12 needs qualified reviewers and contributors for external audit prep, formal verification prep, custody/key-management, oracle operations, deployment dry-run, release signoff, and non-claim preservation.

All blockers remain open. No evidence is accepted yet, no reviewer signoff is claimed, and the project is not production ready. Please contribute through the relevant `STEP9-BLOCK-*` GitHub Issue and avoid closure/readiness claims unless accepted evidence and required signoff are attached or clearly linked.

Start here:
https://github.com/fafa33/Iran-OS/blob/main/docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md

</div>
