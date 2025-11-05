# 🔐 بيانات دخول الأدمن - PromoHive

## ✅ حساب الأدمن الموجود:

```
═══════════════════════════════════════════════════════
📧 البريد الإلكتروني: admin@promohive.com
🔑 كلمة المرور: [يجب تعيينها أو إعادة تعيينها]
👤 الاسم: Admin User
🎯 الدور: admin
✅ الحالة: active
═══════════════════════════════════════════════════════
```

---

## 🚀 طريقة تسجيل الدخول:

### 1. افتح صفحة تسجيل الدخول:
```
https://[your-domain]/login
أو
http://localhost:5173/login
```

### 2. أدخل البيانات:
```
البريد: admin@promohive.com
كلمة المرور: [كلمة المرور الخاصة بك]
```

### 3. بعد تسجيل الدخول:
```
الصفحة الرئيسية: /admin-dashboard
إدارة المستخدمين: /users-management
مراجعة الإثباتات: /proofs-review
معالجة السحوبات: /withdrawals-processing
```

---

## ⚠️ إذا نسيت كلمة المرور:

### الطريقة 1: إعادة تعيين من صفحة تسجيل الدخول

1. اذهب لصفحة Login
2. اضغط "Forgot Password"
3. أدخل: `admin@promohive.com`
4. سيصلك بريد لإعادة التعيين (إذا كان SMTP مفعل)

### الطريقة 2: إعادة تعيين من Supabase Dashboard

1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/auth/users

2. ابحث عن: `admin@promohive.com`

3. اضغط على المستخدم → "Reset Password"

4. سيُرسل بريد إعادة التعيين

### الطريقة 3: تعيين كلمة مرور جديدة مباشرة

استخدم Supabase SQL Editor:

```sql
-- افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

-- إعادة تعيين كلمة المرور
UPDATE auth.users 
SET encrypted_password = crypt('YourNewPassword123!', gen_salt('bf'))
WHERE email = 'admin@promohive.com';

-- ✅ استبدل 'YourNewPassword123!' بكلمة المرور الجديدة
```

---

## 🆕 إنشاء حساب أدمن جديد:

### الطريقة 1: من Supabase Dashboard

1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/auth/users

2. اضغط "Add user" → "Create new user"

3. أدخل البيانات:
   ```
   Email: your-admin@example.com
   Password: [كلمة مرور قوية]
   Email Confirm: true
   ```

4. بعد إنشاء المستخدم، شغل هذا SQL:

```sql
-- تحديث الدور إلى admin
UPDATE public.user_profiles 
SET 
  role = 'admin',
  status = 'active',
  approval_status = 'approved',
  email_verified = true
WHERE email = 'your-admin@example.com';
```

### الطريقة 2: عبر SQL مباشرة

```sql
-- افتح SQL Editor وشغل:

-- 1. إنشاء المستخدم في auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_sent_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'newadmin@example.com',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"New Admin","role":"admin"}',
  false,
  NOW()
)
RETURNING id;

-- 2. ثم أنشئ profile (استبدل USER_ID_HERE بالـ id من النتيجة أعلاه)
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  approval_status,
  email_verified
)
VALUES (
  'USER_ID_HERE',
  'newadmin@example.com',
  'New Admin',
  'admin',
  'active',
  'approved',
  true
);
```

---

## 🔒 تأمين حساب الأدمن:

### ✅ نصائح الأمان:

1. **استخدم كلمة مرور قوية:**
   - على الأقل 12 حرف
   - مزيج من أحرف كبيرة وصغيرة
   - أرقام ورموز خاصة
   - مثال: `Admin@PromoHive2025!`

2. **لا تشارك بيانات الدخول:**
   - احتفظ بها في مكان آمن
   - استخدم password manager

3. **راقب نشاط الأدمن:**
   - جدول `audit_logs` يسجل كل عمليات الأدمن

4. **استخدم Two-Factor Authentication (2FA):**
   - يمكن تفعيله من Supabase

---

## 📊 التحقق من صلاحيات الأدمن:

### تحقق من الـ role في قاعدة البيانات:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  approval_status,
  email_verified,
  created_at
FROM public.user_profiles
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;
```

### تحقق من auth.users:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@promohive.com';
```

---

## 🧪 اختبار تسجيل الدخول:

### 1. محلياً (Development):
```bash
npm run dev
# افتح: http://localhost:5173/login
# سجل دخول بـ: admin@promohive.com
```

### 2. على Netlify (Production):
```
https://[your-domain].netlify.app/login
```

### 3. تحقق من الصلاحيات:
```javascript
// في Browser Console (F12)
console.log(localStorage.getItem('supabase.auth.token'));

// يجب أن يحتوي على role: "admin"
```

---

## 🎯 الوصول لصفحات الأدمن:

بعد تسجيل الدخول كـ admin، يمكنك الوصول لـ:

```
✅ /admin-dashboard           - لوحة التحكم الرئيسية
✅ /users-management          - إدارة المستخدمين
✅ /proofs-review             - مراجعة الإثباتات
✅ /withdrawals-processing    - معالجة السحوبات
✅ /tasks-management          - إدارة المهام
✅ /settings                  - الإعدادات
```

المستخدمين العاديين لا يمكنهم الوصول لهذه الصفحات (محمية بـ ProtectedRoute).

---

## ⚠️ استكشاف الأخطاء:

### "غير مصرح بالوصول" بعد تسجيل الدخول:

**السبب:** الحساب ليس لديه role = 'admin'

**الحل:**
```sql
UPDATE public.user_profiles 
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### "Invalid credentials":

**الأسباب المحتملة:**
1. كلمة المرور خاطئة
2. البريد خاطئ
3. الحساب غير موجود

**الحل:**
- تحقق من البيانات
- أعد تعيين كلمة المرور
- تحقق من وجود الحساب في قاعدة البيانات

### "Email not confirmed":

**الحل:**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@promohive.com';
```

---

## 📞 الدعم:

إذا واجهت مشاكل:

1. **تحقق من Supabase Auth:**
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/auth/users

2. **راجع Logs:**
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/explorer

3. **تحقق من Browser Console:**
   اضغط F12 وابحث عن أخطاء

---

## 🎉 ملخص سريع:

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🔐 بيانات دخول الأدمن الحالي:                 ║
║                                                   ║
║   📧 البريد: admin@promohive.com                 ║
║   🔑 كلمة المرور: [أعد تعيينها إذا لزم الأمر]  ║
║   🎯 الدور: admin                                ║
║   ✅ الحالة: active                              ║
║                                                   ║
║   🌐 صفحة تسجيل الدخول:                         ║
║      /login                                       ║
║                                                   ║
║   📊 صفحات الأدمن:                               ║
║      • /admin-dashboard                          ║
║      • /users-management                         ║
║      • /proofs-review                            ║
║      • /withdrawals-processing                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

**تاريخ آخر تحديث:** 2025-10-30  
**الحالة:** ✅ جاهز للاستخدام  
**المشروع:** PromoHive
