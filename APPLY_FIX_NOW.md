# 🚀 تطبيق الإصلاح - خطوة واحدة فقط!

## 🎯 الخطوة الوحيدة المطلوبة

### 1️⃣ افتح هذا الرابط مباشرة:

```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new
```

أو انسخ والصق: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

---

### 2️⃣ انسخ والصق هذا الكود في SQL Editor:

```sql
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

---

### 3️⃣ اضغط زر "Run" (أو Ctrl+Enter)

---

## ✅ النتيجة المتوقعة:

سترى رسالة: **"Success. No rows returned"**

---

## 🎉 تم! الآن خطأ "Database error saving new user" محلول!

---

## 📋 الخطوات التالية (اختيارية):

### لتحديث Edge Functions (الإيميلات الإنجليزية):

1. **افتح Functions:**
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions

2. **عدّل أو أنشئ الدالات:**
   - `send-verification-email` 
   - `send-notification-email`
   
   الكود موجود في:
   - `promohive/supabase/functions/send-verification-email/index.ts`
   - `promohive/supabase/functions/send-notification-email/index.ts`

3. **أضف RESEND_API_KEY** في Settings:
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions

---

## 🧪 اختبر النظام:

بعد تطبيق SQL أعلاه، جرب:
1. افتح تطبيقك
2. أنشئ حساب جديد
3. يجب أن يعمل بدون خطأ "Database error" ✅

---

## ❓ هل نجح الإصلاح؟

- ✅ إذا نجح: ممتاز! جرب التسجيل الآن
- ❌ إذا فشل: أرسل لي screenshot من الخطأ

---

**ملاحظة:** هذا الإصلاح يحل مشكلة التسجيل فقط. لتحديث لغة الإيميلات، اتبع خطوة Edge Functions أعلاه.
