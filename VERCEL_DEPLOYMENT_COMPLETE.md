# ✅ Vercel Deployment - Complete Guide

## 🎉 تم النشر بنجاح!

### 📊 معلومات النشر:

**Project Name:** 4-main  
**Organization:** promohive  
**Production URL:** https://4-main-h2v5hq3cp-promohive.vercel.app  
**Inspect URL:** https://vercel.com/promohive/4-main  
**GitHub Repo:** https://github.com/tamehad17-droid/2026

---

## ✅ ما تم إنجازه:

### 1. النشر على Vercel ✅
- ✅ تم رفع المشروع على GitHub
- ✅ تم ربط المشروع بـ Vercel
- ✅ تم النشر بنجاح على Production
- ✅ Build نجح بدون أخطاء

### 2. إعدادات المتغيرات البيئية ✅
تم إضافة المتغيرات التالية:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_ADSTERRA_API_KEY`
- ✅ `VITE_ADSTERRA_PLACEMENT_ID`
- ✅ `VITE_ADGEM_APP_ID`
- ✅ `VITE_ADMIN_EMAIL`
- ✅ `VITE_APP_URL`
- ✅ `VITE_DOMAIN`

---

## 🔧 الخطوات المتبقية (يدوياً):

### 1. إضافة باقي المتغيرات البيئية

اذهب إلى: https://vercel.com/promohive/4-main/settings/environment-variables

أضف المتغيرات التالية:

```env
# AdGem API Keys (طويلة جداً - من ملف .env)
VITE_ADGEM_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
VITE_ADGEM_POSTBACK_KEY=bb6h7hh67id3809bi7blmekd
VITE_ADGEM_POSTBACK_URL=https://globalpromonetwork.online/api/adgem-postback
VITE_ADGEM_REPORTING_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...

# Adsterra URLs
VITE_ADSTERRA_DIRECT_URL=https://www.effectivegatecpm.com/ybajxvj6e9?key=105f8b3462908e23fb163a15bb1c7aa4
VITE_ADSTERRA_PUBLISHER_ID=589dcbfb591de266fb90284eccb0725d

# Email SMTP
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=465
VITE_SMTP_SECURE=true
VITE_SMTP_USER=admin@globalpromonetwork.online
VITE_SMTP_PASS=Ibrahem$811997
VITE_SMTP_FROM=admin@globalpromonetwork.online

# Admin Credentials
VITE_ADMIN_PASSWORD=tW5T34Uzh3UEw
VITE_ADMIN_NAME=promohive

# App Config
VITE_APP_NAME=PromoHive
VITE_JWT_SECRET=promohive_secret_key_2025_secure_random_string
```

**ملاحظة:** القيم الكاملة موجودة في ملف `.env` داخل المشروع.

---

### 2. ربط الدومين `globalpromonetwork.online`

#### الطريقة 1: عبر Vercel Dashboard
1. اذهب إلى: https://vercel.com/promohive/4-main/settings/domains
2. اضغط "Add Domain"
3. أدخل: `globalpromonetwork.online`
4. اتبع التعليمات لتحديث DNS

#### الطريقة 2: إذا كان الدومين مربوط بمشروع آخر
1. اذهب إلى المشروع القديم
2. احذف الدومين من المشروع القديم
3. ثم أضفه للمشروع الجديد `4-main`

---

### 3. إعدادات DNS للدومين

بعد إضافة الدومين في Vercel، أضف السجلات التالية في **Vercel DNS**:

#### A. سجلات Vercel (للموقع)
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### B. سجلات البريد الإلكتروني (Hostinger SMTP)

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@globalpromonetwork.online

# MX Records
Type: MX
Name: @
Priority: 10
Value: mx1.hostinger.com

Type: MX
Name: @
Priority: 20
Value: mx2.hostinger.com
```

#### C. سجل DKIM (من Hostinger)
1. سجل دخول إلى: https://hpanel.hostinger.com
2. اذهب إلى: Emails → Email Accounts
3. اختر الدومين `globalpromonetwork.online`
4. اضغط "DKIM Settings"
5. انسخ:
   - **Name:** (مثل `default._domainkey`)
   - **Value:** (نص طويل يبدأ بـ `v=DKIM1; k=rsa; p=...`)
6. أضفهما كسجل TXT في Vercel DNS

---

### 4. إعادة النشر بعد إضافة المتغيرات

بعد إضافة جميع المتغيرات:
1. اذهب إلى: https://vercel.com/promohive/4-main
2. اضغط "Deployments"
3. اختر آخر deployment
4. اضغط "Redeploy"
5. أو: اضغط "Deploy" مباشرة من الصفحة الرئيسية

---

## 🧪 اختبار المشروع

### 1. اختبار الموقع المؤقت
افتح: https://4-main-h2v5hq3cp-promohive.vercel.app

### 2. تسجيل دخول الأدمن
- **URL:** https://4-main-h2v5hq3cp-promohive.vercel.app/login
- **Email:** admin@globalpromonetwork.online
- **Password:** tW5T34Uzh3UEw

### 3. اختبار المميزات
- ✅ إنشاء مهمة جديدة من `/tasks-management`
- ✅ التحقق من ظهورها في `/tasks-list`
- ✅ اختبار نظام المراجعة في `/proofs-review`
- ✅ اختبار العروض من ADSTERRA و ADGEM

---

## 📧 اختبار البريد الإلكتروني

بعد إضافة سجلات DNS:
1. انتظر 1-24 ساعة حتى تنتشر السجلات
2. اختبر إرسال بريد من النظام
3. تحقق من وصول البريد وعدم ذهابه للـ Spam

**أداة الاختبار:**
- https://mxtoolbox.com/SuperTool.aspx
- أدخل: `globalpromonetwork.online`
- تحقق من: SPF, DMARC, MX, DKIM

---

## 🔗 روابط مهمة

**Vercel:**
- Dashboard: https://vercel.com/promohive/4-main
- Settings: https://vercel.com/promohive/4-main/settings
- Domains: https://vercel.com/promohive/4-main/settings/domains
- Environment Variables: https://vercel.com/promohive/4-main/settings/environment-variables

**GitHub:**
- Repository: https://github.com/tamehad17-droid/2026

**Supabase:**
- Dashboard: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy

**Hostinger:**
- Email Settings: https://hpanel.hostinger.com

---

## 📝 ملاحظات مهمة

1. **المتغيرات البيئية:**
   - يجب إضافة جميع المتغيرات من ملف `.env`
   - بعد الإضافة، قم بإعادة النشر (Redeploy)

2. **الدومين:**
   - إذا كان مربوط بمشروع آخر، احذفه أولاً
   - ثم أضفه للمشروع الجديد

3. **DNS:**
   - سجلات Vercel للموقع
   - سجلات Hostinger للبريد
   - لا تتعارض مع بعضها

4. **البريد:**
   - يحتاج 1-24 ساعة حتى تنتشر سجلات DNS
   - DKIM مهم جداً لتجنب Spam

---

## ✅ قائمة التحقق النهائية

- [x] نشر المشروع على Vercel
- [x] ربط GitHub Repository
- [x] إضافة بعض المتغيرات البيئية
- [ ] إضافة باقي المتغيرات البيئية (يدوياً)
- [ ] ربط الدومين `globalpromonetwork.online`
- [ ] إضافة سجلات DNS (Vercel + Email)
- [ ] إضافة سجل DKIM من Hostinger
- [ ] إعادة النشر بعد المتغيرات
- [ ] اختبار تسجيل دخول الأدمن
- [ ] اختبار نظام المهام
- [ ] اختبار البريد الإلكتروني

---

**تاريخ النشر:** 5 نوفمبر 2025  
**الحالة:** نشر أولي ناجح - يحتاج خطوات يدوية لإكمال الإعداد  
**الرابط المؤقت:** https://4-main-h2v5hq3cp-promohive.vercel.app
