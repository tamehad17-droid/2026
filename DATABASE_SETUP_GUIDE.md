# دليل إعداد قاعدة البيانات - PromoHive

## نظرة عامة

هذا الدليل يوضح كيفية تطبيق جميع التحديثات على قاعدة بيانات Supabase لمشروع PromoHive.

## المتطلبات الأساسية

- حساب Supabase نشط
- معرف المشروع: `jtxmijnxrgcwjvtdlgxy`
- صلاحيات الوصول إلى لوحة تحكم Supabase

## الملفات الجديدة (Migrations)

تم إنشاء الملفات التالية في مجلد `supabase/migrations/`:

### 1. `20241031_create_withdrawals_table.sql`
**الغرض:** إنشاء نظام السحب اليدوي
- جدول `withdrawals` لطلبات السحب
- حد أدنى للسحب: **$10**
- دعم شبكات: TRC20, ERC20, BEP20
- موافقة/رفض يدوي من الإدارة
- Functions:
  - `request_withdrawal()` - طلب سحب
  - `approve_withdrawal()` - موافقة الإدارة
  - `reject_withdrawal()` - رفض الإدارة

### 2. `20241031_create_deposits_table.sql`
**الغرض:** إنشاء نظام الإيداع اليدوي
- جدول `deposits` لطلبات الإيداع
- جدول `admin_deposit_addresses` لعناوين USDT الإدارية
- حد أدنى للإيداع: **$50**
- التحقق اليدوي من الإدارة
- Functions:
  - `request_deposit()` - طلب إيداع
  - `verify_deposit()` - تأكيد الإدارة
  - `reject_deposit()` - رفض الإدارة

### 3. `20241031_add_email_notifications.sql`
**الغرض:** نظام البريد الإلكتروني والإشعارات
- إعدادات SMTP (Hostinger)
- قوالب البريد الإلكتروني بالعربية
- سجل إرسال البريد
- قوالب جاهزة:
  - ترحيب بالعضو الجديد (مع مكافأة $5)
  - قبول/رفض المهام
  - قبول/رفض السحب
  - تأكيد الإيداع

## خطوات التطبيق

### الطريقة 1: عبر لوحة تحكم Supabase (موصى بها)

1. **افتح لوحة تحكم Supabase:**
   - اذهب إلى: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/editor

2. **افتح SQL Editor:**
   - من القائمة الجانبية، اختر "SQL Editor"

3. **قم بتطبيق كل migration على حدة:**

   **أولاً: جدول السحب**
   ```sql
   -- انسخ محتوى ملف: 20241031_create_withdrawals_table.sql
   -- والصقه في SQL Editor ثم اضغط RUN
   ```

   **ثانياً: جدول الإيداع**
   ```sql
   -- انسخ محتوى ملف: 20241031_create_deposits_table.sql
   -- والصقه في SQL Editor ثم اضغط RUN
   ```

   **ثالثاً: نظام البريد الإلكتروني**
   ```sql
   -- انسخ محتوى ملف: 20241031_add_email_notifications.sql
   -- والصقه في SQL Editor ثم اضغط RUN
   ```

### الطريقة 2: عبر Supabase CLI

```bash
# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref jtxmijnxrgcwjvtdlgxy

# تطبيق جميع migrations
supabase db push
```

## التحقق من التطبيق

بعد تطبيق جميع migrations، تحقق من:

### 1. الجداول الجديدة
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('withdrawals', 'deposits', 'admin_deposit_addresses', 'email_templates', 'email_logs');
```

يجب أن تظهر جميع الجداول الخمسة.

### 2. الإعدادات الإدارية
```sql
SELECT key, value, description 
FROM admin_settings 
WHERE key IN (
    'min_withdrawal_amount', 
    'min_deposit_amount', 
    'smtp_host', 
    'smtp_user',
    'customer_service_phone'
);
```

يجب أن تظهر:
- `min_withdrawal_amount`: 10
- `min_deposit_amount`: 50
- `smtp_host`: smtp.hostinger.com
- `smtp_user`: promohive@globalpromonetwork.store
- `customer_service_phone`: +17253348692

### 3. قوالب البريد الإلكتروني
```sql
SELECT template_key, subject, is_active 
FROM email_templates;
```

يجب أن تظهر 6 قوالب:
- welcome_approved
- task_approved
- task_rejected
- withdrawal_approved
- withdrawal_rejected
- deposit_verified

## إعدادات ما بعد التطبيق

### 1. تحديث عناوين USDT الإدارية

```sql
-- حذف العناوين التجريبية
DELETE FROM admin_deposit_addresses;

-- إضافة عناوينك الحقيقية
INSERT INTO admin_deposit_addresses (label, address, network, is_active) VALUES
    ('المحفظة الرئيسية TRC20', 'عنوان_TRC20_الحقيقي', 'TRC20', true),
    ('المحفظة الرئيسية ERC20', 'عنوان_ERC20_الحقيقي', 'ERC20', false);
```

### 2. اختبار نظام السحب

```sql
-- اختبار طلب سحب (استبدل user_id بمعرف مستخدم حقيقي)
SELECT public.request_withdrawal(
    'user_id_here'::uuid,
    15.00,
    'TYourUSDTAddress',
    'TRC20'
);
```

### 3. اختبار نظام الإيداع

```sql
-- اختبار طلب إيداع
SELECT public.request_deposit(
    'user_id_here'::uuid,
    50.00,
    'admin_usdt_address',
    'TRC20',
    'tx_hash_here',
    'payment_proof_url'
);
```

## الميزات الرئيسية

### ✅ نظام السحب
- حد أدنى: $10
- دعم 3 شبكات (TRC20, ERC20, BEP20)
- موافقة/رفض يدوي من الإدارة
- خصم تلقائي من الرصيد عند الطلب
- إرجاع تلقائي عند الرفض
- سجل كامل لجميع العمليات

### ✅ نظام الإيداع
- حد أدنى: $50
- عناوين USDT إدارية قابلة للتخصيص
- تحقق يدوي من الإدارة
- إضافة تلقائية للرصيد عند التأكيد
- دعم رفع إثبات الدفع

### ✅ نظام البريد الإلكتروني
- إعدادات SMTP جاهزة (Hostinger)
- قوالب بريد إلكتروني بالعربية
- إشعارات تلقائية:
  - ترحيب بالأعضاء الجدد
  - إشعار بقبول/رفض المهام
  - إشعار بقبول/رفض السحب
  - إشعار بتأكيد الإيداع

### ✅ معلومات الاتصال
- رقم الواتساب: +17253348692
- البريد الإلكتروني: promohive@globalpromonetwork.store

## الأمان (RLS Policies)

جميع الجداول محمية بسياسات Row Level Security:
- المستخدمون يرون بياناتهم فقط
- الإداريون يرون جميع البيانات
- جميع العمليات المالية مسجلة في `admin_actions`
- تتبع كامل لجميع التعديلات

## الدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من سجلات Supabase (Logs)
2. تأكد من تطبيق جميع migrations بالترتيب
3. تحقق من صلاحيات RLS
4. راجع `admin_actions` للتدقيق

## ملاحظات مهمة

⚠️ **تحذيرات:**
- لا تشارك `smtp_password` مع أحد
- قم بتحديث عناوين USDT الإدارية قبل الإنتاج
- اختبر جميع الوظائف في بيئة التطوير أولاً
- احتفظ بنسخة احتياطية من قاعدة البيانات

✅ **أفضل الممارسات:**
- راجع طلبات السحب/الإيداع يومياً
- تحقق من `email_logs` لمتابعة إرسال البريد
- استخدم `admin_actions` لتدقيق جميع العمليات
- حدّث `admin_settings` حسب الحاجة

## التحديثات المستقبلية

للتحديثات المستقبلية، أنشئ ملفات migration جديدة بالتنسيق:
```
YYYYMMDD_description.sql
```

مثال:
```
20241101_add_new_feature.sql
```
