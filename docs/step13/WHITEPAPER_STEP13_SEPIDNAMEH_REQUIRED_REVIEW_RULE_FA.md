<div dir="rtl">

# قاعده اجباری بودن خواندن سپیدنامه برای review معتبر گام ۱۳

**نام فنی:** Step 13 Sepidnameh-Required Review Rule  
**نوع سند:** documentation-only / review-scope-rule / governance-process-bugfix  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند یک bug مهم فرایندی را ثبت و مرزبندی می‌کند:

```text
No Sepidnameh read → no Sepidnameh-alignment review.
No Charter read → no welfare/justice/constitutional review.
No full source context → only limited-scope risk note.
```

هر review، چه توسط AI و چه توسط انسان، اگر سپیدنامه اصلی ایران‌اواس را دقیق نخوانده باشد، حق ندارد درباره سازگاری یا ناسازگاری با روح سپیدنامه، هدف اصلی ایران‌اواس، یا حقانیت ساختار پروژه conclusion بدهد.

## ۲. bug ثبت‌شده

در reviewهای قبلی AI، برخی یافته‌ها درباره زمینه ایران، مشروعیت، جامعه متکثر، یا معماری آینده مطرح شدند، اما سپیدنامه اصلی و منشور رفاه و عدالت در همان reviewها به‌طور کامل خوانده نشده بودند.

این وضعیت یک bug فرایندی است، چون ممکن است review محدود به‌اشتباه به‌عنوان review کامل سپیدنامه‌ای یا ایران‌محور فهمیده شود.

## ۳. قاعده سخت scope

از این پس هر review باید پیش از هر finding، بخش `Source Coverage` داشته باشد و صریحاً اعلام کند:

- آیا سپیدنامه اصلی ایران‌اواس را خوانده است یا نه؛
- آیا منشور رفاه و عدالت / پیمان ملی مشروطه سکولار را خوانده است یا نه؛
- آیا اسناد Step 13 را با متن کامل خوانده است یا فقط نام فایل‌ها را دیده؛
- آیا issues، commits و blockers را دیده است یا نه؛
- آیا review آن `partial-scope`، `limited-context`، `step13-content-only`، `Sepidnameh-aware`، `Charter-aware`، یا `full-context` است.

## ۴. خروجی‌های مجاز و ممنوع

| وضعیت ورودی | خروجی مجاز | خروجی ممنوع |
| --- | --- | --- |
| سپیدنامه خوانده نشده | limited-scope risk note | Sepidnameh alignment / misalignment conclusion |
| منشور خوانده نشده | generic governance risk note | welfare/justice/constitutional conclusion |
| فقط Step 13 خوانده شده | wording/process/non-claim findings | conclusion درباره کل ایران‌اواس |
| issues/commits خوانده نشده | documentation review | repo-level review claim |
| کل repo خوانده نشده | source-limited finding draft | audit completion / formal verification |
| AI reviewer، حتی با همه متن‌ها | pre-review / risk note | signoff / accepted evidence / closure |

## ۵. عبارت الزامی برای review ناقص

اگر سپیدنامه خوانده نشده باشد، reviewer باید صریحاً بنویسد:

```text
No Sepidnameh alignment conclusion is possible because the Sepidnameh was not reviewed.
```

فارسی:

```text
هیچ نتیجه‌گیری درباره سازگاری یا ناسازگاری با سپیدنامه ممکن نیست، چون سپیدنامه بررسی نشده است.
```

اگر منشور رفاه و عدالت خوانده نشده باشد، reviewer باید صریحاً بنویسد:

```text
No welfare/justice/constitutional conclusion is possible because the Charter was not reviewed.
```

فارسی:

```text
هیچ نتیجه‌گیری درباره رفاه، عدالت یا سازگاری مشروطه‌ای ممکن نیست، چون منشور بررسی نشده است.
```

## ۶. قاعده برای findings قبلی

هر finding قبلی که بدون خواندن سپیدنامه یا منشور صادر شده باشد، باید چنین فهمیده شود:

```text
limited-scope risk note only; useful for review preparation; not a final project judgment; not Sepidnameh alignment or misalignment; not Charter alignment or misalignment.
```

فارسی:

```text
فقط یادداشت ریسک با دامنه محدود؛ مفید برای آماده‌سازی review؛ نه داوری نهایی درباره پروژه؛ نه اعلام سازگاری یا ناسازگاری با سپیدنامه؛ نه اعلام سازگاری یا ناسازگاری با منشور.
```

## ۷. اثر بر reviewهای آینده

هیچ AI یا انسان نباید صرفاً با خواندن چند سند Step 13، درباره روح سپیدنامه یا حقانیت ایران‌اواس conclusion بدهد.

برای review معتبرتر، حداقل ورودی لازم:

۱. سپیدنامه اصلی ایران‌اواس؛  
۲. منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛  
۳. اسناد مرتبط Step 13؛  
۴. snapshot وضعیت فعلی؛  
۵. وضعیت issues و blockers مرتبط؛  
۶. non-claim rules.

حتی در این حالت، اگر reviewer هوش مصنوعی باشد، خروجی فقط pre-review / risk note است، نه signoff.

## ۸. non-claim نهایی

این سند فقط bugfix فرایندی و قاعده scope برای reviewهای آینده است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus، Iran-context-complete review، full-context review completion یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
