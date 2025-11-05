# الإصلاحات المطبقة على مشروع PromoHive

## التاريخ: 31 أكتوبر 2024

### المشاكل التي تم إصلاحها

#### 1. المستخدمون الجدد لا يظهرون في صفحة الأدمن

**المشكلة:**
- المستخدمون الجدد المسجلون لا يظهرون في قائمة المستخدمين في لوحة تحكم الأدمن
- الفلترة غير صحيحة في دالة `getUsers`

**الحل المطبق:**
- **ملف:** `src/services/adminService.js`
- **التغيير:** إزالة الشرط الإشكالي في السطر 24 الذي كان يستخدم `or()` بطريقة خاطئة
- **النتيجة:** الآن عند عدم تطبيق أي فلتر، يتم عرض جميع المستخدمين بشكل صحيح

```javascript
// قبل الإصلاح:
query = query?.or(`approval_status.is.null,approval_status.neq.null`);

// بعد الإصلاح:
// تم إزالة هذا السطر تماماً لعرض جميع المستخدمين عند عدم وجود فلتر
```

#### 2. عدم إرسال البريد الإلكتروني بعد موافقة الأدمن

**المشكلة:**
- عند موافقة الأدمن على مستخدم جديد، لا يتم إرسال بريد إلكتروني ترحيبي
- دالة `approveUser` لا تستدعي `sendNotificationEmail`

**الحل المطبق:**
- **ملف:** `src/services/adminService.js`
- **التغيير:** إضافة استدعاء لدالة `sendNotificationEmail` في دالة `approveUser`
- **النتيجة:** الآن يتم إرسال بريد ترحيبي تلقائياً عند الموافقة على المستخدم

```javascript
// تم إضافة هذا الكود في دالة approveUser:
try {
  await this.sendNotificationEmail('welcome', profile?.email, {
    fullName: profile?.full_name,
    loginUrl: `${window.location.origin}/login`
  });
} catch (emailError) {
  console.error('Failed to send welcome email:', emailError);
  // Don't fail the approval if email fails
}
```

#### 3. إصلاح حساب الإحصائيات في صفحة إدارة المستخدمين

**المشكلة:**
- الإحصائيات في صفحة إدارة المستخدمين تستخدم منطق خاطئ للفلترة
- استخدام `approval_status` بدلاً من `status` المحول

**الحل المطبق:**
- **ملف:** `src/pages/users-management/index.jsx`
- **التغيير:** تحديث منطق حساب الإحصائيات لاستخدام حقل `status` المحول
- **النتيجة:** الإحصائيات الآن تعرض الأرقام الصحيحة

```javascript
// قبل الإصلاح:
const pendingUsers = transformedUsers.filter(u => u.approval_status === 'pending' || !u.approval_status).length;

// بعد الإصلاح:
const pendingUsers = transformedUsers.filter(u => u.status === 'pending').length;
```

#### 4. إنشاء ملف SQL للإصلاحات الشاملة

**الملف الجديد:** `supabase/migrations/20241031_fix_admin_approval_issues.sql`

**ما يحتويه:**

1. **تحديث جدول user_profiles:**
   - إضافة الأعمدة المطلوبة إذا لم تكن موجودة
   - إضافة indexes للاستعلامات الأسرع

2. **تحديث trigger التسجيل:**
   - إصلاح `handle_new_user_with_verification()`
   - إضافة إنشاء wallet تلقائي
   - إضافة logging للتسجيلات

3. **دالة approve_user_with_bonus:**
   - دالة جديدة للموافقة على المستخدمين مع إضافة البونص
   - التحقق من صلاحيات الأدمن
   - إضافة transaction للبونص الترحيبي
   - تحديث رصيد المحفظة
   - logging للعملية

4. **دالة reject_user:**
   - دالة محسّنة لرفض المستخدمين
   - التحقق من صلاحيات الأدمن
   - logging للعملية

5. **دالة get_dashboard_stats:**
   - دالة جديدة لحساب إحصائيات لوحة التحكم بشكل صحيح
   - حساب المستخدمين المعلقين بشكل صحيح (pending و null)

### الملفات المعدلة

1. `src/services/adminService.js`
   - إصلاح دالة `getUsers`
   - إصلاح دالة `approveUser` مع إضافة إرسال البريد

2. `src/pages/users-management/index.jsx`
   - إصلاح حساب الإحصائيات

3. `supabase/migrations/20241031_fix_admin_approval_issues.sql` (جديد)
   - ملف SQL شامل لإصلاح قاعدة البيانات

### خطوات التطبيق

#### للكود (Frontend):
الملفات المعدلة جاهزة للاستخدام مباشرة.

#### لقاعدة البيانات (Backend):
يجب تنفيذ ملف SQL في Supabase:

1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. افتح الملف `supabase/migrations/20241031_fix_admin_approval_issues.sql`
4. انسخ المحتوى والصقه في SQL Editor
5. اضغط Run لتنفيذ الاستعلامات

### ملاحظات مهمة

1. **البريد الإلكتروني:**
   - تأكد من أن Edge Function `send-notification-email` منشورة في Supabase
   - تأكد من إعدادات SMTP في Environment Variables:
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASS`
     - `SMTP_FROM`

2. **الصلاحيات:**
   - تأكد من أن RLS Policies تسمح للأدمن بالوصول إلى جميع البيانات
   - تأكد من أن دور الأدمن محدد بشكل صحيح في `user_profiles.role`

3. **الاختبار:**
   - اختبر التسجيل الجديد
   - اختبر الموافقة على المستخدم
   - تحقق من وصول البريد الإلكتروني
   - تحقق من ظهور المستخدمين في لوحة الأدمن

### المشاكل المتبقية المحتملة

1. **عدم إرسال بريد بعد التسجيل مباشرة:**
   - حالياً لا يتم إرسال بريد للمستخدم بعد التسجيل مباشرة
   - يتم إرسال البريد فقط بعد موافقة الأدمن
   - إذا كنت تريد إرسال بريد تأكيد بعد التسجيل، يجب إضافة trigger في قاعدة البيانات أو استدعاء من Frontend

2. **RLS Policies:**
   - قد تحتاج إلى مراجعة سياسات RLS للتأكد من أن الأدمن يمكنه رؤية جميع المستخدمين

### الدعم

إذا واجهت أي مشاكل بعد تطبيق الإصلاحات:

1. تحقق من console logs في المتصفح
2. تحقق من Supabase logs في Dashboard
3. تحقق من أن جميع Environment Variables محددة بشكل صحيح
4. تأكد من أن Edge Functions منشورة ونشطة
