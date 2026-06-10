<div dir="rtl">

# ایست‌گاه مسیر D — شماره ۴ — بستن AssetFreeze

**نسخه:** 1.0
**تاریخ:** ۱۴۰۵-۰۳-۲۰

---

## وضعیت مخزن

| مورد | مقدار |
|---|---|
| HEAD | `7c77b69` |
| شاخه | `main` |
| Origin | synced |
| Worktree | clean |
| تعداد تست‌های موفق | 565 |
| تعداد تست‌های AssetFreeze | 28 |

---

## ماژول‌های بسته‌شده در مسیر D

| ماژول | حوزه | گام‌ها | وضعیت |
|---|---|---|---|
| ConstitutionGuard | core | — | ✅ بسته |
| CitizenCard | welfare | — | ✅ بسته |
| BaseIncome | welfare | ۱۰۰–۱۱۴ | ✅ بسته |
| HealthCoverage | welfare | ۱۱۶–۱۳۴ | ✅ بسته |
| DisabilitySupport | welfare | ۱۳۶–۱۴۲ | ✅ بسته |
| VictimFund | reclaim | ۱۴۴–۱۵۰ | ✅ بسته |
| SovereignCrawler | reclaim | ۱۵۲–۱۶۸ | ✅ بسته |
| AssetFreeze | reclaim | ۱۷۰–۱۹۸ | ✅ بسته |

---

## گاردهای بسته‌شده در AssetFreeze

### freezeAsset

| گارد | گام |
|---|---|
| `invalid id` | ۱۷۲ |
| `already frozen` | پیش‌موجود |
| `invalid owner` | ۱۷۰ |
| `zero value` | پیش‌موجود |

### signConfirmation

| گارد | گام |
|---|---|
| `not found` | ۱۷۴ |
| `invalid status` | ۱۷۶ |
| `already signed` | پیش‌موجود |

### transferToSWF

| گارد | گام |
|---|---|
| `not confirmed` | پیش‌موجود + ۱۸۲/۱۸۴ |
| `already transferred` | پیش‌موجود + ۱۸۶ |

### releaseAsset

| گارد | گام |
|---|---|
| `not found` | ۱۹۴ |
| `already transferred` | ۱۹۶ |

---

## پوشش کنترل دسترسی

| بررسی نقش | تابع | وضعیت |
|---|---|---|
| غیر-`CRAWLER_ROLE` | `freezeAsset` | ✅ پیش‌موجود |
| غیر-`COUNCIL_ROLE` | `signConfirmation` | ✅ گام ۱۸۰ |
| غیر-`COUNCIL_ROLE` | `transferToSWF` | ✅ گام ۱۸۸ |
| غیر-`KERNEL_ROLE` | `releaseAsset` | ✅ پیش‌موجود |

---

## پوشش تکرار / بی‌تأثیری

| سناریو | وضعیت |
|---|---|
| انجماد تکراری همان شناسه | ✅ پیش‌موجود |
| امضای تکراری signConfirmation | ✅ گام ۱۷۸ + پیش‌موجود |
| انتقال تکراری transferToSWF | ✅ پیش‌موجود + گام ۱۸۶ |

---

## پوشش تثبیت حسابداری

| بررسی | گام‌ها |
|---|---|
| `totalFrozenValue` بدون تغییر پس از فراخوانی ناموفق | ۱۷۸/۱۸۲/۱۸۴/۱۸۶/۱۸۸/۱۹۴/۱۹۶ |
| `swf.layerL1` بدون تغییر پس از فراخوانی ناموفق | ۱۸۲/۱۸۴/۱۸۶/۱۸۸/۱۹۶ |
| `swf.totalDeposited` بدون تغییر پس از فراخوانی ناموفق | ۱۸۲/۱۸۴/۱۸۶/۱۹۶ |
| `swf.txCount` بدون تغییر پس از فراخوانی ناموفق | ۱۸۶/۱۸۸ |

---

## پوشش مرزهای جهش SWF

| مرز | وضعیت |
|---|---|
| انتقال فقط در وضعیت Confirmed | ✅ CLC-02 پیش‌موجود |
| revert اتمی در صورت نبود RECLAIM_ROLE | ✅ پیش‌موجود |
| پرچم `transferredToSWF` تغییرناپذیر پس از انتقال | ✅ گام‌های ۱۸۶/۱۹۶ |

---

## پوشش وضعیت پایانی بین‌تابعی

| سناریو | وضعیت |
|---|---|
| `releaseAsset` پس از `transferToSWF` مسدود است | ✅ گام ۱۹۶ |
| `transferToSWF` پس از `transferToSWF` مسدود است | ✅ گام ۱۸۶ |

---

## گاردهای سازنده (Constructor) — معوق

این سه گارد به آزمون‌های سطح استقرار (deploy-level) نیاز دارند و جداگانه پیگیری می‌شوند:

| گارد | تابع |
|---|---|
| `invalid kernel` | constructor |
| `invalid SWF wallet` | constructor |
| `invalid SWF contract` | constructor |

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

---

## وضعیت کلی

- مسیر D فعال
- AssetFreeze بسته‌شد (گام‌های ۱۷۰–۱۹۸)
- تمام ۱۱ گارد غیر-سازنده پوشش داده شد
- تمام ۴ مسیر کنترل دسترسی پوشش داده شد
- بدون تغییر در قراردادها
- پیشرفت تست‌محور
- منشور بدون تغییر
- آستانه‌ها بدون تغییر

</div>
