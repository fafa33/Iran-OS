<div dir="rtl">

# قالب ثبت evidence آینده برای گام ۱۳ و گام ۱۲

**نام فنی:** Step 13 Future Evidence Submission Template  
**نوع سند:** documentation-only / future evidence template  
**وضعیت:** باز؛ این قالب هیچ evidenceای را پذیرفته‌شده اعلام نمی‌کند و هیچ signoff ایجاد نمی‌کند.

## ۱. هدف

این سند یک قالب پیشنهادی برای ثبت evidence آینده است تا هر evidence احتمالی به‌صورت روشن، قابل ردیابی و بدون claim زودرس ثبت شود.

هدف این قالب این است که اگر در آینده برای audit، formal verification، custody، oracle operations، deployment، release یا non-claim preservation شواهدی ارائه شد، مشخص باشد آن evidence باید به کدام issue، کدام blocker، کدام سند، کدام بازبین و کدام نوع signoff وصل شود.

این قالب فقط مسیر ثبت evidence را منظم می‌کند. خود evidence را accepted نمی‌کند.

## ۲. این قالب چه چیزی نیست؟

این قالب:

- evidence accepted نیست.
- reviewer signoff نیست.
- audit completion نیست.
- formal verification completion نیست.
- custody approval نیست.
- oracle signoff نیست.
- release approval نیست.
- production readiness نیست.
- blocker closure نیست.
- Step 12 یا Step 13 را نمی‌بندد.

## ۳. اطلاعات پایه evidence

هر evidence آینده باید حداقل این اطلاعات را داشته باشد:

| فیلد | توضیح | وضعیت |
| --- | --- | --- |
| evidence title | عنوان کوتاه و دقیق evidence | required |
| submitter | فرد یا نقش ثبت‌کننده | required |
| date | تاریخ ثبت | required |
| related issue | issue مرتبط از #12 تا #19 | required |
| related blocker | blocker مرتبط، اگر وجود دارد | required if applicable |
| related document | سند یا mini spec مرتبط | required |
| evidence type | audit، formal proof، custody، oracle، deployment، release، non-claim یا review note | required |
| scope | دامنه دقیق evidence | required |
| out-of-scope | مواردی که evidence پوشش نمی‌دهد | required |
| reviewer needed | نوع بازبین لازم | required |
| signoff required | آیا signoff لازم است؟ اگر بله، چه نوعی؟ | required |
| status | draft / submitted / under review / rejected / accepted by explicit signoff | required |

## ۴. قالب پیشنهادی ثبت evidence

```text
Evidence title:

Submitter / role:

Date:

Related issue:

Related blocker:

Related document(s):

Evidence type:

Scope:

Out of scope:

Summary:

Files / links / artifacts:

Reviewer needed:

Signoff required:

Risk / limitation notes:

Non-claim check:

Current status:
```

## ۵. non-claim check اجباری

هر evidence آینده باید این بخش را داشته باشد:

```text
This submission does not claim:
- production readiness
- release approval
- external audit completion
- formal verification completion
- blocker closure
- accepted evidence
- reviewer signoff
unless explicitly reviewed, accepted, and signed off in the related issue.
```

در نسخه فارسی:

```text
این ثبت evidence تا زمانی که در issue مربوط بررسی، پذیرفته و signoff نشده باشد، هیچ‌کدام از موارد زیر را ادعا نمی‌کند:
- آمادگی تولید
- تأیید انتشار
- تکمیل audit بیرونی
- تکمیل formal verification
- بسته‌شدن blocker
- پذیرفته‌شدن evidence
- reviewer signoff
```

## ۶. نگاشت نوع evidence به issue

| evidence type | issue اصلی | توضیح |
| --- | --- | --- |
| external audit | #12 | فقط با review و signoff معتبر می‌تواند audit claim بسازد. |
| formal verification | #13 | فقط با proof و signoff معتبر می‌تواند formal claim بسازد. |
| custody / key-management | #14 | signer، quorum، key rotation و incident response. |
| oracle operations packet | #15 | feeder، source، monitoring، freshness و operations. |
| oracle runbook | #16 | stale-data، deviation، invalidation و incident response. |
| deployment dry-run / manifest | #17 | فقط برای deployment evidence؛ release approval نیست. |
| non-claim preservation | #18 | کنترل عدم ادعای زودرس و حفظ signal-only / no-downstream-execution. |
| release signoff | #19 | فقط برای release approval با signoff معتبر. |

## ۷. معیارهای ناقص‌بودن evidence

هر ثبت evidence ناقص است اگر:

- issue مرتبط ندارد.
- blocker مرتبط را مشخص نکرده است.
- دامنه و out-of-scope ندارد.
- reviewer لازم را مشخص نکرده است.
- signoff لازم را مشخص نکرده است.
- non-claim check ندارد.
- ادعای accepted evidence یا signoff می‌کند بدون اینکه در issue مربوط ثبت شده باشد.
- به production readiness، release approval، audit completion یا formal verification completion اشاره می‌کند بدون مسیر معتبر signoff.

## ۸. وضعیت‌های مجاز evidence

| status | معنی |
| --- | --- |
| draft | هنوز آماده بررسی نیست. |
| submitted | برای بررسی ثبت شده، اما پذیرفته نشده است. |
| under review | در حال بررسی است. |
| rejected | پذیرفته نشده است. |
| needs revision | نیازمند اصلاح یا evidence تکمیلی است. |
| accepted by explicit signoff | فقط وقتی مجاز است که signoff معتبر در issue مربوط ثبت شده باشد. |

هیچ وضعیت دیگری نباید به‌گونه‌ای استفاده شود که accepted evidence یا signoff ضمنی ایجاد کند.

## ۹. مسیر استفاده پیشنهادی

۱. evidence با این قالب آماده شود.  
۲. issue مرتبط از #12 تا #19 مشخص شود.  
۳. متن evidence یا لینک artifact در همان issue ثبت شود.  
۴. reviewer لازم مشخص شود.  
۵. تا پیش از signoff معتبر، status نباید accepted باشد.  
۶. اگر evidence به claim حساس مربوط است، #18 هم باید بررسی شود.

## ۱۰. non-claim نهایی

این سند فقط قالب ثبت evidence آینده است. هیچ evidence پذیرفته نشده، هیچ signoff گرفته نشده، هیچ blocker بسته نشده، هیچ production readiness، release approval، audit completion یا formal verification completion ادعا نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
