<div dir="rtl">

# Manifest بسته review کامل زمینه‌ای برای گام ۱۳

**نام فنی:** Step 13 Full-Context Review Bundle Manifest  
**نوع سند:** documentation-only / review-bundle-manifest-only / read-only-input-specification  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند مشخص می‌کند هر reviewer، چه AI و چه انسان، برای اظهار نظر معتبرتر درباره گام ۱۳ باید چه اسناد و contextهایی را بخواند.

این manifest جایگزین review نیست. این سند فقط فهرست ورودی‌های لازم برای یک review read-only و full-context است.

## ۲. اصل امنیتی

Gemini، Claude، Codex یا هر ابزار AI بیرونی نباید دسترسی عملیاتی به GitHub، token، permission، workflow، secrets، branch protection، issue mutation یا commit access داشته باشد.

روش مجاز:

```text
Read-only review bundle upload/paste only.
No GitHub access.
No repo mutation.
No workflow execution.
No issue update.
No commit.
No downstream execution.
```

فارسی:

```text
فقط upload یا paste بسته read-only برای review مجاز است.
هیچ دسترسی GitHub، تغییر repo، اجرای workflow، تغییر issue، commit یا downstream execution مجاز نیست.
```

## ۳. سطح‌های review

| سطح | ورودی لازم | خروجی مجاز | خروجی ممنوع |
| --- | --- | --- | --- |
| Level 1 | فقط اسناد Step 13 | finding draft درباره wording/non-claim | signoff / evidence / closure |
| Level 2 | Step 13 + سپیدنامه | سازگاری با روح سپیدنامه به‌صورت risk note | ادعای سازگاری نهایی |
| Level 3 | Step 13 + سپیدنامه + منشور رفاه و عدالت | risk note درباره رفاه، عدالت، کرامت، عدم تبعیض | approval یا conclusion نهایی |
| Level 4 | کل repo + issues + commits + blockers | repo-level risk detection | audit completion / formal verification |
| Level 5 | human/governance review معتبر | تصمیم انسانی/نهادی در صورت صلاحیت | توسط AI قابل انجام نیست |

## ۴. ورودی‌های الزامی برای full-context AI pre-review

### ۴.۱ اسناد اصلی فلسفی/حاکمیتی

- متن کامل سپیدنامه اصلی ایران‌اواس؛
- متن کامل منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛
- هر سند اصلی دیگری که چارچوب مشروعیت، عدالت، سکولاریسم، حقوق عمومی یا architecture حکمرانی را تعریف می‌کند.

### ۴.۲ اسناد Step 13

- `docs/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md`
- `docs/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md`
- `docs/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `docs/WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md`
- `docs/WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md`
- `docs/WHITEPAPER_STEP13_DOCUMENTATION_RISK_REDUCTION_PATCH_FA.md`
- `docs/WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md`
- `docs/WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md`
- `docs/WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md`
- `docs/WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md`
- `docs/WHITEPAPER_STEP13_IRANIAN_CONTEXT_REVIEW_LIMITATION_ADDENDUM_FA.md`
- `docs/WHITEPAPER_STEP13_IRAN_CONTEXT_AWARE_AI_REVIEW_PROMPT_FA.md`
- `docs/WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md`
- `docs/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md`
- `docs/WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md`
- `docs/WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md`
- `docs/WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md`

### ۴.۳ اسناد وضعیت، issues و شواهد زمینه‌ای

- وضعیت issueهای #12 تا #19؛
- issue #18 به‌عنوان محور non-claim preservation؛
- آخرین commits مربوط به Step 13؛
- وضعیت Step 12؛
- وضعیت open blockers؛
- تأیید اینکه contracts/test/package files در گام‌های اخیر تغییر نکرده‌اند؛
- هر snapshot وضعیت فعلی governance.

### ۴.۴ در صورت repo-level review

برای review سطح repo، reviewer باید حداقل این‌ها را ببیند:

- ساختار کامل repo؛
- docs اصلی؛
- contracts؛
- tests؛
- package files؛
- issue history مرتبط؛
- commit history مرتبط؛
- open blockers؛
- current branch/ref.

بدون این ورودی‌ها، خروجی فقط limited-scope risk note است.

## ۵. برچسب scope خروجی‌ها

هر review باید یکی از برچسب‌های زیر را داشته باشد:

| برچسب | معنی |
| --- | --- |
| `partial-scope` | فقط بخشی از اسناد یا فقط نام فایل‌ها دیده شده‌اند |
| `limited-context` | context سپیدنامه/جامعه ایران/منشور کامل داده نشده است |
| `step13-content-review` | متن کامل اسناد Step 13 دیده شده، اما کل repo/اسناد اصلی نه |
| `Iran-context-aware` | context جامعه ایران و روح سپیدنامه صریحاً داده شده است |
| `full-context-AI-pre-review` | سپیدنامه، منشور، Step 13 و snapshotها داده شده‌اند، اما همچنان AI است و signoff نیست |
| `repo-level-pre-review` | کل repo و issues/commits بررسی شده‌اند، اما همچنان pre-review است |
| `human/governance review` | فقط اگر reviewer انسانی/نهادی معتبر باشد |

## ۶. non-claim rule برای همه reviewها

حتی اگر reviewer همه اسناد را بخواند، تا زمانی که authority معتبر انسانی/نهادی وجود نداشته باشد، خروجی نمی‌تواند این موارد را ایجاد کند:

- accepted evidence؛
- reviewer signoff؛
- blocker closure؛
- production readiness؛
- release approval؛
- audit completion؛
- formal verification completion؛
- downstream execution؛
- sovereign authority؛
- Step 12 closure؛
- Step 13 closure.

## ۷. کاربرد عملی برای Gemini/Claude

برای Gemini یا Claude نباید repo access داده شود. باید این‌ها داده شود:

۱. prompt context-aware؛  
۲. متن کامل اسناد اصلی؛  
۳. متن کامل اسناد Step 13؛  
۴. snapshot وضعیت فعلی؛  
۵. وضعیت issueها و commits به‌صورت read-only؛  
۶. دستور non-claim.

اگر ابزار محدودیت حجم دارد، review باید به چند مرحله تقسیم شود و در هر مرحله scope صریحاً ثبت شود.

## ۸. non-claim نهایی

این سند فقط manifest بسته review کامل زمینه‌ای است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus، Iran-context-complete review یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
