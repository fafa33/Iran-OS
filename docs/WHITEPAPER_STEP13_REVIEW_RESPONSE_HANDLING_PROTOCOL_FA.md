<div dir="rtl">

# پروتکل مدیریت پاسخ‌های review در گام ۱۳ و گام ۱۲

**نام فنی:** Step 13 Review Response Handling Protocol  
**نوع سند:** documentation-only / review response handling protocol  
**وضعیت:** باز؛ این سند هیچ review، evidence، signoff، blocker closure یا readiness ایجاد نمی‌کند.

## ۱. هدف

این سند مشخص می‌کند اگر در آینده برای issueهای #12 تا #19 پاسخ review، comment، ایراد، درخواست تغییر، evidence request یا signoff احتمالی ثبت شد، آن پاسخ چگونه باید بدون claim زودرس مدیریت شود.

هدف این پروتکل این است که هیچ review comment به‌صورت اشتباهی به‌عنوان accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion یا formal verification completion تفسیر نشود.

این سند فقط روش پردازش پاسخ‌های آینده را منظم می‌کند و خودش هیچ پاسخ review را complete یا accepted اعلام نمی‌کند.

## ۲. اصول پایه

| اصل | توضیح |
| --- | --- |
| comment مساوی signoff نیست | هر comment فقط نظر یا پرسش است مگر اینکه signoff صریح، معتبر و issue-level باشد. |
| requested changes مساوی failure نهایی نیست | درخواست اصلاح باید به task کوچک یا سند اصلاحی تبدیل شود. |
| needs evidence مساوی accepted evidence نیست | evidence باید جداگانه با قالب evidence ثبت و بعد review شود. |
| signoff احتمالی باید صریح باشد | signoff فقط وقتی معتبر است که scope، reviewer، issue و claim دقیقاً مشخص باشند. |
| ambiguity باید کم شود | هر ابهام باید بدون claim و بدون تغییر foundation پروژه به اصلاح سندی تبدیل شود. |
| Step 12 و Step 13 باز می‌مانند | هیچ پاسخ review به‌تنهایی Step 12 یا Step 13 را نمی‌بندد. |

## ۳. طبقه‌بندی پاسخ‌های review

| نوع پاسخ | معنی | اقدام مجاز |
| --- | --- | --- |
| question | پرسش یا ابهام | پاسخ توضیحی یا اصلاح سند بدون claim |
| comment | نظر عمومی | ثبت و ارزیابی؛ بدون signoff |
| suggestion | پیشنهاد اصلاح | تبدیل به PR/doc update کوچک در صورت مناسب بودن |
| requested changes | درخواست تغییر | ثبت task کوچک و انجام اصلاح محدود |
| needs evidence | نیاز به evidence | ارجاع به قالب evidence آینده |
| scope concern | ابهام در دامنه | اصلاح scope/out-of-scope |
| claim concern | خطر claim زودرس | اصلاح فوری wording و ارجاع به #18 |
| possible signoff | احتمال signoff | بررسی سخت‌گیرانه؛ signoff تلقی نشود مگر صریح و معتبر باشد |
| explicit signoff | signoff صریح | فقط با scope، reviewer، issue، evidence و non-claim check معتبر قابل ثبت است |

## ۴. مسیر پردازش comment ساده

اگر review فقط comment ساده بود:

۱. متن comment خوانده شود.  
۲. issue و سند مرتبط مشخص شود.  
۳. اگر فقط نظر یا پرسش است، به‌عنوان review comment ثبت شود.  
۴. اگر اصلاح لازم دارد، به task کوچک تبدیل شود.  
۵. هیچ signoff یا accepted evidence از comment ساده برداشت نشود.

## ۵. مسیر پردازش requested changes

اگر reviewer درخواست تغییر داد:

۱. تغییر دقیق استخراج شود.  
۲. مشخص شود تغییر مربوط به کدام سند است.  
۳. اگر تغییر documentation-only است، در PR یا commit کوچک انجام شود.  
۴. اگر تغییر به contracts، test، package یا behavior مربوط است، بدون تصمیم جداگانه انجام نشود.  
۵. پس از انجام تغییر، پاسخ باید فقط بگوید تغییر انجام شد؛ نه اینکه signoff گرفته شد.

## ۶. مسیر پردازش needs evidence

اگر reviewer evidence خواست:

۱. نوع evidence مشخص شود: audit، formal verification، custody، oracle، deployment، release یا non-claim.  
۲. issue مرتبط از #12 تا #19 مشخص شود.  
۳. از `WHITEPAPER_STEP13_FUTURE_EVIDENCE_SUBMISSION_TEMPLATE_FA.md` استفاده شود.  
۴. evidence تا پیش از review و signoff معتبر accepted تلقی نشود.  
۵. اگر evidence به claim حساس مربوط است، issue #18 نیز بررسی شود.

## ۷. مسیر پردازش claim concern

اگر reviewer گفت عبارتی ممکن است claim زودرس بسازد:

۱. عبارت دقیق پیدا شود.  
۲. سند یا comment مرتبط مشخص شود.  
۳. wording به‌گونه‌ای اصلاح شود که هیچ production readiness، release approval، audit completion، formal verification completion، blocker closure، accepted evidence یا reviewer signoff القا نکند.  
۴. در صورت نیاز، issue #18 به‌عنوان non-claim preservation reference لینک شود.  
۵. اصلاح claim concern به معنی closure یا signoff نیست.

## ۸. مسیر پردازش signoff احتمالی

اگر پاسخی شبیه signoff بود اما صریح نبود:

- نباید signoff تلقی شود.
- باید از reviewer خواسته شود scope و claim دقیق را روشن کند.
- باید مشخص شود signoff برای کدام issue، کدام evidence و کدام blocker است.
- تا پیش از صراحت، وضعیت باید pending بماند.

## ۹. معیارهای حداقلی signoff معتبر آینده

یک signoff فقط وقتی قابل بررسی است که حداقل این موارد را داشته باشد:

| فیلد | توضیح |
| --- | --- |
| reviewer identity / role | بازبین یا نقش بازبین مشخص باشد. |
| related issue | issue دقیق از #12 تا #19 مشخص باشد. |
| scope | دامنه signoff دقیق باشد. |
| out-of-scope | موارد خارج از signoff مشخص باشد. |
| related evidence | evidence یا artifact مرتبط لینک شده باشد. |
| claim allowed | دقیقاً مشخص باشد چه claimی مجاز است. |
| claim not allowed | دقیقاً مشخص باشد چه claimهایی هنوز مجاز نیستند. |
| non-claim check | کنترل عدم claim زودرس وجود داشته باشد. |

حتی با وجود این موارد، signoff باید در issue مربوط ثبت و بررسی شود. این پروتکل خودش signoff را accepted نمی‌کند.

## ۱۰. نگاشت پاسخ‌ها به issueهای #12 تا #19

| issue | نوع پاسخ حساس | مسیر مدیریت |
| --- | --- | --- |
| #12 | audit comment / audit finding / audit signoff | بدون audit completion تا signoff معتبر |
| #13 | proof comment / invariant concern / formal signoff | بدون formal completion تا signoff معتبر |
| #14 | custody concern / signer / quorum / key rotation | بدون custody approval تا signoff معتبر |
| #15 | feeder/source/oracle operations concern | بدون oracle signoff یا accepted source |
| #16 | runbook/stale-data/incident concern | بدون accepted runbook |
| #17 | deployment/manifest/readiness concern | بدون deployment readiness یا accepted manifest |
| #18 | claim-safety / signal-only / no-downstream concern | بدون closure یا signoff ضمنی |
| #19 | release/readiness-gate concern | بدون release approval یا production readiness |

## ۱۱. پاسخ استاندارد به reviewer

برای پاسخ به reviewer، متن باید محدود و دقیق باشد:

```text
Thank you. This has been recorded as a review comment only.
No signoff, accepted evidence, blocker closure, production readiness, release approval, audit completion, or formal verification completion is implied.
We will handle the requested change/evidence under the related issue and keep Step 12 and Step 13 open unless explicit issue-level signoff is later provided.
```

در فارسی:

```text
این پاسخ فقط به‌عنوان review comment ثبت می‌شود و هیچ signoff، accepted evidence، blocker closure، readiness، release approval، audit completion یا formal verification completion ایجاد نمی‌کند.
```

## ۱۲. موارد ممنوع

در پاسخ به reviewها نباید از این برداشت‌ها استفاده شود مگر اینکه signoff معتبر و صریح وجود داشته باشد:

- reviewer approved
- evidence accepted
- blocker closed
- audit complete
- formal verification complete
- production ready
- release approved
- deployment approved
- custody approved
- oracle signed off
- Step 12 closed
- Step 13 closed

## ۱۳. گام بعدی پیشنهادی

پس از ثبت این پروتکل، مسیر درست این است:

۱. این سند به سند مادر Step 13 لینک شود.  
۲. روی issue #18 به‌عنوان مرکز non-claim preservation لینک شود.  
۳. تا دریافت review واقعی، ساخت سند پایه متوقف شود مگر نیاز روشن ایجاد شود.  
۴. هر review واقعی با همین پروتکل پردازش شود.

## ۱۴. non-claim نهایی

این سند فقط پروتکل مدیریت پاسخ‌های review آینده است. هیچ review کامل‌شده، هیچ evidence پذیرفته‌شده، هیچ reviewer signoff، هیچ blocker closure، هیچ production readiness، هیچ release approval، هیچ audit completion یا formal verification completion ادعا نشده، و Step 12 و Step 13 همچنان باز هستند.

</div>
