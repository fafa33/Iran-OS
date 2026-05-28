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
1. Copy/paste this bundle into Gemini/Claude.
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
2. منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛
3. هر نسخه canonical از سند اصلی که معماری حکمرانی، مشروعیت، عدالت، سکولاریسم یا حقوق عمومی را تعریف می‌کند.

### B. اسناد Step 13

این فایل‌های repo باید به reviewer داده شوند:

```text
docs/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md
docs/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md
docs/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md
docs/WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md
docs/WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md
docs/WHITEPAPER_STEP13_DOCUMENTATION_RISK_REDUCTION_PATCH_FA.md
docs/WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md
docs/WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md
docs/WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md
docs/WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md
docs/WHITEPAPER_STEP13_IRANIAN_CONTEXT_REVIEW_LIMITATION_ADDENDUM_FA.md
docs/WHITEPAPER_STEP13_IRAN_CONTEXT_AWARE_AI_REVIEW_PROMPT_FA.md
docs/WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_BUNDLE_MANIFEST_FA.md
docs/WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md
docs/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md
docs/WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md
docs/WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md
docs/WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md
```

### C. وضعیت issues و commits

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
Downstream execution: not allowed
Multi-AI consensus: not claimed
```

## ۴. Prompt اجرایی برای reviewer

```text
Project: Iran-OS / Sepidnameh
Task: Full-context Iran-context-aware AI-assisted pre-review for Step 13

You are receiving a read-only review bundle.
You are not receiving GitHub write access, workflow access, issue mutation access, token access, commit access, release access, or deployment access.
You must not request or imply any operational access.

AI tool/model used: <write exact model/version if visible>
Review type: full-context / Iran-context-aware / AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

Critical context:
This project is designed for the future governance of Iran and must be reviewed in the context of Iranian society, Persian-language public reasoning, secular constitutional governance, post-authoritarian trust rebuilding, plural social composition, anti-corruption safeguards, anti-concentration of power, and protection against ideological, clerical, military, party, oligarchic, technocratic, bureaucratic, or AI-based authority capture.

Do not review this as a generic governance automation project only.
Review it as a proposed civic/governance operating system for Iran, where legitimacy must come from transparent human/legal/constitutional authority, not from AI output.

Required source review:
You must state exactly which source documents you actually received and read.
If the full text of the Sepidnameh, Charter, Step 13 documents, issue context, or governance snapshot was not provided, mark the review as partial-scope or limited-context.
Do not pretend to have reviewed documents you did not actually read.

Current project status:
Step 12 is open.
Step 13 is open.
No production readiness, release approval, audit completion, formal verification completion, blocker closure, accepted evidence, reviewer signoff, downstream execution, multi-AI consensus, Iran-context-complete review, full-context review completion, or sovereign authority has been claimed.

Review focus:
1. Alignment with Sepidnameh and Iran-OS operating model.
2. Alignment with welfare/justice charter principles, if provided.
3. Iran-specific legitimacy boundary: legitimacy must come from human/legal/constitutional authority, not AI output.
4. Anti-authority-capture: ideological, clerical, military, party, oligarchic, technocratic, bureaucratic, or AI-based capture.
5. Secular constitutional governance.
6. Plural society safeguards: ethnic, linguistic, religious, cultural, regional, political, gender, and generational plurality.
7. Persian-language public reasoning and accessibility.
8. Trust rebuilding, transparency, contestability, appeal, traceability, reversibility.
9. AI authority boundary: AI is analyzer/reviewer/risk detector/proposal generator only.
10. Human non-response: does not erase AI-detected risk, but must not create approval, closure, signoff, accepted evidence, readiness, release approval, downstream execution, or state advancement.
11. No-downstream-execution: AI remains off-chain, non-operational, documentation-only.
12. Non-claim discipline: no wording should imply accepted evidence, signoff, closure, readiness, release approval, audit completion, formal verification completion, Step 12 closure, Step 13 closure, or consensus.
13. Traceability and hash gaps.
14. Whether prior Gemini/Claude reviews are correctly treated as limited-context risk notes.

Output format:

# Full-Context Iran-Context-Aware AI-Assisted Pre-Review — Step 13

## 1. Disclosure
AI tool/model used: <model/version>
Review type: full-context / Iran-context-aware AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

## 2. Source coverage
List every document actually received and read.
Mark missing documents explicitly.
State whether this is full-context, step13-content-only, partial-scope, or limited-context.

## 3. Out of scope
Explicitly state that you are not providing accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution authorization, sovereign authority, multi-AI consensus, Step 12 closure, or Step 13 closure.

## 4. Iran/Sepidnameh alignment findings
Use this table:
| id | severity | type | status | finding | rationale | recommendation |
|---|---|---|---|---|---|---|

Allowed severity: low / medium / high
Allowed status: draft / needs-human-review / unresolved / deferred / escalation_required
Allowed type: Sepidnameh-alignment / welfare-justice / Iran-context / legitimacy-boundary / secular-constitutional / authority-capture / plural-society / public-trust / Persian-public-reasoning / AI-authority-boundary / human-non-response / downstream-risk / traceability-gap / wording-risk / governance-gap

## 5. Generic governance/documentation findings
List generic findings separately from Iran/Sepidnameh findings.

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
  step12_closure: false
  step13_closure: false

## 10. Final statement
State that this is an AI-assisted pre-review only, not accepted evidence, not reviewer signoff, not blocker closure, not readiness, not approval, not audit completion, not formal verification completion, not downstream authorization, not multi-AI consensus, and not Step 12/Step 13 closure.

Important:
Do not say approved, passed, safe, complete, ready for release, blocker closed, evidence accepted, formally verified, audit complete, or consensus achieved.
```

## ۵. دستور به کاربر برای ارسال به Gemini/Claude

برای استفاده عملی:

۱. این bundle را در چت Gemini/Claude paste کن.  
۲. فایل سپیدنامه اصلی را upload کن.  
۳. فایل منشور رفاه و عدالت را upload کن.  
۴. فایل‌های Step 13 فهرست‌شده را upload کن یا متن آن‌ها را paste کن.  
۵. اگر ابزار محدودیت دارد، اول اسناد اصلی + snapshot + rollup + protocol + taxonomy + human review request را بده.  
۶. خروجی را اینجا paste کن تا triage شود.

## ۶. non-claim نهایی

این سند فقط بسته read-only برای review کامل زمینه‌ای است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus، Iran-context-complete review، full-context AI review completion یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
