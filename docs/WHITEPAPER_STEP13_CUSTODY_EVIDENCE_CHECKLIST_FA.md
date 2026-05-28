<div dir="rtl">

# چک‌لیست شواهد گام ۱۳ برای نگهداشت کلید و چندامضایی

**نام فنی:** Step 13 Custody Evidence Checklist  
**نوع سند:** documentation-only / evidence checklist for review  
**وضعیت:** باز؛ این سند evidence پذیرفته‌شده، signer واقعی، quorum نهایی، custody signoff یا production readiness ایجاد نمی‌کند.

## ۱. هدف

این سند چک‌لیست اولیه شواهد لازم برای مسیر custody، key-management، signerها، quorum، چندامضایی و پاسخ به incident را مشخص می‌کند.

هدف این نیست که گام ۱۲ یا گام ۱۳ بسته شود. هدف این است که اگر بعداً قرار شد درباره custody یا multisig تصمیم فنی/حکمرانی گرفته شود، روشن باشد چه چیزهایی باید به issue #14 و در صورت نیاز #18 و #19 وصل شوند.

## ۲. محدوده issueها

| issue | موضوع | نقش در این چک‌لیست |
| --- | --- | --- |
| #14 | custody / key-management / signer / quorum | مسیر اصلی evidence و review |
| #18 | non-claim preservation | جلوگیری از ادعای زودرس یا ایجاد اختیار حاکمیتی بدون signoff |
| #19 | release signoff | فقط اگر custody به release authority وصل شود |
| #12 | external audit | فقط اگر ادعای audit یا production security مطرح شود |
| #13 | formal verification | فقط اگر ادعای proof رسمی مطرح شود |

## ۳. چک‌لیست نقش‌ها

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| role map | فهرست نقش‌های پیشنهادی بدون معرفی شخص واقعی | #14 | pending |
| role authority boundary | حدود اختیار هر نقش | #14، #18 | pending |
| role separation | تفکیک نقش اجرایی، بازبین، اضطراری و release | #14، #18 | pending |
| role conflict review | بررسی تعارض منافع یا تمرکز اختیار | #14، #18 | pending |
| role removal path | مسیر حذف یا تعلیق نقش | #14 | pending |
| role replacement path | مسیر جایگزینی نقش | #14 | pending |

هیچ نقش در این چک‌لیست فعال، منصوب یا تأیید نمی‌شود.

## ۴. چک‌لیست signerها

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| signer slot definition | تعریف جایگاه امضاکننده بر اساس نقش، نه شخص | #14 | pending |
| signer eligibility rule | قاعده صلاحیت signer | #14 | pending |
| signer onboarding path | مسیر ورود signer | #14 | pending |
| signer offboarding path | مسیر خروج signer | #14 | pending |
| signer suspension path | مسیر تعلیق signer در شرایط incident | #14 | pending |
| signer audit trail | مسیر ثبت اقدام‌ها و تغییرات signer | #14، #12 | pending |

هیچ signer واقعی در این سند معرفی یا تأیید نمی‌شود.

## ۵. چک‌لیست quorum و چندامضایی

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| decision category list | دسته‌بندی تصمیم‌ها بر اساس حساسیت | #14 | pending |
| quorum rationale | دلیل انتخاب quorum برای هر دسته | #14 | pending |
| quorum failure path | مسیر برخورد با نرسیدن به quorum | #14 | pending |
| emergency quorum limits | محدودیت quorum اضطراری | #14، #18 | pending |
| release quorum separation | تفکیک quorum release از quorum عملیاتی | #14، #19 | pending |
| no single point authority review | بررسی نبود اختیار مطلق برای یک فرد یا نقش | #14، #18 | pending |

هیچ quorum نهایی در این سند تصویب نمی‌شود.

## ۶. چک‌لیست چرخش کلید

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| key rotation trigger | شرایط شروع چرخش کلید | #14 | pending |
| key rotation request record | قالب ثبت درخواست چرخش | #14 | pending |
| approval path | مسیر بررسی و اجازه چرخش | #14 | pending |
| rollback/recovery plan | مسیر بازگشت یا بازیابی | #14 | pending |
| post-rotation review | بازبینی پس از چرخش | #14، #18 | pending |
| audit linkage | اتصال به audit در صورت ادعای امنیتی | #12 | pending |

تا قبل از تکمیل evidence و signoff معتبر، key rotation production-ready نیست.

## ۷. چک‌لیست کلید compromise شده

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| incident detection path | مسیر تشخیص compromise | #14 | pending |
| incident report template | قالب گزارش incident | #14 | pending |
| temporary suspension rule | قاعده تعلیق موقت | #14، #18 | pending |
| blast-radius review | بررسی محدوده آسیب | #14 | pending |
| recovery path | مسیر بازیابی | #14 | pending |
| governance review | بازبینی حکمرانی پس از incident | #14، #18 | pending |

این سند incident response را فعال نمی‌کند؛ فقط شواهد لازم آینده را مشخص می‌کند.

## ۸. چک‌لیست emergency authority

| evidence item | توضیح | issue | وضعیت |
| --- | --- | --- | --- |
| emergency scope | دامنه دقیق اختیار اضطراری | #14، #18 | pending |
| time limit | محدودیت زمانی | #14، #18 | pending |
| revocation path | مسیر ابطال اختیار اضطراری | #14، #18 | pending |
| review requirement | الزام بازبینی پس از استفاده | #14، #18 | pending |
| no permanent authority proof | شواهد اینکه اختیار اضطراری دائمی نمی‌شود | #18 | pending |
| release impact check | بررسی اثر احتمالی روی release | #19 | pending if applicable |

هیچ emergency authority در این سند فعال یا تأیید نمی‌شود.

## ۹. معیارهای ناقص‌بودن evidence

هر مورد زیر یعنی evidence هنوز کافی نیست:

- نقش‌ها فقط نام برده شده‌اند اما حدود اختیار ندارند.
- signerها معرفی شده‌اند اما مسیر حذف یا تعلیق ندارند.
- quorum عدد دارد اما دلیل ندارد.
- emergency authority تعریف شده اما محدودیت زمانی یا ابطال ندارد.
- key rotation تعریف شده اما rollback یا recovery ندارد.
- incident response تعریف شده اما audit trail ندارد.
- هر عبارت به‌گونه‌ای نوشته شده که production readiness، accepted evidence یا signoff را القا کند.

## ۱۰. خروجی مورد انتظار بعدی

گام بعدی بعد از این checklist می‌تواند یکی از موارد زیر باشد:

- لینک‌دادن این سند به سند مادر گام ۱۳
- ثبت comment روی issue #14 برای اشاره به این checklist
- ساخت Oracle Evidence Checklist برای #15 و #16
- دریافت review از بازبین custody/governance بدون ادعای signoff

## ۱۱. non-claim نهایی

این سند فقط چک‌لیست شواهد آینده است. هیچ signer واقعی معرفی نشده، هیچ quorum نهایی تصویب نشده، هیچ custody evidence پذیرفته نشده، هیچ custody signoff گرفته نشده، هیچ blocker بسته نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
