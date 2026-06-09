<div dir="rtl">

# ایست‌گاه مسیر D — بستن VictimFund

**نسخه:** 1.0
**تاریخ:** ۱۴۰۵-۰۳-۱۹

---

## وضعیت مخزن

| مورد | مقدار |
|---|---|
| HEAD | `52dd17a` |
| شاخه | `main` |
| Origin | synced |
| Worktree | clean |
| تعداد تست‌های موفق | 545 |

---

## ماژول‌های بسته‌شده در مسیر D

| ماژول | وضعیت |
|---|---|
| ConstitutionGuard | ✅ بسته |
| CitizenCard | ✅ بسته |
| BaseIncome | ✅ بسته |
| HealthCoverage | ✅ بسته (گام‌های ۱۱۶ تا ۱۳۴) |
| DisabilitySupport | ✅ بسته (گام‌های ۱۳۶ تا ۱۴۲) |
| VictimFund | ✅ بسته (گام‌های ۱۴۴ تا ۱۵۰) |

---

## آخرین گام تکمیل‌شده

**گام ۱۵۰** — VictimFund · گارد `zero amount` در `payCompensation`

---

## پوشش گاردهای VictimFund

| گارد | تابع | وضعیت |
|---|---|---|
| `invalid victim` | `registerVictim` | ✅ گام ۱۴۴ |
| `zero amount` | `registerVictim` | ✅ پیش‌موجود |
| `unauthorized` | `receiveFunds` | ✅ پیش‌موجود |
| `zero amount` | `receiveFunds` | ✅ پیش‌موجود |
| `not active` | `payCompensation` | ✅ گام ۱۴۶ |
| `compensated` | `payCompensation` | ✅ گام ۱۴۸ |
| `exceeds approved` | `payCompensation` | ✅ پیش‌موجود |
| `insufficient` | `payCompensation` | ✅ پیش‌موجود |
| `zero amount` | `payCompensation` | ✅ گام ۱۵۰ |
| `invalid kernel` | constructor | — غیرقابل آزمون پس از استقرار |

---

## موارد بدون تغییر

- Doctrine
- قراردادها (Contracts)
- Kernel
- Treasury
- SWF
- مدل ذخیره (Reserve model)
- مدل اختیار (Authority model)

---

## گام بعدی

**گام ۱۵۲** — ارزیابی کوچک‌ترین سطح گارد پوشش‌نیافته بعدی در مسیر D.

</div>
