<div dir="rtl">

# قاعده اجباری canonical-source check برای reviewهای گام ۱۳

**نام فنی:** Step 13 Canonical Source Check Required Review Rule  
**نوع سند:** documentation-only / review-protocol-hardening / deprecation-rule  
**وضعیت:** باز؛ این سند هیچ accepted evidence، reviewer signoff، blocker closure، production readiness، release approval، audit completion، formal verification completion یا downstream execution ایجاد نمی‌کند.

## ۱. هدف

این سند یک ضعف مهم در reviewهای AI-assisted قبلی را ثبت و اصلاح می‌کند:

```text
No finding without canonical-source check.
No contradiction claim without checking the relevant FAQ/kit/source explanation.
No architecture finding without mapping the finding to Sepidnameh, Charter, Step 13 source text, relevant FAQ/kit clarification, and Sepidnameh technical pre-awareness.
No AI review may convert a misunderstood concept into a project defect.
```

هدف این سند پاک‌کردن history نیست؛ هدف این است که reviewهای قبلی در جایگاه درست خود باقی بمانند: artifactهای محدود فرایندی و ورودی برای hardening پروتکل review، نه evidence، نه signoff، نه validation و نه defect قطعی پروژه.

## ۲. تعریف canonical source

برای گام ۱۳، canonical source یعنی هر سند یا توضیحی که برای فهم یک مفهوم پروژه مرجع اصلی محسوب می‌شود، از جمله:

- سپیدنامه اصلی ایران‌اواس؛
- بخش «پیش‌آگاهی: ارکان فنی حاکمیت نوین ایران»؛
- فرابخش «معماری هسته سخت در لایه صفر»؛
- منشور رفاه و عدالت / پیمان ملی مشروطه سکولار؛
- FAQها و کیت‌های توضیحی پروژه؛
- توضیحات رسمی/مستندشده درباره مفاهیمی مثل ماشه هوشمند، لایه صفر، هسته سخت، no-admin، خزانه، خزنده، AI review، no-downstream-execution و rule-based execution؛
- اسناد Step 13؛
- issueهای مرجع مثل issue #18 برای non-claim preservation؛
- snapshotهای وضعیت فعلی governance.

## ۳. قاعده اصلی

هر reviewer، چه AI و چه انسان، پیش از ثبت finding باید نشان دهد:

1. sourceهای canonical مرتبط را خوانده است؛
2. پیش‌آگاهی فنی سپیدنامه را برای هر finding معماری بررسی کرده است؛
3. توضیح canonical مرتبط را پیدا کرده است؛
4. اگر finding با توضیح canonical تعارض دارد، توضیح داده چرا finding هنوز باقی است؛
5. اگر توضیح canonical finding را حل می‌کند، finding باید withdrawn، downgraded یا به documentation-clarity note تبدیل شود؛
6. اگر reviewer توضیح canonical را فقط بعد از توضیح طراح فهمیده باشد، خروجی مستقل نیست و باید designer-clarified برچسب بخورد.

## ۴. پیش‌آگاهی فنی سپیدنامه

هیچ finding معماری معتبر نیست مگر اینکه reviewer ابتدا بخش پیش‌آگاهی فنی سپیدنامه را خوانده و اعمال کرده باشد.

Reviewer باید نشان دهد که این عناصر را فهمیده است:

- IranOS به‌عنوان سیستم‌عامل اجرای دستورات حقوقی منشور؛
- National Value Chain به‌عنوان زیرساخت ثبت تغییرناپذیر قوانین، دارایی‌ها و حقوق؛
- National Wealth Treasury به‌عنوان دارایی مشترک ملت؛
- Layer-Zero Kernel و هسته سخت؛
- سه ستون hard-coded: جایگاه آرتش، فرمول ریاضی ثروت ملی و الگوریتم ماشه؛
- Smart Trigger به‌عنوان سازوکار خودکار اجرای قاعده منشور، نه AI خودسر؛
- No Admin Access به‌عنوان حذف دسترسی مدیریتی برای تغییر ستون‌های بنیادین، نه admin پنهان؛
- ابطال خودکار دستور ناسازگار؛
- هدف ضدفساد، ضداستبداد فردی و ضددست‌اندازی سیاسی/انسانی.

قاعده:

```text
No architecture review without Sepidnameh technical pre-awareness.
No kernel/layer-zero/no-admin/smart-trigger finding without reading and applying the technical pre-awareness section.
```

## ۵. ماشه هوشمند و no-downstream-execution

قبل از هر claim درباره تضاد downstream execution، reviewer باید این تمایز را بررسی و نقل کند:

```text
Review AI has no downstream execution authority.
Iran-OS rule-based/deterministic execution is a separate operational layer that may operate only under pre-approved constitutional/governance rules.
```

اگر reviewer این تمایز را بررسی نکرده باشد، finding مربوط به تناقض AI/no-downstream-execution معتبر نیست.

## ۶. لایه صفر، هسته سخت، no-admin و bootstrapping

قبل از هر claim درباره bootstrapping، قدرت نویسنده، author sovereignty، نبود admin یا هسته سخت بدون مدیر، reviewer باید توضیح canonical مرتبط را بررسی کند.

```text
No-admin must not be treated as hidden author sovereignty unless the reviewer first checks the canonical explanation that no-admin can be an anti-capture design, not a concealed administrator.
```

```text
Layer-zero immutability must not be treated as author sovereignty unless the reviewer first checks the canonical explanation of layer-zero as constitutional anti-capture architecture.
```

```text
The author of code or documentation does not become the sovereign authority merely because the initial text or code was authored. Authority must be derived only from valid constitutional, public, human/governance, and founding procedures.
```

## ۷. designer clarification و استقلال review

اگر AI یا انسان یک مفهوم را از متن canonical نفهمیده و فقط پس از توضیح مستقیم طراح متوجه شده باشد، خروجی او نباید independent review شمرده شود.

برچسب الزامی:

```text
designer-clarified / not independent / not evidence / not signoff / not consensus
```

## ۸. deprecation کنترل‌شده reviewهای قبلی Gemini و Claude

Reviewهای قبلی Gemini و Claude حذف کامل نمی‌شوند، چون بخشی از traceability فرایندی و نشان‌دهنده hardening روند review هستند.

اما از این پس این reviewها برای موارد زیر deprecated هستند:

- Sepidnameh alignment؛
- Charter / welfare / justice / constitutional alignment؛
- معماری عملیاتی ایران‌اواس؛
- پیش‌آگاهی فنی سپیدنامه؛
- ماشه هوشمند؛
- لایه صفر؛
- هسته سخت؛
- no-admin؛
- bootstrapping؛
- author-power یا author-sovereignty claim؛
- downstream execution در سطح سیستم؛
- ادعای defect قطعی پروژه؛
- accepted evidence؛
- reviewer signoff؛
- multi-AI consensus.

برچسب صحیح آن‌ها:

```text
limited-scope / limited-context / non-canonical-source-checked / process-hardening artifact only / not validation / not defect evidence / not signoff / not consensus
```

## ۹. قاعده citation برای findings آینده

هر finding آینده باید این fields را داشته باشد:

```yaml
canonical_source_check:
  sepidnameh_checked: true_or_false
  sepidnameh_technical_preawareness_checked: true_or_false
  charter_checked: true_or_false
  step13_sources_checked: true_or_false
  faq_or_kit_checked: true_or_false
  system_execution_vs_review_ai_distinction_checked: true_or_false
  no_admin_or_layer_zero_explanation_checked: true_or_false
  relevant_canonical_explanation: "quote-or-section-reference"
  contradiction_claim_allowed: true_or_false
  reason_if_still_unresolved: "required-if-finding-remains"
```

اگر این بخش وجود نداشته باشد، finding فقط draft note است و نباید در rollup به‌عنوان review finding قوی ثبت شود.

## ۱۰. non-claim نهایی

این سند فقط قاعده سخت‌سازی review و deprecation کنترل‌شده reviewهای قبلی است. این سند هیچ review را accepted، signed off، closed، production ready، release approved، audit complete، formally verified، consensus-backed یا authorized for downstream execution اعلام نمی‌کند.

Step 12 باز می‌ماند. Step 13 باز می‌ماند.

</div>
