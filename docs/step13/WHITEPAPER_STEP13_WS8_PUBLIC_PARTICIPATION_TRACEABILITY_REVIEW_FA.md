<div dir="rtl">

# بازبینی ردیابی workstream ۸ — مشارکت عمومی فارسی‌زبان و نمایندگی مدنی

**نوع سند:** AI-assisted traceability pre-review — documentation-only
**workstream:** WS-8 — مشارکت عمومی / نمایندگی مدنی
**گام:** Step 13 — باز
**وضعیت گام ۱۲:** باز
**وضعیت:** این سند review انسانی، signoff حکمرانی، evidence پذیرفته‌شده، بستن گام ۱۲ یا گام ۱۳، یا هیچ پذیرش production نیست.

---

## ۱. هشدار و محدودیت‌های غیرادعایی

این سند فقط یک pre-review ردیابی AI-assisted است. هیچ‌یک از موارد زیر ادعا نمی‌شود:

- هیچ review انسانی کامل نشده است.
- هیچ signoff حکمرانی یا حقوقی ادعا نمی‌شود.
- هیچ evidence پذیرفته‌شده وجود ندارد.
- هیچ blocker بسته نشده است.
- هیچ audit یا formal verification تکمیل نشده است.
- هیچ production readiness یا release approval ادعا نمی‌شود.
- قرارداد، test، آستانه، timeout یا اختیار حکمرانی تغییر نکرده است.
- گام ۱۲ و گام ۱۳ هر دو باز هستند.

---

## ۲. حدود اصل مشارکت عمومی Iran-OS

مشارکت عمومی در Iran-OS:

**هست:**
- مشارکت قانون‌اساسی — نمایندگی تقنینی از طریق پارلمان
- انتخابات نهادی — از طریق `VotingSystem.sol` با تأیید بیومتریک
- نمایندگی استانی — از طریق `Provincial.sol` و فرمول ۳۰/۷۰
- مشارکت هیئت‌منصفه — از طریق `JurySelection.sol` با انتخاب تصادفی VRF
- مشاوره ساختارمند — ورودی عمومی از طریق کانال‌های قانونی و نهادی

**نیست:**
- دموکراسی مستقیم یا DAO
- رأی‌گیری با وزن توکن یا token-incentive
- حکمرانی خودکار توسط جمع
- حق وتو عمومی روی تصمیمات حاکمیتی، قضایی یا اداری
- سازوکار gamification یا social-credit
- اقتدار مستقل جامعه برای تغییر آستانه‌های چندامضایی، بودجه، ذخایر، اختیارات دادگاه یا اختیارات پادشاه

---

## ۳. منابع repo مورد بررسی

- `contracts/governance/Parliament.sol`
- `contracts/governance/VotingSystem.sol`
- `contracts/governance/Provincial.sol`
- `contracts/justice/JurySelection.sol`
- `contracts/core/ConstitutionGuard.sol`
- `contracts/kernel.sol`
- `contracts/welfare/CitizenCard.sol`
- `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md`
- `docs/WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`
- `docs/STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`

---

## ۴. جدول خلاصه وضعیت اصول WS-8

| # | اصل | وضعیت ردیابی | یادداشت |
|---|-----|--------------|---------|
| P8-01 | اصل مشارکت عمومی | PARTIAL | اصل مستند؛ evidence/signoff تولیدی ندارد |
| P8-02 | مرزهای مشارکت قانون‌اساسی | PARTIAL | مرزها در قرارداد اجرا شده؛ formal verification ندارد |
| P8-03 | پارلمان — نمایندگی تقنینی | PARTIAL | قرارداد و چرخه قانون وجود دارد؛ registry تولیدی نیست |
| P8-04 | سامانه رأی‌گیری | PARTIAL | قرارداد و انواع انتخابات وجود دارد؛ ZK verifier کامل نیست |
| P8-05 | نمایندگی استانی | PARTIAL | فرمول ۳۰/۷۰ مستند و test شده؛ evidence انتخابات استانی نیست |
| P8-06 | مکانیسم همه‌پرسی | PARTIAL | نوع Referendum در enum وجود دارد؛ procedure/scope ندارد |
| P8-07 | مشارکت شهروندی از طریق هیئت‌منصفه | PARTIAL | VRF و آستانه‌ها مستند؛ ZK verifier ناقص؛ signoff ندارد |
| P8-08 | صلاحیت کاندیداتوری خودکار | COMPLETE | بررسی خودکار residency+criminal؛ بدون شورای نگهبان |
| P8-09 | کپی‌زدایی بیومتریک — یک‌نفر-یک‌رأی | COMPLETE | `hasVoted[electionId][voterBiometric]` اجرا شده |
| P8-10 | محدودیت‌های قانون‌اساسی بر مشارکت | PARTIAL | ConstitutionGuard/IMMUTABLE_PRINCIPLES_MASK وجود دارد؛ formal proof ندارد |
| P8-11 | اجرای runtime و حفاظ‌های مشارکت | PARTIAL | role guards و biometric dedup وجود دارد؛ production evidence ندارد |
| P8-12 | مکانیسم بازخورد و مشاوره عمومی | GAP | هیچ on-chain citizen feedback/petition mechanism وجود ندارد |
| P8-13 | رجیستر رأی‌دهندگان واجد شرایط | GAP | totalEligibleVoters باید خارجی تنظیم شود؛ no on-chain voter roll |

**خلاصه: ۲ COMPLETE / ۹ PARTIAL / ۲ GAP**

---

## ۵. بررسی تفصیلی اصول WS-8

---

### P8-01 — اصل مشارکت عمومی (Public Participation Doctrine)

| فیلد | مقدار |
|------|-------|
| **اصل** | مشارکت عمومی در ایران‌اواس مشارکت قانون‌اساسی/نهادی است — نه دموکراسی مستقیم، DAO، رأی‌گیری توکنی یا حکمرانی خودکار جمعی |
| **منبع سند** | `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md`؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md`؛ `STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md` |
| **قرارداد/ماژول** | `Parliament.sol`، `VotingSystem.sol`، `Provincial.sol`، `JurySelection.sol` |
| **توصیف** | مشارکت عمومی از طریق نمایندگی تقنینی، انتخابات، نمایندگی استانی، و هیئت‌منصفه تعریف شده؛ هیچ مکانیسم مستقیم جمع‌سپاری حکمرانی وجود ندارد |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | قراردادهای نمایندگی و انتخابات وجود دارند و test شده‌اند؛ فرمول‌های نمایندگی مستند هستند؛ production evidence ندارد |
| **test/evidence موجود** | `test/VotingSystem.test.js`، `test/Parliament.test.js`، `test/Provincial.test.js`، `test/JurySelection.test.js` — همه repo-level |
| **issue/blocker مرتبط** | #14 governance review، #18 non-claim validation، #19 public participation open |
| **ریسک/محدودیت** | ادعای «مشارکت مستقیم» یا «DAO-style governance» ممنوع است؛ مشارکت عمومی نمی‌تواند اختیار پادشاه، دادگاه یا صندوق ذخایر را نقض کند |
| **اقدام بعدی** | ثبت اصل مشارکت در review حکمرانی و legal review؛ اتصال به issue #14 و #19 |
| **وابستگی evidence** | evidence نهایی نیازمند governance reviewer + legal reviewer قانون اساسی |
| **یادداشت غیرادعایی** | این ردیابی AI-assisted است؛ هیچ review انسانی، signoff یا blocker closure ادعا نمی‌شود |

---

### P8-02 — مرزهای مشارکت قانون‌اساسی

| فیلد | مقدار |
|------|-------|
| **اصل** | مشارکت عمومی نمی‌تواند آستانه‌های چندامضایی، اقتدار دادگاه، ذخایر ملی، پروتکل trigger، حداقل دستمزد یا اختیار پادشاه را نقض یا دور بزند |
| **منبع سند** | `kernel.sol` (TR-01 تا TR-06)؛ `ConstitutionGuard.sol`؛ `STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md` |
| **قرارداد/ماژول** | `kernel.sol` — TR-01/02/03/04/05/06؛ `ConstitutionGuard.sol` — `IMMUTABLE_PRINCIPLES_MASK=0x07`؛ `Parliament.sol` — `enactLaw(SOVEREIGN_ROLE)` |
| **توصیف** | قانون اساسی شش خط قرمز TR-01 تا TR-06 را تعریف می‌کند که حتی مشارکت عمومی نمی‌تواند آن‌ها را تغییر دهد؛ `IMMUTABLE_PRINCIPLES_MASK=0x07` اصول ۱، ۲، ۳ را همیشه اجباری نگه می‌دارد؛ `vetoLaw(SOVEREIGN_ROLE)` نقطه نهایی تأیید را حفظ می‌کند |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | TR codes، IMMUTABLE_PRINCIPLES_MASK، چرخه عمر قانون (Draft→...→Enacted) همه در source وجود دارند؛ formal verification از این مرزها کامل نشده |
| **test/evidence موجود** | تست‌های kernel.sol، ConstitutionGuard، Parliament — همه repo-level؛ هیچ formal verification evidence ندارد |
| **issue/blocker مرتبط** | `STEP9-BLOCK-001` (#12 audit)؛ `STEP9-BLOCK-002` (#13 formal verification)؛ #14؛ #18 |
| **ریسک/محدودیت** | ادعای «مشارکت عمومی می‌تواند TR codes را تغییر دهد» ممنوع است؛ هیچ رأی عمومی نمی‌تواند MULTISIG_THRESHOLD را پایین بیاورد یا emergency lock را دور بزند |
| **اقدام بعدی** | افزودن constitutional participation boundary به formal verification scope (#13)؛ اتصال به audit #12 |
| **وابستگی evidence** | formal verification (#13)؛ external audit (#12)؛ governance/constitutional reviewer |
| **یادداشت غیرادعایی** | مرزها در کد موجودند؛ هیچ formal proof یا accepted evidence ادعا نمی‌شود |

---

### P8-03 — پارلمان — نمایندگی تقنینی

| فیلد | مقدار |
|------|-------|
| **اصل** | پارلمان تنها نهاد تقنینی است؛ نمایندگان توسط KERNEL_ROLE ثبت می‌شوند؛ قوانین چرخه Draft→RoyalReview→Enacted را طی می‌کنند؛ تصویب نهایی با SOVEREIGN_ROLE است |
| **منبع سند** | `contracts/governance/Parliament.sol`؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `Parliament.registerMP(KERNEL_ROLE)`؛ `proposeLaw(MP_ROLE)`؛ `castVote(MP_ROLE)`؛ `enactLaw(SOVEREIGN_ROLE)`؛ `vetoLaw(SOVEREIGN_ROLE)`؛ `returnForRevision(SOVEREIGN_ROLE)` |
| **توصیف** | `REVIEW_PERIOD=10 days`؛ `BUDGET_CAP=150_000_000_000*1e18`؛ اکثریت = `votesFor > totalMPs/2`؛ مصونیت پارلمانی با `immuneMembers[mp]=true`؛ چرخه کامل `LawStatus` در source وجود دارد |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | source کامل است؛ تست‌های repo-level وجود دارند؛ هیچ registry تولیدی MP، نتیجه انتخابات، یا evidence پارلمانی در repo ندارد |
| **test/evidence موجود** | `test/Parliament.test.js` — repo-level؛ هیچ production MP registry evidence یا election result ندارد |
| **issue/blocker مرتبط** | #14 governance review؛ `STEP9-BLOCK-001` (#12 audit)؛ `STEP9-BLOCK-002` (#13 formal verification) |
| **ریسک/محدودیت** | ادعای «پارلمان در production راه‌اندازی شده» ممنوع است؛ هیچ MP رسمی register نشده؛ هیچ قانونی از طریق این قرارداد enacted نشده است |
| **اقدام بعدی** | تهیه parliamentary election evidence plan؛ اتصال به MP registry governance procedure |
| **وابستگی evidence** | governance/legal reviewer؛ election management authority؛ production MP registry evidence |
| **یادداشت غیرادعایی** | قرارداد source-complete است؛ هیچ production deployment یا accepted evidence ادعا نمی‌شود |

---

### P8-04 — سامانه رأی‌گیری (VotingSystem)

| فیلد | مقدار |
|------|-------|
| **اصل** | `VotingSystem.sol` انتخابات ملی، استانی و همه‌پرسی را با ZK proof، dedup بیومتریک و معیارهای صلاحیت خودکار مدیریت می‌کند |
| **منبع سند** | `contracts/governance/VotingSystem.sol`؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `VotingSystem.createElection(ELECTION_ROLE)`؛ `registerCandidate(ORACLE_ROLE)`؛ `castVote(public, zkProof+biometric)`؛ `activateElection(ELECTION_ROLE)` |
| **توصیف** | `MIN_RESIDENCY_YEARS=5`؛ سه نوع انتخابات: National، Provincial، Referendum؛ `castVote()` نیازمند `zkProof.length > 0` و biometric dedup؛ رویداد VoteCast ناشناس است (هویت رأی‌دهنده در event فاش نمی‌شود) |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | source کامل است؛ ZK proof فقط `length > 0` بررسی می‌شود — verifier واقعی on-chain وجود ندارد؛ هیچ production election انجام نشده |
| **test/evidence موجود** | `test/VotingSystem.test.js` — repo-level؛ هیچ production election evidence، voter registration evidence یا ZK verifier audit ندارد |
| **issue/blocker مرتبط** | `STEP9-BLOCK-002` (#13 formal verification — ZK verifier gap)؛ `STEP9-BLOCK-001` (#12 audit)؛ #14؛ #19 |
| **ریسک/محدودیت** | ZK proof فقط با `length > 0` بررسی می‌شود — نه verifier واقعی؛ ادعای «انتخابات ZK-verified در production» ممنوع است |
| **اقدام بعدی** | تعیین ZK verifier به‌عنوان scope در #13 formal verification؛ تهیه election procedure/evidence plan |
| **وابستگی evidence** | ZK verifier deployment (#13)؛ election authority signoff؛ ORACLE_ROLE candidate registration procedure |
| **یادداشت غیرادعایی** | این بررسی repo-level است؛ هیچ production election یا ZK verification complete ادعا نمی‌شود |

---

### P8-05 — نمایندگی استانی

| فیلد | مقدار |
|------|-------|
| **اصل** | استان‌ها ۳۰٪ درآمد را حفظ می‌کنند؛ ۷۰٪ به خزانه ملی می‌رود؛ استان‌های با `productivityScore > 70` مستحق پاداش هستند؛ نمایندگی استانی کانال مشارکت محلی است |
| **منبع سند** | `contracts/governance/Provincial.sol`؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `Provincial.sol` — `PROVINCIAL_SHARE=300` (30٪)؛ `productivityScore`؛ oracle feeds revenue |
| **توصیف** | فرمول ۳۰/۷۰ در source و test ثبت شده؛ پاداش بهره‌وری برای امتیاز >70 اعمال می‌شود؛ درآمد استانی از طریق ORACLE_ROLE تأمین می‌شود؛ هیچ election استانی تولیدی register نشده |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | source کامل است؛ فرمول توزیع درآمد test شده؛ هیچ production province registry یا elected governor evidence در repo ندارد |
| **test/evidence موجود** | `test/Provincial.test.js` — repo-level؛ هیچ production provincial election evidence یا oracle revenue evidence ندارد |
| **issue/blocker مرتبط** | #14 governance review؛ #15 oracle ops (oracle revenue feeds)؛ `STEP9-BLOCK-001` (#12 audit) |
| **ریسک/محدودیت** | ادعای «نمایندگی استانی در production راه‌اندازی شده» ممنوع است؛ oracle revenue feed نیازمند evidence oracle ops دارد |
| **اقدام بعدی** | تهیه provincial governance election plan؛ اتصال oracle revenue به oracle ops evidence (#15) |
| **وابستگی evidence** | oracle ops signoff (#15، #16)؛ provincial election authority؛ governance reviewer |
| **یادداشت غیرادعایی** | فرمول در code موجود است؛ هیچ production deployment یا election evidence ادعا نمی‌شود |

---

### P8-06 — مکانیسم همه‌پرسی

| فیلد | مقدار |
|------|-------|
| **اصل** | `VotingSystem.sol` نوع انتخابات `ElectionType.Referendum` را پشتیبانی می‌کند؛ همه‌پرسی باید از طریق `ELECTION_ROLE` ایجاد شود و در مرزهای قانون اساسی باشد |
| **منبع سند** | `contracts/governance/VotingSystem.sol` (ElectionType.Referendum)؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `VotingSystem.sol` — `ElectionType.Referendum`؛ `createElection(ELECTION_ROLE)` |
| **توصیف** | نوع Referendum در enum وجود دارد و در `createElection()` قابل استفاده است؛ هیچ referendum procedure، trigger criteria، constitutional scope، output binding، یا implementation plan در repo ثبت نشده |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | enum type موجود است؛ هیچ referendum-specific logic، criteria، constitutional scope، یا procedure در source ندارد |
| **test/evidence موجود** | VotingSystem tests repo-level؛ هیچ referendum procedure evidence، trigger criteria، یا constitutional scope review ندارد |
| **issue/blocker مرتبط** | #14 governance review؛ #18 non-claim validation؛ #19 public participation |
| **ریسک/محدودیت** | ادعای «همه‌پرسی می‌تواند TR codes یا اختیارات پادشاه را تغییر دهد» ممنوع است؛ همه‌پرسی باید در چارچوب قانون اساسی و محدودیت‌های ConstitutionGuard باشد |
| **اقدام بعدی** | تعریف referendum scope، trigger criteria و constitutional boundaries؛ legal reviewer signoff |
| **وابستگی evidence** | constitutional lawyer review؛ governance reviewer؛ ELECTION_ROLE procedure evidence |
| **یادداشت غیرادعایی** | enum type موجود است؛ هیچ referendum procedure accepted یا constitutional scope defined ادعا نمی‌شود |

---

### P8-07 — مشارکت شهروندی از طریق هیئت‌منصفه

| فیلد | مقدار |
|------|-------|
| **اصل** | `JurySelection.sol` از VRF تصادفی برای انتخاب ۱۲ هیئت‌منصفه از pool شهروندان واجد شرایط استفاده می‌کند؛ این شکل مستقیم مشارکت شهروندی در دادرسی است |
| **منبع سند** | `contracts/justice/JurySelection.sol`؛ `WHITEPAPER_WELFARE_JUSTICE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `JurySelection.sol` — `JURY_SIZE=12`؛ `CONVICTION_THRESHOLD=8`؛ `ACQUITTAL_THRESHOLD=5`؛ VRF commitment؛ `zkProof.length > 0` |
| **توصیف** | انتخاب تصادفی هیئت توسط VRF — بدون قابلیت دستکاری؛ آستانه‌های رأی‌گیری ثابت در source؛ ZK proof فقط `length > 0` بررسی می‌شود — verifier on-chain کامل ندارد |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | source کامل است؛ VRF، آستانه‌ها، و چرخه هیئت test شده؛ ZK proof on-chain verifier ندارد؛ production jury evidence ندارد |
| **test/evidence موجود** | `test/JurySelection.test.js` — repo-level؛ هیچ production jury evidence، pool registry یا ZK verifier audit ندارد |
| **issue/blocker مرتبط** | `STEP9-BLOCK-002` (#13 ZK formal verification)؛ `STEP9-BLOCK-001` (#12 audit)؛ #14 |
| **ریسک/محدودیت** | ZK verifier gap: `zkProof.length > 0` کافی نیست برای production ZK verification؛ ادعای «هیئت ZK-verified در production» ممنوع است |
| **اقدام بعدی** | افزودن ZK verifier jury به scope formal verification (#13)؛ تهیه eligible citizen pool procedure |
| **وابستگی evidence** | ZK verifier deployment (#13)؛ external audit (#12)؛ justice/governance reviewer |
| **یادداشت غیرادعایی** | VRF و آستانه‌ها در code موجودند؛ هیچ ZK verifier complete یا production jury evidence ادعا نمی‌شود |

---

### P8-08 — صلاحیت کاندیداتوری خودکار (COMPLETE)

| فیلد | مقدار |
|------|-------|
| **اصل** | معیار صلاحیت کاندیداتوری — `residencyYears >= MIN_RESIDENCY_YEARS(5) && !hasCriminalRecord` — به‌صورت خودکار on-chain اجرا می‌شود؛ هیچ شورای نگهبان یا فیلتر دستی وجود ندارد |
| **منبع سند** | `contracts/governance/VotingSystem.sol` (registerCandidate)؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | `VotingSystem.registerCandidate(ORACLE_ROLE)` — بررسی خودکار `require(residencyYears >= 5 && !hasCriminalRecord)` |
| **توصیف** | معیارهای صلاحیت به‌صورت on-chain و خودکار اعمال می‌شوند؛ NatSpec صریحاً می‌گوید «بدون شورای نگهبان — بررسی صلاحیت خودکار»؛ هیچ مکانیسم رد دستی برای کاندیداها وجود ندارد |
| **وضعیت ردیابی** | COMPLETE |
| **وضعیت کد در repo** | `registerCandidate()` با `require(residencyYears >= MIN_RESIDENCY_YEARS && !hasCriminalRecord)` اجرا می‌شود؛ `ORACLE_ROLE` داده می‌دهد؛ NatSpec مستند است |
| **test/evidence موجود** | `test/VotingSystem.test.js` — بررسی صلاحیت test شده در repo |
| **issue/blocker مرتبط** | #14 governance review؛ #15 oracle ops (برای داده `residencyYears` و `hasCriminalRecord`) |
| **ریسک/محدودیت** | داده ورودی `residencyYears` و `hasCriminalRecord` از ORACLE_ROLE می‌آید — نیازمند oracle data source evidence؛ ادعای «oracle data در production معتبر است» ممنوع است |
| **اقدام بعدی** | اتصال oracle data source برای residency و criminal record به oracle ops evidence (#15) |
| **وابستگی evidence** | oracle data source attestation (#15)؛ governance/legal reviewer برای eligibility criteria |
| **یادداشت غیرادعایی** | مکانیسم code-level COMPLETE است؛ data source production evidence pending؛ هیچ production election ادعا نمی‌شود |

---

### P8-09 — کپی‌زدایی بیومتریک — یک‌نفر-یک‌رأی (COMPLETE)

| فیلد | مقدار |
|------|-------|
| **اصل** | `hasVoted[electionId][voterBiometric]` اطمینان می‌دهد که هر شناسه بیومتریک فقط یک‌بار در هر انتخابات رأی می‌دهد |
| **منبع سند** | `contracts/governance/VotingSystem.sol` (castVote)؛ `contracts/welfare/CitizenCard.sol` (biometricToAddress) |
| **قرارداد/ماژول** | `VotingSystem.castVote()` — `require(!hasVoted[electionId][voterBiometric])`؛ `hasVoted[electionId][voterBiometric] = true` |
| **توصیف** | dedup بیومتریک به‌صورت on-chain mapping اجرا شده؛ ZK proof (`length > 0`) برای هویت مخفی رأی‌دهنده استفاده می‌شود؛ رویداد VoteCast هیچ هویت آشکاری ثبت نمی‌کند |
| **وضعیت ردیابی** | COMPLETE |
| **وضعیت کد در repo** | `hasVoted[electionId][voterBiometric]` mapping کامل در source اجرا شده؛ test شده در repo |
| **test/evidence موجود** | `test/VotingSystem.test.js` — biometric dedup test شده در repo |
| **issue/blocker مرتبط** | `STEP9-BLOCK-002` (#13 — ZK verifier gap برای ناشناسی کامل) |
| **ریسک/محدودیت** | biometric data در production باید از منبع معتبر باشد؛ ZK proof فقط `length > 0` بررسی می‌شود — ادعای «full anonymity ZK-verified» ممنوع است |
| **اقدام بعدی** | ZK verifier کامل برای dedup on-chain به scope formal verification (#13) اضافه شود |
| **وابستگی evidence** | biometric data source attestation؛ ZK verifier deployment (#13)؛ governance reviewer |
| **یادداشت غیرادعایی** | مکانیسم dedup code-level COMPLETE است؛ ZK verifier production gap جداگانه در #13 ردیابی می‌شود |

---

### P8-10 — محدودیت‌های قانون‌اساسی بر مشارکت

| فیلد | مقدار |
|------|-------|
| **اصل** | `ConstitutionGuard.IMMUTABLE_PRINCIPLES_MASK=0x07` اصول ۱، ۲، ۳ را همیشه اجباری نگه می‌دارد؛ هیچ فرآیند مشارکت عمومی — از جمله رأی پارلمان یا همه‌پرسی — نمی‌تواند این اصول را تغییر دهد |
| **منبع سند** | `contracts/core/ConstitutionGuard.sol`؛ `kernel.sol` (TR-01 تا TR-06)؛ `STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md` |
| **قرارداد/ماژول** | `ConstitutionGuard.sol` — `IMMUTABLE_PRINCIPLES_MASK=0x07`؛ `kernel.sol` — TR-01/02/03 auto-lock |
| **توصیف** | اصول ۱ (منشور سکولار)، ۲ (سکولاریسم ساختاری)، ۳ (یکپارچگی سرزمینی) همیشه اجباری هستند؛ هیچ قانون پارلمانی یا رأی عمومی نمی‌تواند آن‌ها را غیرفعال کند؛ TR-01/02/03 auto-lock فوری ایجاد می‌کند |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | IMMUTABLE_PRINCIPLES_MASK در source وجود دارد؛ TR-01/02/03 auto-lock test شده؛ formal verification مستقل از این مرزها کامل نشده |
| **test/evidence موجود** | `test/ConstitutionGuard.test.js`؛ `test/kernel.test.js` — repo-level؛ هیچ formal verification evidence ندارد |
| **issue/blocker مرتبط** | `STEP9-BLOCK-002` (#13 formal verification)؛ `STEP9-BLOCK-001` (#12 audit)؛ #18 non-claim |
| **ریسک/محدودیت** | ادعای «formal verification از IMMUTABLE_PRINCIPLES_MASK تأییدشده» ممنوع است؛ تست‌ها جایگزین proof نیستند |
| **اقدام بعدی** | افزودن IMMUTABLE_PRINCIPLES_MASK و TR-01/02/03 auto-lock به scope formal verification (#13) |
| **وابستگی evidence** | formal verification (#13)؛ external audit (#12)؛ constitutional lawyer review |
| **یادداشت غیرادعایی** | محدودیت‌ها در code موجودند؛ هیچ formal proof یا accepted evidence ادعا نمی‌شود |

---

### P8-11 — اجرای runtime و حفاظ‌های مشارکت

| فیلد | مقدار |
|------|-------|
| **اصل** | مشارکت توسط role guards، biometric dedup، ZK proof check، time bounds، و eligibility requirements در سطح runtime محافظت می‌شود؛ هیچ token-weighted mechanism وجود ندارد |
| **منبع سند** | `VotingSystem.sol`؛ `Parliament.sol`؛ `JurySelection.sol`؛ `Provincial.sol`؛ `STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md` |
| **قرارداد/ماژول** | `VotingSystem.castVote()` — time bounds، biometric dedup، zkProof؛ `Parliament.castVote(MP_ROLE)`؛ `Parliament.enactLaw(SOVEREIGN_ROLE)`؛ `JurySelection` — VRF، آستانه‌ها |
| **توصیف** | ELECTION_ROLE، MP_ROLE، SOVEREIGN_ROLE، ORACLE_ROLE هر یک نقش تعریف‌شده در مشارکت دارند؛ رأی‌گیری عمومی با حفاظ‌های on-chain؛ هیچ token-weighted vote یا rأی با وزن ثروت وجود ندارد |
| **وضعیت ردیابی** | PARTIAL |
| **وضعیت کد در repo** | role guards و biometric dedup در source کامل هستند؛ هیچ production evidence از اجرای موفق در election واقعی ندارد |
| **test/evidence موجود** | تست‌های مربوط به role guards، biometric dedup، time bounds — همه repo-level |
| **issue/blocker مرتبط** | `STEP9-BLOCK-001` (#12 audit)؛ `STEP9-BLOCK-002` (#13 formal verification)؛ #14 |
| **ریسک/محدودیت** | ادعای «runtime enforcement production-verified» ممنوع است؛ هیچ production election evidence وجود ندارد |
| **اقدام بعدی** | افزودن participation runtime enforcement به scope audit (#12) و formal verification (#13) |
| **وابستگی evidence** | external audit (#12)؛ formal verification (#13)؛ governance reviewer |
| **یادداشت غیرادعایی** | حفاظ‌ها در code وجود دارند؛ هیچ production evidence یا accepted signoff ادعا نمی‌شود |

---

### P8-12 — مکانیسم بازخورد و مشاوره عمومی (GAP)

| فیلد | مقدار |
|------|-------|
| **اصل** | هیچ مکانیسم on-chain برای بازخورد عمومی، پتیشن، مشاوره شهروندی یا ورودی ساختارمند غیر از انتخابات/هیئت‌منصفه/پارلمان در contracts موجود وجود ندارد |
| **منبع سند** | `docs/WHITEPAPER_PERSIAN_PUBLIC_PARTICIPATION_MAPPING_FA.md`؛ `WHITEPAPER_GOVERNANCE_STRUCTURE_MAPPING_FA.md` |
| **قرارداد/ماژول** | هیچ قرارداد مرتبط — gap شناسایی‌شده |
| **توصیف** | Iran-OS مشارکت عمومی را از طریق elections، jury، و parliamentary representation تعریف می‌کند؛ هیچ on-chain petition، public comment، structured consultation، یا civic input mechanism در contracts وجود ندارد؛ این gap در mapping docs مستند شده |
| **وضعیت ردیابی** | GAP |
| **وضعیت کد در repo** | هیچ قراردادی برای feedback mechanism وجود ندارد؛ gap در mapping مستند شده |
| **test/evidence موجود** | هیچ — gap تأییدشده |
| **issue/blocker مرتبط** | #19 public participation؛ #14 governance review |
| **ریسک/محدودیت** | این gap نیازمند تصمیم حکمرانی است که آیا on-chain feedback mechanism لازم است؛ هر implementation باید در محدوده قانون اساسی و بدون تداخل با اختیارات پادشاه/دادگاه/ذخایر باشد |
| **اقدام بعدی** | ارجاع این gap به governance reviewer و legal reviewer در #14 و #19؛ تصمیم حکمرانی لازم است |
| **وابستگی evidence** | governance/legal reviewer؛ constitutional scope determination |
| **یادداشت غیرادعایی** | این یک gap مستندشده است؛ هیچ implementation یا accepted workaround ادعا نمی‌شود |

---

### P8-13 — رجیستر رأی‌دهندگان واجد شرایط (GAP)

| فیلد | مقدار |
|------|-------|
| **اصل** | `VotingSystem.getTurnout()` از `totalEligibleVoters` استفاده می‌کند که باید خارج از زنجیره تنظیم شود؛ هیچ on-chain voter roll یا eligible citizen registry متصل به VotingSystem وجود ندارد |
| **منبع سند** | `contracts/governance/VotingSystem.sol` (getTurnout)؛ `contracts/welfare/CitizenCard.sol` (biometricToAddress) |
| **قرارداد/ماژول** | `VotingSystem.getTurnout()` — `(totalVotes * 1000) / totalEligibleVoters`؛ `totalEligibleVoters` باید externally set شود |
| **توصیف** | `CitizenCard.biometricToAddress` رجیستر بیومتریک شهروندان را نگه می‌دارد اما این به `VotingSystem.totalEligibleVoters` متصل نیست؛ gap یکپارچه‌سازی voter registry وجود دارد؛ هیچ on-chain integration بین CitizenCard و VotingSystem ندارد |
| **وضعیت ردیابی** | GAP |
| **وضعیت کد در repo** | gap در source قابل مشاهده است — `totalEligibleVoters` از خارج تنظیم می‌شود؛ هیچ on-chain integration با CitizenCard یا رجیستر ملی وجود ندارد |
| **test/evidence موجود** | هیچ — gap تأییدشده |
| **issue/blocker مرتبط** | #14 governance review؛ #19 public participation؛ `STEP9-BLOCK-001` (#12 audit) |
| **ریسک/محدودیت** | دستکاری `totalEligibleVoters` می‌تواند آمار مشارکت را تحت تأثیر قرار دهد؛ هیچ on-chain voter roll = هیچ verifiable turnout در production |
| **اقدام بعدی** | بررسی integration voter registry با CitizenCard در #19؛ تصمیم حکمرانی لازم است؛ ارجاع به audit scope (#12) |
| **وابستگی evidence** | governance reviewer؛ legal review؛ citizen registry authority |
| **یادداشت غیرادعایی** | این یک gap مستندشده است؛ هیچ workaround یا accepted solution ادعا نمی‌شود |

---

## ۶. خلاصه تعداد

| وضعیت | تعداد | موارد |
|--------|-------|-------|
| COMPLETE | ۲ | P8-08 (صلاحیت کاندیداتوری خودکار)؛ P8-09 (کپی‌زدایی بیومتریک) |
| PARTIAL | ۹ | P8-01 تا P8-07؛ P8-10؛ P8-11 |
| GAP | ۲ | P8-12 (feedback عمومی)؛ P8-13 (voter registry) |
| **جمع** | **۱۳** | |

---

## ۷. وابستگی‌های evidence و signoff

| موضوع | نوع وابستگی | issue/blocker |
|-------|-------------|---------------|
| external audit مشارکت | audit (#12) | `STEP9-BLOCK-001` |
| formal verification ZK/VRF | formal verification (#13) | `STEP9-BLOCK-002` |
| governance review مشارکت | human governance review | #14 |
| oracle data source (eligibility) | oracle ops evidence | #15، #16 |
| public participation scope | human/legal review | #19 |
| non-claim validation | non-claim review | #18 |

هیچ‌یک از این وابستگی‌ها بسته نشده‌اند. همه pending/open هستند.

---

## ۸. non-claim نهایی

این سند فقط یک pre-review ردیابی AI-assisted است. هیچ review انسانی کامل نشده، هیچ evidence پذیرفته‌شده وجود ندارد، هیچ signoff حکمرانی یا حقوقی داده نشده، هیچ blocker بسته نشده، هیچ audit تکمیل نشده، هیچ formal verification تکمیل نشده، هیچ production readiness یا release approval ادعا نمی‌شود. قرارداد، test، آستانه، timeout یا اختیار حکمرانی تغییر نکرده است. گام ۱۲ و گام ۱۳ هر دو باز هستند.

</div>
