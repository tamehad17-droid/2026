# إصلاحات PromoHive - دليل التطبيق السريع

## 📋 نظرة عامة

تم إصلاح المشاكل التالية في مشروع PromoHive:

1. ✅ المستخدمون الجدد لا يظهرون في صفحة الأدمن
2. ✅ عدم إرسال البريد الإلكتروني بعد موافقة الأدمن
3. ✅ مشاكل في حساب الإحصائيات
4. ✅ مشاكل في الفلترة والبحث

## 📦 الملفات المرفقة

1. **promohive-fixed.tar.gz** - المشروع الكامل مع الإصلاحات
2. **FIXES_APPLIED.md** - تفاصيل الإصلاحات المطبقة
3. **TESTING_CHECKLIST.md** - قائمة اختبار شاملة
4. **README_FIXES_AR.md** - هذا الملف

## 🚀 خطوات التطبيق السريعة

### الخطوة 1: استخراج الملفات

```bash
tar -xzf promohive-fixed.tar.gz
cd promohive
```

### الخطوة 2: تطبيق إصلاحات قاعدة البيانات

1. افتح **Supabase Dashboard**
2. اذهب إلى **SQL Editor**
3. افتح الملف: `supabase/migrations/20241031_fix_admin_approval_issues.sql`
4. انسخ المحتوى بالكامل
5. الصقه في SQL Editor
6. اضغط **Run** لتنفيذ الاستعلامات

### الخطوة 3: التحقق من Environment Variables

تأكد من أن المتغيرات التالية محددة في Supabase:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=promohive@globalpromonetwork.store
SMTP_PASS=your_password_here
SMTP_FROM=promohive@globalpromonetwork.store
```

**كيفية إضافة المتغيرات:**
1. Supabase Dashboard → Project Settings
2. Edge Functions → Environment Variables
3. أضف كل متغير على حدة

### الخطوة 4: نشر Edge Functions

```bash
# تأكد من تسجيل الدخول إلى Supabase CLI
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# نشر Edge Functions
supabase functions deploy send-notification-email
```

### الخطوة 5: رفع الكود إلى Netlify (أو منصة الاستضافة)

```bash
# بناء المشروع
npm install
npm run build

# رفع إلى Netlify
netlify deploy --prod
```

## 🔍 التحقق من نجاح الإصلاحات

### اختبار سريع (5 دقائق)

1. **تسجيل مستخدم جديد:**
   - افتح `/register`
   - سجل مستخدم جديد
   - يجب أن تظهر رسالة "Awaiting Admin Approval"

2. **التحقق من ظهور المستخدم:**
   - سجل دخول كأدمن
   - اذهب إلى `/users-management`
   - يجب أن يظهر المستخدم الجديد في القائمة

3. **اختبار الموافقة:**
   - اضغط على زر "Approve" بجانب المستخدم
   - يجب أن تظهر رسالة نجاح
   - يجب أن يصل بريد إلكتروني للمستخدم

4. **التحقق من البريد:**
   - تحقق من صندوق البريد الوارد للمستخدم
   - يجب أن يصل بريد ترحيبي يذكر البونص $5

## 📊 التحقق من قاعدة البيانات

استخدم هذه الاستعلامات للتحقق:

```sql
-- عرض جميع المستخدمين مع حالاتهم
SELECT id, email, full_name, approval_status, status, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- عرض المستخدمين المعلقين
SELECT id, email, full_name, created_at 
FROM user_profiles 
WHERE approval_status = 'pending' OR approval_status IS NULL;

-- عرض آخر العمليات في audit_logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- عرض transactions البونص
SELECT * FROM transactions 
WHERE type = 'bonus' 
ORDER BY created_at DESC;
```

## 🐛 استكشاف الأخطاء

### المستخدمون لا يظهرون في لوحة الأدمن

**الحل:**
1. تحقق من RLS Policies:
```sql
-- تأكد من أن الأدمن يمكنه رؤية جميع المستخدمين
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

2. تحقق من دور المستخدم:
```sql
SELECT id, email, role FROM user_profiles WHERE email = 'admin@example.com';
```

### البريد الإلكتروني لا يصل

**الحل:**
1. تحقق من Edge Function logs:
   - Supabase Dashboard → Edge Functions → Logs

2. اختبر Edge Function يدوياً:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-notification-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": {
      "fullName": "Test User",
      "loginUrl": "https://your-site.com/login"
    }
  }'
```

3. تحقق من SMTP settings:
   - تأكد من أن كلمة مرور SMTP صحيحة
   - تأكد من أن المنفذ 465 مفتوح

### خطأ "Database error saving new user"

**الحل:**
1. تأكد من تنفيذ migration الجديد
2. تحقق من trigger:
```sql
-- تحقق من وجود trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- إعادة إنشاء trigger إذا لزم الأمر
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_with_verification();
```

### الإحصائيات غير صحيحة

**الحل:**
1. استخدم دالة `get_dashboard_stats()` الجديدة:
```sql
SELECT * FROM get_dashboard_stats();
```

2. تحقق من البيانات:
```sql
-- عد المستخدمين يدوياً
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE approval_status = 'pending' OR approval_status IS NULL) as pending,
  COUNT(*) FILTER (WHERE approval_status = 'approved' AND status = 'active') as active
FROM user_profiles;
```

## 📝 ملاحظات مهمة

### 1. البريد الإلكتروني بعد التسجيل

حالياً، لا يتم إرسال بريد إلكتروني للمستخدم **مباشرة بعد التسجيل**. البريد يُرسل فقط **بعد موافقة الأدمن**.

إذا كنت تريد إرسال بريد تأكيد بعد التسجيل مباشرة، يمكنك:

**الخيار 1: إضافة trigger في قاعدة البيانات**
```sql
-- إضافة trigger لإرسال بريد بعد التسجيل
CREATE OR REPLACE FUNCTION send_registration_email()
RETURNS TRIGGER AS $$
BEGIN
  -- استدعاء Edge Function لإرسال البريد
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', 'registration_pending',
      'to', NEW.email,
      'data', jsonb_build_object('fullName', NEW.full_name)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_registration
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION send_registration_email();
```

**الخيار 2: إضافة استدعاء في Frontend**
في `RegistrationForm.jsx`، بعد السطر 117:
```javascript
// Send registration confirmation email
try {
  await supabase.functions.invoke('send-notification-email', {
    body: {
      type: 'registration_pending',
      to: formData.email,
      data: {
        fullName: formData.fullName
      }
    }
  });
} catch (emailError) {
  console.error('Failed to send registration email:', emailError);
}
```

### 2. RLS Policies

تأكد من أن RLS policies تسمح للأدمن بالوصول الكامل:

```sql
-- سياسة للأدمن لرؤية جميع المستخدمين
CREATE POLICY "Admins can view all users"
ON user_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- سياسة للأدمن لتحديث جميع المستخدمين
CREATE POLICY "Admins can update all users"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);
```

### 3. الأداء

إذا كان لديك عدد كبير من المستخدمين (أكثر من 1000)، فكر في:

1. **إضافة pagination:**
```javascript
// في getUsers
const { data, error } = await query
  .range(offset, offset + limit - 1);
```

2. **استخدام indexes:**
```sql
-- تم إضافتها بالفعل في migration
CREATE INDEX idx_user_profiles_approval_status ON user_profiles(approval_status);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
```

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع ملف `TESTING_CHECKLIST.md` للاختبارات الشاملة
2. راجع ملف `FIXES_APPLIED.md` لتفاصيل الإصلاحات
3. تحقق من console logs في المتصفح (F12)
4. تحقق من Supabase logs في Dashboard

## ✅ قائمة التحقق النهائية

- [ ] تم استخراج الملفات
- [ ] تم تنفيذ SQL migration
- [ ] تم إضافة Environment Variables
- [ ] تم نشر Edge Functions
- [ ] تم رفع الكود إلى الاستضافة
- [ ] تم اختبار التسجيل
- [ ] تم اختبار الموافقة
- [ ] تم التحقق من وصول البريد
- [ ] تم التحقق من الإحصائيات

## 🎉 انتهى!

بعد تطبيق جميع الخطوات، يجب أن يعمل النظام بشكل كامل:

- ✅ المستخدمون الجدد يظهرون في لوحة الأدمن
- ✅ الأدمن يمكنه الموافقة/الرفض
- ✅ البريد الإلكتروني يُرسل تلقائياً
- ✅ البونص $5 يُضاف تلقائياً
- ✅ الإحصائيات صحيحة

---

**تاريخ الإصلاح:** 31 أكتوبر 2024  
**الإصدار:** 1.0
