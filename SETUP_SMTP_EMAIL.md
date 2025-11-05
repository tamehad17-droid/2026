# 📧 إعداد البريد الإلكتروني عبر SMTP - PromoHive

## 🔐 معلومات SMTP الخاصة بك (Hostinger)

```
Host: smtp.hostinger.com
Port: 465
Secure: SSL/TLS
User: promohive@globalpromonetwork.store
Password: PromoHive@2025!
From: promohive@globalpromonetwork.store
```

---

## ✅ خطوات الإعداد (3 دقائق)

### الطريقة 1: عبر Supabase Dashboard (موصى بها)

1. **افتح Supabase Edge Functions Settings:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
   ```

2. **اذهب لقسم "Secrets"**

3. **أضف Secrets التالية واحداً تلو الآخر:**

   **Secret 1:**
   ```
   Name: SMTP_HOST
   Value: smtp.hostinger.com
   ```

   **Secret 2:**
   ```
   Name: SMTP_PORT
   Value: 465
   ```

   **Secret 3:**
   ```
   Name: SMTP_USER
   Value: promohive@globalpromonetwork.store
   ```

   **Secret 4:**
   ```
   Name: SMTP_PASS
   Value: PromoHive@2025!
   ```

   **Secret 5:**
   ```
   Name: SMTP_FROM
   Value: promohive@globalpromonetwork.store
   ```

4. **احفظ كل secret**

5. **رفع Edge Function المحدثة:**
   ```bash
   cd /workspace/promohive
   supabase functions deploy send-notification-email
   ```

---

### الطريقة 2: عبر Supabase CLI

إذا كنت تستخدم Supabase CLI:

```bash
# 1. ربط المشروع
supabase link --project-ref jtxmijnxrgcwjvtdlgxy

# 2. إضافة SMTP Secrets
supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=promohive@globalpromonetwork.store
supabase secrets set SMTP_PASS="PromoHive@2025!"
supabase secrets set SMTP_FROM=promohive@globalpromonetwork.store

# 3. رفع Edge Function
supabase functions deploy send-notification-email
```

---

## 🔄 رفع Edge Function المحدثة

Edge Function تم تحديثها لاستخدام SMTP بدلاً من Resend. يجب رفعها:

### الخيار 1: عبر Supabase CLI

```bash
cd /workspace/promohive
supabase functions deploy send-notification-email
```

### الخيار 2: رفع يدوي عبر Dashboard

1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions

2. إذا كانت Function موجودة:
   - احذفها
   - أنشئها من جديد

3. انسخ محتوى:
   ```
   /workspace/promohive/supabase/functions/send-notification-email/index.ts
   ```

4. الصقه في Dashboard

5. احفظ و Deploy

---

## 🧪 اختبار SMTP

### 1. اختبار من Terminal:

```bash
# اختبار إرسال بريد
node scripts/test-email.js your-email@gmail.com
```

### 2. اختبار من Supabase Dashboard:

1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions

2. اختر: `send-notification-email`

3. اضغط "Invoke"

4. استخدم:
```json
{
  "type": "welcome",
  "to": "your-test-email@gmail.com",
  "data": {
    "fullName": "Test User",
    "loginUrl": "https://promohive.com/login"
  }
}
```

5. يجب أن يصل البريد من: **promohive@globalpromonetwork.store**

---

## 📊 ما تم تغييره:

### قبل (Resend API):
```typescript
// كان يستخدم Resend API
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
await fetch('https://api.resend.com/emails', {...});
```

### بعد (SMTP):
```typescript
// الآن يستخدم SMTP مباشرة
import { SMTPClient } from "denomailer";

const client = new SMTPClient({
  connection: {
    hostname: 'smtp.hostinger.com',
    port: 465,
    tls: true,
    auth: {
      username: 'promohive@globalpromonetwork.store',
      password: 'PromoHive@2025!',
    },
  },
});

await client.send({
  from: 'promohive@globalpromonetwork.store',
  to: userEmail,
  subject: subject,
  html: htmlContent,
});
```

---

## 🎁 الميزات:

### ✅ البريد سيُرسل من:
```
promohive@globalpromonetwork.store
```

### ✅ يستخدم:
- SMTP خاص بك (Hostinger)
- بدون حدود (على حسب خطتك)
- بريدك الرسمي

### ✅ يعمل تلقائياً عند:
- الموافقة على مستخدم جديد
- استدعاء Edge Function

---

## ⚠️ استكشاف الأخطاء

### "SMTP connection failed"

**الأسباب المحتملة:**
1. SMTP credentials خاطئة
2. Port محجوب
3. Hostinger يحتاج تفعيل SMTP

**الحلول:**
```bash
# 1. تحقق من credentials
# تأكد أن البريد والباسورد صحيحين

# 2. جرب Port مختلف
# Port 465 (SSL) أو Port 587 (TLS)

# 3. تحقق من Hostinger
# افتح cPanel → Email Accounts
# تأكد أن الحساب مفعل
```

### "Authentication failed"

```bash
# تحقق من:
1. البريد: promohive@globalpromonetwork.store
2. الباسورد: PromoHive@2025!
3. الحساب مفعل في Hostinger
```

### "Email not received"

```bash
# تحقق من:
1. Spam/Junk folder
2. Supabase Logs
3. Hostinger Email Logs (cPanel)
```

---

## 📋 قائمة التحقق:

- [ ] إضافة SMTP_HOST في Secrets
- [ ] إضافة SMTP_PORT في Secrets
- [ ] إضافة SMTP_USER في Secrets
- [ ] إضافة SMTP_PASS في Secrets
- [ ] إضافة SMTP_FROM في Secrets
- [ ] رفع Edge Function المحدثة
- [ ] اختبار إرسال بريد
- [ ] التحقق من استلام البريد

---

## 🚀 بعد الإعداد:

```bash
# شغل التطبيق
npm run dev

# افتح
http://localhost:5173/users-management

# وافق على مستخدم
# سيصله بريد من: promohive@globalpromonetwork.store ✅
```

---

## 📊 مقارنة بين Resend و SMTP:

| الميزة | Resend (قديم) | SMTP (جديد) |
|--------|---------------|-------------|
| البريد المرسل | resend.dev | promohive@globalpromonetwork.store ✅ |
| الحدود | 100/يوم (مجاناً) | حسب خطة Hostinger ✅ |
| التكلفة | مجاناً/مدفوع | مجاناً مع الاستضافة ✅ |
| الثقة | متوسطة | عالية (بريد رسمي) ✅ |
| Spam Rate | متوسط | منخفض ✅ |

---

## 🎉 النتيجة:

```
╔════════════════════════════════════════════╗
║                                            ║
║   ✅ SMTP جاهز للاستخدام!                 ║
║                                            ║
║   البريد سيُرسل من:                       ║
║   promohive@globalpromonetwork.store       ║
║                                            ║
║   أكثر احترافية وأقل احتمالية للـ Spam    ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 📞 دعم Hostinger:

- cPanel: تسجيل دخول من حسابك
- Email Accounts: إدارة حسابات البريد
- SMTP Settings: تحقق من الإعدادات

---

**تاريخ:** 2025-10-30  
**الحالة:** ✅ جاهز للتطبيق  
**Provider:** Hostinger SMTP  
**البريد:** promohive@globalpromonetwork.store
