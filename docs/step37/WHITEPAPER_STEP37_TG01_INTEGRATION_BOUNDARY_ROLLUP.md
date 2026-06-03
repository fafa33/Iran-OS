<div dir="rtl">

# رول‌آپ مرز یکپارچگی TG-01 — گام ۳۷

**نوع سند:** documentation-only / integration boundary rollup  
**وضعیت:** باز؛ این سند TG-01 را بسته یا حل‌شده اعلام نمی‌کند.  
**تاریخ:** ۲۵۸۵ شاهنشاهی / ۲۰۲۶ میلادی  
**هد اصلی:** `52bf1f2`  
**تعداد تست‌ها:** ۴۸۸ passing

## non-claim

این سند هیچ‌کدام از موارد زیر را ادعا نمی‌کند:

- TG-01 حل شده یا بسته است
- production readiness
- release approval
- completed external audit
- completed formal verification
- blocker closure
- accepted evidence
- reviewer signoff
- completion of Step 12
- completion of Step 13

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

---

## ۱. نقطه بازبینی

گام ۳۶ کاتالوگ رسمی TINV/INV را کامل پوشش داد (۴۸۷ تست). گام ۳۷ به بررسی مرز یکپارچگی TG-01 می‌پردازد — نقطه‌ای که بین `TriggerProtocol` و `Treasury` وجود دارد و در طراحی فعلی به‌صورت خودکار پر نمی‌شود.

---

## ۲. معنی TG-01

**TG-01** شکاف طراحی بین دو mapping مجزا است:

| mapping | قرارداد | تنظیم‌کننده |
|---------|---------|------------|
| `blockedFromTreasury[offender]` | `TriggerProtocol` | `executeTrigger()` (فراخوانی توسط Kernel) |
| `blockedByTrigger[offender]` | `Treasury` | `blockAddressByTrigger()` (نیازمند فراخوانی جداگانه KERNEL_ROLE) |

`executeTrigger()` داخل `TriggerProtocol` به هیچ تابعی در `Treasury` دسترسی ندارد و آن را فراخوانی نمی‌کند. فعال‌سازی کامل trigger (۷ امضا → `_activateTrigger()` → `executeTrigger()`) منجر به `Treasury.isBlocked(offender) == false` می‌شود.

---

## ۳. آنچه تست یکپارچگی اثبات کرد

تست `test/08_Trigger_Protocol.test.js` (commit `52bf1f2`) موارد زیر را با اطمینان اثبات کرد:

| مرحله | عملیات | نتیجه |
|-------|---------|-------|
| A | `trigger.executeTrigger(1, attacker, 1, 0)` | `TriggerProtocol.isTreasuryBlocked(attacker) == true` |
| B | بررسی Treasury | `Treasury.isBlocked(attacker) == false` — **شکاف TG-01 تأیید شد** |
| C | `proposeTransaction(attacker, amount, lineId, ...)` | موفق — attacker (recipient) هنوز در Treasury مسدود نشده |
| D | `Treasury.blockAddressByTrigger(attacker)` | فراخوانی صریح Kernel (Option D) |
| E | بررسی Treasury پس از Option D | `Treasury.isBlocked(attacker) == true` |
| F | `proposeTransaction(attacker, ...)` | revert: `"Treasury: address blocked by Trigger Protocol"` |
| G | بررسی `txCount` | بدون تغییر — state-neutral |

**نکته مهم درباره modifier `notBlocked`:** این modifier روی `recipient` (نه `msg.sender`) اعمال می‌شود. شکاف TG-01 به این معنی است که attacker می‌تواند وجوه Treasury را دریافت کند تا زمانی که `blockAddressByTrigger` صریحاً فراخوانی شود.

---

## ۴. شکاف طراحی فعلی

```
[Kernel] → _activateTrigger() → executeTrigger(TriggerProtocol)
                                       ↓
                        TriggerProtocol.blockedFromTreasury[offender] = true
                                       ↓
                        Treasury.blockedByTrigger[offender] = ???  ← پر نمی‌شود
```

`executeTrigger` به `Treasury` دسترسی ندارد و هیچ فراخوانی cross-contract به `Treasury.blockAddressByTrigger()` وجود ندارد. Kernel نیز هیچ تابع passthrough برای فراخوانی `Treasury.blockAddressByTrigger()` ندارد.

این یک شکاف معماری است که در گام‌های قبل به‌عنوان **Option D** مستند شده: حکمرانی انسانی پس از trigger فعال‌سازی.

---

## ۵. مسیر Option D اثبات‌شده (EOA-as-kernel)

در سناریوی تست (kernel = EOA سینگر):

```
kernel EOA → Treasury.blockAddressByTrigger(offender)
```

این مسیر کار می‌کند زیرا EOA دارای `KERNEL_ROLE` روی Treasury است (از constructor). یک admin انسانی با دسترسی به kernel پس از فعال‌سازی trigger می‌تواند این فراخوانی را انجام دهد.

---

## ۶. محدودیت — تنظیم IranOS_Kernel کامل

در تنظیم production واقعی (قرارداد `IranOS_Kernel` به‌عنوان `_kernel` Treasury):

- **قرارداد Kernel** دارای `KERNEL_ROLE` روی Treasury است — نه EOA
- **Kernel هیچ تابع passthrough** برای فراخوانی `Treasury.blockAddressByTrigger()` ندارد
- برای پر کردن شکاف TG-01 به‌طور خودکار، یکی از گزینه‌های زیر لازم است:
  - **تغییر قرارداد** (غیرمجاز): افزودن فراخوانی `Treasury.blockAddressByTrigger()` به `executeTrigger()` یا `_activateTrigger()`
  - **تابع passthrough در Kernel** (غیرمجاز): تابعی که به Sovereign/Court اجازه دهد `Treasury.blockAddressByTrigger()` را از طریق Kernel فراخوانی کند
  - **Option D** (مجاز): Sovereign/admin که `DEFAULT_ADMIN_ROLE` روی Treasury دارد، مستقیماً `grantRole(KERNEL_ROLE, someAddress)` را فراخوانی کند تا یک EOA با KERNEL_ROLE مجاز بتواند عمل کند

**هیچ تغییر قراردادی در گام ۳۷ مجاز نیست.**

---

## ۷. خلاصه تست‌ها

| نقطه | تعداد تست |
|------|-----------|
| شروع گام ۳۷ | ۴۸۷ |
| پس از تست TG-01 Integration | **۴۸۸** |

**commit مرتبط:** `52bf1f2` — `test(integration): document TG-01 gap and Option D remedy`

---

## ۸. تغییرات انجام‌شده در گام ۳۷

| نوع | توضیح |
|-----|-------|
| تست | یک تست یکپارچگی در `test/08_Trigger_Protocol.test.js` (+59 خط) |
| قرارداد | بدون تغییر |
| دکترین | بدون تغییر |
| ثوابت/آستانه‌ها | بدون تغییر |
| authority | بدون تغییر |

---

## ۹. وضعیت Step 12 و Step 13

**Step 12 باز می‌ماند.** این سند Step 12 را نمی‌بندد.

**Step 13 باز می‌ماند.** رجیستر شکاف‌های Step 13 در `docs/step13/WHITEPAPER_STEP13_GAP_REGISTER_FA.md` همچنان pending/needs-review است. این سند Step 13 را نمی‌بندد.

---

## ۱۰. مرحله بعدی پیشنهادی

با تکمیل TG-01 به‌عنوان یک واقعیت طراحی مستند، سه مسیر ممکن برای Step 38 وجود دارد:

1. **DG-01 integration test:** مشابه TG-01، اثبات اینکه `executeTrigger()` `SWF.COUNCIL_ROLE` را باز نمی‌گیرد (قبلاً به‌عنوان واقعیت طراحی در آزمون `trigger activation revokes offender kernel role and preserves SWF COUNCIL_ROLE` تأیید شده — سطح پوشش بالاتر است).

2. **بررسی cross-contract CLC-02/03:** از ماتریس اینوریانت Step 5 — مسیرهای cross-contract ناموفق نباید state remote را تغییر دهند. جزئیات در `docs/STEP5_2_EXECUTABLE_INVARIANT_MATRIX.md`.

3. **مرحله مستندسازی:** تهیه سند معماری یکپارچگی cross-contract که TG-01، DG-01، و Option D را در یک مرجع واحد جمع‌بندی کند.

**توصیه:** گزینه ۲ (CLC-02 cross-contract state neutrality) — به‌دلیل اهمیت بالا در ماتریس Step 5 و پوشش نداشتن آن در تست‌های فعلی.

</div>
