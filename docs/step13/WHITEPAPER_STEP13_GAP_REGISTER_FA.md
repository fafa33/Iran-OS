<div dir="rtl">

# رجیستر شکاف‌های گام ۱۳

**نوع سند:** documentation-only / gap register  
**وضعیت:** باز؛ این سند گام ۱۳ را کامل یا بسته اعلام نمی‌کند.  
**هدف:** ثبت شکاف‌های باقی‌مانده در workstreamهای گام ۱۳ و اتصال آن‌ها به issue، evidence، signoff یا review موردنیاز.

## non-claim

این سند هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- production readiness
- release approval
- completed external audit
- completed formal verification
- blocker closure
- accepted evidence
- reviewer signoff
- completion of Step 12
- completion of Step 13

`Fargard7PolicyAdapter` همچنان proposal-only / non-executing است و oracle signals همچنان non-sovereign / signal-only هستند.

## جدول رجیستر شکاف‌ها

| workstream | gap type | gap description | related issue(s) | needed reviewer / evidence / signoff | status | forbidden claim |
| --- | --- | --- | --- | --- | --- | --- |
| اصول بنیادین و منشور | review / constitutional traceability | نیاز به بازبینی دقت مفهومی، ثبات واژگان و اتصال دقیق اصول بنیادین به repo، issue یا evidence بدون تغییر معنی سپیدنامه یا منشور | #12، #13، #18 | بازبین منشور، بازبین حکمرانی، بازبین حقوقی/قانون اساسی، audit/formal/non-claim evidence در صورت ادعای enforcement یا proof | pending / needs review | constitutional approval، formal verification complete، accepted evidence، blocker closure |
| ساختار حکمرانی | governance / custody / release traceability | نیاز به تفکیک نقش‌ها، authority، custody، signer، quorum، release council و اتصال هر شکاف به issue مربوط | #14، #18، #19 | governance reviewer، custody reviewer، release reviewer، custody packet، non-claim review، release signoff packet | pending / needs review | governance signoff، custody completion، release approval، production governance ready |
| رفاه و عدالت | welfare / legal / execution gap | نیاز به تفکیک ادعای مفهومی رفاه و عدالت از اجرای واقعی، entitlement operational، enrollment و اجرای حقوقی | #12، #13، #14، #18 | بازبین رفاه، بازبین حقوقی، بازبین حکمرانی، audit/formal/custody/non-claim evidence در صورت ادعای اجرایی | pending / needs review | real-world enrollment، entitlement operational، production service readiness، accepted evidence |
| اقتصاد و منابع | economic / treasury / feasibility gap | نیاز به تفکیک mapping اقتصادی از ادعای feasibility، funding، treasury operational یا منابع verified | #12، #13، #17، #18، #19 | بازبین اقتصادی، auditor، formal methods reviewer، deployment reviewer، release reviewer | pending / needs review | fiscal feasibility proven، treasury operational، budget ready، release approved |
| قراردادها و adapterها | contract / adapter boundary gap | نیاز به حفظ مرز proposal-only بودن adapter و اتصال هر ادعای contract/proof/deployment به issue مربوط | #12، #13، #17، #18 | Solidity reviewer، auditor، formal verification reviewer، deployment reviewer، non-claim reviewer | pending / needs review | downstream execution، policy mutation، audit complete، proof complete، deployment readiness |
| اوراکل و سیگنال‌ها | oracle / signal-only gap | نیاز به تفکیک oracle signal از oracle authority و اتصال feeder، freshness، deviation، runbook و monitoring به issueهای مربوط | #15، #16، #18 | oracle ops reviewer، data reviewer، governance reviewer، oracle packet/runbook/non-claim evidence | pending / needs review | oracle sovereign authority، oracle signoff، production data validity، automatic freeze/mint/budget/governance |
| evidence / audit / signoff | evidence process gap | نیاز به روشن‌کردن اینکه هیچ evidence یا signoff ضمنی پذیرفته نیست و هر مسیر باید از issue مربوط عبور کند | #12، #13، #14، #15، #16، #17، #18، #19 | auditor، formal reviewer، governance/release reviewer، custody/deployment/oracle reviewers | pending / needs review | accepted evidence، reviewer signoff received، audit complete، formal verification complete، blocker closed |
| مشارکت عمومی فارسی‌زبان | community / review routing gap | نیاز به تفکیک مشارکت عمومی فارسی‌زبان از signoff رسمی و هدایت مشارکت به issue یا PR کوچک و قابل review | #12، #13، #14، #15، #16، #17، #18، #19 | مستندساز فارسی، community reviewer، governance reviewer، evidence/signoff reviewer در صورت نیاز | pending / needs review | public support as approval، accepted evidence، reviewer signoff، blocker closure، production readiness |

## قواعد استفاده

- این رجیستر برای ثبت و پیگیری gap است، نه بستن gap.
- هر gap باید به issue، evidence، signoff یا reviewer مربوط وصل شود.
- وضعیت `pending / needs review` به معنی تکمیل یا پذیرش نیست.
- هر تغییر بعدی باید معنی سپیدنامه و منشور را حفظ کند.
- Step 12 باز می‌ماند.
- Step 13 باز می‌ماند.

</div>
