<div dir="rtl">

# طبقه‌بندی safeguardهای موقت و غیرنهایی در گام ۱۳

**نام فنی:** Step 13 Temporary Non-Final Safeguard Taxonomy  
**نوع سند:** documentation-only / taxonomy-only / governance-safeguard-boundary  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند برای کاهش ریسک SR-004 از self-review سخت‌گیرانه ChatGPT ساخته شده است: ابهام در عبارت safeguard موقت، برگشت‌پذیر و غیرنهایی.

هدف این taxonomy این است که روشن شود findingهای AI-assisted چه نوع واکنش‌هایی می‌توانند پیشنهاد کنند، و کدام واکنش‌ها همچنان فقط documentation-only، status-only یا escalation-only هستند.

این سند هیچ safeguard اجرایی را فعال نمی‌کند و هیچ اجازه عملیاتی ایجاد نمی‌کند.

## ۲. اصل پایه

```text
AI finding may trigger visibility, logging, labeling, review preparation, or escalation proposals.
AI finding must not trigger approval, signoff, accepted evidence, closure, production readiness, release approval, or downstream execution.
```

فارسی:

```text
یافته AI می‌تواند منشأ مشاهده‌پذیری، ثبت، برچسب‌گذاری، آماده‌سازی review یا پیشنهاد escalation باشد.
یافته AI نباید منشأ approval، signoff، accepted evidence، closure، production readiness، release approval یا downstream execution شود.
```

## ۳. سطح‌های safeguard

| سطح | نام | ماهیت | نیاز به human/gate | مجاز در Step 13 فعلی؟ |
| --- | --- | --- | --- | --- |
| S0 | observation-only | فقط ثبت finding یا note | خیر، برای ثبت اولیه | بله، documentation-only |
| S1 | documentation-only | اصلاح wording، افزودن note، روشن‌سازی non-claim | review بعدی لازم است | بله، documentation-only |
| S2 | status-label | برچسب‌هایی مثل `risk flagged` یا `needs review` | برای تصمیم نهایی لازم است | فقط به‌عنوان proposal/status |
| S3 | escalation-only | ارجاع finding به reviewer یا نهاد بالاتر | بله | فقط پیشنهاد escalation |
| S4 | claim-restriction proposal | پیشنهاد محدودکردن wording یا claim حساس | بله | فقط proposal-only |
| S5 | operational safeguard candidate | هر چیزی که ممکن است اثر اجرایی، release، deployment یا governance داشته باشد | gate معتبر، evidence، review و signoff لازم است | در Step 13 فعلی مجاز نیست |
| S6 | irreversible/high-impact action | اقدام غیرقابل‌بازگشت یا پراثر | نیازمند فرایند مستقل معتبر | ممنوع در این سند |

## ۴. قواعد سطح S0 تا S2

### S0 — observation-only

مجاز است:

- ثبت finding؛
- ثبت risk note؛
- ثبت evidence gap؛
- ثبت wording concern؛
- ثبت unresolved state.

ممنوع است:

- acceptance؛
- signoff؛
- closure؛
- readiness؛
- approval.

### S1 — documentation-only

مجاز است:

- افزودن non-claim note؛
- اصلاح wording برای جلوگیری از overclaim؛
- افزودن reference به issue؛
- ساخت template، plan، rollup یا taxonomy؛
- روشن‌کردن اینکه Step 12 و Step 13 باز هستند.

ممنوع است:

- معرفی اصلاح documentation به‌عنوان evidence پذیرفته‌شده؛
- claim کردن completion؛
- بستن blocker.

### S2 — status-label

مجاز است به‌صورت non-final:

- `risk flagged`
- `needs review`
- `unresolved`
- `deferred`
- `escalation_required`

این statusها فقط وضعیت review هستند؛ هیچ‌کدام approval، rejection، acceptance یا closure نیستند.

## ۵. قواعد سطح S3 و S4

### S3 — escalation-only

یافته AI می‌تواند پیشنهاد دهد که موضوع به reviewer یا نهاد بالاتر ارجاع شود.

این escalation:

- decision نهایی نیست؛
- signoff نیست؛
- accepted evidence نیست؛
- فقط مسیر توجه و review را مشخص می‌کند.

### S4 — claim-restriction proposal

یافته AI می‌تواند پیشنهاد دهد یک claim حساس تا زمان review معتبر محدود یا بازنویسی شود.

در Step 13 فعلی، این فقط proposal است و نباید به enforcement یا action خودکار تبدیل شود.

نمونه wording امن:

```text
Suggested claim restriction: do not use this wording until human/governance review resolves the finding.
```

## ۶. قواعد سطح S5 و S6

### S5 — operational safeguard candidate

هر safeguard که ممکن است روی release، deployment، governance state، contract state، oracle state، budget، signer set یا اجرای downstream اثر بگذارد، در Step 13 فعلی فقط candidate است و مجاز نیست اجرا شود.

برای بررسی آینده، حداقل نیاز دارد به:

- evidence مشخص؛
- issue مشخص؛
- reviewer معتبر؛
- gate یا quorum معتبر؛
- signoff صریح؛
- ثبت scope و out-of-scope؛
- non-claim check.

### S6 — irreversible/high-impact action

اقدام‌های غیرقابل‌بازگشت یا پراثر در این سند ممنوع هستند.

این taxonomy هیچ مجوزی برای چنین اقدام‌هایی ایجاد نمی‌کند.

## ۷. نگاشت به findings self-review

| finding | ریسک | پاسخ taxonomy |
| --- | --- | --- |
| SR-003 | authority creep در Human Inaction Safeguard | human non-response فقط visibility/logging/escalation ایجاد می‌کند، نه approval یا action |
| SR-004 | ابهام temporary safeguard | سطح‌های S0 تا S6 مرز safeguard را روشن می‌کنند |
| SR-005 | حس maturity از زیادشدن اسناد | هر safeguard در این سند non-final و documentation-only باقی می‌ماند |
| SR-006 | consensus جعلی | safeguard از consensus جدا است؛ consensus فقط پس از reviewهای مستقل واقعی قابل بررسی است |
| SR-007 | hash gap | traceability model جداست؛ full hash capture هنوز pending است |

## ۸. عبارت‌های مجاز

عبارت‌های امن:

```text
finding recorded
risk flagged for review
needs human/governance review
escalation recommended
claim wording should remain restricted until review
proposal-only safeguard
no accepted evidence or signoff
```

## ۹. عبارت‌های ممنوع بدون signoff معتبر

عبارت‌های زیر نباید از safeguardهای این سند نتیجه گرفته شوند:

- approved
- accepted
- signed off
- evidence accepted
- blocker closed
- production ready
- release approved
- audit complete
- formally verified
- safe for downstream execution
- sovereign authority confirmed

## ۱۰. non-claim نهایی

این سند فقط taxonomy برای طبقه‌بندی safeguardهای موقت و غیرنهایی است. این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
