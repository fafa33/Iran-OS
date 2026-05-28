<div dir="rtl">

# قالب درخواست review برای گام ۱۳ و گام ۱۲

**نام فنی:** Step 13 Review Request Template  
**نوع سند:** documentation-only / future review request template  
**وضعیت:** باز؛ این قالب هیچ review، evidence، signoff، blocker closure یا readiness ایجاد نمی‌کند.

## ۱. هدف

این سند یک قالب پیشنهادی برای درخواست review آینده است تا هر درخواست بازبینی به‌صورت روشن، قابل ردیابی و بدون claim زودرس ثبت شود.

هدف این قالب این است که اگر در آینده برای audit، formal verification، custody، oracle operations، deployment، release، non-claim preservation یا نگاشت سپیدنامه به سیستم بازبینی لازم شد، scope، issue، evidence مورد نیاز، نوع بازبین و مرز non-claim از ابتدا روشن باشد.

این قالب فقط مسیر درخواست review را منظم می‌کند. خود review را انجام‌شده، accepted، signed off یا کامل‌شده اعلام نمی‌کند.

## ۲. این قالب چه چیزی نیست؟

این قالب:

- review انجام‌شده نیست.
- reviewer signoff نیست.
- evidence accepted نیست.
- audit completion نیست.
- formal verification completion نیست.
- custody approval نیست.
- oracle signoff نیست.
- release approval نیست.
- production readiness نیست.
- blocker closure نیست.
- Step 12 یا Step 13 را نمی‌بندد.

## ۳. اطلاعات پایه درخواست review

هر درخواست review آینده باید حداقل این اطلاعات را داشته باشد:

| فیلد | توضیح | وضعیت |
| --- | --- | --- |
| review title | عنوان کوتاه و دقیق review | required |
| requester | فرد یا نقش درخواست‌کننده review | required |
| date | تاریخ درخواست | required |
| related issue | issue مرتبط از #12 تا #19 | required |
| related blocker | blocker مرتبط، اگر وجود دارد | required if applicable |
| related document(s) | سند، mini spec، checklist یا evidence مرتبط | required |
| review type | audit، formal verification، custody، oracle، deployment، release، non-claim، governance یا community review | required |
| review scope | دامنه دقیق review | required |
| out-of-scope | مواردی که review پوشش نمی‌دهد | required |
| evidence needed | evidence یا artifact لازم برای review | required |
| reviewer profile | نوع تخصص یا نقش بازبین لازم | required |
| signoff requested | آیا signoff درخواست می‌شود یا فقط نظر review؟ | required |
| non-claim check | کنترل اینکه درخواست review claim زودرس ایجاد نمی‌کند | required |
| status | draft / requested / under review / returned / needs evidence / signed off by explicit reviewer | required |

## ۴. قالب پیشنهادی درخواست review

```text
Review title:

Requester / role:

Date:

Related issue:

Related blocker:

Related document(s):

Review type:

Review scope:

Out of scope:

Evidence needed:

Reviewer profile needed:

Is signoff requested, or review comments only?

Risk / limitation notes:

Non-claim check:

Current status:
```

## ۵. non-claim check اجباری

هر درخواست review آینده باید این بخش را داشته باشد:

```text
This review request does not claim:
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
این درخواست review تا زمانی که در issue مربوط بررسی، پذیرفته و signoff نشده باشد، هیچ‌کدام از موارد زیر را ادعا نمی‌کند:
- آمادگی تولید
- تأیید انتشار
- تکمیل audit بیرونی
- تکمیل formal verification
- بسته‌شدن blocker
- پذیرفته‌شدن evidence
- reviewer signoff
```

## ۶. نگاشت نوع review به issue

| review type | issue اصلی | توضیح |
| --- | --- | --- |
| external audit review | #12 | فقط با evidence و signoff معتبر می‌تواند audit claim بسازد. |
| formal verification review | #13 | فقط با proof و signoff معتبر می‌تواند formal claim بسازد. |
| custody review | #14 | signer، quorum، key rotation، emergency authority و incident response. |
| oracle operations review | #15 | feeder، source، monitoring، freshness و operations packet. |
| oracle runbook review | #16 | stale-data، deviation، invalidation، incident response و runbook. |
| deployment review | #17 | dry-run، manifest و deployment evidence؛ release approval نیست. |
| non-claim review | #18 | حفظ signal-only، no-downstream-execution و claim-safety. |
| release signoff review | #19 | فقط برای release approval با signoff معتبر. |

## ۷. تفاوت review comment و signoff

| مفهوم | معنی |
| --- | --- |
| review comment | نظر، پرسش، ایراد یا پیشنهاد؛ به معنی تأیید نهایی نیست. |
| requested changes | درخواست اصلاح؛ به معنی رد نهایی یا closure نیست. |
| needs evidence | یعنی evidence کافی نیست یا باید تکمیل شود. |
| explicit signoff | فقط وقتی معتبر است که بازبین واجد صلاحیت صریحاً signoff را در issue مرتبط ثبت کند. |
| accepted evidence | فقط وقتی معتبر است که evidence در issue مربوط با signoff صریح پذیرفته شود. |

هیچ review comment نباید به‌صورت ضمنی به signoff یا accepted evidence تعبیر شود.

## ۸. معیارهای ناقص‌بودن درخواست review

هر درخواست review ناقص است اگر:

- issue مرتبط ندارد.
- scope و out-of-scope ندارد.
- evidence مورد نیاز را مشخص نکرده است.
- reviewer profile ندارد.
- روشن نکرده review comment می‌خواهد یا signoff.
- non-claim check ندارد.
- به production readiness، release approval، audit completion یا formal verification completion اشاره می‌کند بدون مسیر معتبر signoff.

## ۹. مسیر استفاده پیشنهادی

۱. درخواست review با این قالب آماده شود.  
۲. issue مرتبط از #12 تا #19 مشخص شود.  
۳. اسناد و evidence مرتبط لینک شوند.  
۴. مشخص شود فقط review comment لازم است یا signoff هم درخواست می‌شود.  
۵. تا پیش از signoff معتبر، وضعیت نباید signed off یا accepted باشد.  
۶. اگر review به claim حساس مربوط است، #18 هم باید بررسی شود.

## ۱۰. non-claim نهایی

این سند فقط قالب درخواست review آینده است. هیچ review انجام نشده، هیچ evidence پذیرفته نشده، هیچ reviewer signoff گرفته نشده، هیچ blocker بسته نشده، هیچ production readiness، release approval، audit completion یا formal verification completion ادعا نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
