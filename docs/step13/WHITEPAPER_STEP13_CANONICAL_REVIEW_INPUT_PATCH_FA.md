<div dir="rtl">

# Patch ورودی review با canonical-source check برای گام ۱۳

**نام فنی:** Step 13 Canonical Review Input Patch  
**نوع سند:** documentation-only / prompt-bundle-template-patch / review-input-hardening  
**وضعیت:** باز؛ این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند patch لازم برای promptها، bundleها و templateهای review آینده را تعریف می‌کند تا هیچ reviewer بدون canonical-source check، finding معتبر ثبت نکند.

اسناد هدف:

- `WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_READONLY_BUNDLE_FA.md`
- `WHITEPAPER_STEP13_IRAN_CONTEXT_AWARE_AI_REVIEW_PROMPT_FA.md`
- `WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md`

## ۲. متن الزامی برای اضافه‌شدن به promptهای آینده

```text
Canonical-source check is mandatory.
No finding is valid unless the reviewer checks the relevant canonical sources.
Before any contradiction, architecture, execution, legitimacy, alignment, downstream-execution, layer-zero, smart-trigger, or AI-authority finding, the reviewer must identify and evaluate the relevant Sepidnameh, Charter, Step 13, FAQ/kit, and canonical clarification text.
If the reviewer understood a concept only after direct designer clarification, the output must be labeled designer-clarified / not independent / not evidence / not signoff / not consensus.
```

فارسی:

```text
canonical-source check اجباری است.
هیچ finding بدون بررسی sourceهای canonical مرتبط معتبر نیست.
پیش از هر finding درباره contradiction، architecture، execution، legitimacy، alignment، downstream-execution، layer-zero، smart-trigger یا AI-authority، reviewer باید متن مرتبط سپیدنامه، منشور، Step 13، FAQ/kit و clarificationهای canonical را شناسایی و ارزیابی کند.
اگر reviewer فقط پس از توضیح مستقیم طراح یک مفهوم را فهمیده باشد، خروجی باید designer-clarified / not independent / not evidence / not signoff / not consensus برچسب بخورد.
```

## ۳. YAML الزامی برای هر finding آینده

هر finding آینده باید این بلوک را داشته باشد:

```yaml
canonical_source_check:
  sepidnameh_checked: true_or_false
  charter_checked: true_or_false
  step13_sources_checked: true_or_false
  faq_or_kit_checked: true_or_false
  system_execution_vs_review_ai_distinction_checked: true_or_false
  sepidnameh_required_review_rule_checked: true_or_false
  canonical_source_check_rule_checked: true_or_false
  relevant_canonical_explanation: "quote-or-section-reference"
  contradiction_claim_allowed: true_or_false
  reason_if_still_unresolved: "required-if-finding-remains"
```

اگر این بلوک ناقص باشد، finding فقط draft note است و نباید در rollup به‌عنوان finding معتبر یا قوی ثبت شود.

## ۴. rule-specific checks

### ۴.۱ smart trigger / downstream execution

قبل از claim درباره تضاد downstream execution، reviewer باید بررسی کند:

```text
Review AI has no downstream execution authority.
Iran-OS rule-based/deterministic execution is a separate operational layer that may operate only under pre-approved constitutional/governance rules.
```

### ۴.۲ layer zero / bootstrapping

قبل از claim درباره bootstrapping، author power یا immutability risk، reviewer باید بررسی کند آیا layer-zero به‌عنوان anti-capture constitutional architecture تعریف شده است یا نه.

### ۴.۳ Sepidnameh alignment

بدون خواندن سپیدنامه، هر conclusion درباره alignment یا misalignment ممنوع است.

### ۴.۴ Charter alignment

بدون خواندن منشور رفاه و عدالت / پیمان ملی مشروطه سکولار، هر conclusion درباره welfare/justice/constitutional alignment ممنوع است.

## ۵. non-claim نهایی

این سند فقط patch ورودی review است. این سند هیچ review انجام‌شده، evidence، signoff، closure، readiness، approval، audit، formal verification، consensus یا downstream execution ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
