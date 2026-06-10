<div dir="rtl">

# چک‌پوینت وضعیت فعلی گام ۱۳ — به‌روزرسانی پس از TG-01

> **⚠️ جایگزین‌شده:** این سند snapshot تاریخی در `48f5ffa` (۴۹۹ تست) است و دیگر مرجع «وضعیت جاری» نیست. مرجع جاری: `WHITEPAPER_STEP13_CURRENT_STATUS_CHECKPOINT_V4_FA.md`. محتوای این سند بازنویسی نشده است.

**نام فنی:** Step 13 Current Status Checkpoint (post-TG-01 merge)
**نوع سند:** documentation-only / current status checkpoint
**وضعیت:** باز؛ این سند Step 13 یا Step 12 را نمی‌بندد.
**نسخه:** ۳ — پس از ادغام PR #36 (TG-01 Treasury Auto-Block) در main

---

## ۱. پایه مخزن فعلی

| پارامتر | مقدار |
| --- | --- |
| شاخه | `main` |
| آخرین commit | `48f5ffa` — Merge pull request #36 (TG-01 Treasury Auto-Block) |
| تعداد testها | ۴۹۹ |
| نتیجه testها | ۴۹۹ passing |
| وضعیت git | clean — up to date with origin/main |

---

## ۲. وضعیت گام ۱۳

- گام ۱۳ **باز** است.
- گام ۱۳ یک فاز traceability / mapping / review-preparation است.
- گام ۱۳ گام ۱۲ را نمی‌بندد.
- گام ۱۳ هیچ evidence پذیرفته‌شده یا reviewer signoff ایجاد نمی‌کند.

---

## ۳. اسناد موجود گام ۱۳

| سند | نقش |
| --- | --- |
| `WHITEPAPER_STEP13_REVIEW_GUIDE_FA.md` | راهنمای review فارسی‌محور |
| `WHITEPAPER_STEP13_ISSUE_LINKAGE_FA.md` | اتصال workstreamها به issueهای #12 تا #19 |
| `WHITEPAPER_STEP13_GAP_REGISTER_FA.md` | رجیستر شکاف‌ها |
| `WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md` | معیارهای آینده closure (future-only) |
| `WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md` | handoff برای oracle/custody |
| `WHITEPAPER_STEP13_CUSTODY_MULTISIG_MINI_SPEC_FA.md` | mini spec custody/multisig |
| `WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` | mini spec oracle aggregation |
| `WHITEPAPER_STEP13_CUSTODY_EVIDENCE_CHECKLIST_FA.md` | چک‌لیست custody evidence |
| `WHITEPAPER_STEP13_ORACLE_EVIDENCE_CHECKLIST_FA.md` | چک‌لیست oracle evidence |
| `WHITEPAPER_STEP13_ORACLE_CUSTODY_TRACEABILITY_ROLLUP_FA.md` | oracle/custody traceability rollup |
| `WHITEPAPER_STEP13_FUTURE_EVIDENCE_SUBMISSION_TEMPLATE_FA.md` | قالب ثبت evidence آینده |
| `WHITEPAPER_STEP13_EVIDENCE_WORKFLOW_ROLLUP_FA.md` | evidence workflow rollup |
| `WHITEPAPER_STEP13_REVIEW_REQUEST_TEMPLATE_FA.md` | قالب درخواست review |
| `WHITEPAPER_STEP13_REVIEW_REQUEST_WORKFLOW_ROLLUP_FA.md` | review request workflow rollup |
| `WHITEPAPER_STEP13_REVIEW_REQUEST_STATUS_ROLLUP_FA.md` | وضعیت review requestهای گام ۱۳ |
| `WHITEPAPER_STEP13_REVIEW_RESPONSE_HANDLING_PROTOCOL_FA.md` | پروتکل مدیریت پاسخ‌های review |
| `WHITEPAPER_STEP13_AI_ASSISTED_INTERNAL_REVIEW_PLAN_FA.md` | برنامه review داخلی با کمک AI |
| `WHITEPAPER_STEP13_AI_ASSISTED_REVIEW_STATUS_ROLLUP_FA.md` | rollup وضعیت review AI-assisted |
| `WHITEPAPER_STEP13_AI_ASSISTED_GOVERNANCE_PROOF_PROTOCOL_FA.md` | پروتکل proof حکمرانی AI-assisted |
| `WHITEPAPER_STEP13_AI_REVIEW_PROMPT_PACKAGE_FA.md` | بسته prompt review AI |
| `WHITEPAPER_STEP13_CHATGPT_AI_ASSISTED_INTERNAL_REVIEW_FA.md` | review داخلی ChatGPT |
| `WHITEPAPER_STEP13_CHATGPT_SELF_REVIEW_STRICT_FA.md` | self-review سخت‌گیرانه ChatGPT |
| `WHITEPAPER_STEP13_CLAUDE_DOCUMENTATION_HARDENING_PATCH_FA.md` | patch تقویت مستندات Claude |
| `WHITEPAPER_STEP13_CLAUDE_FINDINGS_TRIAGE_FA.md` | triage یافته‌های Claude |
| `WHITEPAPER_STEP13_GEMINI_DOCUMENTATION_HARDENING_PATCH_FA.md` | patch تقویت مستندات Gemini |
| `WHITEPAPER_STEP13_GEMINI_FINDINGS_TRIAGE_FA.md` | triage یافته‌های Gemini |
| `WHITEPAPER_STEP13_CANONICAL_REVIEW_INPUT_PATCH_FA.md` | patch ورودی canonical review |
| `WHITEPAPER_STEP13_CANONICAL_SOURCE_CHECK_REQUIRED_REVIEW_RULE_FA.md` | قانون بررسی منبع canonical |
| `WHITEPAPER_STEP13_DOCUMENTATION_RISK_REDUCTION_PATCH_FA.md` | patch کاهش ریسک مستندات |
| `WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_BUNDLE_MANIFEST_FA.md` | manifest بسته review full-context |
| `WHITEPAPER_STEP13_FULL_CONTEXT_REVIEW_READONLY_BUNDLE_FA.md` | بسته read-only review full-context |
| `WHITEPAPER_STEP13_HUMAN_REVIEW_REQUEST_AI_SAFEGUARDS_FA.md` | درخواست review انسانی با safeguardهای AI |
| `WHITEPAPER_STEP13_INDEPENDENT_AI_REVIEW_TEMPLATE_FA.md` | قالب review مستقل AI |
| `WHITEPAPER_STEP13_IRANIAN_CONTEXT_REVIEW_LIMITATION_ADDENDUM_FA.md` | addendum محدودیت‌های context ایران |
| `WHITEPAPER_STEP13_IRAN_CONTEXT_AWARE_AI_REVIEW_PROMPT_FA.md` | prompt review AI آگاه از context ایران |
| `WHITEPAPER_STEP13_ORACLE_CUSTODY_HANDOFF_FA.md` | handoff oracle/custody |
| `WHITEPAPER_STEP13_README_FA.md` | راهنمای README گام ۱۳ |
| `WHITEPAPER_STEP13_SEPIDNAMEH_REQUIRED_REVIEW_RULE_FA.md` | قانون review اجباری سپیدنامه |
| `WHITEPAPER_STEP13_SEPIDNAMEH_TECHNICAL_PREAWARENESS_REVIEW_RULE_FA.md` | قانون pre-awareness فنی سپیدنامه |
| `WHITEPAPER_STEP13_SYSTEM_EXECUTION_VS_REVIEW_AI_DISTINCTION_FA.md` | تمایز اجرا سیستم در برابر review AI |
| `WHITEPAPER_STEP13_TEMPORARY_NON_FINAL_SAFEGUARD_TAXONOMY_FA.md` | taxonomy safeguardهای موقت غیرنهایی |
| `WHITEPAPER_STEP13_CURRENT_GOVERNANCE_STATE_SNAPSHOT_FA.md` | snapshot وضعیت فعلی حکمرانی |

---

## ۴. جدول وضعیت workstreamها

| workstream | فایل نگاشت | وضعیت فعلی | review/evidence/signoff ناموجود | گام بعدی |
| --- | --- | --- | --- | --- |
| اصول بنیادین و منشور | `WHITEPAPER_FOUNDATIONAL_PRINCIPLES_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | تکمیل بندبه‌بند؛ دریافت review بدون claim |
| ساختار حکمرانی | `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | تکمیل traceability حکمرانی؛ اتصال به issueهای custody/release |
| رفاه و عدالت | `WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | تفکیک شکاف‌های اجرایی، حقوقی، رفاهی |
| اقتصاد و منابع | `WHITEPAPER_ECONOMY_RESOURCES_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | تکمیل نگاشت داده/بودجه/منابع بدون ادعای feasibility |
| قراردادها و adapterها | `WHITEPAPER_CONTRACTS_ADAPTERS_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | ادامه audit/proof targeting؛ حفظ adapter non-execution |
| اوراکل و سیگنال‌ها | `WHITEPAPER_ORACLE_SIGNALS_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | تکمیل oracle ops/runbook traceability؛ حفظ signal-only |
| evidence / audit / signoff | `WHITEPAPER_EVIDENCE_AUDIT_SIGNOFF_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | اتصال هر ادعا به evidence، blocker، reviewer لازم |
| مشارکت عمومی فارسی‌زبان | `WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md` | draft mapping | هیچ reviewer signoff — هیچ evidence پذیرفته‌شده | هدایت مشارکت فارسی به issueها و PRهای کوچک |

---

## ۵. blockerها و موارد pending

- گام ۱۲ باز است.
- هیچ external audit پذیرفته‌شده وجود ندارد.
- هیچ formal verification پذیرفته‌شده وجود ندارد.
- هیچ custody signoff وجود ندارد.
- هیچ oracle operations signoff وجود ندارد.
- هیچ deployment dry-run پذیرفته‌شده وجود ندارد.
- هیچ release signoff وجود ندارد.
- هیچ evidence پذیرفته‌شده وجود ندارد.
- هیچ blocker بسته نشده است.

---

## ۶. اصلاحات فنی اخیر منعکس‌شده در این چک‌پوینت

| شناسه | اصلاح | وضعیت روی main |
| --- | --- | --- |
| CLC-06 | اعمال modifier `notLocked` روی `grantOfficialAccess()`، `setTriggerProtocol()`، `setSovereignWealthFund()` در `kernel.sol` | remediated — commit `f06e0be` |
| DOC-01 | اصلاح RC-E-11 در step21 — فهرست توابع مسدودشده با ارجاع به CLC-06 | corrected — commit `66e8cdf` |
| DOC-02 / IM-08 | تغییر برچسب IM-08 از IMPLEMENTED به DOCUMENTED GAP (TG-01) — `TriggerProtocol.executeTrigger()` فراخوانی `Treasury.blockAddressByTrigger()` را انجام نمی‌دهد؛ step37/step38 حد این شکاف را ثبت کرده‌اند | corrected — commit `66e8cdf` |
| RC-E-13 | annotation مسیر manual-only فعال‌سازی `notBlocked()` در Treasury؛ مسیر خودکار TriggerProtocol وجود ندارد؛ ارجاع به TG-01/Step37/Step38 | annotated — commit `66e8cdf` |
| **TG-01** | **پیاده‌سازی مسدودسازی خودکار خزانه‌داری — `TriggerProtocol.executeTrigger()` اکنون `Treasury.blockAddressByTrigger(offender)` را در همان تراکنش از طریق رابط `ITreasury` فراخوانی می‌کند؛ فقط مسیر terminal trigger — نه oracle-only، نه pre-terminal** | **implemented — PR #36 — commit `48f5ffa`** |

---

## ۷. بازبینی‌های ردیابی workstream انجام‌شده

| workstream | سند بازبینی | وضعیت |
| --- | --- | --- |
| WS-1 اصول بنیادین | `WHITEPAPER_STEP13_WS1_FOUNDATIONAL_PRINCIPLES_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review انسانی | 3 COMPLETE / 10 PARTIAL / 1 GAP |
| WS-2 ساختار حکمرانی | `WHITEPAPER_STEP13_WS2_GOVERNANCE_STRUCTURE_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review انسانی/حکمرانی | 1 COMPLETE / 11 PARTIAL / 2 GAP |
| WS-4 اقتصاد و منابع ملی | `WHITEPAPER_STEP13_WS4_ECONOMY_AND_NATIONAL_RESOURCES_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review مالی/اقتصادی/حقوقی | 5 COMPLETE / 8 PARTIAL / 0 GAP (TG-01 remediated — PR #36) |
| WS-5 قراردادها و ماژول‌های runtime | `WHITEPAPER_STEP13_WS5_CONTRACTS_RUNTIME_MODULES_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review فنی/حقوقی/حکمرانی | 2 COMPLETE / 23 PARTIAL / 0 GAP (TG-01 remediated — PR #36) |
| WS-3 رفاه و عدالت | `WHITEPAPER_STEP13_WS3_WELFARE_AND_JUSTICE_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review حقوقی/اقتصادی/حکمرانی | 2 COMPLETE / 11 PARTIAL / 1 GAP (ZK Proof) |
| WS-7 evidence / audit / signoff | `WHITEPAPER_STEP13_WS7_EVIDENCE_AUDIT_SIGNOFF_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review انسانی مستقل | 0 COMPLETE / 9 PARTIAL / 3 GAP (Deployment، Release، هیچ accepted evidence) |
| WS-6 اوراکل و سیگنال‌ها | `WHITEPAPER_STEP13_WS6_ORACLE_AND_SIGNAL_ARCHITECTURE_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review فنی/oracle/حکمرانی | 2 COMPLETE / 13 PARTIAL / 1 GAP (Airnode) — TG-01 برطرف‌شده (PR #36 — commit `48f5ffa`) |
| WS-8 مشارکت عمومی فارسی‌زبان | `WHITEPAPER_STEP13_WS8_PUBLIC_PARTICIPATION_TRACEABILITY_REVIEW_FA.md` | AI-assisted pre-review — نیازمند review حکمرانی/حقوقی/قانون اساسی | 2 COMPLETE / 9 PARTIAL / 2 GAP (feedback عمومی، voter registry) |
| **Final Rollup** | `WHITEPAPER_STEP13_FINAL_ROLLUP_REVIEW_FA.md` | خلاصه کلی WS-1 تا WS-8 — documentation-only | **مجموع: 17 COMPLETE / 94 PARTIAL / 11 GAP (TG-01 remediated)** |

این بازبینی‌ها AI-assisted و documentation-only هستند. هیچ‌کدام human review، governance review، signoff، evidence accepted، یا blocker closure نیستند. گام ۱۲ و گام ۱۳ همچنان باز هستند.

---

## ۸. گام بعدی پیشنهادی گام ۱۳

- بسته review انسانی آماده است: `WHITEPAPER_STEP13_HUMAN_REVIEW_PREPARATION_PACKAGE_FA.md`
- بسته آماده‌سازی برای human reviewer، governance reviewer، audit coordinator، formal verification reviewer، custody reviewer، oracle ops reviewer، و release council
- گام ۱۳ را نبندید.
- قراردادها یا testها را تغییر ندهید.

## ۸-الف. وضعیت بسته‌های تکمیل‌شده در گام ۱۳

| سند | وضعیت |
| --- | --- |
| `WHITEPAPER_STEP13_FINAL_ROLLUP_REVIEW_FA.md` | ایجاد شد — مجموع در snapshot اولیه rollup (تاریخی): 17 COMPLETE / 94 PARTIAL / 13 GAP — این رقم ۱۳ وضعیت فعلی نیست؛ پس از برطرف‌شدن TG-01 (PR #36 — commit `48f5ffa`)، مجموع جاری مطابق جدول §۷ همین سند **11 GAP** است |
| `WHITEPAPER_STEP13_HUMAN_REVIEW_PREPARATION_PACKAGE_FA.md` | ایجاد شد — بسته آماده‌سازی review انسانی (۲۰ بخش) |
| **Step 12** | **باز** — هیچ evidence پذیرفته نشده، هیچ blocker بسته نشده |
| **Step 13** | **باز** — هیچ review انسانی، هیچ signoff، هیچ blocker closure |

---

## ۹. چک‌پوینت پس از ادغام TG-01 (PR #36)

### وضعیت TG-01

| پارامتر | مقدار |
| --- | --- |
| شناسه | TG-01 — مسدودسازی خودکار خزانه‌داری |
| وضعیت | **پیاده‌سازی‌شده روی main** |
| PR | #36 (ادغام‌شده) |
| commit | `48f5ffa` |
| تعداد testها | ۴۹۹ / ۴۹۹ passing |

### خلاصه پیاده‌سازی

- `TriggerProtocol.executeTrigger()` اکنون از طریق رابط `ITreasury` تابع `Treasury.blockAddressByTrigger(offender)` را در **همان تراکنش** فراخوانی می‌کند.
- مسدودسازی فقط در مسیر terminal trigger (پس از ۷ امضا) اتفاق می‌افتد.
- سیگنال oracle به‌تنهایی و حالات pre-terminal (کمتر از ۷ امضا) خزانه‌داری را مسدود نمی‌کنند.
- replay پس از فعال‌شدن trigger با خطای `"Kernel: trigger already activated"` رد می‌شود.
- invariantهای حسابداری SWF و Treasury پس از terminal trigger دست‌نخورده باقی می‌مانند.

### الزام استقرار — KERNEL_ROLE

> **⚠️ الزام استقرار اجباری:**  
> پس از deploy کردن `Treasury` و `TriggerProtocol`، باید `KERNEL_ROLE` روی Treasury به `TriggerProtocol` اعطا شود.  
> در غیر این صورت فراخوانی `blockAddressByTrigger()` در `executeTrigger()` با خطای `"AccessControl: account ... is missing role ..."` revert می‌کند.  
> این grant باید پیش از اولین فعال‌سازی trigger انجام شده باشد.
>
> ```
> treasury.grantRole(treasury.KERNEL_ROLE(), address(triggerProtocol));
> ```

### شکاف باز بعدی — COURT-01

شکاف واقعی باز بعدی به ترتیب اولویت: **COURT-01** — در دسترس بودن COURT_ROLE.  
`deactivateEmergencyLock()` عملاً قابل فراخوانی نیست چون هیچ پروتکلی برای تعیین آدرس‌های دادگاه روی‌زنجیر وجود ندارد.

گام ۱۳ **همچنان باز است** تا شکاف‌های باقی‌مانده بررسی و حل‌وفصل شوند.

---

## ۱۰. non-claim نهایی

این سند فقط چک‌پوینت وضعیت فعلی است. هیچ review کامل‌شده، هیچ evidence پذیرفته‌شده، هیچ reviewer signoff، هیچ blocker closure، هیچ production readiness، هیچ release approval، هیچ audit completion یا formal verification completion ادعا نشده است. گام ۱۲ و گام ۱۳ همچنان باز هستند.

</div>
