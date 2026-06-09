<div dir="rtl">

# ایست‌گاه مسیر D — شماره ۳ — پیش از AssetFreeze

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

| ماژول | حوزه | وضعیت |
|---|---|---|
| ConstitutionGuard | core | ✅ بسته |
| CitizenCard | welfare | ✅ بسته |
| BaseIncome | welfare | ✅ بسته (گام‌های ۱۰۰–۱۱۴) |
| HealthCoverage | welfare | ✅ بسته (گام‌های ۱۱۶–۱۳۴) |
| DisabilitySupport | welfare | ✅ بسته (گام‌های ۱۳۶–۱۴۲) |
| VictimFund | reclaim | ✅ بسته (گام‌های ۱۴۴–۱۵۰) |
| SovereignCrawler | reclaim | ✅ بسته (گام‌های ۱۵۲–۱۶۸) |

---

## گاردهای بسته‌شده در SovereignCrawler

| گارد | تابع | گام |
|---|---|---|
| `invalid address` | `identifyTarget` | ۱۵۲ |
| `confirmed` | `identifyTarget` | ۱۵۴ |
| `not found` | `freezeTarget` | ۱۵۶ |
| `wrong status` | `freezeTarget` | ۱۵۸ |
| `too early` | `freezeTarget` | ۱۶۰ |
| `not frozen` | `confirmByCouncil` | ۱۶۲ |
| `not confirmed` | `transferToSWF` | ۱۶۴ |
| `transferred` | `releaseTarget` | ۱۶۶ |

---

## ماژول فعال بعدی

**AssetFreeze** — `contracts/reclaim/AssetFreeze.sol`
**فایل تست:** `test/06_asset_freeze.test.js`
**گام شروع:** ۱۷۰

---

## گاردهای پوشش‌نیافته در AssetFreeze (پیش از Step-170)

| گارد | تابع | وضعیت |
|---|---|---|
| `invalid kernel` | constructor | ✗ پوشش‌نیافته |
| `invalid SWF wallet` | constructor | ✗ پوشش‌نیافته |
| `invalid SWF contract` | constructor | ✗ پوشش‌نیافته |
| `already frozen` | `freezeAsset` | ✅ پیش‌موجود |
| `invalid id` | `freezeAsset` | ✗ پوشش‌نیافته |
| `invalid owner` | `freezeAsset` | ✗ پوشش‌نیافته |
| `zero value` | `freezeAsset` | ✅ پیش‌موجود |
| `already signed` | `signFreeze` | ✅ پیش‌موجود |
| `not found` | `signFreeze` | ✗ پوشش‌نیافته |
| `invalid status` | `signFreeze` | ✗ پوشش‌نیافته |
| `not confirmed` | `transferToSWF` | ✅ پیش‌موجود |
| `already transferred` | `transferToSWF` / `releaseAsset` | ✅ پیش‌موجود (×۲) |
| `not found` | `releaseAsset` | ✗ پوشش‌نیافته |

**گاردهای پوشش‌نیافته: ۸ از ۱۴**

---

## موارد بدون تغییر

- Doctrine
- قراردادها (Contracts)
- Kernel
- Treasury
- SWF
- آستانه‌های چندامضایی
- مدل ذخیره
- مدل اختیار

</div>
