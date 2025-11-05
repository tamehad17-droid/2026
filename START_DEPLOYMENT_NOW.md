# 🚀 ابدأ النشر الآن - PromoHive

## ✅ نعم! جاهز للنشر

**الكود 100% جاهز!** لكن قبل النشر، يجب إتمام 3 خطوات (15-20 دقيقة):

---

## 📋 قبل النشر - قائمة تحقق:

### ✅ ما تم إنجازه (لا تحتاج لفعل شيء):
- ✅ الكود باللغة الإنجليزية بالكامل
- ✅ SQL migrations جاهزة
- ✅ Edge Functions كود جاهز
- ✅ Netlify configuration جاهز
- ✅ Documentation كامل
- ✅ GitHub repository محدث
- ✅ AdGem integration code جاهز

### ⏳ ما يجب عليك فعله (15-20 دقيقة):

---

## 🎯 الخطوات المطلوبة قبل النشر:

### الخطوة 1️⃣: رفع Edge Functions على Supabase (10 دقائق) ⚠️ **مطلوب**

#### A) adgem-postback
1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
2. اضغط "Create a new function"
3. الاسم: `adgem-postback`
4. افتح ملف `COPY_ADGEM_POSTBACK.txt` وانسخ كل المحتوى
5. الصقه في Supabase
6. اضغط "Deploy"

#### B) send-verification-email (إذا لم يكن مرفوع)
1. نفس الخطوات
2. الاسم: `send-verification-email`
3. الكود من: `FUNCTION_1_CODE.txt`
4. Deploy

#### C) send-notification-email (إذا لم يكن مرفوع)
1. نفس الخطوات
2. الاسم: `send-notification-email`
3. الكود من: `FUNCTION_2_CODE.txt`
4. Deploy

#### D) إضافة Secrets في Supabase
افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions

في قسم "Secrets"، أضف:
```
ADGEM_API_KEY = eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODYxNWM5MjMxZGJlNzA1NDBkYzNkNTE4NTMwZTk1MmI5NzQ2Y2FmZmI2ZTIyZjUyODY4NGFiZmE5NjgzMmYwMjBlZDA2Y2VkMjY4YzQ4OTkiLCJpYXQiOjE3NjE3ODc2MDUuMjE2Njg1LCJuYmYiOjE3NjE3ODc2MDUuMjE2Njg3LCJleHAiOjE3OTMzMjM2MDUuMjEzMTI1LCJzdWIiOiIyODk2NyIsInNjb3BlcyI6W119.YXjX9d5nch4wVQcEHXmsIjafQMkzHyKVRWC0q-1No_T1CrxkpPqExG5s032kQcq-x1hS-Lhu-bjIeqp7yqXv401ksi4RO-YYyC9Xp1o2kTKAkIk0Vq_SKB5UirdPeyqK737b8pLzi_QntUTTFVhW9WvrJkE26SwP-uzzoNpnmDRR6gp2q4o_x_HUSlkZSRD5cKpHO4tAXvyZsDT5ipQfADNxJcU9oNjBdcpzftV8cowDkvJGcYX5GbOYs4DBir-530DGg3Y-fUe22rtTNArIfw9WXC-781aE2-l3jQGjGfec-9yvS6dZPvOsBQQr3d5fOu2_6RrhFHxufv5NxWZSc2hVLzCU8_vm__dpbOJAU6oaTJNM8PdqdMISfDta-E1kv_6YmowNKbqr63LzN617Cd1jTin70vXJtd367Faff4UBIZNScyu-m8Sxjmm9B_Uc5qhvckUAd7m6m5MaV3nPZMkbTdYLjeFxPWEAuKCP_5EXGS4BOOHhcvR2f5X9H1bh3yMuy-UZu1aGT8kPDHgZoxJjHNmvzJ6_PlVuC9fuXsBLgaxSr5q5xPh5S72HmqmhM1GSx8AjU6iuV6zmSIs821PYpsG1OLlb9vrlXgMInIqSjG_ClOvjZnmIqNuYBaaFe_T7X0M4aYfI_tsaz3_Co0rHRZDcD78Ic9o6dVzjm1s

ADGEM_PUBLISHER_ID = 31283
ADGEM_APP_ID = 31283
ADGEM_POSTBACK_KEY = 6b133h6i0674mfcca9bnfaid
RESEND_API_KEY = [احصل عليه من resend.com/api-keys]
```

**⚠️ مهم:** احصل على RESEND_API_KEY من: https://resend.com/api-keys

---

### الخطوة 2️⃣: تحديث Postback في AdGem (2 دقيقة) ⚠️ **مطلوب**

1. افتح: https://dashboard.adgem.com/apps/31283/edit

2. في حقل "Postback URL"، غيّره إلى:
```
https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/adgem-postback?appid={app_id}&userid={player_id}&offerid={offer_id}&amount={amount}&payout={payout}&transaction_id={transaction_id}&offer_name={offer_name}
```

3. اضغط "Save Changes"

---

### الخطوة 3️⃣: النشر على Netlify (5-8 دقائق) ⚠️ **مطلوب**

#### الطريقة A: عبر GitHub (موصى بها)

1. **اذهب إلى Netlify:**
   ```
   https://app.netlify.com/
   ```

2. **اضغط "Add new site"** → "Import an existing project"

3. **اختر "Deploy with GitHub"**

4. **اختر Repository:**
   ```
   needh986-cloud/1
   ```

5. **اختر Branch:**
   ```
   cursor/identify-application-language-3813
   ```

6. **إعدادات Build:**
   ```
   Base directory: promohive
   Build command: npm run build
   Publish directory: promohive/build
   ```

7. **اضغط "Deploy site"**

8. **بعد Deploy، أضف Environment Variables:**
   - Site settings → Environment variables
   - أضف:
     ```
     VITE_SUPABASE_URL = https://jtxmijnxrgcwjvtdlgxy.supabase.co
     VITE_SUPABASE_ANON_KEY = [من Supabase → Settings → API → anon key]
     ```

9. **Redeploy:**
   - Deploys → Trigger deploy → Deploy site

---

## ✅ بعد إتمام الخطوات الثلاثة:

**تطبيقك سيكون:**
- ✅ Live على الإنترنت
- ✅ HTTPS آمن
- ✅ التسجيل يعمل
- ✅ بريد التحقق يُرسل (بالإنجليزية)
- ✅ AdGem Postback يعمل
- ✅ جاهز للمستخدمين!

---

## ⏱️ الوقت المتوقع:

| الخطوة | الوقت |
|--------|-------|
| 1. رفع Edge Functions | 10 دقائق |
| 2. تحديث AdGem | 2 دقيقة |
| 3. نشر Netlify | 5-8 دقائق |
| **المجموع** | **17-20 دقيقة** |

---

## 🎯 ابدأ الآن:

### أسهل طريقة:

1. **افتح 3 تبويبات في المتصفح:**
   - Tab 1: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
   - Tab 2: https://dashboard.adgem.com/apps/31283/edit
   - Tab 3: https://app.netlify.com/

2. **افتح الملفات في محرر نصوص:**
   - COPY_ADGEM_POSTBACK.txt
   - FUNCTION_1_CODE.txt
   - FUNCTION_2_CODE.txt

3. **اتبع الخطوات أعلاه واحدة تلو الأخرى**

---

## 🆘 إذا واجهت مشكلة:

### Supabase:
- تأكد من نسخ الكود كاملاً
- لا تنسى إضافة Secrets
- تحقق من عدم وجود أخطاء في الكود

### AdGem:
- تأكد من نسخ URL كاملاً
- لا تنسى اضغط "Save"

### Netlify:
- تأكد من اختيار Branch الصحيح
- لا تنسى إضافة Environment Variables
- Redeploy بعد إضافة المتغيرات

---

## 📞 أخبرني:

بعد إتمام كل خطوة، أخبرني:
- ✅ "تم رفع Edge Functions"
- ✅ "تم تحديث AdGem"
- ✅ "تم النشر على Netlify"

وسأساعدك في الخطوة التالية أو في أي مشكلة! 🤝

---

## 🎉 جاهز للبدء؟

**افتح Tab 1 (Supabase) وابدأ بالخطوة 1!**

رابط مباشر: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions

**انسخ الكود من:** `COPY_ADGEM_POSTBACK.txt`

**لنبدأ!** 🚀
