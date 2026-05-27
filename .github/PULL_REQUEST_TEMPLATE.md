<div dir="rtl">
  
# چک‌لیست Pull Request / Pull Request Checklist

## خلاصه تغییر / Summary

این PR چه چیزی را تغییر می‌دهد؟  
What does this PR change?

## دامنه تغییر / Scope

دامنه این PR را مشخص کنید:  
Select the scope of this PR:

- [ ] فقط مستندات / Documentation only
- [ ] گام ۱۲ / Step 12 evidence / signoff
- [ ] گام ۱۳ / Step 13 whitepaper-to-system mapping
- [ ] تست‌ها / Tests
- [ ] قراردادها یا کد منبع / Contracts or source code
- [ ] CI / ابزارها / CI or tooling
- [ ] سایر موارد / Other

## Step / Issue / Blocker مرتبط / Related Step, Issue, or Blocker

در صورت وجود، موارد مرتبط را لینک کنید:  
Link related items if applicable:

- Step:
- Issue:
- Blocker:
- Document:

## شواهد و بازبینی / Evidence and Review

اگر این PR به گام ۱۲، evidence، audit، formal verification، release approval یا بسته‌شدن blocker مربوط است، لینک‌ها را اینجا وارد کنید:  
If this PR relates to Step 12, evidence, audit, formal verification, release approval, or blocker closure, provide links here:

- Evidence packet:
- Reviewer / signoff:
- Related issue:

## تأیید non-claim / Non-claim Confirmations

- [ ] این PR بدون evidence پذیرفته‌شده و signoff معتبر، ادعای آمادگی تولید نمی‌کند.  
  This PR does not claim production readiness without accepted evidence and required reviewer signoff.

- [ ] این PR بدون signoff معتبر، ادعای تأیید انتشار نمی‌کند.  
  This PR does not claim release approval without required signoff.

- [ ] این PR بدون شواهد پذیرفته‌شده و تأیید بازبین، ادعای تکمیل audit بیرونی نمی‌کند.  
  This PR does not claim completed external audit without accepted audit evidence and auditor/reviewer signoff.

- [ ] این PR بدون proof evidence و signoff معتبر، ادعای تکمیل formal verification نمی‌کند.  
  This PR does not claim completed formal verification without proof evidence and required signoff.

- [ ] این PR هیچ `STEP9-BLOCK-*` را به‌صورت ضمنی نمی‌بندد.  
  This PR does not close any `STEP9-BLOCK-*` blocker by implication.

- [ ] `Fargard7PolicyAdapter` همچنان proposal-only / non-executing باقی می‌ماند مگر اینکه از مسیر بازبینی لازم تأیید شده باشد.  
  `Fargard7PolicyAdapter` remains proposal-only / non-executing unless explicitly reviewed and approved through the required process.

- [ ] سیگنال‌های اوراکل همچنان non-sovereign / signal-only باقی می‌مانند مگر اینکه از مسیر بازبینی لازم تأیید شده باشد.  
  Oracle signals remain non-sovereign / signal-only unless explicitly reviewed and approved through the required process.

## تست / Tests

تست یا بررسی انجام‌شده را مشخص کنید:  
Describe testing or review performed:

- [ ] نیاز ندارد / Not applicable
- [ ] تغییر فقط مستنداتی است / Documentation-only change
- [ ] `npm test`
- [ ] سایر موارد / Other:

نتیجه تست / توضیح:  
Test result / notes:

## نکته برای بازبین / Reviewer Notes

هر نکته‌ای که بازبین باید با دقت بیشتری بررسی کند اینجا بنویسید.  
Add anything reviewers should pay special attention to.

</div>