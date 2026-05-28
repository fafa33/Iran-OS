<div dir="rtl">

# بسته prompt برای بازبینی AI-assisted در گام ۱۳

**نام فنی:** Step 13 AI Review Prompt Package  
**نوع سند:** documentation-only / prompt-package-only / AI-assisted review preparation  
**وضعیت:** باز؛ این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند promptهای استاندارد برای اجرای pre-reviewهای AI-assisted در گام ۱۳ را آماده می‌کند.

این بسته هم برای self-review توسط ChatGPT و هم برای reviewهای مستقل آینده توسط Claude، Gemini، Codex/Copilot-like repo reviewer یا ابزارهای دیگر قابل استفاده است.

این سند خودش review نیست. این سند فقط prompt package است.

## ۲. اصل مشترک همه promptها

هر خروجی AI باید این مرزها را حفظ کند:

- خروجی فقط AI-assisted pre-review است.
- خروجی non-sovereign، non-binding و proposal-only است.
- هیچ accepted evidence ایجاد نمی‌کند.
- هیچ reviewer signoff ایجاد نمی‌کند.
- هیچ blocker closure ایجاد نمی‌کند.
- هیچ production readiness یا release approval ایجاد نمی‌کند.
- هیچ audit completion یا formal verification completion ایجاد نمی‌کند.
- هیچ downstream execution authorization ایجاد نمی‌کند.
- Step 12 و Step 13 باز می‌مانند.

## ۳. input artifactهای پایه

برای هر review، این اسناد ورودی اصلی هستند:

- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md`
- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md`
- `docs/step13/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md`
- `docs/step13/WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md`
- `docs/step13/WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md`
- `docs/step13/WHITEPAPER_STEP13_REVIEW_RESPONSE_HANDLING_PROTOCOL_FA.md`
- `docs/step13/WHITEPAPER_STEP13_CURRENT_STATUS_CHECKPOINT_FA.md`
- issue #18 به‌عنوان محور non-claim preservation
- issueهای #12 تا #19 برای context وضعیت pending review/evidence

## ۴. prompt برای ChatGPT self-review

از این prompt برای بازبینی دوباره توسط ChatGPT استفاده شود:

```text
Project: Iran-OS / Sepidnameh
Task: Step 13 AI-assisted self-review
AI tool/model used: OpenAI ChatGPT — GPT-5.5 Thinking
Review type: AI-assisted self-review / internal pre-review
Authority level: non-sovereign / non-binding / proposal-only

Review the Step 13 AI-assisted governance documents that were previously drafted with ChatGPT assistance.

Focus on finding blind spots, overclaims, internal inconsistencies, unclear wording, hidden authority inflation, missing non-claim boundaries, and any wording that could imply accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution, or sovereign authority.

Also review whether the Human Inaction Safeguard is balanced: AI must not replace human/governance authority, but human silence or unexplained rejection must not erase AI-detected risk.

Required output:
1. Disclosure of AI tool/model used.
2. Scope and out-of-scope.
3. Findings table with id, severity, type, status, rationale, and recommendation.
4. Separate section for possible overclaim risks.
5. Separate section for unresolved / needs-human-review items.
6. Non-claim check with all final claim fields set to false.

Do not claim accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution, Step 12 closure, or Step 13 closure.
```

## ۵. prompt برای Claude independent review

```text
Project: Iran-OS / Sepidnameh
Task: Step 13 independent AI-assisted review
AI tool/model used: Claude <version if known>
Review type: independent AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only

Please independently review the Step 13 AI-assisted governance documents.

Focus areas:
- non-claim discipline
- AI authority boundary
- human non-response safeguard
- temporary non-final safeguards
- no-downstream-execution boundary
- consistency with the Sepidnameh / Iran-OS governance operating model
- wording that may imply premature signoff, approval, closure, readiness, audit completion, or formal verification completion

Required output:
- AI/tool disclosure
- scope and out-of-scope
- findings with severity and status
- unclear or risky wording
- evidence gaps
- unresolved items requiring human/governance review
- final non-claim check

All findings must remain draft / needs-human-review / unresolved unless a qualified human/governance reviewer resolves them.
```

## ۶. prompt برای Gemini independent review

```text
Project: Iran-OS / Sepidnameh
Task: Step 13 cross-document AI-assisted review
AI tool/model used: Gemini <version if known>
Review type: independent AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only

Please perform a cross-document consistency review of the Step 13 AI-assisted governance package.

Check whether the documents consistently preserve:
- Step 12 open / pending
- Step 13 open / pending review
- no accepted evidence
- no reviewer signoff
- no blocker closure
- no production readiness
- no release approval
- no audit completion
- no formal verification completion
- no downstream execution
- no sovereign AI authority

Also check whether the AI governance model is presented as a limited demo of the future Iran-OS operating model, without implying live deployment or final authority.

Required output:
- disclosure
- consistency findings
- contradictions or gaps
- unresolved items
- recommendations
- non-claim check
```

## ۷. prompt برای Codex / repo-assisted review

```text
Project: Iran-OS / Sepidnameh
Task: Step 13 repo-assisted documentation review
Tool used: Codex / Copilot-like repo reviewer <version if known>
Review type: repo-assisted AI pre-review
Authority level: non-sovereign / non-binding / proposal-only

Review the repository documentation changes related to Step 13.

Focus on:
- whether paths referenced in rollups exist
- whether commits and filenames are consistently named
- whether docs are documentation-only
- whether contracts / test / package.json / package-lock.json remain out of scope unless explicitly changed
- whether issue #18 remains the non-claim preservation reference
- whether any document claims signoff, accepted evidence, closure, readiness, approval, audit completion, or formal verification completion

Output format:
- file/path findings
- consistency findings
- missing link or stale reference findings
- non-claim risks
- recommended documentation-only fixes
- final non-claim check

Do not approve release, close blockers, accept evidence, or claim audit/formal verification completion.
```

## ۸. prompt برای ابزارهای static / formal آینده

این prompt فقط برای زمانی است که scope فنی واقعاً فعال شود. در وضعیت فعلی، چون contract/test/package files در گام‌های اخیر دست‌نخورده مانده‌اند، استفاده از این بخش به معنی audit کامل یا formal verification کامل نیست.

```text
Project: Iran-OS / Sepidnameh
Task: Tool-assisted technical signal review
Tool used: <Slither / Mythril / Foundry / Echidna / Certora / TLA+ / Lean / Coq / other>
Review type: tool-assisted evidence-candidate generation
Authority level: non-sovereign / non-binding / evidence-candidate-only

Run or analyze the relevant technical artifact only if the scope is explicitly defined.

Output must distinguish:
- raw tool output
- finding candidate
- false positive possibility
- missing evidence
- human/security/formal reviewer required

Do not claim audit completion, formal verification completion, accepted evidence, release approval, production readiness, blocker closure, or downstream execution authorization.
```

## ۹. قالب خروجی مشترک

هر AI باید خروجی را با این ساختار بدهد:

```yaml
review_id: "AI-STEP13-<TOOL>-YYYYMMDD-NNN"
ai_tool_or_model: "<tool/model name>"
review_type: "AI-assisted pre-review"
authority_level: "non-sovereign / non-binding / proposal-only"
input_artifacts:
  - "docs/..."
related_issues:
  - "#18"
  - "#12-#19"
findings:
  - id: "F-001"
    severity: "low | medium | high"
    type: "claim-safety | evidence-gap | consistency | governance-risk | wording | downstream-risk | human-non-response | architecture-consistency"
    status: "draft | needs-human-review | unresolved | deferred | escalation_required"
    summary: "..."
    rationale: "..."
    recommendation: "..."
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
  step12_closure: false
  step13_closure: false
```

## ۱۰. مسیر بعد از گرفتن خروجی AIها

پس از دریافت خروجی از هر AI:

۱. خروجی باید در فایل جداگانه ثبت شود.  
۲. نام ابزار/مدل باید در ابتدای سند بیاید.  
۳. خروجی فقط AI-assisted pre-review باقی می‌ماند.  
۴. اگر حداقل دو review مستقل موجود شد، rollup مقایسه‌ای multi-AI ساخته می‌شود.  
۵. consensus یا divergence فقط بعد از وجود reviewهای مستقل کافی قابل گزارش است.  
۶. همه findings حساس تا review انسانی معتبر، needs-human-review یا unresolved باقی می‌مانند.

## ۱۱. non-claim نهایی

این سند فقط بسته prompt برای اجرای reviewهای AI-assisted است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
