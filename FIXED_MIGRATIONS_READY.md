# ✅ الملفات المُصلحة جاهزة للتنفيذ!

## 🔧 المشاكل التي تم إصلاحها:

### ❌ المشكلة 1: `column up.total_withdrawn does not exist`
**الحل:** ✅ تم تعديل الكود ليستخدم فقط عمود `balance` الموجود في `user_profiles`

### ❌ المشكلة 2: `column "category" does not exist`
**الحل:** ✅ تم إضافة كود للتحقق من البنية وإعادة إنشاء الجدول إذا لزم الأمر

### ❌ المشكلة 3: أوامر `supabase secrets` في SQL Editor
**الحل:** ✅ هذه الأوامر يجب تنفيذها في Terminal/CLI وليس SQL Editor

---

## 📋 التنفيذ الصحيح (خطوة بخطوة):

### الخطوة 1️⃣: نفذ Migration الأول

```
1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql
2. اضغط "New Query"
3. افتح الملف: supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql
4. انسخ **كل** المحتوى (Ctrl+A → Ctrl+C)
5. الصق في SQL Editor (Ctrl+V)
6. اضغط "Run" أو Ctrl+Enter
7. انتظر حتى ترى "Success ✓"
```

**المتوقع:** رسالة "Success ✓" أو "NOTICE: Wallets created for existing users"

---

### الخطوة 2️⃣: نفذ Migration الثاني

```
1. في نفس الصفحة، اضغط "New Query" مرة أخرى
2. افتح الملف: supabase/migrations/20241031_complete_admin_system.sql
3. انسخ **كل** المحتوى
4. الصق في SQL Editor
5. اضغط "Run"
6. انتظر حتى ترى "Success ✓"
```

**المتوقع:** رسالة "Success ✓" أو عدة "NOTICE" messages

---

### الخطوة 3️⃣: أضف SMTP Secrets

⚠️ **مهم:** هذه الخطوة **ليست** في SQL Editor!

#### الطريقة 1: عبر Supabase Dashboard (سهلة):

```
1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions

2. في قسم "Secrets"، اضغط "Add secret" لكل واحدة:

   Name: SMTP_HOST
   Value: smtp.hostinger.com
   
   Name: SMTP_PORT
   Value: 465
   
   Name: SMTP_USER
   Value: promohive@globalpromonetwork.store
   
   Name: SMTP_PASS
   Value: PromoHive@2025!
   
   Name: SMTP_FROM
   Value: promohive@globalpromonetwork.store

3. اضغط "Save" بعد كل واحدة
```

#### الطريقة 2: عبر Terminal/CLI (إذا كان Supabase CLI مُثبت):

```bash
# في Terminal على جهازك (ليس في SQL Editor!)
cd /path/to/your/project

supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=promohive@globalpromonetwork.store
supabase secrets set "SMTP_PASS=PromoHive@2025!"
supabase secrets set SMTP_FROM=promohive@globalpromonetwork.store
```

---

### الخطوة 4️⃣: انشر Edge Function

#### الطريقة 1: عبر Dashboard:

```
1. افتح: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions

2. ابحث عن "send-notification-email"

3. إذا كانت موجودة:
   - اضغط عليها
   - اضغط "Deploy"
   
4. إذا لم تكن موجودة:
   - اضغط "Create Function"
   - الاسم: send-notification-email
   - ارفع الملف: supabase/functions/send-notification-email/index.ts
   - اضغط "Deploy"
```

#### الطريقة 2: عبر CLI:

```bash
# في Terminal
supabase functions deploy send-notification-email
```

---

## ✅ التحقق من النجاح

### تحقق من الجداول:

```sql
-- نفذ هذا في SQL Editor للتحقق
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'wallets', 
    'admin_settings', 
    'referrals', 
    'spin_prizes', 
    'level_upgrades', 
    'usdt_addresses',
    'admin_actions'
)
ORDER BY table_name;
```

**النتيجة المتوقعة:** 7 جداول

---

### تحقق من الوظائف:

```sql
-- نفذ هذا في SQL Editor
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'approve_user',
    'create_user_wallet',
    'update_wallet_balance',
    'check_referral_rewards',
    'process_spin',
    'can_spin_today',
    'get_setting',
    'request_level_upgrade'
)
ORDER BY routine_name;
```

**النتيجة المتوقعة:** 8 وظائف

---

### تحقق من الإعدادات:

```sql
-- نفذ هذا في SQL Editor
SELECT key, value, category 
FROM admin_settings 
ORDER BY category, key;
```

**النتيجة المتوقعة:** ~20 إعداد في فئات مختلفة

---

### تحقق من المحافظ:

```sql
-- نفذ هذا في SQL Editor
SELECT 
    COUNT(*) as total_wallets,
    SUM(available_balance) as total_available,
    SUM(total_earned) as total_earned
FROM wallets;
```

**النتيجة المتوقعة:** عدد المحافظ = عدد المستخدمين

---

## 🎯 اختبار سريع

بعد تنفيذ كل شيء:

1. **سجل مستخدم جديد**
   - اذهب إلى الموقع
   - سجل حساب جديد
   - تحقق من إنشاء المحفظة تلقائياً:
   ```sql
   SELECT * FROM wallets WHERE user_id = 'USER_ID_HERE';
   ```

2. **وافق على المستخدم (كأدمن)**
   - اذهب إلى `/admin-dashboard`
   - وافق على المستخدم
   - تحقق من إضافة $5 ترحيب:
   ```sql
   SELECT available_balance, earnings_from_bonuses 
   FROM wallets 
   WHERE user_id = 'USER_ID_HERE';
   ```

3. **تحقق من البريد الإلكتروني**
   - يجب أن يصل بريد ترحيب
   - من: promohive@globalpromonetwork.store
   - يحتوي على: "Welcome to PromoHive!" + "$5 bonus"

---

## 🆘 إذا واجهت أخطاء

### خطأ: "relation already exists"
```sql
-- نفذ هذا قبل Migration
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
-- ثم نفذ Migration من جديد
```

### خطأ: "function already exists"
```sql
-- نفذ هذا قبل Migration
DROP FUNCTION IF EXISTS approve_user(UUID);
DROP FUNCTION IF EXISTS update_wallet_balance(UUID, NUMERIC, TEXT, TEXT, TEXT);
-- ثم نفذ Migration من جديد
```

### خطأ في SMTP Secrets:
- تأكد أنك تستخدم Dashboard وليس SQL Editor
- تأكد من عدم وجود مسافات زائدة في القيم
- تأكد من كتابة الأسماء بالضبط كما هي (حساسة لحالة الأحرف)

---

## 📞 تحتاج مساعدة؟

إذا واجهت أي مشكلة:
1. انسخ رسالة الخطأ كاملة
2. انسخ السطر الذي فيه المشكلة
3. سأساعدك فوراً!

---

## 🎊 بعد النجاح

عندما ترى "Success ✓" في كل الخطوات:
- ✅ كل الجداول موجودة
- ✅ كل الوظائف تعمل
- ✅ المحافظ تُنشأ تلقائياً
- ✅ الإعدادات جاهزة
- ✅ البريد الإلكتروني يعمل

**جاهز للاستخدام! 🚀**
