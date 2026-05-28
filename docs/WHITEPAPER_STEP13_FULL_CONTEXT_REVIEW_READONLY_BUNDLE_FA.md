<div dir="rtl">

# بسته read-only برای review کامل زمینه‌ای گام ۱۳

**نام فنی:** Step 13 Full-Context Read-Only Review Bundle  
**نوع سند:** documentation-only / read-only-review-bundle / upload-paste-package  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند بسته عملی read-only برای ارسال به Gemini، Claude، Codex یا reviewer انسانی است.

این بسته به reviewer می‌گوید چه فایل‌هایی را باید به‌صورت read-only بخواند، چگونه scope را اعلام کند، و چه claimهایی ممنوع است.

این سند خودش شامل همه متن‌های منبع نیست. برای جلوگیری از خطای scope، فایل‌های منبع باید همراه این bundle به‌صورت upload یا paste ارائه شوند. اگر هر فایل منبع ارائه نشود، reviewer باید review را partial-scope اعلام کند.

## ۲. روش مجاز استفاده

روش مجاز:

```text
1. Copy/paste this bundle into Gemini/Claude or give it to a human reviewer.
2. Attach or paste the required source documents listed below.
3. Do not give GitHub access, token, workflow permission, repo mutation permission, issue mutation permission, or commit access.
4. Ask for review text only.
5. Paste the review output back into the project workflow for triage.
```

روش ممنوع:

```text
No GitHub token.
No direct repo access.
No workflow execution.
No issue update.
No branch write.
No commit.
No release operation.
No deployment.
No downstream execution.
```

## ۳. فایل‌های منبع الزامی برای upload/paste

### A. اسناد اصلی پروژه

این فایل‌ها باید به reviewer داده شوند:

1. سپیدنامه اصلی ایران‌اواس، ترجیحاً متن کامل از فایل اصلی سپیدنامه؛
2. بخش «پیش‌آگاهی: ارکان فنی حاکمیت نوین ایران» در سپیدنامه؛
3. فرابخش «معماری هسته سخت در لایه صفر» در سپیدنامه؛
4. منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛
5. هر نسخه canonical از FAQ/kit که ماشه هوشمند، لایه صفر، no-admin، execution، خزانه، خزنده، مشروعیت یا non-claim را توضیح می‌دهد.

### B. اسناد Step 13

این فایل‌های repo باید به reviewer داده شوند:

```text
docs/WHITEPAPER_STEP13_README_FA.md
docs/WHITEPAPER_STEP13_SEPIDNAMEH_REQUIRED_REVIEW_RULE_FA.md
docs/WHITEPAPER_STEP13_SEPIDNAMEH_TECHNICAL_PREAWARENESS_REVIEW_RULE_FA.md
docs/WHITEPAPER_STEP13_CANONICAL_SOURCE_CHECK_REQUIRED_REVIEW_RULE_FA.md
docs/WHITEPAPER_STEP13_SYSTEM_EXECUTION_VS_REVIEW_AI_DISTINCTION_FA.md
docs/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md
docs/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md
docs/WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md
docs/WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md
docs/WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md
docs/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md
docs/WHITEPAPER_STEP13_CANONICAL_REVIEW_INPUT_PATCH_FA.md
docs/WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md
docs/WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md
```

### C. artifactهای deprecated / process-hardening

این اسناد فقط برای traceability فرایندی و فهم سخت‌تر شدن review protocol هستند، نه برای validation یا defect claim:

```text
docs/WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md
docs/WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md
docs/WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md
docs/WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md
docs/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md
docs/WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md
```

### D. وضعیت issues و commits

اگر reviewer قرار است repo-level یا governance-state review بدهد، این context باید به‌صورت read-only ارائه شود:

```text
Step 12: open / pending
Step 13: open / pending human review
Issue #18: non-claim preservation reference
Issues #12-#19: pending review/evidence context
Accepted evidence: none
Reviewer signoff: none
Blocker closure: not claimed
Production readiness: not claimed
Release approval: not claimed
Audit completion: not claimed
Formal verification completion: not claimed
Downstream execution: not allowed for AI review output
Multi-AI consensus: not claimed
```

## ۴. Prompt اجرایی برای reviewer

```text
Project: Iran-OS / Sepidnameh
Task: Full-context Iran-context-aware AI-assisted or human pre-review for Step 13

You are receiving a read-only review bundle.
You are not receiving GitHub write access, workflow access, issue mutation access, token access, commit access, release access, or deployment access.
You must not request or imply any operational access.

AI tool/model used: <write exact model/version if visible, or human reviewer identity/role if human>
Review type: full-context / Iran-context-aware / pre-review
Authority level: non-sovereign / non-binding / proposal-only unless separately authorized by a valid future human/governance process
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

Critical source requirements:
Before any architecture, execution, no-admin, layer-zero, smart-trigger, hard-coded-kernel, legitimacy, or alignment finding, you must verify that you read and understood:
1. The Sepidnameh main whitepaper.
2. The Sepidnameh technical pre-awareness section: IranOS, National Value Chain, National Wealth Treasury.
3. The Sepidnameh layer-zero hard-kernel section: hard-coded pillars, smart trigger, no-admin architecture, automatic invalidation.
4. The Welfare/Justice Charter / Secular Constitutional Covenant.
5. Relevant Step 13 review-scope rules.
6. Relevant FAQ/kit/canonical clarifications.

No architecture review is valid without Sepidnameh technical pre-awareness.
No kernel/layer-zero/no-admin/smart-trigger finding is valid without reading and applying the technical pre-awareness section.
Do not treat no-admin as hidden author sovereignty unless you first check the canonical explanation that no-admin is an anti-capture design.
Do not treat smart trigger as autonomous AI unless you first check the canonical distinction between review AI and rule-based/deterministic system execution.
Do not treat hard-coded layer-zero pillars as a defect merely because they are not discretionary or admin-editable.

If you use an external/traditional governance framework, label it explicitly as external-framework critique. Do not present it as an internal Iran-OS defect unless the canonical technical pre-awareness has been checked and the contradiction remains unresolved.

Current project status:
Step 12 is open.
Step 13 is open.
No production readiness, release approval, audit completion, formal verification completion, blocker closure, accepted evidence, reviewer signoff, downstream execution, multi-AI consensus, Iran-context-complete review, full-context review completion, canonical-source-checked review completion, or sovereign authority has been claimed.

Output format:

# Full-Context Iran-Context-Aware Pre-Review — Step 13

## 1. Disclosure
AI tool/model used or human reviewer role: <model/version or reviewer role>
Review type: full-context / Iran-context-aware pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

## 2. Source coverage
List every document actually received and read.
Mark missing documents explicitly.
State whether this is full-context, step13-content-only, partial-scope, limited-context, Sepidnameh-aware, Charter-aware, technical-preawareness-checked, or canonical-source-checked.

## 3. Technical pre-awareness check
Return this YAML block for the review as a whole:

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

## 4. Out of scope
Explicitly state that you are not providing accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution authorization, sovereign authority, multi-AI consensus, Step 12 closure, or Step 13 closure.

## 5. Findings
Use this table. Every finding must include canonical_source_check.
| id | severity | type | status | finding | canonical_source_check | rationale | recommendation |
|---|---|---|---|---|---|---|---|

Required canonical_source_check per finding:
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

## 6. Overclaim and legitimacy risks
List anything that could be misread as approval, completion, closure, readiness, accepted evidence, signoff, proof, audit, verification, consensus, AI legitimacy, technocratic rule, or authority capture.

## 7. Missing evidence / unresolved gaps
List unresolved gaps, especially those requiring human/governance/legal/constitutional review.

## 8. Recommendations
Only propose documentation-only, review-preparation, wording-boundary, context-boundary, traceability-placeholder, or human-review-preparation fixes.
Do not propose execution, release, closure, signoff, approval, or governance action.

## 9. Non-claim check
Return this YAML block exactly, with all values false:

non_claim_check:
  accepted_evidence: false
  reviewer_signoff: false
  blocker_closure: false
  production_readiness: false
  release_approval: false
  audit_completion: false
  formal_verification_completion: false
  downstream_execution: false
  sovereign_authority: false
  multi_ai_consensus: false
  iran_context_complete_review: false
  full_context_review_completion: false
  canonical_source_checked_review_completion: false
  step12_closure: false
  step13_closure: false

## 10. Final statement
State that this is a pre-review only, not accepted evidence, not reviewer signoff, not blocker closure, not readiness, not approval, not audit completion, not formal verification completion, not downstream authorization, not multi-AI consensus, and not Step 12/Step 13 closure.

Important:
Do not say approved, passed, safe, complete, ready for release, blocker closed, evidence accepted, formally verified, audit complete, or consensus achieved.
```

## ۵. دستور به کاربر برای ارسال به Gemini/Claude یا reviewer انسانی

برای استفاده عملی:

۱. این bundle را در چت Gemini/Claude paste کن یا به reviewer انسانی بده.  
۲. فایل سپیدنامه اصلی را upload کن.  
۳. بخش پیش‌آگاهی فنی و فرابخش هسته سخت را جداگانه highlight یا paste کن.  
۴. فایل منشور رفاه و عدالت را upload کن.  
۵. فایل‌های Step 13 فهرست‌شده را upload کن یا متن آن‌ها را paste کن.  
۶. اگر ابزار محدودیت دارد، اول اسناد اصلی + پیش‌آگاهی فنی + snapshot + README + canonical-source rule + system execution distinction را بده.  
۷. خروجی را برای triage برگردان.

## ۶. non-claim نهایی

این سند فقط بسته read-only برای review کامل زمینه‌ای است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus، Iran-context-complete review، full-context AI review completion، canonical-source-checked review completion یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
