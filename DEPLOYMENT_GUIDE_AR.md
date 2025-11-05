# 🚀 دليل النشر السريع - PromoHive

## معلومات المشروع
- **Supabase URL**: https://jtxmijnxrgcwjvtdlgxy.supabase.co
- **Project ID**: jtxmijnxrgcwjvtdlgxy

---

## الخطوة 1: إصلاح قاعدة البيانات ✅

### افتح SQL Editor:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new
```

### انسخ والصق هذا الكود ثم اضغط "Run":

```sql
-- Fix user registration trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_with_verification()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    referral_code_text TEXT;
BEGIN
    referral_code_text := UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    
    INSERT INTO public.user_profiles (
        id, email, full_name, role, status, 
        approval_status, email_verified, referral_code, 
        level, welcome_bonus_used
    )
    VALUES (
        NEW.id, NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
        'pending'::user_status, 'pending', false, 
        referral_code_text, 0, false
    );
    
    RETURN NEW;
END;
$$;
```

✅ **النتيجة المتوقعة**: رسالة "Success. No rows returned"

---

## الخطوة 2: رفع Edge Functions

### 2.1 - الدالة الأولى: send-verification-email

1. **افتح Edge Functions:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
   ```

2. اضغط **"Create a new function"** أو عدّل الدالة الموجودة

3. **اسم الدالة:** `send-verification-email`

4. **الكود:** انسخ من ملف:
   ```
   promohive/supabase/functions/send-verification-email/index.ts
   ```

5. اضغط **"Deploy"**

---

### 2.2 - الدالة الثانية: send-notification-email

كرر نفس الخطوات السابقة مع:
- **اسم الدالة:** `send-notification-email`
- **الكود:** انسخ من:
   ```
   promohive/supabase/functions/send-notification-email/index.ts
   ```

---

## الخطوة 3: إضافة RESEND_API_KEY (مهم جداً!) ⚠️

### 3.1 - احصل على Resend API Key:
1. اذهب إلى: https://resend.com/api-keys
2. سجل حساب مجاني (إذا لم يكن لديك)
3. انقر **"Create API Key"**
4. انسخ المفتاح

### 3.2 - أضف المفتاح في Supabase:
1. اذهب إلى:
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
   ```
2. انزل إلى قسم **"Secrets"**
3. اضغط **"Add new secret"**
4. **Name:** `RESEND_API_KEY`
5. **Value:** [المفتاح الذي نسخته من Resend]
6. اضغط **"Save"**

---

## الخطوة 4: اختبار النظام 🧪

### اختبر التسجيل:
1. افتح تطبيقك
2. حاول إنشاء حساب جديد
3. يجب أن يعمل بدون أخطاء
4. يجب أن يصل بريد التحقق

### إذا واجهت مشاكل:
- تحقق من وجود `RESEND_API_KEY` في Secrets
- تحقق من Logs في Edge Functions
- تأكد من أن الـ SQL migration تم تنفيذه بنجاح

---

## ملخص التغييرات المطبقة ✅

1. ✅ تحويل جميع النصوص من العربية إلى الإنجليزية
2. ✅ إصلاح خطأ "Database error saving new user"
3. ✅ تحديث بريد التحقق الإلكتروني
4. ✅ تحديث رسائل الإشعارات

---

## روابط مفيدة 🔗

- **SQL Editor**: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new
- **Edge Functions**: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
- **Settings**: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
- **Logs**: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/edge-functions

---

## الدعم الفني 💬

إذا واجهت أي مشكلة، تواصل معي وأعطني:
1. رسالة الخطأ كاملة
2. Screenshot من Console
3. الخطوة التي فشلت فيها
