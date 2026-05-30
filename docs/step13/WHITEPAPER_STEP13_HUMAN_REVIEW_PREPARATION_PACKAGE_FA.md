<div dir="rtl">

# بسته آماده‌سازی review انسانی — گام ۱۳

**نوع سند:** Human Review Preparation Package — documentation-only
**گام:** Step 13 — باز
**وضعیت گام ۱۲:** باز
**نسخه:** ۱ — پس از تکمیل تمام ۸ workstream و Final Rollup

---

## ۱. پایه مخزن

| پارامتر | مقدار |
|---------|-------|
| شاخه | `main` |
| آخرین commit | `f9d47da` — Merge pull request #26 |
| تعداد testها | ۴۹۹ |
| نتیجه testها | ۴۹۹ passing |
| وضعیت git | clean — up to date with origin/main |
| وضعیت Step 12 | **باز** |
| وضعیت Step 13 | **باز** |
| evidence پذیرفته‌شده | **هیچ** |
| blocker بسته‌شده | **هیچ** |
| reviewer signoff | **هیچ** |

---

## ۲. دامنه review گام ۱۳

گام ۱۳ یک فاز traceability/mapping/review-preparation است. هدف آن:

- نگاشت مفاهیم سپیدنامه به source، test، evidence، blocker، issue
- شناسایی شکاف‌ها، موارد PARTIAL، و موارد COMPLETE
- آماده‌سازی برای human review، نه انجام آن

**گام ۱۳ انجام نمی‌دهد:**
- review انسانی
- signoff حکمرانی
- پذیرش evidence
- بستن blocker
- audit یا formal verification
- تأیید production readiness یا release readiness

---

## ۳. فهرست workstreamهای بررسی‌شده

| WS | موضوع | سند بازبینی | وضعیت |
|----|-------|-------------|--------|
| WS-1 | اصول بنیادین و خطوط قرمز | `WHITEPAPER_STEP13_WS1_FOUNDATIONAL_PRINCIPLES_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-2 | ساختار حکمرانی | `WHITEPAPER_STEP13_WS2_GOVERNANCE_STRUCTURE_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-3 | رفاه و عدالت | `WHITEPAPER_STEP13_WS3_WELFARE_AND_JUSTICE_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-4 | اقتصاد و منابع ملی | `WHITEPAPER_STEP13_WS4_ECONOMY_AND_NATIONAL_RESOURCES_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-5 | قراردادها و ماژول‌های runtime | `WHITEPAPER_STEP13_WS5_CONTRACTS_RUNTIME_MODULES_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-6 | اوراکل و سیگنال‌ها | `WHITEPAPER_STEP13_WS6_ORACLE_AND_SIGNAL_ARCHITECTURE_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-7 | evidence / audit / signoff | `WHITEPAPER_STEP13_WS7_EVIDENCE_AUDIT_SIGNOFF_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |
| WS-8 | مشارکت عمومی فارسی‌زبان | `WHITEPAPER_STEP13_WS8_PUBLIC_PARTICIPATION_TRACEABILITY_REVIEW_FA.md` | AI pre-review کامل |

مرجع کلی: `WHITEPAPER_STEP13_FINAL_ROLLUP_REVIEW_FA.md`

---

## ۴. حوزه‌های COMPLETE شناخته‌شده

موارد زیر در source repo کامل هستند. COMPLETE به‌معنای کامل بودن زنجیره ردیابی داخلی است — نه accepted evidence، نه audit، نه formal verification.

| # | مورد | قرارداد/ماژول | WS |
|---|------|---------------|----|
| C-01 | CLC-06 — modifier `notLocked` روی `grantOfficialAccess()`، `setTriggerProtocol()`، `setSovereignWealthFund()` | `kernel.sol` | WS-1 |
| C-02 | CLC-03 — `MAX_DATA_AGE=1h` staleness guard در `API3Oracle.flagViolation()` | `API3Oracle.sol` | WS-1، WS-6 |
| C-03 | `Fargard7PolicyAdapter` — `executable=false`؛ `allSignalsFresh` guard؛ proposal-only | `Fargard7PolicyAdapter.sol` | WS-1، WS-2، WS-5 |
| C-04 | اصل ۱۰۰۰ پهلوی — `MIN_WAGE=1000*1e18`؛ `recordWagePayment()` تطابق کارفرما را ثبت می‌کند؛ NatSpec: «توسط کارفرما — نه دولت» | `BaseIncome.sol`، `CitizenCard.sol` | WS-3 |
| C-05 | ممنوعیت فنی اعدام — `SentenceType enum` بدون death option؛ NatSpec: «اعدام وجود ندارد — از نظر فنی غیرممکن» | `JusticeProtocol.sol` | WS-3 |
| C-06 | `Monetary Expansion Constraints` — `MIN_RESERVE_RATIO=333` (33.3٪) اجرا شده؛ revert در صورت نقض | `kernel.sol`، `SovereignWealthFund.sol` | WS-4 |
| C-07 | `Reserve Ratio Protection` — revert برای عملیات نقض‌کننده MIN_RESERVE_RATIO | `SovereignWealthFund.sol` | WS-4 |
| C-08 | `Liquidity Cap Protection` — `LIQUIDITY_CAP=900B*1e18` اجرا شده | `kernel.sol`، `PahlaviToken.so` | WS-4 |
| C-09 | Wealth Fund State Transitions — L1/L2/L3 منطق کامل؛ MULTISIG_REQUIRED=3 | `SovereignWealthFund.sol` | WS-4 |
| C-10 | Reserve-backed Currency Doctrine — مستند و اجرا در source | `SovereignWealthFund.sol`، `PahlaviToken.so` | WS-4 |
| C-11 | `ConstitutionGuard` — `IMMUTABLE_PRINCIPLES_MASK=0x07`؛ اصول ۱/۲/۳ همیشه اجباری | `ConstitutionGuard.sol` | WS-5 |
| C-12 | حفاظ تازگی `PriceOracle` — `MIN_FEEDERS`، `STALENESS_THRESHOLD`، `DEVIATION_THRESHOLD` اجرا شده | `PriceOracle.sol` | WS-6 |
| C-13 | صلاحیت کاندیداتوری خودکار — `require(residencyYears >= 5 && !hasCriminalRecord)`؛ بدون شورای نگهبان | `VotingSystem.sol` | WS-8 |
| C-14 | کپی‌زدایی بیومتریک — `hasVoted[electionId][voterBiometric]`؛ یک‌نفر-یک-رأی اجرا شده | `VotingSystem.sol` | WS-8 |

---

## ۵. حوزه‌های PARTIAL شناخته‌شده

۹۴ مورد PARTIAL شناسایی شده. حوزه‌های تکراری مهم:

| حوزه تکراری | خلاصه وضعیت | WS‌ها |
|-------------|-------------|-------|
| TG-01 (TriggerProtocol ↔ Treasury) | مستند در source؛ automation رد شد؛ مسیر manual-only — signoff pending | WS-1، WS-4، WS-5، WS-6 |
| TRIGGER_TIMEOUT=72h | SLA دادگاه اجرا شده؛ نه auto-unlock، نه auto-execute | WS-1، WS-5 |
| ZK proof `length > 0` | بررسی حضور؛ verifier on-chain موجود نیست | WS-3، WS-7، WS-8 |
| External audit dependency | همه ۸ WS نیازمند audit completion در #12 | همه |
| Formal verification dependency | همه ۸ WS نیازمند formal verification در #13 | همه |
| Oracle operations evidence | oracle ops signoff pending در #15/#16 | WS-1، WS-4، WS-5، WS-6، WS-8 |
| Production deployment evidence | هیچ deployment واقعی انجام نشده | همه |
| Governance/human reviewer signoff | همه موارد نیازمند human review | همه |

---

## ۶. شکاف‌های شناخته‌شده (GAP)

| # | شناسه | توضیح | WS | issue/blocker |
|---|--------|-------|----|---------------|
| G-01 | TG-01 | `TriggerProtocol.executeTrigger()` هرگز `Treasury.blockAddressByTrigger()` را فراخوانی نمی‌کند؛ automation در step38 رد شد (P0 revert risk)؛ مسیر Option D (human Kernel call) تنها مسیر فعلی | WS-1، WS-4، WS-5، WS-6 | #12، #13، step37/38 |
| G-02 | Airnode | هیچ قرارداد Airnode-specific در repo؛ اتصال Airnode→feeder→API3Oracle مستند نشده | WS-6، WS-7 | #15، #16 |
| G-03 | ZK Verifier | `JurySelection` و `VotingSystem` فقط `zkProof.length > 0`؛ هیچ verifier on-chain؛ ZKP کامل به نسخه آینده موکول | WS-3، WS-8 | #13 |
| G-04 | STEP9-BLOCK-005 | Deployment dry-run — هیچ dry-run artifact، testnet result، manifest hash، یا migration checklist | WS-7 | `STEP9-BLOCK-005` |
| G-05 | STEP9-BLOCK-006 | Release signoff — هیچ release council membership، go/no-go، یا release package hash؛ upstream همه باز | WS-2، WS-7 | `STEP9-BLOCK-006` |
| G-06 | Deployment Artifact Packet | هیچ `STEP9-BLOCK-005-DEPLOYMENT-PACKET-*` artifact ارائه نشده | WS-7 | `STEP9-BLOCK-005` |
| G-07 | Custody/Key-Management | production signer registry، custodian identity، rotation plan، و compromise response تعریف نشده | WS-2 | `STEP9-BLOCK-003`، #14 |
| G-08 | Release Council | membership، go/no-go procedure، و release package hash وجود ندارد | WS-2 | `STEP9-BLOCK-006` |
| G-09 | Public Feedback Mechanism | هیچ on-chain petition، public comment، یا structured consultation mechanism در contracts | WS-8 | #14، #19 |
| G-10 | Voter Registry | `VotingSystem.totalEligibleVoters` باید externally set شود؛ هیچ on-chain voter roll یا CitizenCard integration | WS-8 | #14، #19 |

---

## ۷. فهرست blockerهای باز

| شناسه | توضیح | مدرک آماده‌سازی | issue | وضعیت |
|--------|-------|-----------------|-------|--------|
| `STEP9-BLOCK-001` | External audit — scope، auditor identity، final report، finding register، remediation، signoff | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` | #12 | **باز** |
| `STEP9-BLOCK-002` | Formal verification — proof scope، target list، tool config، assumptions، proof artifacts، unresolved obligations | `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | #13 | **باز** |
| `STEP9-BLOCK-003` | Role custody/key-management — signer registry، multisig quorum، rotation plan، onboarding/offboarding، compromise response | `STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md` | #14 | **باز** |
| `STEP9-BLOCK-004` | Oracle operations evidence — feeder registry، quorum config، freshness، deviation handling، incident runbook، monitoring | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | #15 | **باز** |
| `STEP9-BLOCK-005` | Deployment dry-run — manifest، artifact hashes، constructor args، dependency book، dry-run logs، gas estimates | `STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md` | #17 | **باز** |
| `STEP9-BLOCK-006` | Release signoff — upstream blocker disposition، release package hash، signer approvals، council go/no-go minutes | `STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | #18 | **باز** |
| `STEP9-BLOCK-007` | Oracle runbook — feeder onboarding/suspension، stale-data، invalidation، deviation، liveness، signal-only review | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | #16 | **باز** |
| `STEP9-BLOCK-008` | Non-claim preservation control — roadmap non-claim check، release packet non-claim excerpt، governance reviewer confirmation | `STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | #18 | **باز** |

---

## ۸. فهرست evidence موجود

موارد زیر به‌عنوان artifact آماده‌سازی ثبت شده‌اند. هیچ‌کدام accepted evidence نیستند.

| artifact | نوع | فایل | وضعیت |
|---------|-----|------|--------|
| External audit prep packet | audit scope + targets | `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` | draft — pending acceptance |
| Formal verification prep packet | proof scope + targets | `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` | draft — pending acceptance |
| Custody/key-management evidence packet | signer + quorum prep | `STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md` | draft — pending acceptance |
| Oracle operations evidence packet | feeder/runbook prep | `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md` | draft — pending acceptance |
| Deployment dry-run evidence packet | manifest prep | `STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md` | draft — pending acceptance |
| Release signoff prep packet | council/release prep | `STEP12_RELEASE_SIGNOFF_PREP_PACKET.md` | draft — pending acceptance |
| Non-claim preservation evidence packet | non-claim record | `STEP12_NON_CLAIM_PRESERVATION_EVIDENCE_PACKET.md` | draft — pending acceptance |
| Accepted evidence acquisition checklist | checklist | `STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` | draft — pending |
| Evidence execution blocker disposition | blocker review | `STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md` | draft — all open |
| WS-1 traceability review | AI pre-review | step13/WS1_...md | AI pre-review — نیازمند human review |
| WS-2 traceability review | AI pre-review | step13/WS2_...md | AI pre-review — نیازمند human review |
| WS-3 traceability review | AI pre-review | step13/WS3_...md | AI pre-review — نیازمند human review |
| WS-4 traceability review | AI pre-review | step13/WS4_...md | AI pre-review — نیازمند human review |
| WS-5 traceability review | AI pre-review | step13/WS5_...md | AI pre-review — نیازمند human review |
| WS-6 traceability review | AI pre-review | step13/WS6_...md | AI pre-review — نیازمند human review |
| WS-7 traceability review | AI pre-review | step13/WS7_...md | AI pre-review — نیازمند human review |
| WS-8 traceability review | AI pre-review | step13/WS8_...md | AI pre-review — نیازمند human review |
| Step 13 Final Rollup | summary | step13/FINAL_ROLLUP_...md | AI summary — نیازمند human review |

---

## ۹. فهرست evidence مفقود

| evidence مفقود | blocker مرتبط | چرا مفقود است |
|----------------|---------------|---------------|
| External audit firm identity و engagement record | `STEP9-BLOCK-001` | هیچ audit firm انتخاب نشده |
| Final external audit report و finding register | `STEP9-BLOCK-001` | audit اجرا نشده |
| Formal verification tool config و proof artifacts | `STEP9-BLOCK-002` | هیچ formal verification tool انتخاب نشده |
| Unresolved proof obligation disposition | `STEP9-BLOCK-002` | TG-01، ZK verifier gap هنوز باز |
| Production signer registry | `STEP9-BLOCK-003` | هیچ custodian identity تعریف نشده |
| Custodian-to-role quorum map | `STEP9-BLOCK-003` | pending governance decision |
| Key rotation plan و onboarding/offboarding log | `STEP9-BLOCK-003` | pending |
| Production feeder registry | `STEP9-BLOCK-004`، `STEP9-BLOCK-007` | هیچ production feeder تعریف نشده |
| Feeder data-source attestations | `STEP9-BLOCK-004`، `STEP9-BLOCK-007` | pending |
| Liveness monitoring evidence | `STEP9-BLOCK-007` | هیچ dashboard، alert rule یا alert history |
| Testnet dry-run logs و gas estimates | `STEP9-BLOCK-005` | dry-run اجرا نشده |
| Deployment manifest و artifact hashes | `STEP9-BLOCK-005` | pending |
| Post-run role و authority-boundary verification | `STEP9-BLOCK-005` | pending |
| Release council membership و go/no-go minutes | `STEP9-BLOCK-006` | council تشکیل نشده |
| Release package hash و signer approvals | `STEP9-BLOCK-006` | upstream همه باز |
| Governance reviewer confirmation برای non-claim | `STEP9-BLOCK-008` | pending |
| Airnode→feeder→API3Oracle connection spec | G-02 | pending oracle ops packet |
| ZK verifier on-chain deployment | G-03 | pending formal verification (#13) |

---

## ۱۰. چک‌لیست review انسانی عمومی

این چک‌لیست برای هر reviewer که قبل از signoff باید تکمیل کند:

- [ ] مطالعه `docs/step13/WHITEPAPER_STEP13_FINAL_ROLLUP_REVIEW_FA.md`
- [ ] مطالعه WS traceability reviews مرتبط با حوزه review
- [ ] مطالعه `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- [ ] تأیید که هیچ claim ناخواسته‌ای در مستندات وجود ندارد
- [ ] تأیید اینکه Step 12 و Step 13 باز هستند
- [ ] تأیید اینکه هیچ evidence به‌عنوان accepted علامت‌گذاری نشده
- [ ] تأیید اینکه هیچ blocker بسته نشده
- [ ] مستندسازی هر finding، gap یا نقص شناسایی‌شده

---

## ۱۱. چک‌لیست external audit

**مخصوص:** audit coordinator، auditor یا نماینده مجاز audit

- [ ] تأیید scope در `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`
- [ ] تأیید audit targets: kernel.sol، TriggerProtocol، ConstitutionGuard، SovereignWealthFund، API3Oracle، PriceOracle، Treasury، AssetFreeze
- [ ] بررسی COMPLETE items (C-01 تا C-14) برای صحت ادعاهای ردیابی
- [ ] بررسی PARTIAL items در WS-1 تا WS-8 برای gap‌های احتمالی
- [ ] بررسی TG-01 (G-01) — automation rejection و مسیر manual-only
- [ ] بررسی CLC-06 — notLocked modifier روی authority setters
- [ ] بررسی CLC-03 — MAX_DATA_AGE staleness guard
- [ ] بررسی TR-01/02/03 auto-lock و deactivation path
- [ ] بررسی MULTISIG_THRESHOLD=7-of-9 — constitutional minimum
- [ ] تأیید و ثبت `STEP9-BLOCK-001-AUDIT-PACKET-001` (scope)
- [ ] تأیید و ثبت `STEP9-BLOCK-001-AUDIT-PACKET-002` (report + finding register)
- [ ] تأیید و ثبت `STEP9-BLOCK-001-AUDIT-PACKET-003` (remediation disposition)
- [ ] signoff مجاز audit reviewer

---

## ۱۲. چک‌لیست formal verification

**مخصوص:** formal methods owner، formal verification reviewer

- [ ] تأیید proof scope در `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md`
- [ ] تأیید proof targets: IMMUTABLE_PRINCIPLES_MASK، TR auto-lock، MULTISIG_THRESHOLD، reserve ratio invariants، liquidity cap، ZK verifier integration
- [ ] بررسی TG-01 (G-01) — تأیید که automation رد شده و مسیر manual documented
- [ ] بررسی ZK verifier gap (G-03) — scope ZK verifier deployment در این blocker
- [ ] بررسی reserve ratio / liquidity cap invariants (C-06، C-07، C-08)
- [ ] بررسی ConstitutionGuard IMMUTABLE_PRINCIPLES_MASK (C-11)
- [ ] تأیید و ثبت `STEP9-BLOCK-002-FORMAL-PACKET-001` (proof target map)
- [ ] تأیید و ثبت `STEP9-BLOCK-002-FORMAL-PACKET-002` (tool output + proof artifacts)
- [ ] تأیید و ثبت `STEP9-BLOCK-002-FORMAL-PACKET-003` (unresolved proof-risk disposition)
- [ ] signoff formal verification reviewer

---

## ۱۳. چک‌لیست custody review

**مخصوص:** governance operations lead، release council representative

- [ ] مطالعه `STEP12_CUSTODY_KEY_MANAGEMENT_EVIDENCE_PACKET.md`
- [ ] تعریف production signer registry — هویت، role، آدرس
- [ ] تعریف custodian-to-role quorum map برای SOVEREIGN_ROLE، COURT_ROLE، GUARDIAN_ROLE، COUNCIL_ROLE
- [ ] تعریف key rotation plan و rotation period
- [ ] تعریف onboarding و offboarding procedure
- [ ] تعریف compromise response plan
- [ ] تأیید MULTISIG_THRESHOLD=7-of-9 (kernel)؛ MULTISIG_REQUIRED=3 (SWF)
- [ ] تأیید gap G-07 (custody/key-management) در مستندات registry
- [ ] تأیید و ثبت `STEP9-BLOCK-003-CUSTODY-PACKET-001` (signer registry)
- [ ] تأیید و ثبت `STEP9-BLOCK-003-CUSTODY-PACKET-002` (role-to-custodian map)
- [ ] تأیید و ثبت `STEP9-BLOCK-003-CUSTODY-PACKET-003` (rotation + compromise procedure)
- [ ] signoff governance operations lead

---

## ۱۴. چک‌لیست oracle operations review

**مخصوص:** oracle operations lead، governance reviewer

- [ ] مطالعه `STEP12_ORACLE_OPERATIONS_EVIDENCE_PACKET.md`
- [ ] تعریف production feeder registry (PriceOracle feeders: PAH_USD، USD_GOLD، OIL_USD، GAS_USD، GLOBAL_CPI، L2_YIELD_RATE)
- [ ] تأیید MIN_FEEDERS quorum در production
- [ ] تأیید STALENESS_THRESHOLD و DEVIATION_THRESHOLD در production
- [ ] تعریف feeder data-source attestations و source ownership
- [ ] تعریف stale-data handling procedure و escalation path
- [ ] تعریف invalidation procedure و post-incident review
- [ ] تعریف liveness monitoring dashboard و alert rules
- [ ] تعریف Airnode connection spec و integration plan (gap G-02)
- [ ] تأیید signal-only doctrine — oracle داده است نه اختیار
- [ ] تأیید Fargard7PolicyAdapter proposal-only/non-executing (C-03)
- [ ] تأیید CLC-03 staleness guard (C-02)
- [ ] تأیید و ثبت `STEP9-BLOCK-004` و `STEP9-BLOCK-007` evidence packets
- [ ] signoff oracle operations lead

---

## ۱۵. چک‌لیست deployment dry-run

**مخصوص:** deployment coordinator، engineering maintainer

- [ ] مطالعه `STEP12_DEPLOYMENT_DRY_RUN_EVIDENCE_PACKET.md`
- [ ] تهیه deployment manifest (contract list، deploy order، dependencies)
- [ ] ثبت artifact hashes برای هر contract
- [ ] ثبت constructor arguments برای هر contract
- [ ] تهیه dependency address book
- [ ] تعریف initial role assignments (SOVEREIGN، COURT، ORACLE، GUARDIAN، COUNCIL)
- [ ] اجرای dry-run در testnet و ثبت logs
- [ ] ثبت gas estimates
- [ ] اجرای post-run verification (role state، authority boundaries، dependency wiring)
- [ ] تأیید TG-01 manual path — Kernel call procedure در deployment checklist
- [ ] تأیید گپ G-04 (STEP9-BLOCK-005) و G-06 (Deployment Artifact Packet) در مستندات
- [ ] تأیید و ثبت `STEP9-BLOCK-005-DEPLOYMENT-PACKET-001/002/003`
- [ ] signoff deployment reviewer

---

## ۱۶. چک‌لیست release signoff

**مخصوص:** release council (اعضای منتخب)

- [ ] تأیید که BLOCK-001 (external audit) بسته شده
- [ ] تأیید که BLOCK-002 (formal verification) بسته شده
- [ ] تأیید که BLOCK-003 (custody) بسته شده
- [ ] تأیید که BLOCK-004 (oracle ops) بسته شده
- [ ] تأیید که BLOCK-005 (deployment dry-run) بسته شده
- [ ] تأیید که BLOCK-007 (oracle runbook) بسته شده
- [ ] تأیید که BLOCK-008 (non-claim) accepted شده
- [ ] تهیه upstream blocker disposition summary
- [ ] تعریف release package hash و سند آن
- [ ] جمع‌آوری signer approvals
- [ ] برگزاری release council go/no-go session و ثبت minutes
- [ ] تأیید گپ G-08 (Release Council) با membership مستند
- [ ] تأیید و ثبت `STEP9-BLOCK-006-RELEASE-PACKET-001/002/003`
- [ ] signoff release council

---

## ۱۷. تصمیم‌های doctrine شناخته‌شده

موارد زیر در step37/38/41/42 و source docs تصمیم‌گیری شده‌اند:

| # | تصمیم | موقعیت مستند |
|---|--------|--------------|
| D-01 | **TG-01 — automation رد شد:** `TriggerProtocol.executeTrigger()` هرگز `Treasury.blockAddressByTrigger()` را فراخوانی نمی‌کند؛ P0 revert risk تأیید شد؛ Option D (human Kernel call) تنها مسیر فعلی | step37، step38، WS-1، WS-5 |
| D-02 | **TRIGGER_TIMEOUT=72h — SLA دادگاه:** فقط SLA رسیدگی دادگاه است — نه auto-unlock، نه auto-execute؛ deactivation نیاز به `onlyCourt` دارد | step42 doctrine، WS-1، WS-5 |
| D-03 | **Signal-only doctrine:** oracle data → evidence review → authorized human decision؛ هرگز → autonomous execution | Step-4/5/9، WS-6 |
| D-04 | **Fargard7PolicyAdapter — proposal-only:** `executable=false`؛ `allSignalsFresh` guard؛ هیچ downstream mutation | WS-1، WS-2، WS-5، WS-6 |
| D-05 | **۱۰۰۰ پهلوی — کارفرما پرداخت می‌کند:** MIN_WAGE=1000 PAH؛ CitizenCard = status tracker؛ SWF = backing ذخیره نه منبع مستقیم رفاه | WS-3، CLAUDE.md |
| D-06 | **ZK on-chain verifier — موکول به نسخه آینده:** `length > 0` فعلاً کافی تلقی شده؛ full ZKP verification در نسخه آینده | CLAUDE.md، WS-3، WS-8 |
| D-07 | **Parliament — SOVEREIGN_ROLE برای enactment:** `enactLaw(SOVEREIGN_ROLE)` و `vetoLaw(SOVEREIGN_ROLE)` تضمین نظارت نهایی | WS-2، WS-3، WS-8 |
| D-08 | **Emergency lock — TR-01/02/03 auto-lock:** flagViolation برای TR-01/02/03 فوراً emergencyLockActive=true می‌کند؛ فقط `onlyCourt` می‌تواند غیرفعال کند | WS-1، WS-5 |
| D-09 | **MULTISIG_THRESHOLD=7-of-9 — حداقل قانون اساسی:** کاهش این آستانه در هیچ PR مجاز نیست | CLAUDE.md، WS-1، WS-2 |
| D-10 | **IMMUTABLE_PRINCIPLES_MASK=0x07 — اصول ۱/۲/۳ همیشه اجباری:** هیچ فرآیند عمومی نمی‌تواند این اصول را غیرفعال کند | WS-5، WS-8 |
| D-11 | **CLC-06 — notLocked روی authority setters:** `grantOfficialAccess()`، `setTriggerProtocol()`، `setSovereignWealthFund()` همه notLocked دارند | commit f06e0be، WS-1 |
| D-12 | **CLC-03 — MAX_DATA_AGE=1h staleness guard:** `API3Oracle.flagViolation()` نیازمند داده تازه‌تر از ۱ ساعت | commit 6e688e5، WS-1، WS-6 |

---

## ۱۸. تصمیم‌های باز (non-decisions شناخته‌شده)

موارد زیر هنوز تصمیم‌گیری نشده‌اند و نیازمند governance review هستند:

| # | موضوع | نیازمند تصمیم از |
|---|--------|-----------------|
| ND-01 | کدام firm برای external audit | governance/release council |
| ND-02 | کدام tool برای formal verification (Certora/SMTChecker/Echidna/Noir) | formal methods owner + governance |
| ND-03 | هویت custodianها — چه کسی کدام key را نگه می‌دارد | governance operations lead |
| ND-04 | production feeder registry — identity و custody feeders | oracle operations lead |
| ND-05 | Airnode network selection و connection architecture | oracle operations lead + technical reviewer |
| ND-06 | Release council membership — چه کسانی عضو هستند | governance |
| ND-07 | ZK verifier technology — Circom/SnarkJS/Noir/Halo2 | formal methods owner + technical reviewer |
| ND-08 | Voter registry integration approach — CitizenCard → VotingSystem | governance + legal reviewer |
| ND-09 | Public feedback mechanism — آیا on-chain mechanism لازم است و با چه طراحی | governance + constitutional lawyer |
| ND-10 | Deployment network selection — mainnet/zkSync/StarkNet | governance + technical reviewer |
| ND-11 | Key rotation period و rotation trigger criteria | governance operations lead |
| ND-12 | Compromise response procedure — who decides، who executes | governance + release council |

---

## ۱۹. اقدامات آینده ضروری توسط انسان

| # | اقدام | نوع reviewer | blocker مرتبط | اولویت |
|---|-------|--------------|---------------|--------|
| A-01 | انتخاب audit firm و راه‌اندازی engagement | governance/release council | `STEP9-BLOCK-001` | بالا |
| A-02 | تعریف formal verification scope و انتخاب tool/firm | formal methods owner | `STEP9-BLOCK-002` | بالا |
| A-03 | تعریف custody plan و signer registry | governance operations lead | `STEP9-BLOCK-003` | بالا |
| A-04 | تهیه production feeder registry و oracle ops evidence | oracle operations lead | `STEP9-BLOCK-004`، `STEP9-BLOCK-007` | بالا |
| A-05 | اجرای testnet deployment dry-run و ثبت artifacts | deployment coordinator | `STEP9-BLOCK-005` | بالا |
| A-06 | تشکیل release council و تعریف membership | governance | `STEP9-BLOCK-006` | متوسط |
| A-07 | بررسی مستقل WS-1 تا WS-8 توسط governance reviewer | governance reviewer | همه WS | بالا |
| A-08 | بررسی مستقل WS-3 توسط legal reviewer | حقوقدان قانون اساسی | #14 | بالا |
| A-09 | بررسی مستقل WS-4 توسط financial reviewer | کارشناس مالی/اقتصادی | #14 | متوسط |
| A-10 | بررسی مستقل WS-6 توسط oracle/technical reviewer | متخصص oracle/فنی | #15، #16 | بالا |
| A-11 | تعریف Airnode connection spec و integration plan | oracle operations lead + technical | `STEP9-BLOCK-007` | متوسط |
| A-12 | تصمیم درباره ZK verifier technology و deployment | formal methods owner + technical | `STEP9-BLOCK-002` | متوسط |
| A-13 | تصمیم درباره voter registry integration | governance + legal | #19 | پایین |
| A-14 | تصمیم درباره public feedback mechanism | governance + constitutional lawyer | #19 | پایین |

---

## ۲۰. خلاصه وضعیت فعلی پروژه

| موضوع | وضعیت |
|-------|--------|
| آخرین commit main | `f9d47da` |
| testها | ۴۹۹ passing |
| گام ۱۲ | **باز** |
| گام ۱۳ | **باز** |
| پوشش traceability گام ۱۳ | کامل — ۸/۸ workstream |
| اصول بررسی‌شده | ۱۲۴ (17 COMPLETE / 94 PARTIAL / 13 GAP) |
| blockerهای باز | ۸ (همه STEP9-BLOCK-001 تا 008) |
| evidence پذیرفته‌شده | **صفر** |
| reviewer signoff | **صفر** |
| blocker بسته‌شده | **صفر** |
| آمادگی برای human review preparation | **بله** |
| production readiness | **خیر — ادعا نشده** |
| release readiness | **خیر — ادعا نشده** |
| audit completion | **خیر** |
| formal verification completion | **خیر** |

**یادداشت نهایی:** این بسته آماده‌سازی برای review انسانی است. آماده‌سازی برای review، review نیست. آماده‌سازی evidence، پذیرش evidence نیست. آماده‌سازی signoff، اعطای signoff نیست. گام ۱۲ و گام ۱۳ هر دو باز هستند و هیچ‌چیزی در این بسته آن‌ها را نمی‌بندد.

</div>
