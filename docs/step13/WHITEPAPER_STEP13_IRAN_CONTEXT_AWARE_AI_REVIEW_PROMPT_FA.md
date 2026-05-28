<div dir="rtl">

# Prompt زمینه‌مند برای review هوش مصنوعی با تمرکز بر جامعه ایران در گام ۱۳

**نام فنی:** Step 13 Iran-Context-Aware AI Review Prompt  
**نوع سند:** documentation-only / prompt-package-only / Iran-context-review-preparation  
**وضعیت:** باز؛ این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند prompt جدیدی برای reviewهای آینده Gemini، Claude، Codex یا ابزارهای دیگر فراهم می‌کند تا review فقط generic governance/documentation نباشد، بلکه با context جامعه ایران، روح سپیدنامه و هدف ایران‌اواس انجام شود.

این prompt باید برای دور جدید review استفاده شود، زیرا reviewهای قبلی Gemini و Claude از نظر زمینه ایرانی کامل نبودند.

## ۲. Prompt پیشنهادی

```text
Project: Iran-OS / Sepidnameh
Repository: fafa33/Iran-OS
Task: Step 13 Iran-context-aware strict AI-assisted pre-review

AI tool/model used: <write exact model/version if visible>
Review type: Iran-context-aware AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

Critical context:
This project is designed for the future governance of Iran and must be reviewed in the context of Iranian society, Persian-language public reasoning, secular constitutional governance, post-authoritarian trust rebuilding, plural social composition, anti-corruption safeguards, anti-concentration of power, and protection against ideological, clerical, military, party, oligarchic, technocratic, or AI-based authority capture.

Do not review this as a generic governance automation project only.
Review it as a proposed civic/governance operating system for Iran, where legitimacy must come from transparent human/legal/constitutional authority, not from AI output.

Iranian society context to consider:
- historical experience of centralized and opaque power;
- risk of hidden authority capture;
- sensitivity to ideological, religious, military, party, oligarchic, technocratic, or algorithmic domination;
- need for secular constitutional boundaries;
- need for public trust rebuilding;
- plural ethnic, linguistic, religious, cultural, political, and regional composition;
- Persian-language public reasoning and accessibility;
- anti-corruption and auditability requirements;
- protection against elite capture and opaque gatekeeping;
- need for contestability, appeal, transparency, traceability, and reversible safeguards;
- AI must never replace public legitimacy, constitutional law, human/governance review, or accountable institutions.

Current project status:
Step 12 is open.
Step 13 is open.
No production readiness, release approval, audit completion, formal verification completion, blocker closure, accepted evidence, reviewer signoff, downstream execution, multi-AI consensus, or sovereign authority has been claimed.
Recent work is documentation-only plus issue/reference comments.
No code, contracts, tests, package files, release state, or governance execution should be treated as changed.

Prior AI review limitation:
Prior Gemini and Claude findings are useful limited-context AI risk notes.
They are not Iran-context-complete reviews.
They do not invalidate the Iran-OS governance model or the Sepidnameh project.
They identify generic governance, wording, traceability, and non-claim risks that should remain visible and be hardened.
This new review must explicitly evaluate the Iran-specific social, constitutional, trust, legitimacy, and anti-authority-capture dimensions.

Input artifacts to review:
1. docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md
2. docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md
3. docs/step13/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md
4. docs/step13/WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md
5. docs/step13/WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md
6. docs/step13/WHITEPAPER_STEP13_DOCUMENTATION_RISK_REDUCTION_PATCH_FA.md
7. docs/step13/WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md
8. docs/step13/WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md
9. docs/step13/WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md
10. docs/step13/WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md
11. docs/step13/WHITEPAPER_STEP13_IRANIAN_CONTEXT_REVIEW_LIMITATION_ADDENDUM_FA.md
12. docs/step13/WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md
13. docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md
14. docs/step13/WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md
15. docs/step13/WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md
16. docs/step13/WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md
17. issue #18 context as the non-claim preservation reference
18. issues #12-#19 context as pending review/evidence context

Review focus:

1. Iran-specific legitimacy boundary
Check whether the AI-assisted governance model preserves legitimacy through human/legal/constitutional authority, not AI output.
Flag any wording that could imply AI legitimacy, algorithmic authority, or technocratic rule.

2. Anti-authority-capture
Check whether the model resists capture by ideological, clerical, military, party, oligarchic, technocratic, bureaucratic, or AI-based authority.

3. Secular constitutional governance
Check whether the model is consistent with secular constitutional governance and does not smuggle ideological, religious, partisan, or opaque authority into the operating model.

4. Trust rebuilding and public reasoning
Check whether the documentation is understandable, contestable, and transparent enough for Persian-language public reasoning and public trust rebuilding.

5. Plural society safeguards
Check whether the model is sensitive to Iran's ethnic, linguistic, religious, cultural, regional, political, gender, and generational plurality.
Flag any single-center or single-class governance assumption.

6. AI authority boundary
Check whether AI remains analyzer, reviewer assistant, risk detector, consistency checker, claim-safety checker, evidence-gap detector, proposal generator, and review preparation assistant only.
AI must not become sovereign authority, signer, auditor, verifier, release approver, blocker closer, governance authority, or downstream executor.

7. Human non-response safeguard
Check whether the model balances:
- AI must not replace human/governance authority.
- Human silence, incapacity, negligence, or unexplained rejection must not erase AI-detected risk.
- Human non-response must not trigger approval, signoff, accepted evidence, blocker closure, production readiness, release approval, downstream execution, or state advancement.

8. No-downstream-execution
Check whether AI output is off-chain, non-operational, and documentation-only.
AI output must not generate operational bytecode, mutate repository state automatically, trigger deployment, change governance state, or execute downstream actions.

9. Non-claim discipline
Check whether any wording could imply accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, Step 12 closure, Step 13 closure, or multi-AI consensus.

10. Context gap handling
Check whether prior Gemini/Claude limited-context reviews are correctly labeled as useful but incomplete, and whether a new Iran-context-aware review is required before any Iran-specific conclusion.

Output requirements:

# Iran-Context-Aware Independent AI-Assisted Pre-Review — Step 13

## 1. Disclosure
AI tool/model used: <model/version>
Review type: Iran-context-aware AI-assisted pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed

## 2. Scope
List exactly what artifacts were actually reviewed. If full document text was not provided, say so clearly.

## 3. Out of scope
Explicitly state that you are not providing accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution authorization, sovereign authority, multi-AI consensus, Step 12 closure, or Step 13 closure.

## 4. Iran-specific findings table
Use this table:

| id | severity | type | status | finding | rationale | recommendation |
|---|---|---|---|---|---|---|

Allowed severity:
low / medium / high

Allowed type:
Iran-context / legitimacy-boundary / secular-constitutional / authority-capture / plural-society / public-trust / Persian-public-reasoning / claim-safety / AI-authority-boundary / human-non-response / downstream-risk / traceability-gap / wording-risk / governance-gap

Allowed status:
draft / needs-human-review / unresolved / deferred / escalation_required

## 5. Generic governance/documentation findings
List any generic findings separately from Iran-context findings.

## 6. Overclaim and legitimacy risks
List anything that could be misread as approval, completion, closure, readiness, accepted evidence, signoff, proof, audit, verification, consensus, AI legitimacy, technocratic rule, or authority capture.

## 7. Missing evidence / unresolved gaps
List unresolved gaps, especially those needing human/governance/legal/constitutional review.

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
  step12_closure: false
  step13_closure: false

## 10. Final statement
State that this is an Iran-context-aware AI-assisted pre-review only, not accepted evidence, not reviewer signoff, not blocker closure, not readiness, not approval, not audit completion, not formal verification completion, not downstream authorization, not multi-AI consensus, and not Step 12/Step 13 closure.

Important:
Do not say approved, passed, safe, complete, ready for release, blocker closed, evidence accepted, formally verified, audit complete, or consensus achieved.
```

## ۳. non-claim نهایی

این سند فقط prompt زمینه‌مند برای review آینده است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، multi-AI consensus یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
