<div dir="rtl">

# مینی‌اسپک گام ۱۳ برای نگهداشت کلید و چندامضایی

**نام فنی:** Step 13 Custody / Multisig Mini Spec  
**نوع سند:** documentation-only / mini spec for review  
**وضعیت:** باز؛ این سند قرارداد جدید، signer واقعی، quorum نهایی، evidence پذیرفته‌شده یا signoff ایجاد نمی‌کند.

## ۱. هدف

این سند برای روشن‌کردن چارچوب اولیه نگهداشت کلید، نقش‌ها، signerها و چندامضایی در مسیر گام ۱۳ نوشته شده است.

هدف این نیست که یک قرارداد multisig ساخته شود یا یک quorum نهایی تصویب شود. هدف این است که پیش از هر پیاده‌سازی یا ادعای تولید، مسیر review، evidence و signoff برای custody روشن باشد.

این سند به issueهای زیر وصل است:

- #14 برای custody / key-management / signer / quorum
- #18 برای حفظ non-claim و جلوگیری از ادعای زودرس
- #19 فقط در صورتی که بحث release authority یا release approval مطرح شود

## ۲. این سند چه چیزی نیست؟

این سند:

- قرارداد multisig نیست.
- لیست signer واقعی نیست.
- quorum نهایی نیست.
- policy اجرایی نیست.
- release approval نیست.
- custody signoff نیست.
- production readiness نیست.
- evidence پذیرفته‌شده نیست.
- Step 12 یا Step 13 را نمی‌بندد.

## ۳. اصل طراحی

نگهداشت کلید و چندامضایی در Iran-OS باید از منطق سپیدنامه پیروی کند:

- اختیار بدون ردیابی ایجاد نشود.
- هیچ نقش انسانی یا فنی به‌تنهایی اختیار حاکمیتی مطلق نداشته باشد.
- هر اختیار حساس باید به role، evidence، review و signoff وصل باشد.
- emergency authority باید محدود، قابل ثبت، قابل بازبینی و غیر دائمی باشد.
- هیچ مسیر custody نباید باعث دورزدن Kernel، non-claim discipline یا Step 12 شود.

## ۴. دامنه نقش‌ها

| حوزه نقش | توضیح | وضعیت |
| --- | --- | --- |
| نقش اجرایی | نقشی که در آینده ممکن است اجرای عملیاتی محدود داشته باشد | فقط پیشنهادی / needs review |
| نقش بازبین | نقشی که evidence، risk یا policy را بررسی می‌کند | فقط پیشنهادی / needs review |
| نقش اضطراری | نقشی برای شرایط بحرانی، freeze یا incident response | فقط پیشنهادی / needs strict limits |
| نقش release | نقشی که در آینده ممکن است به release signoff مربوط شود | فقط پیشنهادی / linked to #19 if needed |
| نقش oracle/custody liaison | نقشی برای اتصال custody به oracle ops و runbook | فقط پیشنهادی / linked to #15/#16 if needed |

هیچ‌کدام از این نقش‌ها در این سند فعال، منصوب، تأیید یا production-ready اعلام نمی‌شوند.

## ۵. signerها

هر signer آینده باید فقط پس از review و evidence روشن شود.

برای هر signer یا role-signing slot، این موارد باید مشخص شود:

| مورد | وضعیت لازم |
| --- | --- |
| شناسه نقش | باید تعریف شود، نه با نام شخصی شروع شود. |
| محدوده اختیار | باید محدود و قابل ردیابی باشد. |
| نوع تصمیم قابل امضا | باید مشخص شود. |
| سقف اختیار | باید مشخص شود. |
| وابستگی به review | باید روشن باشد. |
| مسیر تعلیق یا حذف | باید تعریف شود. |
| مسیر جایگزینی | باید تعریف شود. |
| evidence لازم | باید به #14 وصل شود. |

این سند هیچ signer واقعی معرفی نمی‌کند.

## ۶. quorum

quorum باید بر اساس نوع تصمیم فرق کند. این سند فقط دسته‌بندی اولیه را پیشنهاد می‌کند و عدد نهایی تعیین نمی‌کند.

| نوع تصمیم | نمونه | وضعیت quorum |
| --- | --- | --- |
| تصمیم مستنداتی | ویرایش سند، اصلاح نگاشت، ثبت gap | نیازمند review سبک؛ quorum نهایی تعریف نشده |
| تصمیم عملیاتی غیرحساس | runbook update یا monitoring note | نیازمند review؛ quorum نهایی تعریف نشده |
| تصمیم custody حساس | key rotation، role change، emergency response | نیازمند spec سخت‌گیرانه؛ quorum نهایی تعریف نشده |
| تصمیم release | release approval یا production gate | فقط از مسیر #19؛ quorum نهایی تعریف نشده |
| تصمیم حاکمیتی حساس | freeze، policy activation، downstream execution | در این سند مجاز یا فعال نمی‌شود |

## ۷. چرخش کلید

هر مسیر key rotation آینده باید حداقل این موارد را داشته باشد:

- دلیل چرخش کلید
- درخواست ثبت‌شده
- بازبین مرتبط
- signer یا role affected
- زمان‌بندی اجرا
- مسیر rollback یا recovery
- ثبت evidence
- اتصال به #14
- بررسی non-claim در #18 در صورت حساسیت حاکمیتی

تا قبل از این موارد، key rotation production-ready نیست.

## ۸. کلید compromise شده

اگر در آینده کلیدی compromise شود، مسیر پاسخ باید پیش از production مشخص باشد:

- تشخیص incident
- ثبت گزارش
- تعلیق موقت role یا signer
- محدودکردن blast radius
- بررسی اینکه آیا emergency authority فعال شده یا نه
- ثبت evidence
- بازبینی governance/custody
- مسیر recovery
- اتصال به #14 و در صورت نیاز #18

این سند incident response را فعال نمی‌کند؛ فقط نیازهای آینده را مشخص می‌کند.

## ۹. emergency authority

هر اختیار اضطراری آینده باید محدود باشد:

- زمان‌دار
- قابل ثبت
- قابل بازبینی
- قابل ابطال
- بدون اختیار دائمی
- بدون دورزدن evidence/signoff
- بدون تبدیل شدن به مسیر production readiness

در این سند هیچ emergency authority فعال یا تأیید نمی‌شود.

## ۱۰. مرز review، execution و signoff

| مفهوم | معنی |
| --- | --- |
| review | بررسی و نظر دادن؛ به معنی تأیید نهایی نیست. |
| evidence | بسته شواهد؛ تا زمانی که پذیرفته نشده، accepted evidence نیست. |
| signoff | تأیید رسمی بازبین واجد صلاحیت؛ در این سند وجود ندارد. |
| execution | اجرای واقعی یا اثرگذاری عملیاتی؛ در این سند ایجاد نمی‌شود. |
| release approval | تأیید انتشار؛ فقط از مسیر #19 و با evidence/signoff معتبر ممکن است. |

## ۱۱. خروجی مورد انتظار بعدی

گام بعدی پس از این mini spec می‌تواند یکی از موارد زیر باشد:

- ثبت comment روی issue #14 برای اشاره به این mini spec
- ساخت checklist تفصیلی custody evidence
- تهیه mini spec جداگانه برای oracle aggregation و signal-only boundary
- دریافت نظر بازبین governance/custody درباره اینکه این چارچوب با روح سپیدنامه سازگار است یا نه

## ۱۲. non-claim نهایی

این سند فقط چارچوب اولیه برای review آینده است. هیچ signer واقعی معرفی نشده، هیچ quorum نهایی تصویب نشده، هیچ قرارداد multisig ساخته نشده، هیچ blocker بسته نشده، هیچ evidence پذیرفته نشده، هیچ signoff گرفته نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
