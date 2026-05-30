<div dir="rtl">

# بازبینی ردیابی workstream ۱: اصول بنیادین و منشور

**نام فنی:** Step 13 WS-1 Foundational Principles Traceability Review
**نوع سند:** documentation-only / traceability review
**workstream:** اصول بنیادین و منشور
**وضعیت:** باز — این سند گام ۱۳ یا گام ۱۲ را نمی‌بندد.
**پایه مخزن:** main — commit `66e8cdf` — 499 test passing

---

## ۱. هدف

این سند ردیابی تفصیلی اصول بنیادین سپیدنامه/منشور ایران‌اواس را به سطوح قرارداد، حفاظ runtime، پوشش test، و وضعیت evidence در repo ارائه می‌دهد.

این سند:
- گام ۱۳ را نمی‌بندد.
- گام ۱۲ را نمی‌بندد.
- هیچ blocker را نمی‌بندد.
- هیچ evidence را accepted علامت نمی‌زند.
- هیچ reviewer signoff ادعا نمی‌کند.
- هیچ قرارداد، test، threshold، timeout یا مکانیزم حاکمیتی را تغییر نمی‌دهد.
- `Fargard7PolicyAdapter` همچنان proposal-only/non-executing است.
- سیگنال‌های اوراکل همچنان non-sovereign و signal-only هستند.

---

## ۲. راهنمای وضعیت ردیابی

| برچسب | معنی |
| --- | --- |
| COMPLETE | اصل، قرارداد، حفاظ runtime، test، و مستندات همگی در repo موجود و به‌هم وصل‌اند. Evidence accepted نیست — فقط داخل repo کامل است. |
| PARTIAL | بخشی از زنجیره موجود است؛ حداقل یک حلقه (قرارداد، runtime guard، test، یا مستند) ناقص یا ثبت‌نشده است. |
| GAP | یک حلقه اصلی در زنجیره ردیابی وجود ندارد یا صراحتاً مستند نشده است. |

---

## ۳. جدول ردیابی تفصیلی اصول بنیادین

---

### TR-01 — پادشاهی مشروطه سکولار

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-01 — پادشاهی مشروطه سکولار |
| منبع منشور | `constitution/constitution-fa.md` — اصل مشروطه سکولار؛ `whitepaper/whitepaper-fa.md` — فصل اول |
| دکترین مرتبط | TRIGGER_TIMEOUT = 72h به‌عنوان SLA رسیدگی دادگاه (Step42 doctrine) — نه auto-lock یا auto-execute |
| قرارداد/ماژول | `contracts/kernel.sol:43` — `TR_CONSTITUTIONAL_MONARCHY = 1`؛ `contracts/core/TriggerProtocol.sol`؛ `contracts/core/ConstitutionGuard.sol` |
| حفاظ runtime | `kernel.sol:276-281` — TR-01 باعث `emergencyLockActive = true` می‌شود؛ `kernel.sol:184` — `notLocked` بر `grantOfficialAccess`، `setTriggerProtocol`، `setSovereignWealthFund` (CLC-06) |
| پوشش test | `test/01_kernel.test.js` — آزمون‌های flagViolation TR-01، emergencyLock، CLC-06؛ `test/08_Trigger_Protocol.test.js` — اجرای TriggerProtocol |
| evidence موجود | داخل repo: constants و testها موجودند. Evidence accepted از مسیر issue #12/#13: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | نگاشت بند‌به‌بند منشور به هر constant/guard؛ formal verification target برای تغییرناپذیری TR-01؛ evidence پذیرفته‌شده از #12/#13 |
| گام بعدی پیشنهادی | PR کوچک برای نگاشت بند منشور → `kernel.sol:43` → test coverage؛ ثبت formal verification target در issue #13 |

---

### TR-02 — سکولاریسم ساختاری

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-02 — سکولاریسم ساختاری |
| منبع منشور | `constitution/constitution-fa.md` — جدایی دین از حکومت؛ `whitepaper/whitepaper-fa.md` |
| دکترین مرتبط | Step42 — TRIGGER_TIMEOUT به‌عنوان SLA رسیدگی دادگاه |
| قرارداد/ماژول | `contracts/kernel.sol:44` — `TR_SECULARISM = 2`؛ `contracts/core/ConstitutionGuard.sol`؛ `contracts/governance/BudgetAllocation.sol` (ردیف بودجه مذهبی) |
| حفاظ runtime | `kernel.sol:276-281` — TR-02 باعث `emergencyLockActive = true` می‌شود؛ `notLocked` بر setterهای اختیار (CLC-06) |
| پوشش test | `test/01_kernel.test.js` — flagViolation TR-02؛ `test/04_constitution_guard.test.js`؛ `test/17_Budget_Allocation.test.js` — پوشش جزئی |
| evidence موجود | داخل repo: constants و testها موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | نگاشت مسیرهای غیرقراردادی سکولاریسم (اداری، اجرایی، بودجه)؛ formal verification target برای BudgetAllocation secularism guard |
| گام بعدی پیشنهادی | تفکیک پوشش مستند از شکاف اجرایی در BudgetAllocation؛ ارجاع به workstream ساختار حکمرانی برای مسیرهای غیرقراردادی |

---

### TR-03 — یکپارچگی سرزمینی

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-03 — یکپارچگی سرزمینی |
| منبع منشور | `constitution/constitution-fa.md` — اصول تمامیت ارضی |
| دکترین مرتبط | Step42 — TRIGGER_TIMEOUT SLA |
| قرارداد/ماژول | `contracts/kernel.sol:45` — `TR_TERRITORIAL_INTEGRITY = 3`؛ `contracts/core/TriggerProtocol.sol` |
| حفاظ runtime | `kernel.sol:276-281` — TR-03 باعث `emergencyLockActive = true` می‌شود؛ `notLocked` بر setterهای اختیار (CLC-06) |
| پوشش test | `test/01_kernel.test.js` — flagViolation TR-03، emergencyLock |
| evidence موجود | داخل repo: constant و test موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | هیچ تعریف قراردادی از «یکپارچگی سرزمینی» در سطح on-chain وجود ندارد (تعریف اجرایی این اصل خارج از blockchain است)؛ formal verification target |
| گام بعدی پیشنهادی | ثبت صریح محدوده on-chain/off-chain این اصل؛ ارجاع به workstream حکمرانی برای مسیرهای اجرایی غیرقراردادی |

---

### TR-04 — حقوق بنیادین ملت

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-04 — حقوق بنیادین ملت |
| منبع منشور | `constitution/constitution-fa.md` — فصل حقوق بنیادین |
| دکترین مرتبط | Step42 — TRIGGER_TIMEOUT SLA؛ TR-04 **قفل اضطراری فعال نمی‌کند** (فقط TR-01/02/03 فعال می‌کنند) |
| قرارداد/ماژول | `contracts/kernel.sol:46` — `TR_FUNDAMENTAL_RIGHTS = 4`؛ `contracts/core/TriggerProtocol.sol`؛ `contracts/welfare/`؛ `contracts/justice/` |
| حفاظ runtime | TR-04 در flagViolation ثبت می‌شود اما `emergencyLockActive` فعال **نمی‌کند**؛ اجرا نیازمند 7-of-9 multi-sig است |
| پوشش test | `test/01_kernel.test.js` — flagViolation TR-04، تأیید عدم قفل اضطراری؛ `test/08_Trigger_Protocol.test.js`؛ `test/09_api3_oracle.test.js` — مسیر کامل از feeder تا TriggerProtocol برای TR-04 |
| evidence موجود | داخل repo: constants، testها و مسیر کامل اجرا موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | نگاشت بند‌به‌بند حقوق بنیادین (آزادی بیان، آزادی تجمع، …) به module/test مشخص؛ TG-01 gap (TriggerProtocol نمی‌تواند بلوک خزانه را از طریق Treasury فعال کند) |
| گام بعدی پیشنهادی | استخراج فهرست حقوق بنیادین از منشور و نگاشت هر حق به module/test؛ ثبت TG-01 به‌عنوان شکاف اجرایی در issue #12 |

---

### TR-05 — استقلال صندوق ثروت ملی

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-05 — استقلال صندوق ثروت ملی |
| منبع منشور | `constitution/constitution-fa.md`؛ `whitepaper/whitepaper-fa.md` — فصل اقتصاد و صندوق |
| دکترین مرتبط | MULTISIG_THRESHOLD = 7؛ COUNCIL_ROLE multi-sig 3-of-N در SWF |
| قرارداد/ماژول | `contracts/kernel.sol:47` — `TR_SWF_INDEPENDENCE = 5`؛ `contracts/monetary/SovereignWealthFund.sol` — MULTISIG_REQUIRED = 3 |
| حفاظ runtime | SWF withdrawal نیازمند ≥3 COUNCIL_ROLE signature؛ flagViolation TR-05 در kernel موجود؛ `notLocked` بر `setSovereignWealthFund()` (CLC-06) |
| پوشش test | `test/01_kernel.test.js` — TR-05 flagViolation؛ `test/03_sovereign_wealth_fund.test.js` — multi-sig withdrawal guards |
| evidence موجود | داخل repo: constants، SWF multi-sig، testها موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | CLC-04 — RECLAIM_ROLE روی AssetFreeze در deployment هنوز manual است (ROLE_WIRING_CHECKLIST.md)؛ formal verification target برای SWF independence invariant |
| گام بعدی پیشنهادی | اتصال CLC-04 deployment checklist به این ردیابی؛ ثبت formal verification target در issue #13 |

---

### TR-06 — سقف نقدینگی

| محور | جزئیات |
| --- | --- |
| نام اصل | TR-06 — سقف نقدینگی (Liquidity Cap) |
| منبع منشور | `constitution/constitution-fa.md`؛ `whitepaper/whitepaper-fa.md` — فصل پول ملی |
| دکترین مرتبط | LIQUIDITY_CAP = 900,000,000,000 × 1e18 PAH؛ MIN_RESERVE_RATIO = 333 (33.3%) — هر دو immutable |
| قرارداد/ماژول | `contracts/kernel.sol:54-55` — LIQUIDITY_CAP، MIN_RESERVE_RATIO؛ `contracts/monetary/PahlaviToken.so` — mint gate |
| حفاظ runtime | PahlaviToken mint gate بر اساس reserve ratio؛ Kernel constants غیرقابل تغییر در constructor |
| پوشش test | `test/02_pahlavi_token.test.js` — mint gate و reserve ratio؛ `test/03_sovereign_wealth_fund.test.js`؛ `test/01_kernel.test.js:41` — تأیید LIQUIDITY_CAP و MIN_RESERVE_RATIO |
| evidence موجود | داخل repo: constants و testها موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | هیچ circuit-breaker test برای نقض سقف نقدینگی در سطح Kernel مستقیم وجود ندارد؛ formal verification invariant برای LIQUIDITY_CAP |
| گام بعدی پیشنهادی | ثبت formal verification target برای LIQUIDITY_CAP invariant در issue #13؛ ارجاع به workstream اقتصاد و منابع |

---

### حاکمیت قانون و مشروطه‌گرایی (اصل کلی)

| محور | جزئیات |
| --- | --- |
| نام اصل | حاکمیت قانون — هیچ شخص یا نهادی بالاتر از قانون نیست |
| منبع منشور | `constitution/constitution-fa.md` — اصول کلی حاکمیت قانون |
| دکترین مرتبط | Step42 — TRIGGER_TIMEOUT SLA؛ multi-sig 7-of-9؛ SOVEREIGN_ROLE آربیتر ملی نه مطلق‌العنان |
| قرارداد/ماژول | `contracts/kernel.sol` — role-based access؛ `contracts/core/ConstitutionGuard.sol` — law proposal/approval |
| حفاظ runtime | AccessControl role boundaries؛ `notLocked` modifier (CLC-06)؛ `onlySovereign`/`onlyCourt`/`onlyOracle` modifiers |
| پوشش test | `test/01_kernel.test.js`؛ `test/04_constitution_guard.test.js` |
| evidence موجود | داخل repo: role guards و testها. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | نگاشت دقیق هر اختیار SOVEREIGN_ROLE به منبع منشور؛ formal verification target برای absence of admin backdoor |
| گام بعدی پیشنهادی | تکمیل نگاشت بند‌به‌بند منشور به Kernel/Guard؛ ثبت formal verification target |

---

### شفافیت و قابلیت ممیزی

| محور | جزئیات |
| --- | --- |
| نام اصل | شفافیت و قابلیت ممیزی — هر اقدام سیستمی باید قابل ردیابی و audit باشد |
| منبع منشور | `constitution/constitution-fa.md`؛ `whitepaper/whitepaper-fa.md` |
| دکترین مرتبط | Step40/41 — CLC-03 oracle staleness guard؛ Step42 — TRIGGER_TIMEOUT doctrine |
| قرارداد/ماژول | `contracts/kernel.sol` — رویدادهای ViolationFlagged، TriggerActivated، AccessGranted، AccessRevoked؛ `contracts/oracles/API3Oracle.sol` — ViolationFlagged، DataUpdated |
| حفاظ runtime | همه رویدادهای حیاتی on-chain emit می‌شوند؛ API3Oracle MAX_DATA_AGE = 1h (CLC-03) |
| پوشش test | `test/01_kernel.test.js` — emit events؛ `test/09_api3_oracle.test.js` — CLC-03 staleness guard |
| evidence موجود | داخل repo: event emissions، CLC-03 tests موجودند. Evidence accepted از audit: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | چک‌لیست تأیید completeness رویدادهای on-chain؛ external audit evidence از مسیر issue #12 |
| گام بعدی پیشنهادی | ساخت چک‌لیست completeness event emissions؛ ارجاع به issue #12 برای external audit |

---

### عدم تمرکز و کنترل‌پذیری قدرت

| محور | جزئیات |
| --- | --- |
| نام اصل | عدم تمرکز — هیچ نهاد منفردی کنترل کامل سیستم را نداشته باشد |
| منبع منشور | `constitution/constitution-fa.md` — تفکیک قوا و محدودیت اختیار |
| دکترین مرتبط | MULTISIG_THRESHOLD = 7-of-9 (غیرقابل کاهش)؛ CLC-06 — notLocked بر authority setters |
| قرارداد/ماژول | `contracts/kernel.sol` — role separation؛ `contracts/monetary/SovereignWealthFund.sol` — COUNCIL_ROLE 3-of-N؛ `contracts/core/TriggerProtocol.sol` |
| حفاظ runtime | `notLocked` modifier (CLC-06) — setterهای اختیار در emergency lock قابل فراخوانی نیستند؛ 7-of-9 multi-sig برای trigger؛ 3-of-N برای SWF withdrawal |
| پوشش test | `test/01_kernel.test.js` — CLC-06 emergency lock؛ `test/03_sovereign_wealth_fund.test.js` — multi-sig؛ `test/08_Trigger_Protocol.test.js` |
| evidence موجود | داخل repo: CLC-06 remediated و tested. Evidence accepted از custody: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | custody deployment evidence (issue #14)؛ production signer registry؛ governance signoff (issue #19) |
| گام بعدی پیشنهادی | اتصال custody gap به issue #14؛ ارجاع به workstream ساختار حکمرانی |

---

### TRIGGER_TIMEOUT — SLA رسیدگی دادگاه

| محور | جزئیات |
| --- | --- |
| نام اصل | TRIGGER_TIMEOUT = 72h — بازه اجباری رسیدگی دادگاه (نه auto-lock/auto-execute) |
| منبع منشور | `constitution/constitution-fa.md` — حق دادرسی عادلانه؛ `whitepaper/whitepaper-fa.md` |
| دکترین مرتبط | `docs/step42/WHITEPAPER_STEP42_TRIGGER_TIMEOUT_DOCTRINE_DECISION.md` — صریحاً SLA حکمرانی |
| قرارداد/ماژول | `contracts/kernel.sol:57` — `TRIGGER_TIMEOUT = 72 hours` — immutable constant |
| حفاظ runtime | هیچ call-site اجرایی برای TRIGGER_TIMEOUT در kernel وجود ندارد — این طراحی عمدی است. timeout فقط SLA مستندسازی است. |
| پوشش test | `test/01_kernel.test.js` — تأیید مقدار 72×3600 ثانیه؛ `test/01_kernel.test.js:258-302` — تأیید اینکه timeout هیچ auto-action ایجاد نمی‌کند |
| evidence موجود | داخل repo: doctrine document و tests. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **PARTIAL** |
| artifact ناموجود | هیچ on-chain enforcement برای SLA وجود ندارد — عمدی؛ mندار رسیدگی انسانی off-chain ثبت نشده |
| گام بعدی پیشنهادی | ثبت صریح این که off-chain SLA monitoring در phase deployment (گام ۱۵+) نیازمند off-chain tooling است |

---

### CLC-06 — اعمال notLocked بر setterهای اختیار

| محور | جزئیات |
| --- | --- |
| نام اصل | عدم تغییر ساختار اختیار در وضعیت emergency |
| منبع منشور | `constitution/constitution-fa.md` — محدودیت اختیار در بحران |
| دکترین مرتبط | CLC-06 remediation — commit `f06e0be` |
| قرارداد/ماژول | `contracts/kernel.sol:184` — `notLocked` modifier؛ `kernel.sol:388`، `kernel.sol:453`، `kernel.sol:469` — سه setter |
| حفاظ runtime | `grantOfficialAccess()`، `setTriggerProtocol()`، `setSovereignWealthFund()` همگی در emergency lock غیرقابل فراخوانی‌اند |
| پوشش test | `test/01_kernel.test.js` — CLC-06 describe block — 7 test |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | evidence accepted از مسیر issue #12/#13 |
| گام بعدی پیشنهادی | حفظ وضعیت؛ ثبت در formal verification target list |

---

### TG-01 — شکاف اجرایی TriggerProtocol → Treasury

| محور | جزئیات |
| --- | --- |
| نام اصل | اجرای کامل ماشه باید بلوک خزانه را فعال کند |
| منبع منشور | `constitution/constitution-fa.md` — اجرای کامل تخلف شامل مسدودسازی منابع مالی |
| دکترین مرتبط | `docs/step38/` — TG-01 passthrough decision؛ `docs/step37/` — TG-01 boundary |
| قرارداد/ماژول | `contracts/core/TriggerProtocol.sol` — `executeTrigger()` ؛ `contracts/monetary/Treasury.sol` — `blockAddressByTrigger()` |
| حفاظ runtime | **شکاف:** `TriggerProtocol.executeTrigger()` هرگز `Treasury.blockAddressByTrigger()` را فراخوانی نمی‌کند؛ آدرس treasury ذخیره می‌شود اما استفاده نمی‌شود |
| پوشش test | این شکاف در testها مستند شده است (step37/38 reports) |
| evidence موجود | شکاف مستند است؛ Step38 تغییر را به دلیل revert-risk رد کرده است |
| وضعیت ردیابی | **GAP** |
| artifact ناموجود | هیچ مسیر خودکار از TriggerProtocol به Treasury.blockAddressByTrigger() وجود ندارد — step38 عمداً این را رد کرده |
| گام بعدی پیشنهادی | ثبت TG-01 در issue #12 به‌عنوان شکاف external audit؛ تصمیم آینده درباره مسیر اجرایی باید step جداگانه‌ای داشته باشد |

---

### CLC-03 — حفاظ staleness اوراکل

| محور | جزئیات |
| --- | --- |
| نام اصل | داده‌های اوراکل برای flagViolation باید تازه باشند |
| منبع منشور | `whitepaper/whitepaper-fa.md` — integrity داده‌های حکمرانی |
| دکترین مرتبط | `docs/step40/` — CLC-03 decision؛ `docs/step41/` — CLC-03 rollup |
| قرارداد/ماژول | `contracts/oracles/API3Oracle.sol:27` — `MAX_DATA_AGE = 1 hours`؛ `API3Oracle.sol:84` — بررسی staleness در `flagViolation()` |
| حفاظ runtime | `block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE` — revert با `"API3Oracle: stale data feed"` |
| پوشش test | `test/09_api3_oracle.test.js` — CLC-03 describe block — 3 test |
| evidence موجود | داخل repo: کامل. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | evidence accepted از مسیر issue #12/#13/#15 |
| گام بعدی پیشنهادی | حفظ وضعیت؛ ارجاع به workstream اوراکل و سیگنال‌ها برای ردیابی oracle ops |

---

### Fargard7PolicyAdapter — proposal-only / غیر اجرایی

| محور | جزئیات |
| --- | --- |
| نام اصل | adapter سیاست‌گذاری فقط recommendation/review تولید می‌کند و downstream execution ندارد |
| منبع منشور | `whitepaper/whitepaper-fa.md` — جدایی پیشنهاد از اجرا |
| دکترین مرتبط | Step7/8 boundary doctrine |
| قرارداد/ماژول | `contracts/governance/Fargard7PolicyAdapter.sol` |
| حفاظ runtime | هیچ state mutation مستقیم از adapter؛ proposal path فقط recommendation emit می‌کند |
| پوشش test | `test/26_Step7_PolicyLayer.test.js` — non-execution در همه مسیرها |
| evidence موجود | داخل repo: testها موجودند. Evidence accepted: **ندارد** |
| وضعیت ردیابی | **COMPLETE** (داخل repo) |
| artifact ناموجود | formal verification target برای absence of downstream execution |
| گام بعدی پیشنهادی | حفظ وضعیت؛ ثبت formal verification target در workstream قراردادها/adapterها |

---

## ۴. خلاصه وضعیت ردیابی workstream ۱

| اصل | وضعیت |
| --- | --- |
| TR-01 — پادشاهی مشروطه سکولار | PARTIAL |
| TR-02 — سکولاریسم ساختاری | PARTIAL |
| TR-03 — یکپارچگی سرزمینی | PARTIAL |
| TR-04 — حقوق بنیادین ملت | PARTIAL |
| TR-05 — استقلال صندوق ثروت ملی | PARTIAL |
| TR-06 — سقف نقدینگی | PARTIAL |
| حاکمیت قانون و مشروطه‌گرایی | PARTIAL |
| شفافیت و قابلیت ممیزی | PARTIAL |
| عدم تمرکز و کنترل‌پذیری قدرت | PARTIAL |
| TRIGGER_TIMEOUT — SLA رسیدگی دادگاه | PARTIAL |
| CLC-06 — notLocked بر authority setters | COMPLETE (داخل repo) |
| TG-01 — شکاف TriggerProtocol → Treasury | GAP |
| CLC-03 — staleness guard اوراکل | COMPLETE (داخل repo) |
| Fargard7PolicyAdapter — proposal-only | COMPLETE (داخل repo) |

**وضعیت کلی workstream ۱:**
- COMPLETE (داخل repo): 3
- PARTIAL: 10
- GAP: 1

**مهم‌ترین شکاف:** TG-01 — هیچ مسیر خودکاری از TriggerProtocol به Treasury.blockAddressByTrigger() وجود ندارد. این شکاف در step37/38 مستند و عمداً به تعویق افتاده است.

---

## ۵. artifact‌های ناموجود که باید اولویت‌بندی شوند

| اولویت | artifact | مرتبط با |
| --- | --- | --- |
| ۱ | نگاشت بند‌به‌بند منشور به Kernel constants/guards | TR-01 تا TR-06، حاکمیت قانون |
| ۲ | ثبت TG-01 در issue #12 برای external audit | TG-01 |
| ۳ | formal verification targets برای TR invariants | TR-01/02/05/06 + issue #13 |
| ۴ | چک‌لیست completeness رویدادهای on-chain | شفافیت و قابلیت ممیزی |
| ۵ | ثبت off-chain SLA monitoring در roadmap | TRIGGER_TIMEOUT |

---

## ۶. محدودیت‌های این بازبینی

این بازبینی:
- بر پایه repo در commit `66e8cdf` است.
- هیچ evidence بیرونی را evaluated نکرده است.
- جایگزین review فنی مستقل، legal review، یا formal verification نیست.
- وضعیت COMPLETE (داخل repo) به معنای accepted evidence، audit completion یا formal verification completion **نیست**.

---

## ۷. non-claim نهایی

این سند فقط بازبینی ردیابی داخلی repo است. هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion یا formal verification completion ادعا نشده است. گام ۱۲ و گام ۱۳ همچنان باز هستند.

</div>
