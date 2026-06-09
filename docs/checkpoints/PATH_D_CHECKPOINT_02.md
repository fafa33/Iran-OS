<div dir="rtl">

# ایست‌گاه مسیر D — شماره ۲

**نسخه:** 1.0
**تاریخ:** ۱۴۰۵-۰۳-۱۹

---

## وضعیت مخزن

| مورد | مقدار |
|---|---|
| HEAD | `5f028c1` |
| شاخه | `main` |
| Origin | synced |
| Worktree | clean |
| تعداد تست‌های موفق | 553 |

---

## ماژول‌های بسته‌شده در مسیر D

| ماژول | وضعیت |
|---|---|
| ConstitutionGuard | ✅ بسته |
| CitizenCard | ✅ بسته |
| BaseIncome | ✅ بسته |
| HealthCoverage | ✅ بسته |
| DisabilitySupport | ✅ بسته |
| VictimFund | ✅ بسته |
| SovereignCrawler | ✅ بسته |

---

## گاردهای بسته‌شده

### HealthCoverage

| گارد | تابع |
|---|---|
| `not active` | `useHealthCredit` |
| `not active` | `renewAnnualCredit` |
| `too early` | `renewAnnualCredit` |

### DisabilitySupport

| گارد | تابع |
|---|---|
| `invalid address` | `registerDisabledCitizen` |
| `not registered` | `payMonthlyStipend` |
| `not registered` | `updateDisabilityLevel` |
| `not registered` | `issueAccessibilityCard` |

### VictimFund

| گارد | تابع |
|---|---|
| `invalid victim` | `registerVictim` |
| `not active` | `payCompensation` |
| `compensated` | `payCompensation` |
| `zero amount` | `payCompensation` |

### SovereignCrawler

| گارد | تابع |
|---|---|
| `invalid address` | `identifyTarget` |
| `confirmed` | `identifyTarget` |
| `not found` | `freezeTarget` |
| `wrong status` | `freezeTarget` |
| `too early` | `freezeTarget` |
| `not frozen` | `confirmByCouncil` |
| `not confirmed` | `transferToSWF` |
| `transferred` | `releaseTarget` |

---

## موارد بدون تغییر

- Doctrine
- قراردادها (Contracts)
- Kernel
- Treasury
- SWF
- آستانه‌های چندامضایی
- مدل ذخیره (Reserve model)
- مدل اختیار (Authority model)

---

## وضعیت کلی

- مسیر D فعال
- SovereignCrawler بسته‌شد
- بدون تغییر در قراردادها
- پیشرفت تست‌محور
- منشور بدون تغییر
- آستانه‌ها بدون تغییر

---

## گام بعدی

ارزیابی کوچک‌ترین ماژول پوشش‌نیافته باقی‌مانده در مسیر D.

</div>
