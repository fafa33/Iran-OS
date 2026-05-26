<div dir="rtl">

# نگاشت مشارکت عمومی فارسی‌زبان — گام ۱۳

**نوع سند:** draft mapping  
**workstream:** مشارکت عمومی فارسی‌زبان  
**وضعیت:** باز؛ نگاشت قابل review، نه تکمیل گام ۱۳  
**زبان:** فارسی‌محور، با برچسب‌های کوتاه انگلیسی فقط برای ارجاع فنی مانند `issue`، `pull request`، `evidence`، `audit`، `formal verification`، `signoff` و نام فایل‌ها

## ۱. هدف

این سند هشتمین نگاشت تفصیلی گام ۱۳ است و فقط workstream «مشارکت عمومی فارسی‌زبان» را پوشش می‌دهد. هدف آن اتصال مشارکت عمومی، بازبینی فارسی، مستندسازی، outreach و مسیرهای GitHub به ردیابی سیستم است:

مشارکت‌کننده فارسی‌زبان → نقش/حوزه مشارکت → سند یا issue مرتبط → وضعیت فعلی → مسیر evidence/signoff → ریسک ادعایی/غیرمجاز → اقدام بعدی

این سند برای قابل‌فهم‌تر کردن مسیر مشارکت است. این سند هیچ evidenceای را پذیرفته‌شده اعلام نمی‌کند، هیچ reviewer signoffای ایجاد نمی‌کند، هیچ blockerای را نمی‌بندد، و هیچ production readiness، release approval، audit completion یا formal verification completion ادعا نمی‌کند.

## ۲. حدود و non-claim

این سند فقط draft mapping است:

- گام ۱۳ را کامل نمی‌کند.
- گام ۱۲ را نمی‌بندد.
- هیچ blockerای را نمی‌بندد.
- هیچ evidenceای را پذیرفته‌شده علامت نمی‌زند.
- هیچ reviewer signoffای را ادعا نمی‌کند.
- هیچ مشارکت عمومی را به signoff رسمی، governance approval، accepted evidence یا blocker closure تبدیل نمی‌کند.
- آمادگی تولید را ادعا نمی‌کند.
- تأیید انتشار را ادعا نمی‌کند.
- تکمیل حسابرسی بیرونی را ادعا نمی‌کند.
- تکمیل formal verification را ادعا نمی‌کند.
- هیچ قرارداد، test، package، threshold، timeout، ثابت مشروطه‌ای، اختیار Kernel، اختیار freeze، اختیار اوراکل یا مسیر اجرایی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only و non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

## ۳. نسبت با اصل فارسی‌محور جامعه

اصل راهبردی زبان و جامعه در roadmap ثبت کرده است که مخاطب عمومی و اجتماعی ایران‌اواس، جامعه‌ی فارسی‌زبان ایران است. این نگاشت همان اصل را به مسیر مشارکت عملی وصل می‌کند:

- متن عمومی، دعوت به مشارکت، نگاشت سپیدنامه، راهنمای مشارکت و outreach باید فارسی‌محور باشند.
- انگلیسی همچنان برای audit، formal verification، security review، issue templateها و بازبین‌های بین‌المللی معتبر است.
- فارسی‌محور بودن به معنی کاهش معیار evidence، signoff، audit، proof یا non-claim نیست.
- مشارکت عمومی می‌تواند پرسش، اصلاح مستند، پیشنهاد نگاشت، evidence draft یا review ارائه کند؛ اما accepted evidence و signoff فقط طبق مسیر گام ۱۲ و issueهای مربوط معتبر می‌شود.

## ۴. منابع repo که برای این نگاشت بررسی شدند

- `docs/IRAN_OS_ROADMAP.md`
- `README.md`
- `docs/README.md`
- `docs/contributing-fa.md`
- `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`
- `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`
- `docs/WHITEPAPER_MAPPING_INTAKE_PLAN_FA.md`
- `docs/WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md`
- `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`
- `docs/WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md`
- `docs/WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md`
- `docs/WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md`
- `docs/WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md`
- `docs/WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- GitHub issues #12 تا #19 برای blockerهای گام ۱۲

## ۵. نقش‌های مشارکت‌کننده و بازبین

این workstream مشارکت عمومی را به نقش‌های قابل ردیابی تقسیم می‌کند:

- بازبین فنی
- بازبین حکمرانی
- بازبین حقوقی/قانون اساسی
- بازبین اقتصادی/رفاهی
- بازبین امنیتی/audit
- بازبین formal verification
- مشارکت‌کننده مستندات فارسی
- مشارکت‌کننده outreach/community

هر نقش می‌تواند در مستندسازی و review مشارکت کند، اما هیچ نقش بدون evidence و signoff معتبر، blocker را نمی‌بندد یا readiness ادعا نمی‌کند.

## ۶. جدول ردیابی مشارکت عمومی

| مؤلفه مشارکت عمومی | توضیح فارسی | جایگاه در repo | وضعیت فعلی | مسیر مشارکت | issue یا سند مرتبط | ریسک ادعایی/غیرمجاز | اقدام بعدی |
| --- | --- | --- | --- | --- | --- | --- | --- |
| اصل فارسی‌محور جامعه | مشارکت عمومی ایران‌اواس باید برای فارسی‌زبانان قابل فهم، قابل پیگیری و قابل مشارکت باشد | `docs/IRAN_OS_ROADMAP.md`، `README.md`، `docs/README.md` | ثبت شده؛ نیازمند تکمیل در اسناد آینده | اصلاح مستندات فارسی، پیشنهاد واژه‌گذاری، بهبود مسیرهای راهنما | roadmap، docs README، contributing | تبدیل زبان فارسی‌محور به claim آمادگی تولید ممنوع است | حفظ فارسی‌محوری در PRهای مستنداتی و لینک به mappingهای گام ۱۳ |
| بسته outreach گام ۱۲ | مسیر دعوت از بازبین و مشارکت‌کننده فارسی‌زبان برای blockerهای تولیدی | `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md` | موجود؛ دعوت است، نه accepted evidence یا signoff | خواندن بسته، انتخاب issue مرتبط، ثبت پرسش/شواهد/بازبینی در GitHub | `STEP12_REVIEWER_OUTREACH_FA.md`، issueهای #12 تا #19 | ادعای اینکه outreach به معنی signoff یا blocker closure است ممنوع است | به‌روزرسانی متن دعوت و هدایت مشارکت‌کننده به issue مناسب |
| بازبین فنی | بررسی نگاشت کد، معماری، تست و مرزهای runtime بدون تغییر ادعایی | `contracts/CONTRACT_RUNTIME_MAP.md`، Step-13 mapping docs | نیازمند بازبین | PR مستنداتی، review روی mapping، طرح شکاف فنی | mappingهای قراردادها، اوراکل، اقتصاد، حکمرانی | ادعای implementation complete یا production ready ممنوع است | ثبت review محدود، قابل ارجاع و بدون claim بسته‌شدن |
| بازبین حکمرانی | بررسی نقش‌ها، authority، release، custody و مسیر تصمیم‌گیری | governance docs، Step-9/Step-12 reports | نیازمند بازبین و evidence/signoff | comment روی issueهای governance/custody/release، پیشنهاد اصلاح سند | issue #14، #18، #19، governance mapping | ادعای governance signoff یا release approval ممنوع است | تفکیک نظر عمومی از signoff رسمی و ثبت نیازهای evidence |
| بازبین حقوقی/قانون اساسی | بررسی سازگاری متن با مشروطه سکولار، حقوق بنیادین، حاکمیت قانون و حدود نهادها | `constitution/constitution-fa.md`، foundational/welfare/governance mappings | نیازمند بازبین | PR مستنداتی، comment تفسیری، پیشنهاد واژگان دقیق | foundational، governance، welfare mappings | اختراع claim حقوقی، historical fact یا constitutional approval ممنوع است | ثبت پیشنهادهای editorial جدا از پیشنهادهای substantive |
| بازبین اقتصادی/رفاهی | بررسی ادعاهای رفاه، عدالت، اقتصاد، منابع، feasibility و بودجه بدون claim مالی | economy و welfare mappings، Step-12 evidence docs | نیازمند بازبین و evidence | comment روی شکاف‌های مالی/رفاهی، پیشنهاد evidence لازم | welfare/economy mappings، issueهای #12، #13، #17، #19 | ادعای بودجه واقعی، fiscal feasibility یا entitlement operational ممنوع است | مشخص کردن داده و evidence لازم برای هر ادعای اقتصادی/رفاهی |
| بازبین امنیتی/audit | بررسی audit scope، threat model، finding register و remediation مسیر | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`، evidence/audit/signoff mapping | نیازمند evidence و signoff | مشارکت در issue #12، پیشنهاد scope یا finding template | issue #12، audit prep packet | ادعای audit complete، finding accepted یا remediation complete ممنوع است | تکمیل audit packet با auditor/reviewer معتبر |
| بازبین formal verification | بررسی proof targets، assumptions، toolchain و proof artifacts | `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | نیازمند evidence و signoff | مشارکت در issue #13، پیشنهاد target/tool/assumption | issue #13، formal verification prep packet | ادعای proof complete یا formal verification complete ممنوع است | ثبت proof plan، artifact و reviewer disposition واقعی |
| مشارکت‌کننده مستندات فارسی | بهبود خوانایی، ساختار، واژه‌نامه، پیوندها و consistency فارسی | `docs/`، `whitepaper/`، Step-13 mapping docs | نیازمند مشارکت‌کننده | PR کوچک، editorial changes، اصلاح لینک‌ها | `docs/contributing-fa.md`، mapping docs | تغییر معنای سیاسی/حقوقی یا ادعای evidence/signoff ممنوع است | بهبود متن با حفظ معنی سیاسی، حقوقی و فنی |
| مشارکت‌کننده outreach/community | رساندن دعوت به افراد مناسب و بازگرداندن پرسش‌ها به issueهای درست | outreach docs، README، GitHub issues | نیازمند مشارکت‌کننده | استفاده از متن دعوت، ارجاع افراد به issue مربوط، جمع‌آوری پرسش‌ها | `STEP12_REVIEWER_OUTREACH_FA.md`، issueهای #12 تا #19 | تبدیل حمایت عمومی یا علاقه‌مندی به approval یا signoff ممنوع است | هدایت مشارکت به issueها و ثبت وضعیت draft/pending |
| issueهای #12 تا #19 | مسیر رسمی ثبت evidence، پرسش و review برای blockerهای گام ۱۲ | GitHub issue tracker، Step-12 reports | باز/pending؛ هیچ blocker بسته نشده است | ثبت comment یا PR مرتبط با شناسه `STEP9-BLOCK-*` | #12 audit، #13 formal verification، #14 custody، #15 oracle ops، #16 oracle runbook، #17 deployment، #18 non-claim، #19 release | ادعای accepted evidence یا reviewer signoff بدون معیار ممنوع است | ادامه‌ی triage و اتصال هر مشارکت به blocker مربوط |
| نگاشت‌های گام ۱۳ | مسیر فهم عمومی از سپیدنامه به کد، test، docs، issues و signoff | همه‌ی `WHITEPAPER_*_MAPPING_FA.md` | draft/open؛ نیازمند تکمیل تدریجی | PRهای کوچک برای یک workstream یا بند مشخص | Step-13 mapping docs | ادعای تکمیل گام ۱۳ یا بسته‌شدن Step-12 ممنوع است | نگاشت بندبه‌بند با وضعیت محتاطانه و مسیر evidence مشخص |

## ۷. مسیر پیشنهادی مشارکت عمومی

۱. ابتدا سند outreach فارسی گام ۱۲ را بخوانید: `docs/outreach/STEP12_REVIEWER_OUTREACH_FA.md`.  
۲. حوزه مشارکت را انتخاب کنید: audit، formal verification، custody، oracle، deployment، release، non-claim، مستندسازی یا نگاشت سپیدنامه.  
۳. issue مرتبط #12 تا #19 یا سند mapping مرتبط را انتخاب کنید.  
۴. اگر پیشنهاد شما editorial است، آن را از پیشنهاد سیاسی/حقوقی/فنی substantive جدا کنید.  
۵. اگر evidence یا signoff ندارید، وضعیت را draft، نیازمند تکمیل، نیازمند مشارکت‌کننده، نیازمند بازبین یا نیازمند evidence/signoff بنویسید.  
۶. از عبارت‌های «blocker بسته شد»، «evidence accepted»، «reviewer signoff received»، «production ready»، «release approved»، «audit complete» و «formal verification complete» استفاده نکنید مگر اینکه evidence پذیرفته‌شده و signoff معتبر واقعاً لینک شده باشد.

## ۸. معیار review برای این workstream

این نگاشت زمانی آماده گسترش بعدی است که:

- هر مسیر مشارکت به سند، issue، workstream یا blocker مشخص وصل باشد.
- نقش‌های مشارکت‌کننده از signoff رسمی تفکیک شوند.
- وضعیت‌ها با واژه‌های «نیازمند تکمیل»، «نیازمند مشارکت‌کننده»، «نیازمند بازبین» یا «نیازمند evidence/signoff» نوشته شوند.
- هیچ مشارکت عمومی به accepted evidence، reviewer signoff، release approval، audit completion، formal verification completion، production readiness یا blocker closure تبدیل نشود.
- Step-12 و Step-13 باز بمانند.
- `Fargard7PolicyAdapter` proposal-only/non-executing باقی بماند.
- oracle signals non-sovereign و signal-only باقی بمانند.

</div>
