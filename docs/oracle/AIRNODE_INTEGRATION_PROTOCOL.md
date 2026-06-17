<div dir="rtl">

# پروتکل یکپارچه‌سازی Airnode — IranOS Oracle

**نسخه:** ۱.۰.۰  
**تاریخ:** ۱۳ خرداد ۲۵۸۵ شاهنشاهی / ۳ ژوئن ۲۰۲۶ میلادی  
**شناسه شکاف:** G-02  
**نوع:** مستندات یکپارچه‌سازی — بدون تغییر قرارداد  
**وضعیت:** راهنمای مرجع پیش از استقرار oracle

---

> **⚠️ وضعیت فعلی:**  
> هیچ استقرار Airnode وجود ندارد.  
> هیچ رجیستری feeder وجود ندارد.  
> هیچ عملیات oracle تولیدی وجود ندارد.  
> **[این سند مستندات‌محور است | استقرار انجام نمی‌شود | آمادگی تولید اعلام نمی‌شود | Step 12 بسته نمی‌شود | Step 13 بسته نمی‌شود]**

---

## فهرست مطالب

1. [مبنای قانون اساسی](#۱-مبنای-قانون-اساسی)
2. [ارزیابی وضعیت فعلی](#۲-ارزیابی-وضعیت-فعلی)
3. [معماری Airnode در IranOS](#۳-معماری-airnode-در-iranos)
4. [الزامات Airnode RRP](#۴-الزامات-airnode-rrp)
5. [الزامات رجیستری feeder](#۵-الزامات-رجیستری-feeder)
6. [الزامات عملیات oracle](#۶-الزامات-عملیات-oracle)
7. [الزامات استقرار](#۷-الزامات-استقرار)
8. [الزامات پایش](#۸-الزامات-پایش)
9. [فرضیات امنیتی](#۹-فرضیات-امنیتی)
10. [اعلام غیرادعا](#۱۰-اعلام-غیرادعا)

---

## ۱. مبنای قانون اساسی

**فرگرد ۱ (اصول بنیادین — لایه تشخیص):**

> «هرگونه انحراف از خطوط قرمز، توسط دادگاه عالی قانون اساسی تایید می‌گردد. حکم صادره به صورت یک فرمان دیجیتال شکست‌ناپذیر از راه زیرساخت‌های هوشمند نظارتی به قراردادهای حاکمیتی گسیل می‌شود.»

**پروتکل ماشه، لایه ۱ — تشخیص:**

> «اوراکل‌های غیرمتمرکز به صورت ۲۴/۷ تمام تراکنش‌های حاکمیتی، تصمیمات مالی، و فرامین اجرایی را پایش می‌کنند. هر داده‌ای که با کدهای منشور در تضاد باشد، بلافاصله پرچم‌گذاری می‌شود.»

**نتیجه:** oracle زیرساخت بنیادین لایه ۱ پروتکل ماشه است. بدون oracle فعال، پروتکل ماشه عملاً غیرفعال است.

---

## ۲. ارزیابی وضعیت فعلی

### موجود در مخزن

| مورد | وضعیت | فایل |
|------|--------|------|
| قرارداد `API3Oracle.sol` | ✅ موجود و تست‌شده | `contracts/oracles/API3Oracle.sol` |
| `FEEDER_ROLE` تعریف‌شده | ✅ موجود | `API3Oracle.sol:18` |
| `MAX_DATA_AGE = 1 hours` | ✅ موجود | `API3Oracle.sol:29` |
| `PAH_USD_KEY` | ✅ موجود | `API3Oracle.sol:53` |
| `updateData()` | ✅ موجود | `API3Oracle.sol` |
| `flagViolation()` با staleness guard | ✅ موجود | `API3Oracle.sol` |
| انواع داده (PRICE/PRODUCTION/GOVERNANCE/JUDICIAL/MILITARY/WELFARE) | ✅ موجود | `API3Oracle.sol:22-27` |

### غایب — هیچ‌کدام از موارد زیر در مخزن وجود ندارد

| مورد | وضعیت |
|------|--------|
| پیکربندی Airnode (`config.json`) | ❌ غایب |
| فایل `secrets.env` یا الگوی آن | ❌ غایب |
| اسکریپت deploy Airnode | ❌ غایب |
| رجیستری feeder (آدرس‌های feeder مجاز) | ❌ غایب |
| پروتکل عملیات oracle (runbook) | ❌ غایب |
| پایش staleness | ❌ غایب |
| فرآیند تأیید کیفیت داده | ❌ غایب |
| SLA تعریف‌شده برای feeder | ❌ غایب |

---

## ۳. معماری Airnode در IranOS

### جریان داده

```
منابع داده واقعی (API‌های مالی، حاکمیتی، تولیدی)
    ↓
Airnode (API3 RRP) — Node.js + Docker
    ↓  [RRP — Request-Response Protocol]
API3Oracle.updateData(key, dataType, value, confidence)
    ↓  [نیاز به FEEDER_ROLE]
dataPoints[key] = DataPoint{...}
    ↓
flagViolation() ← اگر داده نشان‌دهنده تخلف TR-01 تا TR-06 باشد
    ↓
IIranOSKernel.flagViolation() → پروتکل ماشه
```

### انواع داده و کلیدهای مورد نیاز

| نوع | ثابت | کلید پیش‌فرض | اولویت |
|-----|------|-------------|--------|
| PRICE (قیمت) | `DATA_PRICE = 1` | `PAH_USD_KEY` | بحرانی — staleness guard |
| PRODUCTION (تولید) | `DATA_PRODUCTION = 2` | تعریف‌نشده | بالا |
| GOVERNANCE (حکمرانی) | `DATA_GOVERNANCE = 3` | تعریف‌نشده | بالا |
| JUDICIAL (قضایی) | `DATA_JUDICIAL = 4` | تعریف‌نشده | متوسط |
| MILITARY (نظامی) | `DATA_MILITARY = 5` | محدود به KERNEL_ROLE | بحرانی |
| WELFARE (رفاه) | `DATA_WELFARE = 6` | تعریف‌نشده | متوسط |

**توجه بحرانی:** `flagViolation()` بررسی می‌کند که `PAH_USD_KEY` در ۱ ساعت گذشته به‌روز شده باشد. اگر feeder این کلید را به‌روز نکند، هیچ تخلفی نمی‌تواند flag شود — پروتکل ماشه عملاً فلج می‌شود.

---

## ۴. الزامات Airnode RRP

### ساختار پیکربندی (نباید در مخزن عمومی باشد)

```json
{
  "nodeSettings": {
    "cloudProvider": { "type": "aws|gcp|azure", "region": "..." },
    "airnodeWalletMnemonic": "${AIRNODE_WALLET_MNEMONIC}",
    "heartbeatEnabled": true
  },
  "chains": [
    {
      "id": "<chain_id>",
      "providers": { "selfHostedMainnet": { "url": "${JSON_RPC_PROVIDER_URL}" } },
      "contracts": {
        "AirnodeRrp": "<airnode_rrp_contract_address>"
      }
    }
  ],
  "triggers": {
    "rrp": [
      {
        "endpointId": "<endpoint_id>",
        "oisTitle": "IranOS Oracle Feed",
        "endpointName": "PAH_USD_RATE"
      }
    ]
  }
}
```

### الزامات محیطی (secrets — هرگز در مخزن عمومی)

```
AIRNODE_WALLET_MNEMONIC=<مخفی>
JSON_RPC_PROVIDER_URL=<مخفی>
API_KEY_FINANCIAL_DATA=<مخفی>
API_KEY_GOVERNANCE_DATA=<مخفی>
```

### الزامات OIS (Oracle Integration Specification)

برای هر endpoint یک OIS باید تعریف شود:
- `oisTitle`: نام یکتا
- `apiSpecifications`: OpenAPI spec منبع داده
- `endpoints`: نگاشت از endpoint API به پاسخ
- `parameters`: پارامترهای ورودی
- `preprocessingSpecificationV2` / `postprocessingSpecificationV2`: تبدیل داده

---

## ۵. الزامات رجیستری feeder

### هویت feeder در API3Oracle

هر feeder باید:
1. `FEEDER_ROLE` روی `API3Oracle` داشته باشد
2. آدرس آن از طریق `kernel.grantRole(FEEDER_ROLE, feederAddress)` توسط Kernel ثبت شده باشد
3. یک Airnode مجزا با wallet اختصاصی داشته باشد

### رجیستری off-chain (نباید در مخزن عمومی باشد)

| فیلد | توضیح |
|------|-------|
| `feeder_address` | آدرس on-chain Airnode wallet |
| `airnode_address` | آدرس Airnode node |
| `data_types` | انواع داده‌ای که این feeder مجاز به ارسال است |
| `endpoints` | لیست endpoint‌های پشتیبانی‌شده |
| `sla_max_latency` | حداکثر تأخیر مجاز (پیشنهاد: ۱۵ دقیقه) |
| `sla_min_availability` | حداقل uptime (پیشنهاد: ۹۵٪) |

### حداقل feeder برای PAH_USD_KEY

برای تضمین liveness (جلوگیری از staleness `flagViolation`):
- حداقل **۲ feeder مستقل** باید `PAH_USD_KEY` را به‌روز کنند
- هر feeder باید در فواصل زیر ۳۰ دقیقه (نه ۱ ساعت) به‌روزرسانی کند تا حاشیه امنیتی وجود داشته باشد
- اگر تنها یک feeder وجود داشته باشد و خاموش شود، `flagViolation()` برای همیشه revert خواهد کرد

---

## ۶. الزامات عملیات oracle

### SLA داده

| نوع داده | حداکثر فاصله به‌روزرسانی | دلیل |
|---------|--------------------------|------|
| PAH_USD_KEY (PRICE) | ۳۰ دقیقه | MAX_DATA_AGE = 1 ساعت — باید حاشیه داشته باشد |
| PRODUCTION | ۱ روز | تغییرات کند |
| GOVERNANCE | بلافاصله پس از رویداد | flagViolation وابسته |
| JUDICIAL | بلافاصله پس از رویداد | flagViolation وابسته |
| MILITARY | فقط از طریق KERNEL_ROLE | محدودیت قرارداد |
| WELFARE | ۱ روز | تغییرات کند |

### runbook — پاسخ به staleness

```
اگر dataPoints[PAH_USD_KEY].timestamp + 3600 < block.timestamp:
  → هشدار بحرانی — flagViolation() قادر به اجرا نیست
  → feeder باید فوراً updateData(PAH_USD_KEY, DATA_PRICE, ...) صدا کند
  → اگر feeder در دسترس نیست: escalate به تیم ops
  → اگر پس از ۲ ساعت رفع نشد: بررسی emergency manual intervention
```

### توالی اجباری فراخوانی — syncReserves (GAP-MEX-04)

برای ارسال داده ذخایر از طریق `API3Oracle.syncReserves`، feeder باید الزامات دو دروازه را رعایت کند:

**دروازه الف (Gate A — liveness):** `dataPoints[PAH_USD_KEY].timestamp` باید در بازه `MAX_DATA_AGE = 1 hour` از `block.timestamp` باشد.
**دروازه ب (Gate B — rate limiter):** حداقل `MAX_DATA_AGE` از آخرین `syncReserves` موفق گذشته باشد.

**توالی اجباری در هر فراخوانی syncReserves:**

```
۱. updateData(PAH_USD_KEY, DATA_PRICE, <مقدار جاری>, <confidence>)
   ← PAH_USD_KEY را در همان اجرا تازه می‌کند — Gate A را تضمین می‌کند
۲. syncReserves(<مقدار ذخایر>)
   ← بلافاصله پس از updateData فراخوانی می‌شود
```

این دو فراخوانی باید در **همان اجرای اتوماتیک** (همان اسکریپت یا job) انجام شوند. اگر در job‌های مجزا اجرا شوند، Gate A ممکن است در مرز بازه شکست بخورد.

**محدودیت بازه Gate B — بازیابی پس از نقض:**

اگر `syncReserves` در پنجره جاری `MAX_DATA_AGE` فراخوانی شده باشد و نیاز به ارسال مقدار اصلاحی وجود داشته باشد، Gate B تا `lastReservesSyncTimestamp + MAX_DATA_AGE` هر فراخوانی اضافی را revert می‌کند. revert رویداد on-chain منتشر نمی‌کند — پایش باید از رسیدهای تراکنش استفاده کند، نه از event log.

**تنها مسیر بازیابی در پنجره جاری:** `PahlaviToken.burn()` (کاهش عرضه برای بازگرداندن نسبت پشتوانه). ارسال `syncReserves` اصلاحی تا پایان پنجره ممکن نیست.

---

### فرآیند تأیید کیفیت داده

قبل از `flagViolation()`:
- مقدار `value` باید با منابع مستقل تأیید شود
- `confidence` باید بر اساس تعداد منابع و انحراف آن‌ها تنظیم شود (۰–۱۰۰۰)
- هیچ flagViolation نباید بدون تأیید چندگانه ارسال شود

---

## ۷. الزامات استقرار

### پیش‌نیازهای محیطی

```
□ Docker و docker-compose نصب شده
□ Node.js >= 18 نصب شده
□ @api3/airnode-deployer نصب شده
□ دسترسی به JSON-RPC provider (Infura/Alchemy/خود-میزبانی)
□ کیف‌پول Airnode با ETH کافی برای gas
□ API keyهای منابع داده (خارج از مخزن)
```

### ترتیب استقرار Airnode (پس از استقرار قراردادها)

```
مرحله ۱: پیکربندی
  - config.json تکمیل شود (بدون کلیدهای خصوصی)
  - secrets.env تکمیل شود (خارج از مخزن)

مرحله ۲: استقرار Airnode
  npx @api3/airnode-deployer deploy
  → آدرس Airnode wallet ثبت شود

مرحله ۳: ثبت feeder در قرارداد
  kernel.grantRole(api3Oracle.FEEDER_ROLE(), airnodeWalletAddress)

مرحله ۴: تأیید اتصال
  → api3Oracle.hasRole(FEEDER_ROLE, airnodeWalletAddress) == true
  → یک updateData تست ارسال شود
  → api3Oracle.dataPoints[PAH_USD_KEY].timestamp تازه باشد
```

---

## ۸. الزامات پایش

### متریک‌های بحرانی

| متریک | آستانه هشدار | آستانه بحران |
|-------|-------------|--------------|
| `block.timestamp - dataPoints[PAH_USD_KEY].timestamp` | > ۳۰ دقیقه | > ۵۰ دقیقه |
| `api3Oracle.violationFlagCount` | افزایش غیرمنتظره | — |
| موجودی ETH wallet Airnode | < ۰.۱ ETH | < ۰.۰۱ ETH |
| uptime Airnode node | < ۹۸٪ | < ۹۵٪ |

### ابزارهای پایش پیشنهادی

- **The Graph**: ایندکس رویداد `DataUpdated` برای پایش freshness
- **Tenderly**: alert روی staleness
- **Grafana + on-chain query**: داشبورد متریک‌های oracle

---

## ۹. فرضیات امنیتی

| فرض | توضیح |
|-----|-------|
| **feeder honest majority** | حداقل یک feeder صادق باید همیشه فعال باشد |
| **API source integrity** | منابع داده (API‌های مالی) مورد اعتماد هستند |
| **Airnode wallet امنیت** | mnemonic Airnode در محیط امن نگهداری می‌شود |
| **chain data finality** | تراکنش‌های on-chain پس از N block نهایی هستند |
| **no feeder collusion** | feederهای مختلف با یکدیگر هماهنگ نمی‌شوند |

### موارد خارج از دامنه این سند

- تأیید رسمی صداقت feeder
- مدل تهدید کامل Airnode
- راه‌حل oracle aggregation (PriceOracle، ProductionOracle — مستقل از Airnode)

---

## ۱۰. اعلام غیرادعا

این سند صرفاً مستندات مرجع یکپارچه‌سازی است:

- **هیچ استقرار Airnode وجود ندارد**
- **هیچ رجیستری feeder وجود ندارد**
- **هیچ عملیات oracle تولیدی وجود ندارد**
- هیچ `config.json` یا `secrets.env` در مخزن نیست و نباید باشد
- Step 12 یا Step 13 بسته نمی‌شود
- آمادگی تولید یا mainnet اعلام نمی‌شود
- هیچ حسابرسی امنیتی (Slither / Mythril / Echidna) انجام نشده
- هیچ بررسی خارجی oracle ops وجود ندارد
- این سند شرط لازم برای استقرار oracle است، نه شرط کافی

</div>
