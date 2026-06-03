<div dir="rtl">

# پروتکل تعیین COURT_ROLE — استقرار IranOS

**نسخه:** ۱.۰.۰  
**تاریخ:** ۲۵۸۵ شاهنشاهی / ۲۰۲۶ میلادی  
**شناسه شکاف:** COURT-01  
**نوع:** مستندات استقرار — بدون تغییر قرارداد  
**وضعیت:** الزام فعال پیش از استقرار mainnet

---

> **⚠️ این سند الزامی استقراری است، نه توصیه‌ای.**  
> بدون اجرای کامل این پروتکل، مسیر اجرای ماشه (۷ از ۹ امضا) برای همیشه در دسترس نخواهد بود.  
> **[Step 12 یا Step 13 را نمی‌بندد | آمادگی تولید اعلام نمی‌شود | حسابرسی یا تأیید رسمی نیست]**

---

## فهرست مطالب

1. [مبنای قانون اساسی](#۱-مبنای-قانون-اساسی)
2. [مبنای فنی — کرنل](#۲-مبنای-فنی--کرنل)
3. [شکاف COURT-01](#۳-شکاف-court-01)
4. [محدودیت بحرانی notLocked](#۴-محدودیت-بحرانی-notlocked)
5. [معیارهای انتخاب قضات](#۵-معیارهای-انتخاب-قضات)
6. [ترتیب اجباری استقرار](#۶-ترتیب-اجباری-استقرار)
7. [دستورالعمل ثبت آنلاین](#۷-دستورالعمل-ثبت-آنلاین)
8. [عدم تقارن غیرفعال‌سازی قفل در برابر فعال‌سازی ماشه](#۸-عدم-تقارن-غیرفعال‌سازی-قفل-در-برابر-فعال‌سازی-ماشه)
9. [از دست دادن کلید و جانشینی](#۹-از-دست-دادن-کلید-و-جانشینی)
10. [چک‌لیست تأیید پیش از استقرار](#۱۰-چکلیست-تأیید-پیش-از-استقرار)
11. [اعلام غیرادعا](#۱۱-اعلام-غیرادعا)

---

## ۱. مبنای قانون اساسی

**فرگرد ۱۷ (دادگاه قانون اساسی و دیده‌بانی):**

> «در صورت سرپیچی احتمالی نهاد پادشاهی از اصول قانون اساسی، دادگاه عالی قانون اساسی مرجع رسیدگی به شکایات است.»

> «اعضای این دادگاه باید از مستقل‌ترین حقوقدانان کشور باشند.»

**فرگرد ۸۶ (دادگاه عالی قانون اساسی):**

> «این دادگاه مرجع نهایی تفسیر قوانین است. اگر مصوبه‌ای در مجلس یا دولتی برخلاف روح این منشور باشد، دادگاه عالی موظف است آن را ابطال کند.»

**پروتکل ماشه، لایه ۲:**

> «داوران مستقل دادگاه عالی موظفند ظرف ۷۲ ساعت از دریافت Flag، صحت تخلف را بررسی و تاییدیه دیجیتال (Multi-Sig) صادر کنند. این تاییدیه نیازمند امضای حداقل **۷ از ۹ داور** است.»

---

## ۲. مبنای فنی — کرنل

```solidity
// kernel.sol
bytes32 public constant COURT_ROLE = keccak256("COURT_ROLE");
uint8   public constant MULTISIG_THRESHOLD = 7;   // حداقل ۷ از ۹ امضا

// سازنده: فقط یک آدرس دادگاه ثبت می‌شود
constructor(address _sovereign, address _court, ...) {
    _grantRole(COURT_ROLE, _court);   // ← تنها یک عضو دادگاه
}

// ثبت اعضای بیشتر: فقط از طریق Sovereign + notLocked
function grantOfficialAccess(address official, bytes32 role)
    external onlySovereign notLocked nonReentrant { ... }

// امضای تخلف: نیاز به 7 عضو مجزا
function signViolation(uint256 violationId) external onlyCourt { ... }
// → if (signaturesCount >= MULTISIG_THRESHOLD) _activateTrigger(...)

// غیرفعال‌سازی قفل اضطراری: فقط یک عضو کافی است
function deactivateEmergencyLock() external onlyCourt { ... }
```

**نتیجه:** با یک عضو دادگاه در constructor، `signViolation` هرگز به آستانه ۷ نمی‌رسد. مسیر اجرای ماشه برای همیشه بسته است.

---

## ۳. شکاف COURT-01

| جنبه | وضعیت |
|------|--------|
| تعریف `COURT_ROLE` در کرنل | ✅ موجود (`kernel.sol:35`) |
| ثبت یک عضو اولیه در constructor | ✅ موجود (`kernel.sol:217`) |
| امکان افزودن اعضای بیشتر | ✅ موجود (`grantOfficialAccess`) |
| حداقل ۹ عضو قبل از استقرار mainnet | ❌ **هیچ پیش‌نیاز یا مستندی ندارد** |
| فرآیند انتخاب و تأیید قضات | ❌ **هیچ پروتکل مدونی ندارد** |
| چک‌لیست استقرار با COURT_ROLE | ❌ **در `ROLE_WIRING_CHECKLIST.md` غایب بود** |
| پروتکل جانشینی در صورت از دست دادن کلید | ❌ **مستند نشده** |

---

## ۴. محدودیت بحرانی notLocked

**این مهم‌ترین بخش این سند است.**

```
grantOfficialAccess() ← onlySovereign + notLocked
```

وقتی یک تخلف TR-01، TR-02، یا TR-03 توسط اوراکل flagging می‌شود:

```
flagViolation(violationCode=1/2/3)
  → _activateEmergencyLock()
  → emergencyLockActive = true
```

پس از این لحظه:
- `grantOfficialAccess()` **برای همیشه revert می‌کند** (مگر با `deactivateEmergencyLock`)
- برای `deactivateEmergencyLock()` فقط یک عضو `COURT_ROLE` کافی است
- اما برای `signViolation()` باید ۷ عضو مجزا وجود داشته باشد

**سناریوی شکست بدون بازگشت:**

```
مرحله ۱: kernel deploy می‌شود با 1 عضو دادگاه
مرحله ۲: پیش از ثبت ۹ عضو، یک تخلف TR-01 flag می‌شود
مرحله ۳: emergencyLockActive = true
مرحله ۴: grantOfficialAccess() = revert (notLocked)
مرحله ۵: ماشه هرگز ≥ 7 امضا نمی‌گیرد → trigger اجرا نمی‌شود
مرحله ۶: تنها راه خروج: deactivateEmergencyLock() با عضو اولیه
          ولی همان مقام خاطی ممکن است عضو اولیه بوده باشد!
```

**الزام مطلق:** ۹ عضو دادگاه باید **پیش از** اعطای `ORACLE_ROLE` به API3Oracle و **پیش از** فراخوانی `setTriggerProtocol()` ثبت شده باشند.

---

## ۵. معیارهای انتخاب قضات

بر اساس فرگرد ۱۷ و ۸۶ منشور، هر عضو دادگاه باید:

| معیار | توضیح |
|-------|-------|
| **استقلال** | هیچ وابستگی حزبی، ایدئولوژیک، یا نهادی نداشته باشد |
| **تخصص حقوقی** | حقوقدان شناخته‌شده با سابقه فعالیت در حقوق عمومی یا قانون اساسی |
| **تنوع جغرافیایی** | نمایندگی استان‌های مختلف کشور |
| **امنیت کلید** | آدرس آنلاین باید با کیف‌پول سخت‌افزاری یا سیستم چندامضایی مستقل محافظت شود |
| **پشتیبان تأیید شده** | یک آدرس جانشین از پیش تأیید‌شده برای هر عضو تعریف شده باشد |

**توجه:** انتخاب قضات فرآیند حاکمیتی off-chain است و از دامنه این قرارداد خارج است. این سند الزامات فنی را مستند می‌کند؛ فرآیند انتخاب باید در مجمع تأسیسی (فاز ۵ نقشه راه) تعریف شود.

---

## ۶. ترتیب اجباری استقرار

```
مرحله A — استقرار پایه (هنوز فعال نیست)
──────────────────────────────────────────
1. deploy Kernel(_sovereign, court_1, placeholder_oracle, _swf)
   → COURT_ROLE برای court_1 اعطا می‌شود (عضو اول)

2. deploy TriggerProtocol(kernel, treasury, swf)
3. deploy Treasury(_kernel)
4. deploy API3Oracle(kernel)

مرحله B — تکمیل دادگاه (⚠️ پیش از هر چیز دیگر)
──────────────────────────────────────────────
5. sovereign.grantOfficialAccess(court_2, COURT_ROLE)
6. sovereign.grantOfficialAccess(court_3, COURT_ROLE)
7. sovereign.grantOfficialAccess(court_4, COURT_ROLE)
8. sovereign.grantOfficialAccess(court_5, COURT_ROLE)
9. sovereign.grantOfficialAccess(court_6, COURT_ROLE)
10. sovereign.grantOfficialAccess(court_7, COURT_ROLE)
11. sovereign.grantOfficialAccess(court_8, COURT_ROLE)
12. sovereign.grantOfficialAccess(court_9, COURT_ROLE)
    → اکنون ۹ عضو فعال داریم — آستانه ۷ قابل دسترس است

مرحله C — فعال‌سازی سیستم (فقط پس از تکمیل مرحله B)
──────────────────────────────────────────────────
13. sovereign.setTriggerProtocol(triggerProtocolAddress)
14. treasury.grantRole(KERNEL_ROLE, triggerProtocolAddress)
15. swf.grantRole(RECLAIM_ROLE, assetFreezeAddress)
16. sovereign.grantOfficialAccess(api3OracleAddress, ORACLE_ROLE)
    ← اوراکل آخرین چیزی است که فعال می‌شود
```

**هیچ تخلفی نباید پیش از اتمام مرحله B flagging شود.**

---

## ۷. دستورالعمل ثبت آنلاین

برای هر یک از ۸ عضو اضافی (عضو ۲ تا ۹)، پادشاه باید اجرا کند:

```solidity
kernel.grantOfficialAccess(
    courtMemberAddress,     // آدرس کیف‌پول سخت‌افزاری عضو دادگاه
    kernel.COURT_ROLE()     // bytes32: keccak256("COURT_ROLE")
);
```

**تأیید موفقیت:**

```solidity
kernel.hasRole(kernel.COURT_ROLE(), courtMemberAddress)
// باید true برگرداند
```

```solidity
kernel.officialAccess(courtMemberAddress)
// باید isActive = true, role = COURT_ROLE باشد
```

---

## ۸. عدم تقارن غیرفعال‌سازی قفل در برابر فعال‌سازی ماشه

این عدم تقارن **عمدی** و طراحی‌شده است:

| عملکرد | تابع | نیاز |
|--------|------|------|
| غیرفعال‌سازی قفل اضطراری | `deactivateEmergencyLock()` | ۱ عضو `COURT_ROLE` |
| فعال‌سازی ماشه (trigger) | `signViolation()` × ۷ | ۷ عضو مجزا `COURT_ROLE` |

**منطق طراحی:**
- رفع قفل با یک امضا: تضمین می‌کند سیستم در حالت قفل گیر نکند (liveness)
- فعال‌سازی ماشه با ۷ امضا: تضمین می‌کند اجرای تنبیه بدون اجماع کافی رخ ندهد (safety)

اگر تنها عضو باقی‌مانده دادگاه همان مقام خاطی باشد، سیستم در قفل باقی می‌ماند. این نتیجه‌ای است که منشور برای چنین سناریویی پیش‌بینی کرده است.

---

## ۹. از دست دادن کلید و جانشینی

**پیش از فعال‌سازی قفل اضطراری (notLocked = true):**

```solidity
// Sovereign می‌تواند عضو جانشین را ثبت کند
kernel.grantOfficialAccess(replacementCourtAddress, kernel.COURT_ROLE())
```

**پس از فعال‌سازی قفل اضطراری:**

- `grantOfficialAccess()` revert می‌کند
- باید ابتدا `deactivateEmergencyLock()` توسط یکی از اعضای فعال فراخوانی شود
- سپس می‌توان عضو جدید ثبت کرد
- سپس می‌توان دوباره قفل را فعال کرد (از طریق flagViolation)

**الزام عملی:** پیش از mainnet، برای هر عضو دادگاه یک **آدرس جانشین از پیش تأیید‌شده** باید خارج از زنجیره مستند شده باشد تا در صورت از دست دادن کلید فعلی، قابل استفاده باشد.

---

## ۱۰. چک‌لیست تأیید پیش از استقرار

این چک‌لیست باید **پیش از اعطای ORACLE_ROLE** کامل شده باشد:

```
□ kernel.hasRole(kernel.COURT_ROLE(), court_1) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_2) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_3) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_4) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_5) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_6) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_7) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_8) → true
□ kernel.hasRole(kernel.COURT_ROLE(), court_9) → true
□ kernel.officialAccess(court_i).isActive → true  (برای همه ۹ عضو)
□ kernel.emergencyLockActive() → false  (سیستم هنوز قفل نشده)
□ آدرس جانشین هر عضو مستند و امن است
```

**این ۹ چک باید پیش از ورودی‌های ۱۳ تا ۱۶ در مرحله C ترتیب استقرار (بخش ۶) تکمیل شوند.**

---

## ۱۱. اعلام غیرادعا

این سند پروتکل استقراری است. موارد زیر ادعا نمی‌شود:

- Step 12 یا Step 13 بسته نمی‌شود
- آمادگی تولید یا mainnet اعلام نمی‌شود
- فرآیند انتخاب قضات off-chain تأیید نمی‌شود
- هیچ حسابرسی امنیتی (Slither / Mythril / Echidna) انجام نشده
- هیچ بررسی حقوقی یا حاکمیتی صورت نگرفته

</div>
