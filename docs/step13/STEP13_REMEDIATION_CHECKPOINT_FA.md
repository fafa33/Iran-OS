<div dir="rtl">

# چک‌پوینت رفع شکاف‌های Step 13
## Step 13 Remediation Checkpoint

**نسخه:** ۱.۰.۰  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**مرتبط با:** [Issue #35](https://github.com/fafa33/Iran-OS/issues/35)  
**منبع:** `docs/step13/STEP13_REAL_GAP_DISPOSITION_FA.md`

---

> **⚠️ وضعیت: چک‌پوینت اطلاعاتی — Step 13 را نمی‌بندد — Step 12 را نمی‌بندد — حسابرسی، تأیید رسمی، یا آمادگی تولید نیست**

---

## فهرست مطالب

1. [خلاصه وضعیت شکاف‌ها](#۱-خلاصه-وضعیت-شکافها)
2. [شکاف‌های رفع‌شده](#۲-شکافهای-رفعشده)
3. [شکاف‌های معوق](#۳-شکافهای-معوق)
4. [وضعیت آزمون](#۴-وضعیت-آزمون)
5. [باقی‌مانده‌های فنی](#۵-باقیماندههای-فنی)
6. [غیر-ادعاها](#۶-غیر-ادعاها)

---

## ۱. خلاصه وضعیت شکاف‌ها

| شناسه | عنوان | دسته | وضعیت | PR |
|--------|--------|-------|--------|-----|
| **TG-01** | مسدودسازی خودکار خزانه‌داری | Runtime | **DONE** | [#36](https://github.com/fafa33/Iran-OS/pull/36) |
| **COURT-01** | در دسترس بودن COURT_ROLE | Governance | **DONE (docs)** | [#38](https://github.com/fafa33/Iran-OS/pull/38) |
| **G-11** | مانیفست استقرار | Deployment | **DONE (docs)** | [#39](https://github.com/fafa33/Iran-OS/pull/39) |
| **G-02** | یکپارچه‌سازی Airnode RRP | Integration | **DONE (docs)** | [#40](https://github.com/fafa33/Iran-OS/pull/40) |
| **G-03** | تأییدکننده ZK روی‌زنجیر | Runtime | **Deferred** | — |
| **VS-01** | پیوند VotingSystem ↔ CitizenCard | Integration | **Deferred** | — |

---

## ۲. شکاف‌های رفع‌شده

### TG-01 — مسدودسازی خودکار خزانه‌داری

**نوع رفع:** پیاده‌سازی کد  
**PR:** [#36](https://github.com/fafa33/Iran-OS/pull/36) — commit `48f5ffa`  
**آزمون‌ها:** ۴۹۹/۴۹۹ passing

**خلاصه:**  
`TriggerProtocol.executeTrigger()` اکنون `Treasury.blockAddressByTrigger(offender)` را از طریق رابط `ITreasury` در همان تراکنش فراخوانی می‌کند. الزام "خودکار" منشور (فرگرد ۱۳، بند ۸۱) برآورده شده است.

**تغییرات:**
- رابط `ITreasury` به `TriggerProtocol.sol` اضافه شد
- فراخوانی `blockAddressByTrigger()` فقط در مسیر terminal trigger (≥۷ امضا)
- oracle-only و pre-terminal خزانه‌داری را مسدود نمی‌کنند

**الزام استقرار:** پس از deploy، `KERNEL_ROLE` روی Treasury باید به `TriggerProtocol` اعطا شود. بدون این grant، `executeTrigger()` revert خواهد کرد.

---

### COURT-01 — در دسترس بودن COURT_ROLE

**نوع رفع:** مستندسازی  
**PR:** [#38](https://github.com/fafa33/Iran-OS/pull/38)  
**سند:** `docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md`

**خلاصه:**  
الزام ۹ عضو `COURT_ROLE` پیش از mainnet مستند شد. محدودیت بحرانی `notLocked` توضیح داده شد: اگر تخلف TR-01/02/03 پیش از ثبت ۹ عضو رخ دهد، مسیر ماشه برای همیشه مسدود می‌شود.

**ترتیب اجباری استقرار:**
1. تکمیل دادگاه (۹ عضو `COURT_ROLE`)
2. فراخوانی `setTriggerProtocol()`
3. اعطای `ORACLE_ROLE` (آخرین مرحله)

---

### G-11 — مانیفست استقرار

**نوع رفع:** مستندسازی  
**PR:** [#39](https://github.com/fafa33/Iran-OS/pull/39)  
**سند:** `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`

**خلاصه:**  
نقشه وابستگی سازنده‌ها (Layer 0/1/2/3)، ترتیب اجباری استقرار ۱۶ قرارداد، ترتیب سیم‌کشی نقش‌ها (گروه‌های A تا E)، و چک‌لیست‌های پیش/حین/پس از استقرار مستند شدند.

**باقی‌مانده فنی G-11:** اسکریپت‌های `deploy/` هنوز ایجاد نشده‌اند — این مرحله بعدی G-11 است (کد، نه docs).

---

### G-02 — یکپارچه‌سازی Airnode RRP

**نوع رفع:** مستندسازی  
**PR:** [#40](https://github.com/fafa33/Iran-OS/pull/40)  
**سند:** `docs/oracle/AIRNODE_INTEGRATION_PROTOCOL.md`

**خلاصه:**  
پروتکل یکپارچه‌سازی Airnode شامل: ارزیابی وضعیت فعلی `API3Oracle.sol`، الزامات config.json و OIS، حداقل ۲ feeder مستقل برای `PAH_USD_KEY` (بازه ۳۰ دقیقه)، SLA عملیات oracle، staleness runbook، و توالی استقرار.

---

## ۳. شکاف‌های معوق

### G-03 — تأییدکننده ZK روی‌زنجیر

**دلیل تعویق:**  
تأیید ZK کامل (Groth16/Plonk) نیاز به زیرساخت Circom/SnarkJS دارد. این پیچیدگی مناسب مرحله‌ای جدا است.

**وضعیت فعلی:**  
`JurySelection.sol` فقط `zkProof.length > 0` بررسی می‌کند. هیچ verifier روی‌زنجیر وجود ندارد. این محدودیت در مستندات صریح است.

**اقدام بعدی:** ایجاد issue با برچسب `core` — پس از تعریف زیرساخت ZK

---

### VS-01 — پیوند VotingSystem ↔ CitizenCard

**دلیل تعویق:**  
سیستم رأی‌گیری جزء لایه ۵ (نهادی) و لایه ۷ (مجلس مؤسسان) است. پیش از نهایی شدن پروتکل انتخابات، پیاده‌سازی زودهنگام خطرناک است.

**وضعیت فعلی (اصلاحیه):**  
`CitizenCard.sol` هویت شهروندی دارد و `VotingSystem.sol` نیز موجود است (`contracts/governance/VotingSystem.sol`؛ آزمون: `test/18_Voting_System.test.js`). شکاف باز VS-01 فقط یکپارچه‌سازی VotingSystem ↔ CitizenCard (رجیستری رأی‌دهنده) و تعریف‌نشدن ElectionProtocol است.

**اقدام بعدی:** پس از تعریف ElectionProtocol — یکپارچه‌سازی با CitizenCard

---

## ۴. وضعیت آزمون

| نقطه زمانی | تعداد آزمون | وضعیت |
|------------|------------|--------|
| پیش از TG-01 (Step 35) | ۴۸۷ | passing |
| پس از TG-01 (PR #36) | ۴۹۹ | passing |
| پس از COURT-01 (PR #38) | ۴۹۹ | passing |
| پس از G-11 (PR #39) | ۴۹۹ | passing |
| پس از G-02 (PR #40) | ۴۹۹ | passing |
| پس از اصلاح تاریخ (PR #41) | ۴۹۹ | passing |

هیچ آزمون جدیدی در PRهای docs-only اضافه نشد. آزمون‌های موجود بدون تغییر باقی ماندند.

---

## ۵. باقی‌مانده‌های فنی

موارد زیر خارج از محدوده Step 13 هستند و در مراحل بعدی باید رسیدگی شوند:

| آیتم | نوع | مرحله پیشنهادی |
|------|-----|----------------|
| اسکریپت‌های `deploy/01_kernel.js` تا `deploy/08_verify.js` | کد | پیش از testnet |
| ZK verifier روی‌زنجیر (G-03) | کد | مرحله جداگانه |
| یکپارچه‌سازی VotingSystem ↔ CitizenCard (VS-01) | کد | پس از ElectionProtocol |
| اعطای `KERNEL_ROLE` روی Treasury به TriggerProtocol | استقرار | پیش از mainnet |
| ثبت ۹ عضو `COURT_ROLE` | استقرار | پیش از mainnet |
| تأمین منابع Airnode و feeder registry | عملیات | پیش از mainnet |

---

## ۶. غیر-ادعاها

- این سند Step 13 را نمی‌بندد
- این سند Step 12 را نمی‌بندد
- این چک‌پوینت حسابرسی رسمی نیست
- هیچ تأیید خارجی کدی انجام نشده است
- آمادگی تولید ادعا نمی‌شود
- اسکریپت‌های deploy وجود ندارند
- Airnode در محیط واقعی deploy نشده است
- feeder registry تأسیس نشده است
- ZK verifier روی‌زنجیر وجود ندارد
- یکپارچه‌سازی VotingSystem ↔ CitizenCard پیاده‌سازی نشده است؛ ElectionProtocol تعریف نشده است

---

> این سند چک‌پوینت اطلاعاتی است. هیچ شکافی بدون شواهد پذیرفته‌شده و تأیید لازم بسته نمی‌شود.  
> Step 12 یا Step 13 را نمی‌بندد | حسابرسی یا تأیید رسمی نیست

</div>
