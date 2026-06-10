<div dir="rtl">

### ایران‌اواس — IranOS

<div dir="ltr">

[![CI](https://github.com/fafa33/Iran-OS/actions/workflows/ci.yml/badge.svg)](https://github.com/fafa33/Iran-OS/actions/workflows/ci.yml)

---

## For External Reviewers (English)

**IranOS** is an open-source blockchain governance operating system — a technical blueprint for a post-Islamic-Republic Iran. It encodes a secular constitutional monarchy (*Charter of Welfare and Justice*) into auditable Solidity smart contracts, governance protocols, and deployment documentation.

**Current status:**
- Current repository inventory and test baseline are tracked in the [latest Step 13 checkpoint](docs/step13/WHITEPAPER_STEP13_CURRENT_STATUS_CHECKPOINT_V4_FA.md)
- Step 13 (cross-fargard fidelity review) — internal remediation complete, **open for external review**
- Step 12 (external audit / formal verification) — **open, no accepted evidence yet**
- **Not production-ready.** No external audit. No formal verification. No deployment on any public network.

**External reviewer entry points:**
- [Step 13 Reviewer Index (English)](docs/step13/STEP13_REVIEWER_INDEX_EN.md) — start here
- [SECURITY.md](SECURITY.md) — security status and non-claim policy
- [LICENSE](LICENSE) — MIT
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — contributor conduct

---

</div>

**سیستم‌عامل حکمرانی بلاک‌چین‌محور برای ایران**

> پروژه‌ای متن‌باز برای طراحی و توسعه‌ی یک سیستم‌عامل حاکمیتی دیجیتال بر پایه بلاک‌چین، با تمرکز بر منشور رفاه و عدالت، معماری قابل‌ردیابی، تست، شواهد، بازبینی بیرونی و اجرای مرحله‌ای.
---

## دموی اپلیکیشن زنده

**[https://fafa33.github.io/Iran-OS/](https://fafa33.github.io/Iran-OS/)**

رابط شهروندی: کارت دیجیتال، کیف‌پول PAH، پرداخت قبوض، استیکینگ و وضعیت Kernel

---

## ساختار پروژه

- [`/constitution`](https://github.com/fafa33/Iran-OS/tree/main/constitution) — پیمان ملی مشروطه سکولار

- [`/whitepaper`](https://github.com/fafa33/Iran-OS/tree/main/whitepaper) — سپیدنامه فنی و اقتصادی

- [`/protocols`](https://github.com/fafa33/Iran-OS/tree/main/protocols) — پروتکل‌های حکمرانی و معماری شبکه

- [`/workflows`](./workflows) — گردش‌کارهای اجرایی و معماری عامل‌محور IranOS

- [`/architecture`](./architecture) — معماری هسته، اوراکل‌ها، امنیت، دفترکل و توپولوژی سامانه

- [`/contracts`](https://github.com/fafa33/Iran-OS/tree/main/contracts) — قراردادهای هوشمند Solidity

- [`/docs`](https://github.com/fafa33/Iran-OS/tree/main/docs) — مستندات، راهنماها و اپلیکیشن وب

- [`/test`](https://github.com/fafa33/Iran-OS/tree/main/test) — تست‌های فنی و امنیتی

- [`/app`](https://github.com/fafa33/Iran-OS/tree/main/app) — رابط کاربری شهروندی و داشبورد حکمرانی

---

## ویژگی‌های اصلی

- **Kernel حاکمیتی** — شش خط قرمز مشروطه (TR-01 تا TR-06)
- **صندوق ثروت ملی** — سه لایه نقد / مولد / گرو
- **کارت شهروند هوشمند** — هویت، بیمه بیکاری، بهداشت
- **انتخاب هیئت منصفه با VRF** — دادگستری تصادفی و قابل ممیزی
- **توکن پهلوی (PAH)** — ارز ملی روی بلاک‌چین

---

## فناوری

- قرارداد هوشمند: Solidity ^0.8.20 + OpenZeppelin
- اوراکل: API3 / Airnode
- اثبات صفر: Circom / SnarkJS / Noir
- تراکنش ملی: ZK-Rollups
- توسعه و تست: Hardhat / Foundry
- ممیزی امنیتی: Slither / Mythril / Echidna
---

## شروع مشارکت

۱. متن منشور را بخوانید:  
[constitution/constitution-fa.md](https://github.com/fafa33/Iran-OS/blob/main/constitution/constitution-fa.md)

۲. راهنمای مشارکت را بخوانید:  
[docs/contributing-fa.md](https://github.com/fafa33/Iran-OS/blob/main/docs/contributing-fa.md)

۳. یک branch بسازید و Pull Request ارسال کنید.

<div dir="ltr">

## Call for Evidence and Reviewer Signoff — Step 12

Iran-OS Step 12 has reached an evidence handoff checkpoint. All `STEP9-BLOCK-001` through `STEP9-BLOCK-008` have evidence/status recorded, but every blocker remains pending/open and no blocker has been closed.

Further progress requires accepted evidence and reviewer signoff from qualified contributors. The project does not claim production readiness, release approval, completed external audit, or completed formal verification.

See the accepted-evidence checklist: [`docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`](docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md)

GitHub issue workflow guide: [`docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`](docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md)

Persian-first reviewer outreach kit: [`docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`](docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md)

Evidence contributions should be submitted through GitHub Issues or Pull Requests using the relevant `STEP9-BLOCK-*` identifier:

- `STEP9-BLOCK-001`: external audit evidence and auditor/reviewer signoff.
- `STEP9-BLOCK-002`: formal verification packet and formal verification reviewer signoff.
- `STEP9-BLOCK-003`: role custody/key-management packet and governance reviewer signoff.
- `STEP9-BLOCK-004`: oracle operations packet and oracle/governance signoff.
- `STEP9-BLOCK-005`: deployment dry-run/manifest packet and deployment reviewer signoff.
- `STEP9-BLOCK-006`: release signoff packet and release council approval.
- `STEP9-BLOCK-007`: oracle operations runbook and oracle/governance signoff.
- `STEP9-BLOCK-008`: non-claim preservation review and governance/release signoff.

Please do not submit PRs or Issues that claim blocker closure, production readiness, audit completion, formal verification completion, or release approval unless the required accepted evidence and reviewer signoff are attached or clearly linked. `Fargard7PolicyAdapter` remains proposal-only/non-executing, and oracle signals remain non-sovereign.

</div>

## دعوت به مشارکت برای ارائه شواهد و تأیید بازبین — گام ۱۲

گام ۱۲ ایران‌اواس به نقطه‌ی تحویل شواهد رسیده است. برای همه‌ی `STEP9-BLOCK-001` تا `STEP9-BLOCK-008` وضعیت یا شواهد اولیه ثبت شده، اما همه‌ی blockerها همچنان pending/open هستند و هیچ blocker بسته نشده است.

ادامه‌ی کار نیازمند شواهد پذیرفته‌شده و تأیید بازبین‌های واجد صلاحیت است. این پروژه در این مرحله ادعای آمادگی تولید، تأیید انتشار، تکمیل حسابرسی بیرونی، یا تکمیل راستی‌آزمایی رسمی ندارد.

چک‌لیست شواهد پذیرفته‌شده: [`docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`](docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md)

راهنمای گردش‌کار Issue در GitHub: [`docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`](docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md)

بسته‌ی فارسی‌محور دعوت از بازبین و مشارکت‌کننده: [`docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`](docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md)

نگاشت فارسی‌محور سپیدنامه به سیستم برای گام ۱۳: [`docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`](docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md)

خلاصه عمومی فارسی برای مشارکت در گام ۱۳: [`docs/WHITEPAPER_MAPPING_COMMUNITY_SUMMARY_FA.md`](docs/WHITEPAPER_MAPPING_COMMUNITY_SUMMARY_FA.md)

مشارکت‌های مربوط به شواهد باید از طریق GitHub Issues یا Pull Requests و با شناسه‌ی مربوط `STEP9-BLOCK-*` ثبت شوند:

- `STEP9-BLOCK-001`: شواهد حسابرسی بیرونی و تأیید حسابرس/بازبین.
- `STEP9-BLOCK-002`: بسته‌ی راستی‌آزمایی رسمی و تأیید بازبین راستی‌آزمایی رسمی.
- `STEP9-BLOCK-003`: بسته‌ی نگهداشت نقش‌ها/مدیریت کلید و تأیید بازبین حکمرانی.
- `STEP9-BLOCK-004`: بسته‌ی عملیات اوراکل و تأیید اوراکل/حکمرانی.
- `STEP9-BLOCK-005`: بسته‌ی dry-run و manifest استقرار و تأیید بازبین استقرار.
- `STEP9-BLOCK-006`: بسته‌ی تأیید انتشار و تصویب شورای انتشار.
- `STEP9-BLOCK-007`: runbook عملیات اوراکل و تأیید اوراکل/حکمرانی.
- `STEP9-BLOCK-008`: بازبینی حفظ non-claim و تأیید حکمرانی/انتشار.

لطفاً Pull Request یا Issueای که مدعی بسته‌شدن blocker، آمادگی تولید، تکمیل حسابرسی، تکمیل راستی‌آزمایی رسمی، یا تأیید انتشار است ثبت نکنید، مگر اینکه شواهد پذیرفته‌شده و تأیید بازبین لازم به آن پیوست شده یا به‌روشنی لینک شده باشد. `Fargard7PolicyAdapter` همچنان فقط پیشنهاددهنده و غیر اجرایی است و سیگنال‌های اوراکل همچنان غیرحاکمیتی هستند.

## معرفی عمومی ایران‌او‌اس

برای معرفی ساده و عمومی پروژه، این سند را ببینید:

[معرفی عمومی ایران‌او‌اس](docs/public/IRAN_OS_PUBLIC_INTRO_FA.md)

</div>