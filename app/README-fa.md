<div dir="rtl">

# اپلیکیشن ملی ایران‌اواس

رابط شهروندی سیستم‌عامل حاکمیتی ایران — ساخته‌شده با React Native + Expo

---

## صفحات اپلیکیشن

| صفحه | قرارداد مرتبط | توضیح |
|------|--------------|-------|
| **Splash** | — | نماد شیر و خورشید + نام ایران‌اواس |
| **داشبورد** | `kernel.sol`, `CitizenCard.sol` | موجودی، مزایا، تراکنش‌های اخیر |
| **کارت شهروندی** | `CitizenCard.sol` | کارت دیجیتال با تایید بیومتریک ZKP |
| **کیف‌پول** | `PahlaviToken.sol` | ارسال/دریافت PAH، تاریخچه تراکنش |
| **قبوض** | `PahlaviToken.sol` | پرداخت مستقیم بدون درگاه بانکی |
| **استیکینگ** | `SovereignWealthFund.sol` | قفل PAH در لایه L2، سود ۱۵٪ سالانه |
| **وضعیت Kernel** | `kernel.sol` | خطوط قرمز TR-01..TR-06، ماشه Trigger |

---

## واحد پول

| واحد | معادل | نماد | کاربرد |
|------|-------|------|--------|
| **پهلوی (PAH)** | واحد اصلی | `₱` | پرداخت، استیک، حقوق |
| **سره** | ۱/۱۰۰ پهلوی | `سره` | مزایا کوچک، سهمیه دارو |

---

## نصب و اجرا

```bash
cd app
npm install
npx expo start
```

برای اجرا روی گوشی، اپ **Expo Go** را نصب کنید و QR کد را اسکن کنید.

برای شبیه‌ساز:
```bash
npx expo start --ios      # macOS
npx expo start --android  # همه سیستم‌عامل‌ها
```

---

## نماد شیر و خورشید

نشان شیر و خورشید به صورت برداری (SVG) در `src/components/LionSunLogo.tsx` پیاده‌سازی شده است.
این نشان در تمام اندازه‌ها (از ۳۲px تا ۲۲۰px) بدون از دست دادن کیفیت نمایش داده می‌شود.

---

## ساختار پوشه

```
app/
├── App.tsx                          ← نقطه ورود + ناوبری
├── src/
│   ├── theme/
│   │   ├── colors.ts                ← رنگ‌بندی ملی
│   │   └── typography.ts            ← تایپوگرافی فارسی
│   ├── mock/
│   │   └── citizen.ts               ← داده‌های نمونه شهروند
│   ├── components/
│   │   ├── LionSunLogo.tsx          ← نشان شیر و خورشید (SVG)
│   │   ├── PAHAmount.tsx            ← نمایش موجودی پهلوی
│   │   └── KernelStatusBadge.tsx    ← نشانگر وضعیت سیستم
│   └── screens/
│       ├── SplashScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── CitizenCardScreen.tsx
│       ├── WalletScreen.tsx
│       ├── BillsScreen.tsx
│       ├── StakingScreen.tsx
│       └── KernelStatusScreen.tsx
```

---

## اتصال به قراردادهای هوشمند

در نسخه فعلی، اپلیکیشن با داده‌های نمونه (`mock/citizen.ts`) کار می‌کند.
برای اتصال واقعی به شبکه، `ethers.js` را اضافه کنید:

```bash
npm install ethers
```

سپس ABIهای قراردادها را از پوشه `../contracts/` وارد کنید.

---

> نسخه ۱.۰ — فروردین ۱۴۰۵
> شورای تدوین پیمان ملی — IranOS Technical Committee

</div>
