<div dir="rtl">

# README راهنمای review اسناد گام ۱۳

**نام فنی:** Step 13 Reviewer README  
**نوع سند:** documentation-only / reviewer-orientation / non-claim-index  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این README برای reviewerهای آینده، چه AI و چه انسان، ترتیب خواندن و مرزهای اعتبار review را روشن می‌کند.

هیچ reviewer نباید فقط با خواندن یک سند منفرد درباره کل سپیدنامه، منشور، معماری ایران‌اواس، مشروعیت، execution، یا alignment نتیجه‌گیری کند.

## ۲. قاعده پایه

```text
No Sepidnameh read → no Sepidnameh-alignment review.
No Sepidnameh technical pre-awareness → no valid architecture review.
No Charter read → no welfare/justice/constitutional review.
No canonical-source check → no valid architecture/contradiction finding.
No AI output → accepted evidence, signoff, closure, readiness, approval, or consensus.
```

## ۳. ترتیب پیشنهادی خواندن

### مرحله ۱ — اسناد پایه

1. سپیدنامه اصلی ایران‌اواس؛
2. بخش «پیش‌آگاهی: ارکان فنی حاکمیت نوین ایران» در سپیدنامه؛
3. فرابخش «معماری هسته سخت در لایه صفر» در سپیدنامه؛
4. منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛
5. FAQها و کیت‌های توضیحی مرتبط با ماشه هوشمند، لایه صفر، execution، خزانه، خزنده، مشروعیت و non-claim.

### مرحله ۲ — قواعد scope و canonical-source

1. `WHITEPAPER_STEP13_SEPIDNAMEH_REQUIRED_REVIEW_RULE_FA.md`
2. `WHITEPAPER_STEP13_SEPIDNAMEH_TECHNICAL_PREAWARENESS_REVIEW_RULE_FA.md`
3. `WHITEPAPER_STEP13_CANONICAL_SOURCE_CHECK_REQUIRED_REVIEW_RULE_FA.md`
4. `WHITEPAPER_STEP13_SYSTEM_EXECUTION_VS_REVIEW_AI_DISTINCTION_FA.md`
5. `WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md`

### مرحله ۳ — بسته review

1. `WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_BUNDLE_MANIFEST_FA.md`
2. `WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_READONLY_BUNDLE_FA.md`
3. `WHITEPAPER_STEP13_IRAN_CONTEXT_AWARE_AI_REVIEW_PROMPT_FA.md`
4. `WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md`
5. `WHITEPAPER_STEP13_CANONICAL_REVIEW_INPUT_PATCH_FA.md`

### مرحله ۴ — اسناد اصلی Step 13

1. `WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md`
2. `WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md`
3. `WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md`
4. `WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md`
5. `WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md`
6. `WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md`

### مرحله ۵ — artifactهای process-hardening و deprecated-for-validation

این اسناد برای traceability فرایندی و فهم اینکه چرا پروتکل review سخت‌تر شد مفیدند، اما برای validation، signoff، consensus، defect claim یا alignment نباید استفاده شوند:

- `WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md`
- `WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md`
- `WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md`
- `WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md`
- `WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md`

برچسب آن‌ها:

```text
limited-scope / limited-context / non-canonical-source-checked / process-hardening artifact only / not validation / not defect evidence / not signoff / not consensus
```

## ۴. شرط پیش‌آگاهی فنی سپیدنامه

Reviewer باید پیش از هر finding معماری، نشان دهد که پیش‌آگاهی فنی سپیدنامه را فهمیده است، از جمله:

- ایران‌اواس؛
- زنجیره ارزش ملی؛
- گنجینه/صندوق ثروت ملی؛
- هسته سخت لایه صفر؛
- سه ستون hard-coded؛
- ماشه هوشمند؛
- no-admin؛
- ابطال خودکار؛
- هدف ضدفساد، ضداستبداد فردی و ضددست‌اندازی سیاسی/انسانی.

اگر این شرط رعایت نشده باشد، finding معماری فقط draft note است و نباید defect یا blocker تلقی شود.

## ۵. تمایز حیاتی: AI review در برابر اجرای سیستم

Reviewer باید پیش از هر claim درباره downstream execution این تمایز را بررسی کند:

```text
Review AI has no downstream execution authority.
Iran-OS rule-based/deterministic execution is a separate operational layer that may operate only under pre-approved constitutional/governance rules.
```

ماشه هوشمند، اگر در معماری ایران‌اواس تعریف شود، autonomous AI نیست؛ اجرای قطعی قواعد ازپیش‌تصویب‌شده است.

## ۶. قالب الزامی هر finding آینده

هر finding آینده باید canonical-source check و technical-preawareness check داشته باشد:

```yaml
canonical_source_check:
  sepidnameh_checked: true_or_false
  sepidnameh_technical_preawareness_checked: true_or_false
  charter_checked: true_or_false
  step13_sources_checked: true_or_false
  faq_or_kit_checked: true_or_false
  system_execution_vs_review_ai_distinction_checked: true_or_false
  no_admin_or_layer_zero_explanation_checked: true_or_false
  relevant_canonical_explanation: "quote-or-section-reference"
  contradiction_claim_allowed: true_or_false
  reason_if_still_unresolved: "required-if-finding-remains"

technical_preawareness_check:
  iran_os_checked: true_or_false
  national_value_chain_checked: true_or_false
  national_wealth_treasury_checked: true_or_false
  layer_zero_kernel_checked: true_or_false
  hard_coded_pillars_checked: true_or_false
  smart_trigger_checked: true_or_false
  no_admin_checked: true_or_false
  automatic_invalidation_checked: true_or_false
  external_framework_used: true_or_false
  if_external_framework_used_label_as_external: true_or_false
  internal_defect_claim_allowed: true_or_false
```

اگر این بخش ناقص باشد، finding فقط draft note است.

## ۷. non-claim نهایی

این README فقط راهنمای خواندن و review است. این سند هیچ review کامل‌شده، evidence، signoff، closure، readiness، approval، audit، formal verification، consensus یا downstream execution ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
