<div dir="rtl">

# قالب بازبینی مستقل AI-assisted در گام ۱۳

**نام فنی:** Step 13 Independent AI Review Template  
**نوع سند:** documentation-only / template-only / AI-assisted independent review template  
**وضعیت:** باز؛ این قالب هیچ review کامل‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این قالب برای ثبت reviewهای مستقل AI-assisted آینده در گام ۱۳ ساخته شده است.

هدف قالب این است که اگر در آینده از Claude، Gemini، Codex، Copilot-like repo reviewer، یا ابزارهای تخصصی دیگر استفاده شد، خروجی آن‌ها با disclosure، scope، limitation، finding status، hash، issue mapping و non-claim boundary ثبت شود.

این قالب خودش review نیست، evidence نیست، signoff نیست، و هیچ claim نهایی ایجاد نمی‌کند.

## ۲. اصل پایه

هر review مستقل AI-assisted باید این اصل را حفظ کند:

```text
AI review is advisory, non-sovereign, non-binding, and proposal-only.
It does not create accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, or downstream execution authorization.
```

فارسی:

```text
بازبینی AI-assisted فقط مشورتی، غیرحاکمیتی، غیرالزام‌آور و proposal-only است.
این خروجی هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا مجوز downstream execution ایجاد نمی‌کند.
```

## ۳. نحوه استفاده از قالب

برای هر ابزار AI یا review مستقل، یک فایل جدا ساخته شود. نمونه نام فایل‌ها:

- `docs/step13/WHITEPAPER_STEP13_CLAUDE_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `docs/step13/WHITEPAPER_STEP13_GEMINI_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `docs/step13/WHITEPAPER_STEP13_CODEX_REPO_ASSISTED_REVIEW_FA.md`
- `docs/step13/WHITEPAPER_STEP13_STATIC_TOOL_ASSISTED_REVIEW_FA.md`

نباید چند review مستقل در یک فایل مخلوط شوند، مگر در rollup مقایسه‌ای آینده.

## ۴. metadata الزامی

```yaml
review_id: "AI-STEP13-<TOOL>-YYYYMMDD-NNN"
timestamp_utc: "YYYY-MM-DDTHH:MM:SSZ"
ai_tool_or_model: "<tool/model name>"
provider_or_runtime: "<provider/runtime if known>"
review_type: "AI-assisted independent pre-review"
authority_level: "non-sovereign / non-binding / proposal-only"
output_status: "finding draft / risk note / consistency check"
signoff_status: "no signoff"
evidence_status: "not accepted evidence"
downstream_execution: "not allowed"
related_issues:
  - "#18"
  - "#12-#19"
related_protocols:
  - "docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md"
  - "docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md"
  - "docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md"
```

## ۵. disclosure الزامی در ابتدای review

هر review مستقل باید با متن مشابه زیر شروع شود:

```text
AI tool/model used: <tool/model name>
Review type: AI-assisted independent pre-review
Authority level: non-sovereign / non-binding / proposal-only
Output status: finding draft / risk note / consistency check
Signoff status: no signoff
Evidence status: not accepted evidence
Downstream execution: not allowed
Related issue(s): #12-#19, with #18 as non-claim preservation reference
```

## ۶. scope پیشنهادی review

هر review مستقل باید حداقل این محورها را بررسی کند:

۱. آیا اسناد Step 13 به‌طور ضمنی production readiness، release approval، blocker closure، accepted evidence، reviewer signoff، audit completion یا formal verification completion القا می‌کنند؟  
۲. آیا Step 12 و Step 13 همچنان open / pending نگه داشته شده‌اند؟  
۳. آیا AI فقط analyzer / reviewer assistant / risk detector / proposal generator است؟  
۴. آیا AI به sovereign authority، signer، auditor، verifier، release approver یا blocker closer تبدیل نشده است؟  
۵. آیا no-downstream-execution rule روشن و حفظ شده است؟  
۶. آیا Human Inaction Safeguard از دفن‌شدن findingهای AI توسط سکوت یا اهمال انسان جلوگیری می‌کند؟  
۷. آیا safeguardهای موقت، برگشت‌پذیر و غیرنهایی از approval و signoff جدا شده‌اند؟  
۸. آیا خروجی‌های AI با prompt/input/output/hash/timestamp/issue/evidence link قابل ثبت هستند؟  
۹. آیا این فرایند به‌درستی به‌عنوان دمو محدود و غیرحاکمیتی مدل آینده ایران‌اواس توضیح داده شده است؟  
۱۰. آیا findings اختلافی یا unresolved به human review و escalation ارجاع می‌شوند؟

## ۷. out-of-scope الزامی

هر review مستقل باید صریحاً اعلام کند که خارج از scope است:

- production readiness approval
- release approval
- external audit completion
- formal verification completion
- blocker closure
- accepted evidence
- reviewer signoff
- custody approval
- oracle signoff
- deployment approval
- downstream execution authorization
- sovereign authority confirmation
- Step 12 closure
- Step 13 closure

## ۸. ورودی‌های پیشنهادی review

ورودی‌های پایه:

- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md`
- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md`
- `docs/step13/WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md`
- `docs/step13/WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md`
- `docs/step13/WHITEPAPER_STEP13_REVIEW_RESPONSE_HANDLING_PROTOCOL_FA.md`
- `docs/step13/WHITEPAPER_STEP13_CURRENT_STATUS_CHECKPOINT_FA.md`
- issue #18 برای non-claim preservation
- issueهای #12 تا #19 برای pending evidence / review context

در صورت review فنی واقعی، inputهای فنی باید جداگانه و با hash/commit مشخص ثبت شوند. در وضعیت فعلی، review فوری documentation/governance محور است، نه audit فنی کامل.

## ۹. قالب findings

```yaml
findings:
  - id: "F-001"
    severity: "low | medium | high"
    type: "claim-safety | evidence-gap | consistency | governance-risk | wording | downstream-risk | human-inaction-risk | architecture-consistency"
    status: "draft | needs-human-review | unresolved | deferred | escalation_required"
    summary: "..."
    rationale: "..."
    supporting_artifact: "docs/... or issue #..."
    recommendation: "..."
    non_claim_effect: "no signoff / no accepted evidence / no closure / no readiness"
```

## ۱۰. وضعیت‌های مجاز findings

| وضعیت | معنی | اثر |
| --- | --- | --- |
| `draft` | finding خام AI است | نیازمند review انسانی |
| `needs-human-review` | برای تصمیم انسانی آماده است | نه acceptance، نه rejection |
| `unresolved` | هنوز حل نشده | قابل مشاهده و قابل ارجاع باقی می‌ماند |
| `deferred` | نیازمند evidence یا reviewer دیگر است | pending |
| `escalation_required` | reviewer فعلی کافی نیست | ارجاع به سطح بالاتر |
| `reasoned_rejection_required` | رد انسانی بدون دلیل کافی است | rationale لازم است |

هیچ‌کدام از این وضعیت‌ها signoff یا accepted evidence ایجاد نمی‌کنند.

## ۱۱. قالب non-claim check در پایان review

هر review مستقل باید با این check پایان یابد:

```yaml
non_claim_check:
  accepted_evidence: false
  reviewer_signoff: false
  blocker_closure: false
  production_readiness: false
  release_approval: false
  audit_completion: false
  formal_verification_completion: false
  custody_approval: false
  oracle_signoff: false
  deployment_approval: false
  downstream_execution: false
  sovereign_authority: false
  step12_closure: false
  step13_closure: false
```

## ۱۲. قالب statement نهایی review

```text
This independent AI-assisted review is advisory, non-sovereign, non-binding, and proposal-only.
All findings remain draft / needs-human-review / unresolved unless a qualified human or governance reviewer resolves them.
No accepted evidence, reviewer signoff, blocker closure, production readiness, release approval, audit completion, formal verification completion, downstream execution, sovereign authority, Step 12 closure, or Step 13 closure is implied.
```

فارسی:

```text
این review مستقل AI-assisted فقط مشورتی، غیرحاکمیتی، غیرالزام‌آور و proposal-only است.
همه findings تا زمان بررسی بازبین انسانی یا نهاد حاکمیتی معتبر در وضعیت draft / needs-human-review / unresolved باقی می‌مانند.
هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، downstream execution، sovereign authority، Step 12 closure یا Step 13 closure از این خروجی برداشت نمی‌شود.
```

## ۱۳. مسیر بعد از ثبت review مستقل

پس از ثبت هر review مستقل:

۱. فایل review باید به issue #18 فقط به‌عنوان AI-assisted review-aid لینک شود.  
۲. findings باید در rollup مقایسه‌ای آینده فقط پس از وجود حداقل دو review مستقل مقایسه شوند.  
۳. consensus یا divergence نباید پیش از وجود reviewهای مستقل کافی ادعا شود.  
۴. موارد unresolved باید به human/governance review ارجاع شوند.  
۵. هیچ finding نباید بدون signoff معتبر به claim حساس تبدیل شود.

## ۱۴. non-claim نهایی

این سند فقط قالب ثبت reviewهای مستقل AI-assisted آینده است. این سند هیچ review انجام‌شده، accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion، custody approval، oracle signoff، deployment approval، downstream execution یا sovereign authority ایجاد نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
