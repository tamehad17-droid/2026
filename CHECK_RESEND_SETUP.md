# ✅ كيفية التحقق من إعداد Resend API

## الخطوة 1: تحقق من Supabase Secrets

### افتح:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
```

### يجب أن ترى في قسم "Secrets":
```
RESEND_API_KEY = re_xxxxx...
```

---

## الخطوة 2: تحقق من Edge Functions

### افتح:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
```

### يجب أن ترى:
```
✅ send-verification-email (Status: Active)
✅ send-notification-email (Status: Active)
```

---

## الخطوة 3: اختبار الإرسال

### في Supabase Functions، افتح `send-verification-email`

### اضغط "Invoke" واستخدم هذا الـ payload:
```json
{
  "email": "your_test_email@gmail.com",
  "verificationCode": "12345",
  "fullName": "Test User"
}
```

### يجب أن ترى:
```json
{
  "success": true,
  "message": "Verification code has been sent to your email"
}
```

---

## الخطوة 4: إذا لم يصل البريد

### تحقق من:

1. **RESEND_API_KEY صحيح؟**
   - افتح Resend Dashboard
   - تحقق من API Keys
   - انسخ المفتاح مرة أخرى

2. **From address صحيح؟**
   - في `send-verification-email/index.ts`
   - يجب أن يكون: `from: 'onboarding@resend.dev'`
   - أو domain محقق في Resend

3. **البريد في Spam؟**
   - تحقق من مجلد الرسائل غير المرغوب فيها

---

## 🎯 للحصول على RESEND_API_KEY:

### 1. سجل في Resend (مجاناً):
```
https://resend.com/signup
```

### 2. احصل على API Key:
```
https://resend.com/api-keys
→ Create API Key
→ Name: PromoHive
→ Type: Sending access
→ Copy the key (starts with re_)
```

### 3. أضفه في Supabase:
```
Settings → Edge Functions → Secrets
→ Add new secret
→ Name: RESEND_API_KEY
→ Value: [paste key]
→ Save
```

---

## 📊 حدود Resend Free Plan:

```
✅ 100 emails/day
✅ 3,000 emails/month
✅ مجاناً تماماً
```

---

## ⚠️ ملاحظة مهمة:

رسالة "Set up custom SMTP" في Supabase Auth **ليست** عن نظام التحقق الخاص بك!

نظامك يستخدم:
- ✅ Edge Functions
- ✅ Resend API
- ✅ لا يعتمد على Supabase Auth SMTP

يمكنك تجاهل تلك الرسالة! ✅
