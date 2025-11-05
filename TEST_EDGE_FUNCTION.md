# 🧪 كيفية اختبار Edge Function وقراءة الأخطاء

## الطريقة 1: من Supabase Dashboard

### الخطوات:
1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
2. اضغط على `send-verification-email`
3. اضغط "Invoke"
4. في الـ Body، ضع:
```json
{
  "email": "your_real_email@gmail.com",
  "verificationCode": "12345",
  "fullName": "Test User"
}
```
5. اضغط "Send"
6. **اقرأ Response بعناية:**

### النتائج المحتملة:

#### ✅ نجح (200 OK):
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "emailId": "abc123..."
}
```
**ويصلك بريد!**

#### ❌ فشل - RESEND_API_KEY ناقص (500):
```json
{
  "error": "Failed to send verification code",
  "details": "RESEND_API_KEY not configured"
}
```
**الحل:** أضف RESEND_API_KEY في Secrets

#### ❌ فشل - بيانات ناقصة (400):
```json
{
  "error": "Missing required fields"
}
```
**الحل:** تأكد من إرسال email و verificationCode

#### ❌ فشل - Resend API خطأ (500):
```json
{
  "error": "Failed to send verification code",
  "details": "Resend API error: Invalid API key"
}
```
**الحل:** تأكد من صحة RESEND_API_KEY في https://resend.com/api-keys

---

## الطريقة 2: من Browser Console

### افتح Console (F12) ونفذ:

```javascript
fetch('https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/send-verification-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    verificationCode: '12345',
    fullName: 'Test User'
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e))
```

**استبدل `YOUR_ANON_KEY` بـ:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.wyPqe5j3VeCYGOaYmN6e9Yp-LW4n7bUxsOVwCCpJM6o
```

---

## الطريقة 3: فحص Logs

### في Supabase Dashboard:

1. افتح Functions
2. اضغط على `send-verification-email`
3. اضغط "Logs" أو "Invocations"
4. ستجد سجل كل الطلبات والأخطاء

**ابحث عن:**
- Status Code (200 = نجاح، 400/500 = فشل)
- Error messages
- Response body

---

## 🔧 حل المشاكل الشائعة:

### المشكلة 1: "RESEND_API_KEY not configured"
```
الحل:
1. https://resend.com/api-keys
2. Create API Key
3. انسخه
4. أضفه في Supabase Settings → Functions → Secrets
```

### المشكلة 2: "Invalid API key"
```
الحل:
1. تأكد أن المفتاح صحيح
2. تأكد أنه لم يُحذف من Resend
3. أنشئ مفتاح جديد وجرب
```

### المشكلة 3: "Resend API error: 422"
```
الحل:
المشكلة في from address
- للاختبار: استخدم "onboarding@resend.dev"
- للإنتاج: حقق domain في Resend
```

### المشكلة 4: البريد لم يصل
```
الحل:
1. تحقق من مجلد Spam
2. تحقق من Resend Dashboard → Emails
3. تحقق من Status (delivered / bounced / failed)
```

---

## ✅ التحقق من إعداد RESEND:

### الخطوة 1: احصل على API Key
```
https://resend.com/signup (مجاني)
https://resend.com/api-keys
→ Create API Key
→ Name: PromoHive
→ Copy key (starts with re_)
```

### الخطوة 2: أضفه في Supabase
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
→ Secrets
→ Add new secret
→ Name: RESEND_API_KEY
→ Value: [paste key]
→ Save
```

### الخطوة 3: انتظر 10 ثواني
(Supabase يحدّث Secrets)

### الخطوة 4: جرب Invoke مرة أخرى

---

## 📊 Resend Free Plan:

```
✅ 100 emails/day
✅ 3,000 emails/month
✅ Test mode: onboarding@resend.dev
✅ مجاناً 100%
```

للإنتاج الكامل:
- حقق domain خاص بك في Resend
- استخدم from: noreply@yourdomain.com
