<div dir="rtl">

# خلاصه عمومی نگاشت سپیدنامه به سیستم — گام ۱۳

**وضعیت:** خلاصه عمومی برای مشارکت فارسی‌زبان؛ نه تکمیل گام ۱۳، نه evidence پذیرفته‌شده، نه signoff

## گام ۱۳ چیست؟

گام ۱۳ مسیر فارسی‌محور ردیابی سپیدنامه ایران‌اواس به سیستم است. یعنی هر اصل، بند یا ادعای سپیدنامه باید بتواند به سند، ماژول، test، issue، blocker، evidence یا signoff مربوط وصل شود.

مسیر اصلی این است:

سپیدنامه → اصل/بند → ماژول فنی یا حکمرانی → وضعیت اجرا → `evidence/test` → issue/blocker/signoff

## چرا سپیدنامه به سیستم نگاشت می‌شود؟

برای اینکه بازبین‌ها و مشارکت‌کنندگان فارسی‌زبان بتوانند ببینند هر ادعا در کجای repo پشتیبانی شده، کجا فقط مستند است، کجا شکاف اجرایی دارد، و کجا برای گام ۱۲ به evidence یا signoff نیاز دارد. این کار جایگزین audit، formal verification، evidence پذیرفته‌شده یا تصمیم release نیست.

## از کجا شروع کنیم؟

- سند اصلی نگاشت: [WHITEPAPER_TO_SYSTEM_MAPPING_FA.md](WHITEPAPER_TO_SYSTEM_MAPPING_FA.md)
- چک‌لیست بازبینی ۸ workstream: [WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md](WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md)
- بسته دعوت از بازبین و مشارکت‌کننده فارسی‌زبان برای گام ۱۲: [outreach/STEP12_REVIEWER_OUTREACH_FA.md](outreach/STEP12_REVIEWER_OUTREACH_FA.md)

## ۸ workstream گام ۱۳

| workstream | فایل شروع |
| --- | --- |
| اصول بنیادین و منشور | [WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md](WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md) |
| ساختار حکمرانی | [WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md](WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md) |
| رفاه و عدالت | [WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md](WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md) |
| اقتصاد و منابع | [WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md](WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md) |
| قراردادها و adapterها | [WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md](WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md) |
| اوراکل و سیگنال‌ها | [WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md](WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md) |
| `evidence / audit / signoff` | [WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md](WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md) |
| مشارکت عمومی فارسی‌زبان | [WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md](WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md) |

## چه نقش‌هایی برای بازبینی لازم است؟

- بازبین فنی و Solidity
- بازبین حکمرانی، DAO، multisig و custody
- بازبین حقوقی/قانون اساسی
- بازبین اقتصادی/رفاهی
- بازبین امنیتی/audit
- بازبین formal verification
- مشارکت‌کننده مستندات فارسی
- مشارکت‌کننده outreach/community

## چطور مشارکت کنیم؟

۱. از سند اصلی نگاشت یا چک‌لیست بازبینی شروع کنید.  
۲. یک workstream کوچک انتخاب کنید.  
۳. اگر پیشنهاد شما فقط ویرایشی است، آن را از پیشنهاد فنی/حقوقی/سیاسی جدا کنید.  
۴. اگر موضوع به evidence، audit، formal verification، custody، oracle ops، deployment، release یا non-claim مربوط است، آن را به issueهای گام ۱۲ وصل کنید.  
۵. از ادعای بسته‌شدن blocker، پذیرش evidence، دریافت signoff، آمادگی تولید یا تأیید انتشار خودداری کنید مگر اینکه evidence پذیرفته‌شده و signoff معتبر واقعاً لینک شده باشد.

## non-claimهای فعلی

- گام ۱۳ هنوز کامل نشده است.
- گام ۱۲ هنوز باز است.
- هیچ blockerای بسته نشده است.
- هیچ evidence پذیرفته‌شده یا reviewer signoff ادعا نشده است.
- production readiness ادعا نمی‌شود.
- release approval ادعا نمی‌شود.
- external audit کامل نشده است.
- formal verification کامل نشده است.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

</div>
