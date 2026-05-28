<div dir="rtl">

# چک‌لیست شواهد گام ۱۳ برای اوراکل‌ها و تجمیع داده

**نام فنی:** Step 13 Oracle Evidence Checklist  
**نوع سند:** documentation-only / evidence checklist for review  
**وضعیت:** باز؛ این سند feeder واقعی، threshold نهایی، aggregation rule نهایی، oracle signoff، evidence پذیرفته‌شده یا اجرای خودکار ایجاد نمی‌کند.

## ۱. هدف

این سند چک‌لیست اولیه شواهد لازم برای مسیر oracle operations، oracle runbook، feederها، تازگی داده، داده قدیمی، انحراف داده، تجمیع سیگنال‌ها، monitoring و حفظ مرز signal-only را مشخص می‌کند.

هدف این نیست که گام ۱۲ یا گام ۱۳ بسته شود. هدف این است که اگر بعداً قرار شد درباره اوراکل یا تجمیع داده تصمیم فنی/حکمرانی گرفته شود، روشن باشد چه چیزهایی باید به issueهای #15، #16 و #18 وصل شوند.

## ۲. محدوده issueها

| issue | موضوع | نقش در این چک‌لیست |
| --- | --- | --- |
| #15 | oracle operations packet | مسیر اصلی evidence برای feeder، source، monitoring و operations |
| #16 | oracle operations runbook | مسیر runbook، incident، stale-data، deviation و invalidation |
| #18 | non-claim preservation | جلوگیری از تبدیل سیگنال به اختیار حاکمیتی مستقل یا اجرای خودکار |
| #12 | external audit | فقط اگر ادعای audit یا production security مطرح شود |
| #13 | formal verification | فقط اگر ادعای proof رسمی مطرح شود |

## ۳. چک‌لیست feeder registry

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| feeder role definition | تعریف نقش feeder بدون معرفی منبع واقعی قطعی | #15 | pending |
| feeder onboarding path | مسیر ورود feeder | #15، #16 | pending |
| feeder suspension path | مسیر تعلیق feeder | #15، #16 | pending |
| feeder removal path | مسیر حذف feeder | #15، #16 | pending |
| feeder conflict review | بررسی تعارض منافع یا تمرکز داده | #15، #18 | pending |
| feeder audit trail | مسیر ثبت تغییرات feeder | #15، #12 | pending if audit claim |

هیچ feeder واقعی در این سند معرفی یا تأیید نمی‌شود.

## ۴. چک‌لیست source attestation

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| source description | توضیح منبع داده | #15 | pending |
| source reliability note | یادداشت درباره قابلیت اتکا و محدودیت‌ها | #15 | pending |
| source update frequency | تناوب به‌روزرسانی منبع | #15، #16 | pending |
| source tamper risk review | بررسی خطر دستکاری داده | #15، #18 | pending |
| source fallback path | مسیر جایگزین در صورت خرابی منبع | #16 | pending |
| source rejection path | مسیر رد منبع مشکوک | #16، #18 | pending |

هیچ data source واقعی در این سند accepted نمی‌شود.

## ۵. چک‌لیست freshness و staleness

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| freshness window rationale | دلیل انتخاب بازه تازگی داده | #15، #16 | pending |
| near-stale behavior | رفتار با داده نزدیک به انقضا | #16 | pending |
| stale-data rejection rule | قاعده رد داده منقضی | #16 | pending |
| unknown-time rejection rule | قاعده برخورد با داده بدون timestamp معتبر | #16 | pending |
| monitoring alert path | مسیر هشدار برای stale data | #15، #16 | pending |
| non-execution check | اثبات اینکه داده fresh هم اجرای خودکار ایجاد نمی‌کند | #18 | pending |

هیچ freshness window یا staleness rule نهایی در این سند تصویب نمی‌شود.

## ۶. چک‌لیست deviation handling

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| deviation definition | تعریف اختلاف یا داده پرت | #15، #16 | pending |
| deviation threshold rationale | دلیل threshold احتمالی، بدون عدد نهایی | #15، #16 | pending |
| severe deviation behavior | رفتار با اختلاف شدید | #16 | pending |
| suspend signal path | مسیر تعلیق سیگنال | #16، #18 | pending |
| manual review requirement | الزام بازبینی انسانی/حکمرانی | #16، #18 | pending |
| additional feeder requirement | الزام منبع تکمیلی در صورت اختلاف | #15، #16 | pending |

هیچ deviation threshold نهایی در این سند تصویب نمی‌شود.

## ۷. چک‌لیست aggregation review

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| aggregation method description | توضیح روش احتمالی تجمیع داده | #15 | pending |
| weighting rationale | دلیل وزن‌دهی احتمالی، بدون وزن نهایی | #15 | pending |
| outlier handling | مسیر برخورد با داده پرت | #15، #16 | pending |
| quorum of feeds | تعداد یا تنوع منبع لازم، بدون عدد نهایی | #15 | pending |
| review-before-use rule | الزام review قبل از هر استفاده حساس | #16، #18 | pending |
| no-downstream-execution proof | شواهد اینکه aggregation اجرای خودکار ایجاد نمی‌کند | #18 | pending |

هیچ aggregation rule نهایی در این سند پذیرفته نمی‌شود.

## ۸. چک‌لیست invalidation و dispute

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| invalidation trigger | شرایط رد یا باطل‌کردن سیگنال | #16 | pending |
| dispute submission path | مسیر ثبت اعتراض به داده یا سیگنال | #16 | pending |
| review authority boundary | حدود اختیار بازبین در رد یا تعلیق سیگنال | #16، #18 | pending |
| post-invalidation record | ثبت خروجی پس از invalidation | #16 | pending |
| rollback consideration | بررسی اثر برگشت‌پذیری در صورت استفاده نادرست | #16، #18 | pending |
| no-sovereign-oracle check | بررسی اینکه oracle اختیار حاکمیتی مستقل نگرفته است | #18 | pending |

## ۹. چک‌لیست monitoring و runbook

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| monitoring scope | محدوده monitoring | #15، #16 | pending |
| liveness check | بررسی زنده‌بودن feeder/source | #15، #16 | pending |
| alert routing | مسیر ارسال هشدار | #16 | pending |
| incident report template | قالب گزارش incident اوراکل | #16 | pending |
| operator action boundary | حدود اقدام operator | #16، #18 | pending |
| governance escalation path | مسیر ارجاع به governance review | #16، #18 | pending |

## ۱۰. چک‌لیست signal-only boundary

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| signal-only declaration | تصریح اینکه خروجی oracle فقط سیگنال است | #18 | pending |
| no automatic freeze | عدم اجرای خودکار freeze | #18 | pending |
| no automatic mint | عدم اجرای خودکار mint | #18 | pending |
| no automatic budget allocation | عدم اجرای خودکار بودجه | #18 | pending |
| no automatic fee change | عدم تغییر خودکار fee | #18 | pending |
| no automatic governance action | عدم اقدام خودکار حکمرانی | #18 | pending |
| Fargard7PolicyAdapter boundary | حفظ proposal-only / non-executing بودن adapter | #18 | pending |

## ۱۱. معیارهای ناقص‌بودن evidence

هر مورد زیر یعنی evidence هنوز کافی نیست:

- feederها ذکر شده‌اند اما مسیر تعلیق یا حذف ندارند.
- source معرفی شده اما reliability note یا tamper risk review ندارد.
- freshness تعریف شده اما stale-data rejection rule ندارد.
- deviation تعریف شده اما مسیر suspend یا manual review ندارد.
- aggregation method نوشته شده اما no-downstream-execution proof ندارد.
- monitoring تعریف شده اما incident report یا escalation path ندارد.
- signal-only boundary در متن تضعیف شده یا مبهم است.
- هر عبارت به‌گونه‌ای نوشته شده که oracle signoff، accepted evidence، production readiness یا blocker closure را القا کند.

## ۱۲. خروجی مورد انتظار بعدی

گام بعدی بعد از این checklist می‌تواند یکی از موارد زیر باشد:

- لینک‌دادن این سند به سند مادر گام ۱۳
- ثبت comment روی issueهای #15، #16 یا #18 برای اشاره به این checklist
- دریافت review از بازبین oracle/governance بدون ادعای signoff
- آماده‌سازی template برای ثبت evidence آینده، بدون accepted evidence claim

## ۱۳. non-claim نهایی

این سند فقط چک‌لیست شواهد آینده است. هیچ feeder واقعی معرفی نشده، هیچ source پذیرفته نشده، هیچ threshold نهایی تصویب نشده، هیچ aggregation rule نهایی پذیرفته نشده، هیچ oracle signoff گرفته نشده، هیچ evidence پذیرفته نشده، هیچ downstream execution فعال نشده، هیچ blocker بسته نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
