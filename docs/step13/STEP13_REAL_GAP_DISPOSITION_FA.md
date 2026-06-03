<div dir="rtl">

# بررسی تکلیف شکاف‌های واقعی — Step 13
## Real Gap Disposition Review

**نسخه:** ۱.۰.۰  
**تاریخ:** ۱۴۰۵-۰۳-۱۳  
**مرتبط با:** [Issue #35](https://github.com/fafa33/Iran-OS/issues/35)  
**منبع:** `docs/step13/WHITEPAPER_STEP13_CROSS_FARGARD_FIDELITY_REVIEW_FA.md`

---

> **⚠️ وضعیت: بررسی اطلاعاتی — هیچ شکافی را نمی‌بندد — Step 12 یا Step 13 را نمی‌بندد — حسابرسی، تأیید، یا آمادگی تولید نیست**

---

## فهرست مطالب

1. [جدول شکاف‌های واقعی](#۱-جدول-شکافهای-واقعی)
2. [تکلیف پیشنهادی هر شکاف](#۲-تکلیف-پیشنهادی-هر-شکاف)
3. [ترتیب پیشنهادی کار](#۳-ترتیب-پیشنهادی-کار)

---

## ۱. جدول شکاف‌های واقعی

| شناسه | عنوان | دسته | اقدام لازم | اولویت | مانع |
|--------|--------|-------|-----------|--------|-------|
| **TG-01** | مسدودسازی خودکار خزانه‌داری | Runtime | ~~Fix~~ **IMPLEMENTED** | ~~Critical~~ **Done** | ~~وفاداری قانون اساسی A~~ **PR #36 — commit `48f5ffa`** |
| **G-03** | تأییدکننده ZK روی‌زنجیر | Runtime | Defer | High | وفاداری قانون اساسی A |
| **G-02** | یکپارچه‌سازی Airnode RRP | Integration | External evidence | High | آمادگی تولید |
| **G-11** | مانیفست استقرار | Deployment | Document | High | آمادگی تولید + بررسی خارجی |
| **COURT-01** | در دسترس بودن COURT_ROLE | Governance | ~~Document~~ **ADDRESSED** | ~~Medium~~ **Done** | ~~آمادگی تولید~~ **`COURT_ROLE_ASSIGNMENT_PROTOCOL.md`** |
| **VS-01** | پیوند VotingSystem ↔ CitizenCard | Integration | Defer | Medium | هیچ (در این مرحله) |

---

## ۲. تکلیف پیشنهادی هر شکاف

### TG-01 — مسدودسازی خودکار خزانه‌داری
**دسته:** Runtime  
**اولویت:** ~~Critical~~ **IMPLEMENTED**  
**مانع:** ~~وفاداری قانون اساسی A (فرگرد ۱۳، بند ۸۱)~~ **برطرف‌شده**

**وضعیت — پس از ادغام PR #36 (commit `48f5ffa`):**  
`TriggerProtocol.executeTrigger()` اکنون `Treasury.blockAddressByTrigger(offender)` را از طریق رابط `ITreasury` در همان تراکنش فراخوانی می‌کند. الزام "خودکار" منشور (فرگرد ۱۳، بند ۸۱) برآورده شده است.

**خلاصه پیاده‌سازی:**
- رابط `ITreasury` به `TriggerProtocol.sol` اضافه شد
- فراخوانی `blockAddressByTrigger()` فقط در مسیر terminal trigger (≥۷ امضا)
- oracle-only و pre-terminal خزانه‌داری را مسدود نمی‌کنند
- ۴۹۹/۴۹۹ تست passing

**الزام استقرار:** پس از deploy، `KERNEL_ROLE` روی Treasury باید به `TriggerProtocol` اعطا شود. بدون این grant، `executeTrigger()` revert خواهد کرد.

**اقدام بعدی:** ندارد — پیاده‌سازی‌شده.

---

### G-03 — تأییدکننده ZK روی‌زنجیر
**دسته:** Runtime  
**اولویت:** High  
**مانع:** وفاداری قانون اساسی A (فرگرد ۴، بند ۳۹.۵)

**وضعیت:**  
`JurySelection.sol` فقط `zkProof.length > 0` بررسی می‌کند. هیچ verifier روی‌زنجیر وجود ندارد.

**تکلیف پیشنهادی:** Defer  
تأیید ZK کامل (Groth16/Plonk) نیاز به زیرساخت Circom/SnarkJS دارد. این پیچیدگی مناسب مرحله‌ای جدا است.  
اقدام فوری: مستندسازی صریح که `zkProof` در نسخه فعلی تأیید نمی‌شود.

**اقدام بعدی:** ایجاد issue با برچسب `core` برای ZK verifier integration.

---

### G-02 — یکپارچه‌سازی Airnode RRP
**دسته:** Integration  
**اولویت:** High  
**مانع:** آمادگی تولید

**وضعیت:**  
`API3Oracle.sol` موجود است اما هیچ پیکربندی Airnode RRP، فایل `config.json`، یا اسکریپت deploy در مخزن وجود ندارد.

**تکلیف پیشنهادی:** External evidence  
پیکربندی Airnode شامل کلیدهای API3 است که نباید در مخزن عمومی باشد. مستندسازی پروتکل اتصال و الزامات محیطی کافی است.

**اقدام بعدی:** ایجاد `docs/deployment/AIRNODE_INTEGRATION_PROTOCOL.md`.

---

### G-11 — مانیفست استقرار
**دسته:** Deployment  
**اولویت:** High  
**مانع:** آمادگی تولید + بررسی خارجی

**وضعیت:**  
هیچ `hardhat.config.js`، `foundry.toml`، یا اسکریپت استقرار قابل تکرار در مخزن وجود ندارد.

**تکلیف پیشنهادی:** Document  
پیش از هر استقرار: ایجاد `hardhat.config.js` و اسکریپت‌های `deploy/` حداقلی. بدون این فایل‌ها بررسی خارجی ناقص است.

**اقدام بعدی:** ایجاد issue با برچسب `core` برای deployment manifest.

---

### COURT-01 — در دسترس بودن COURT_ROLE
**دسته:** Governance  
**اولویت:** ~~Medium~~ **ADDRESSED**  
**مانع:** ~~آمادگی تولید~~ **برطرف‌شده**

**وضعیت — پس از ایجاد پروتکل:**  
`docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md` ایجاد شد. این سند:
- الزام ۹ عضو `COURT_ROLE` پیش از mainnet را مستند کرد
- محدودیت بحرانی `notLocked` را توضیح داد (اگر TR-01/02/03 زودتر از ثبت ۹ عضو رخ دهد، مسیر ماشه برای همیشه مسدود می‌شود)
- ترتیب اجباری استقرار را تعریف کرد: تکمیل دادگاه → setTriggerProtocol → ORACLE_ROLE
- معیارهای انتخاب off-chain قضات را مستند کرد
- چک‌لیست ۹ `hasRole` برای تأیید پیش از استقرار ایجاد کرد
- `ROLE_WIRING_CHECKLIST.md` با بخش COURT-01 به‌روز شد

**اقدام بعدی:** ندارد — مستند شده.

---

### VS-01 — پیوند VotingSystem ↔ CitizenCard
**دسته:** Integration  
**اولویت:** Medium  
**مانع:** هیچ (در این مرحله)

**وضعیت:**  
`CitizenCard.sol` هویت شهروندی دارد اما هیچ `VotingSystem.sol` یا رجیستری رأی‌دهنده وجود ندارد.

**تکلیف پیشنهادی:** Defer  
سیستم رأی‌گیری جزء لایه ۵ (نهادی) و لایه ۷ (مجلس مؤسسان) است. پیش از نهایی شدن پروتکل انتخابات، پیاده‌سازی زودهنگام خطرناک است.

**اقدام بعدی:** پس از تعریف ElectionProtocol — یکپارچه‌سازی با CitizenCard.

---

## ۳. ترتیب پیشنهادی کار

### فوری (پیش از هر بررسی خارجی)

| اولویت | شکاف | اقدام | نوع | وضعیت |
|--------|-------|-------|-----|--------|
| ۱ | **G-11** مانیفست استقرار | ایجاد `hardhat.config.js` + اسکریپت deploy | Deployment | باز |
| ۲ | ~~**TG-01** مستندسازی تأخیر~~ | ~~ایجاد issue core برای step38~~ | ~~Documentation~~ | **DONE — PR #36** |
| ۳ | **G-02** پروتکل Airnode | ایجاد `AIRNODE_INTEGRATION_PROTOCOL.md` | Documentation | باز |
| ۴ | ~~**COURT-01** پروتکل تعیین قضات~~ | ~~ایجاد `COURT_ROLE_ASSIGNMENT_PROTOCOL.md`~~ | ~~Documentation~~ | **DONE** |

### مرحله بعدی (پیش از استقرار تستنت)

| اولویت | شکاف | اقدام | نوع | وضعیت |
|--------|-------|-------|-----|--------|
| ۵ | ~~**TG-01** پیاده‌سازی~~ | ~~`executeTrigger()` → `Treasury.blockAddressByTrigger()`~~ | ~~Fix~~ | **DONE — PR #36 — commit `48f5ffa`** |
| ۶ | **G-03** ZK verifier | ایجاد issue core برای ZK integration | Defer/Plan | باز |

### معوق (پس از تعریف مجلس مؤسسان)

| اولویت | شکاف | اقدام |
|--------|-------|-------|
| ۷ | **VS-01** VotingSystem | پس از نهایی شدن ElectionProtocol |

---

### خلاصه اولویت‌بندی

```
Critical → DONE:   TG-01 (PR #36 — commit 48f5ffa)
High → Document:   G-11 (فوری — باز), G-02 (فوری — باز)
High → Defer:      G-03 (مرحله بعدی — باز)
Medium → DONE:     COURT-01 (COURT_ROLE_ASSIGNMENT_PROTOCOL.md)
Medium → Defer:    VS-01 (معوق)
```

---

> این سند بررسی اطلاعاتی است. هیچ شکافی بدون شواهد پذیرفته‌شده و تأیید لازم بسته نمی‌شود.  
> Step 12 یا Step 13 را نمی‌بندد | حسابرسی یا تأیید رسمی نیست

</div>
