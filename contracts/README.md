<div dir="rtl">

# قراردادهای هوشمند ایران‌اواس (Smart Contracts)

### نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی

-----

## فهرست

- [معماری کلی](#معماری-کلی)
- [ساختار پوشه](#ساختار-پوشه)
- [هسته (Core)](#هسته-core)
- [پولی (Monetary)](#پولی-monetary)
- [شهروندی (Welfare)](#شهروندی-welfare)
- [حاکمیت (Governance)](#حاکمیت-governance)
- [قضایی (Justice)](#قضایی-justice)
- [بازپس‌گیری (Reclaim)](#بازپس‌گیری-reclaim)
- [اوراکل (Oracles)](#اوراکل-oracles)
- [فناوری‌های پایه](#فناوری‌های-پایه)
- [راهنمای توسعه](#راهنمای-توسعه)

-----

## معماری کلی

```
┌─────────────────────────────────────────────────────────┐
│                    لایه صفر (Kernel)                    │
│   IranOS_Kernel — TriggerProtocol — ConstitutionGuard   │
├──────────────┬──────────────┬────────────────────────────┤
│    پولی      │    رفاهی     │        حاکمیتی             │
│ PahlaviToken │ CitizenCard  │  Parliament                │
│ SWF          │ BaseIncome   │  Provincial                │
│ Treasury     │ HealthCoverage│ BudgetAllocation          │
│ MonetaryPolicy│ Disability  │  VotingSystem              │
│ VelocityFee  │              │                            │
├──────────────┴──────────────┴────────────────────────────┤
│              قضایی — بازپس‌گیری — اوراکل                 │
│  JurySelection — JusticeProtocol — PenalLabor           │
│  AssetFreeze — SovereignCrawler — VictimFund            │
│  API3Oracle — PriceOracle — ProductionOracle            │
└─────────────────────────────────────────────────────────┘
```

-----

## ساختار پوشه

```
contracts/
├── README.md
├── IranOS_Kernel.sol
├── core/
│   ├── TriggerProtocol.sol
│   └── ConstitutionGuard.sol
├── monetary/
│   ├── PahlaviToken.sol
│   ├── SovereignWealthFund.sol
│   ├── Treasury.sol
│   ├── MonetaryPolicy.sol
│   └── VelocityFee.sol
├── welfare/
│   ├── CitizenCard.sol
│   ├── BaseIncome.sol
│   ├── HealthCoverage.sol
│   └── DisabilitySupport.sol
├── governance/
│   ├── Parliament.sol
│   ├── Provincial.sol
│   ├── BudgetAllocation.sol
│   └── VotingSystem.sol
├── justice/
│   ├── JurySelection.sol
│   ├── JusticeProtocol.sol
│   └── PenalLabor.sol
├── reclaim/
│   ├── AssetFreeze.sol
│   ├── SovereignCrawler.sol
│   └── VictimFund.sol
└── oracles/
    ├── API3Oracle.sol
    ├── PriceOracle.sol
    └── ProductionOracle.sol
```

-----

## هسته (Core)

### [IranOS_Kernel.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/IranOS_Kernel.sol)

قلب سیستم. شش اصل غیرقابل تغییر را در لایه صفر قفل می‌کند (TR-01 تا TR-06): پادشاهی مشروطه سکولار، سکولاریسم ساختاری، یکپارچگی سرزمینی، حقوق بنیادین ملت، استقلال صندوق ثروت ملی، سقف نقدینگی ۹۰۰ میلیارد پهلوی. سازوکار Multi-Sig با آستانه ۷ از ۹ امضا.

**مبنا:** فرگرد ۱ منشور | **وابستگی‌ها:** TriggerProtocol، ConstitutionGuard

### [core/TriggerProtocol.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/core/TriggerProtocol.sol)

اجرای پیامدهای ماشه. به محض دریافت تاییدیه Multi-Sig از Kernel: دسترسی به خزانه را قطع می‌کند، امضای دیجیتال را باطل می‌کند، اطلاع‌رسانی فوری عمومی انجام می‌دهد و جانشین موقت را فعال می‌کند.

**رویدادها:** `TriggerExecuted`, `TreasuryAccessBlocked`, `SignatureRevoked`, `PublicNotification`

### [core/ConstitutionGuard.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/core/ConstitutionGuard.sol)

نگهبان قانون اساسی. هر قانون، مصوبه یا دستوری که از این قرارداد عبور نکند در شبکه ایران‌اواس اعتبار ندارد. تمام قوانین به صورت نسخه‌دار (Versioning) ثبت می‌شوند.

**مبنا:** فرگرد ۱۳ منشور

-----

## پولی (Monetary)

### [monetary/PahlaviToken.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/monetary/PahlaviToken.sol)

واحد پول ملی پهلوی. سقف عرضه ۹۰۰ میلیارد واحد در پروتکل قفل شده است. واحد فرعی «سره» (۱ پهلوی = ۱۰۰۰ سره). نسبت پشتوانه حداقل ۳۳.۳٪. هیچ مقامی توان mint مازاد بر سقف را ندارد.

**استاندارد:** ERC-20 با Hard Cap | **مبنا:** بخش ۳۹ منشور

### [monetary/SovereignWealthFund.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/monetary/SovereignWealthFund.sol)

صندوق ثروت ملی. مدیریت سه لایه: L1 نقد (۳۰۰ میلیارد دلار)، L2 مولد (۳۰۰ میلیارد دلار، ۱۵٪ سود سالانه)، L3 گرو (۲ تریلیون دلار). هر برداشت نیازمند Multi-Sig شورای نخبگان است.

**مبنا:** بخش ۳۸ منشور | **سود سالانه:** ~۴۵ میلیارد دلار از L2

### [monetary/Treasury.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/monetary/Treasury.sol)

خزانه‌داری ملی. سقف بودجه سالانه دولت ۱۵۰ میلیارد پهلوی. تمام تراکنش‌ها شفاف و در بلاک‌چین ثبت می‌شوند (Glass Box). هیچ برداشتی خارج از ردیف‌های مصوب مجلس مجاز نیست.

**مبنا:** بخش ۲۹ منشور | **کنترل:** مجلس + Multi-Sig حسابرسان

### [monetary/MonetaryPolicy.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/monetary/MonetaryPolicy.sol)

سیاست پولی. اثبات ذخیره (Proof of Reserve) پیش از هر انتشار الزامی است. بانک مرکزی حق وام‌دهی به دولت یا خلق پول بدون پشتوانه را ندارد. توزیع نقدینگی: ۴۸۰ میلیارد دستمزد/رفاه، ۱۵۰ میلیارد حاکمیتی، ۸۰ میلیارد تولید، ۵۰ میلیارد خرده، ۱۴۰ میلیارد ذخیره استراتژیک.

**مبنا:** بخش ۳۹ و ۴۱ منشور

### [monetary/VelocityFee.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/monetary/VelocityFee.sol)

کارمزد رکود. هر حساب با موجودی بالای ۱۰۰,۰۰۰ پهلوی و بدون تراکنش ۳۶۵ روزه: ۲٪ تا ۸٪ کارمزد سالانه. استیکینگ در صندوق‌های نوسازی تولید کاملاً معاف است. درآمد کارمزد به بانک‌های تخصصی توسعه می‌رود.

**مبنا:** بخش ۴۱.۶ منشور

-----

## شهروندی (Welfare)

### [welfare/CitizenCard.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/welfare/CitizenCard.sol)

کارت هوشمند شهروندی. هویت دیجیتال بیومتریک، ثبت اشتغال توسط کارفرما، بیمه بیکاری ۷۰٪ برای حداکثر ۱۸ ماه، بازنشستگی، حمایت از توان‌خواهان با سه درجه. ۱۰۰۰ پهلوی توسط کارفرما پرداخت می‌شود — نه دولت.

**مبنا:** فرگرد ۱۰ منشور

### [welfare/BaseIncome.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/welfare/BaseIncome.sol)

مدیریت حداقل حقوق. کارفرمایان موظف به پرداخت حداقل ۱۰۰۰ پهلوی هستند. صندوق ثروت ملی مابه‌التفاوت کارگاه‌های کوچک را پوشش می‌دهد. مالیات بر درآمد حداقل حقوق حذف شده است.

**مبنا:** بخش ۴۰ منشور

### [welfare/HealthCoverage.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/welfare/HealthCoverage.sol)

بیمه همگانی رایگان. بودجه مستقیم به کیف پول سلامت هر شهروند (بودجه به دنبال بیمار می‌رود). یارانه دارو در لحظه خرید. مرخصی زایمان ۶ ماه با حقوق کامل برای هر دو والد. ذخیره استراتژیک سلامت ۲ ساله.

**مبنا:** بخش ۵۷-۶۰ منشور

### [welfare/DisabilitySupport.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/welfare/DisabilitySupport.sol)

حمایت از توان‌خواهان. مستمری عزت‌مندانه = ۱۰۰۰ پهلوی + ضریب: درجه ۱ خفیف (+۳۰٪)، درجه ۲ متوسط (+۵۰٪)، درجه ۳ شدید (+۷۰٪). گواهی اجباری دسترسی‌پذیری برای ساختمان‌ها، وسایل نقلیه و سیستم‌های دیجیتال.

**مبنا:** بخش ۶۳ منشور

-----

## حاکمیت (Governance)

### [governance/Parliament.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/governance/Parliament.sol)

مجلس شورای ملی دیجیتال. قوانین نسخه‌دار در بلاک‌چین ثبت می‌شوند. آرای نمایندگان کاملاً شفاف و عمومی. مصونیت پارلمانی هیچ نهادی حق قطع دسترسی نمایندگان را ندارد. توشیح نیازمند دستینه دیجیتال پادشاه است.

**مبنا:** فرگرد ۴ منشور

### [governance/Provincial.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/governance/Provincial.sol)

حاکمیت استانی. فرمول ۳۰/۷۰ از طریق قرارداد هوشمند اجرا می‌شود و دولت مرکزی دسترسی فنی برای مسدودسازی ندارد. پاداش بهره‌وری برای استان‌های با امتیاز بالای ۷۰.

**مبنا:** فرگرد ۹ منشور

### [governance/BudgetAllocation.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/governance/BudgetAllocation.sol)

تخصیص بودجه. نسبت‌های ثابت: ۲۰٪ بهداشت، ۲۰٪ آموزش، ۱۵٪ دفاع، ۱۵٪ زیرساخت، ۱۰٪ رفاه، ۱۰٪ دادگستری، ۵٪ محیط زیست، ۵٪ اداری. هزینه‌کرد خارج از مسیر مصوب از نظر فنی غیرممکن است.

**مبنا:** بخش ۲۵ و ۲۹ منشور

### [governance/VotingSystem.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/governance/VotingSystem.sol)

انتخابات دیجیتال. هویت بیومتریک + ZKP. تایید صلاحیت خودکار — فقط عدم سابقه کیفری و شرط اقامت ۵ ساله. هیچ شورای نگهبانی وجود ندارد. تقلب از نظر فنی غیرممکن است.

**مبنا:** بخش ۲۵ و ۵۱ منشور

-----

## قضایی (Justice)

### [justice/JurySelection.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/justice/JurySelection.sol)

انتخاب تصادفی ۱۲ داور ملی با الگوریتم VRF. هویت داوران با ZKP محافظت می‌شود. آستانه محکومیت ۸ از ۱۲ رای. آستانه تبرئه ۵ رای. هیچ مقامی در انتخاب داوران دخالت نمی‌کند.

**مبنا:** بخش ۳۶ منشور

### [justice/JusticeProtocol.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/justice/JusticeProtocol.sol)

API قضایی واحد. احکام به صورت فرمان‌های دیجیتال امضا شده صادر می‌شوند. هر حکم بدون امضای دیجیتال معتبر در شبکه بی‌اعتبار است. اعدام در این سیستم وجود ندارد — از نظر فنی غیرممکن است.

**مبنا:** فرگرد ۶ منشور | **نکته کلیدی:** `SentenceType` هیچ مقداری برای اعدام ندارد

### [justice/PenalLabor.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/justice/PenalLabor.sol)

کار جبرانی — جایگزین اعدام. هزینه صفر برای دولت. اولویت کسر: ۱) هزینه نگهداری ۲۰٪، ۲) غرامت قربانی ۴۰٪، ۳) مالیات ملی ۳۰٪، ۴) حداقل بقا ۱۰٪. کار سخت با ضریب دشواری ۵-۱۰.

**مبنا:** بخش ۶.۴ و پی‌افزود ۱ منشور

-----

## بازپس‌گیری (Reclaim)

### [reclaim/AssetFreeze.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/reclaim/AssetFreeze.sol)

انجماد آنی دارایی‌های غصبی. Smart Freeze: ابطال امضای مدیران + قفل انتقال + انتقال کلید به کیف‌پول موقت صندوق. تایید نهایی نیازمند ۳ امضای شورای نخبگان مالی.

**مبنا:** بخش ۳۸ منشور

### [reclaim/SovereignCrawler.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/reclaim/SovereignCrawler.sol)

خزنده شبکه. هوش مصنوعی توزیع‌شده روی نودهای نخبگانی. شناسایی و انجماد ظرف ۷۲ ساعت. تحلیل گراف تراکنش‌ها برای ردیابی Shell Companies. فرمول: V(L1) = Σ(C + G + A).

**مبنا:** بخش ۳۸.۱ منشور | **هدف‌ها:** Cartel, ParastatalEntity, ShellCompany, PersonalAccount

### [reclaim/VictimFund.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/reclaim/VictimFund.sol)

گنجینه حمایت از آسیب‌دیدگان. مستقل از دولت. منابع: درآمد کار جبرانی محکومان + دارایی‌های بازپس‌گرفته. پنج دسته قربانی: فساد مستقیم، زندانیان سیاسی، فساد ساختاری، شکنجه، مصادره اموال.

**مبنا:** پی‌افزود ۲ منشور

-----

## اوراکل (Oracles)

### [oracles/API3Oracle.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/oracles/API3Oracle.sol)

اوراکل اصلی. منابع داده: زنجیره ارزش ملی، سامانه C4I، دفتر کل عمومی، سامانه قضایی. پرچم‌گذاری تخلف از منشور و ارسال به Kernel برای فعال‌سازی ماشه.

**مبنا:** سپیدنامه فنی | **داده‌ها:** قیمت، تولید، حاکمیت، قضایی، نظامی، رفاهی

### [oracles/PriceOracle.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/oracles/PriceOracle.sol)

قیمت‌های جهانی. نرخ پهلوی به دلار، قیمت طلا، نفت، گاز، تورم جهانی، بازده L2 صندوق. حداقل ۳ منبع مستقل برای اجماع. حداکثر ۵٪ انحراف مجاز بین منابع.

**مبنا:** بخش ۳۹ منشور | **هدف:** تثبیت ۱ پهلوی = ۱ دلار

### [oracles/ProductionOracle.sol](https://github.com/fafa33/Iran-OS/blob/main/contracts/oracles/ProductionOracle.sol)

داده‌های تولید و Proof of Merit. رتبه‌بندی: پیشران (۷۰+)، در حال گذار (۵۰-۷۰)، بحرانی (زیر ۵۰). شاخص‌ها: اشتغال ۳۰٪، ارزش افزوده ۳۰٪، نوسازی ۲۰٪، انضباط مالی ۲۰٪. کارگاه‌های بحرانی ۶ ماه حمایت رفاهی دریافت می‌کنند.

**مبنا:** بخش ۴۰.۱ منشور

-----

## فناوری‌های پایه

|فناوری          |نقش                                 |
|----------------|------------------------------------|
|Solidity ^0.8.20|زبان اصلی قراردادها                 |
|OpenZeppelin    |کتابخانه‌های امنیتی استاندارد        |
|ZK-Rollups      |پردازش انبوه تراکنش با کارمزد صفر   |
|Chainlink VRF   |انتخاب تصادفی قابل اثبات برای داوران|
|API3            |اوراکل‌های غیرمتمرکز                 |
|Multi-Sig       |تصمیمات حاکمیتی حساس                |
|ZKP             |حفاظت هویت داوران و شهروندان        |

-----

## راهنمای توسعه

```bash
# نصب
npm install

# تست
npx hardhat test

# پوشش تست
npx hardhat coverage

# استقرار محلی
npx hardhat node
npx hardhat run scripts/deploy-core.js --network localhost
```

### استانداردهای کد

```
✅ پوشش تست حداقل ۹۵٪
✅ مستندات NatSpec برای تمام توابع
✅ Audit توسط حداقل ۲ بازبین مستقل
✅ هیچ Admin Key مخفی مجاز نیست
✅ تمام توابع حساس نیازمند Multi-Sig
❌ هیچ Backdoor یا دسترسی مخفی
❌ هیچ کدی خارج از چارچوب منشور و سپیدنامه
```

-----

> نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
> شورای تدوین پیمان ملی — IranOS Technical Committee

</div>