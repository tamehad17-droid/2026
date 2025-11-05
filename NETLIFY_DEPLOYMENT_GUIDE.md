# 🚀 دليل النشر على Netlify - PromoHive

## ✅ التحقق من الجاهزية

### المشروع جاهز 100% للنشر! ✅

تم التحقق من:
- ✅ `package.json` - Scripts جاهزة
- ✅ `vite.config.mjs` - Build configuration صحيحة
- ✅ `netlify.toml` - تم إنشاؤه
- ✅ `.env.example` - موجود
- ✅ كل الـ Components والـ Pages
- ✅ Supabase integration
- ✅ AdGem integration

---

## 📋 قبل البدء - قائمة التحقق:

### 1. Edge Functions مرفوعة في Supabase:
- [ ] send-verification-email
- [ ] send-notification-email
- [ ] adgem-postback
- [ ] sync-adgem-offers (اختياري)

### 2. Secrets في Supabase:
- [ ] ADGEM_API_KEY
- [ ] ADGEM_PUBLISHER_ID
- [ ] ADGEM_APP_ID
- [ ] ADGEM_POSTBACK_KEY
- [ ] RESEND_API_KEY

### 3. قاعدة البيانات:
- [ ] SQL migrations مطبقة

---

## 🚀 طريقة النشر على Netlify

### الطريقة 1: عبر GitHub (الأفضل) ⭐

#### الخطوة 1: رفع الكود على GitHub

```bash
cd /workspace/promohive

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment - PromoHive v1.0"

# Add remote (create repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/promohive.git

# Push
git push -u origin main
```

#### الخطوة 2: ربط Netlify بـ GitHub

1. **اذهب إلى:**
   ```
   https://app.netlify.com/
   ```

2. **اضغط "Add new site" → "Import an existing project"**

3. **اختر "Deploy with GitHub"**

4. **صرّح لـ Netlify بالوصول لـ GitHub**

5. **اختر Repository: `promohive`**

6. **إعدادات Build:**
   ```
   Build command: npm run build
   Publish directory: build
   ```

7. **اضغط "Deploy site"** ✅

---

### الطريقة 2: Drag & Drop (سريعة)

#### الخطوة 1: Build محلياً

```bash
cd /workspace/promohive

# Install dependencies
npm install

# Build
npm run build
```

#### الخطوة 2: رفع على Netlify

1. **اذهب إلى:**
   ```
   https://app.netlify.com/drop
   ```

2. **اسحب مجلد `build` إلى الصفحة**

3. **انتظر الرفع** ✅

⚠️ **ملاحظة:** هذه الطريقة للاختبار فقط. الأفضل استخدام GitHub!

---

## ⚙️ إعداد Environment Variables في Netlify

### بعد نشر الموقع:

**1. افتح Dashboard:**
```
https://app.netlify.com/sites/YOUR_SITE_NAME/settings
```

**2. اذهب إلى:**
```
Site settings → Environment variables
```

**3. أضف المتغيرات التالية:**

#### Environment Variables المطلوبة:

| Key | Value | Where to find |
|-----|-------|---------------|
| `VITE_SUPABASE_URL` | `https://jtxmijnxrgcwjvtdlgxy.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon/public |

**كيفية إضافة:**
1. اضغط "Add a variable"
2. Key: `VITE_SUPABASE_URL`
3. Value: `https://jtxmijnxrgcwjvtdlgxy.supabase.co`
4. اضغط "Set variable"
5. كرر للمتغير الثاني

**4. Redeploy الموقع:**
```
Deploys → Trigger deploy → Deploy site
```

---

## 🔗 إعداد Custom Domain (اختياري)

### 1. في Netlify Dashboard:

**اذهب إلى:**
```
Domain settings → Add custom domain
```

**أدخل:**
```
your-domain.com
```

### 2. في مزود الدومين (Namecheap, GoDaddy, etc.):

**أضف DNS Records:**

```
Type: A
Host: @
Value: 75.2.60.5

Type: CNAME
Host: www
Value: YOUR_SITE_NAME.netlify.app
```

**أو استخدم Netlify DNS:**
- انقل الـ Nameservers إلى Netlify
- Netlify ستدير كل شيء تلقائياً

### 3. SSL Certificate:

Netlify توفر SSL مجاني تلقائياً! ✅

---

## 📊 بعد النشر - اختبار شامل

### 1. التسجيل:
```
1. افتح https://your-site.netlify.app/register
2. سجل حساب جديد
3. تحقق من وصول بريد التحقق (بالإنجليزية)
4. أدخل الكود المكون من 5 أرقام
5. يجب أن تظهر رسالة نجاح
```

### 2. تسجيل الدخول:
```
1. افتح /login
2. أدخل البريد وكلمة المرور
3. يجب أن تدخل Dashboard
4. يجب أن يكون الحساب في حالة "Pending"
```

### 3. Admin Approval (من Supabase):
```
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. نفذ: SELECT public.approve_user('USER_ID', 'ADMIN_ID');
4. المستخدم يحصل على $5 مكافأة ترحيب
```

### 4. AdGem Offers:
```
1. افتح /tasks
2. يجب أن ترى عروض AdGem (إذا أضفتها)
3. الروابط تعمل
4. Postback يعمل عند إكمال العرض
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: Build فشل

**الحل:**
```bash
# في Terminal:
cd /workspace/promohive
npm install
npm run build

# إذا نجح محلياً، المشكلة في Netlify
# تحقق من Node version في netlify.toml
```

### المشكلة: الموقع يعمل لكن البيانات لا تحمل

**الحل:**
1. تحقق من Environment Variables
2. تأكد من إضافة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`
3. Redeploy بعد إضافة المتغيرات

### المشكلة: Routing لا يعمل (404)

**الحل:**
- تأكد من وجود `netlify.toml` في root
- تحقق من redirect rules

### المشكلة: الصور لا تظهر

**الحل:**
```javascript
// في الكود، استخدم:
import imagePath from '/path/to/image.png'

// بدلاً من:
<img src="/path/to/image.png" />
```

---

## 📈 تحسينات ما بعد النشر

### 1. إضافة Analytics:

في Netlify:
```
Site settings → Analytics → Enable
```

### 2. Performance Monitoring:

استخدم:
- Lighthouse (في Chrome DevTools)
- GTmetrix
- PageSpeed Insights

### 3. Error Tracking:

أضف:
- Sentry
- LogRocket
- Rollbar

---

## 🔄 Continuous Deployment

### مع GitHub:

كل مرة تعمل `git push`:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Netlify ستعمل:
1. ✅ Pull الكود الجديد
2. ✅ npm install
3. ✅ npm run build
4. ✅ Deploy تلقائياً
5. ✅ Rollback إذا فشل

---

## 🎯 ملخص الخطوات السريعة

### للنشر الأول:

```bash
# 1. Build محلياً للتأكد
cd /workspace/promohive
npm install
npm run build

# 2. رفع على GitHub
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/promohive.git
git push -u origin main

# 3. في Netlify:
# - Import from GitHub
# - Select repo
# - Build: npm run build
# - Publish: build
# - Add Environment Variables
# - Deploy!
```

**الوقت المتوقع:** 10-15 دقيقة ⏱️

---

## ✅ قائمة التحقق النهائية

### قبل النشر:
- [x] Supabase Edge Functions مرفوعة
- [x] Secrets مضافة في Supabase
- [x] SQL migrations مطبقة
- [x] AdGem Postback URL محدث
- [x] RESEND_API_KEY مضاف

### أثناء النشر:
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Netlify site created
- [ ] Environment variables added
- [ ] First deployment successful

### بعد النشر:
- [ ] الموقع يفتح
- [ ] التسجيل يعمل
- [ ] البريد يصل
- [ ] تسجيل الدخول يعمل
- [ ] Dashboard يظهر
- [ ] AdGem يعمل (إذا أعددته)

---

## 📞 الدعم

### إذا واجهت مشاكل:

1. **تحقق من Netlify Build Logs:**
   ```
   Deploys → Last deployment → View function logs
   ```

2. **تحقق من Browser Console:**
   ```
   F12 → Console → ابحث عن أخطاء
   ```

3. **تحقق من Supabase Logs:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs
   ```

---

## 🎉 مبروك!

بعد اتباع هذا الدليل، تطبيقك سيكون:
- ✅ Live على الإنترنت
- ✅ HTTPS آمن
- ✅ Continuous Deployment
- ✅ جاهز للمستخدمين!

**رابط الموقع سيكون:**
```
https://YOUR_SITE_NAME.netlify.app
```

أو مع Custom Domain:
```
https://your-domain.com
```

---

**جاهز للنشر الآن؟ ابدأ بالخطوة 1!** 🚀
