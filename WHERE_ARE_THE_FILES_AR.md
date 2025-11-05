# 📍 أين تجد الملفات - دليل شامل

## ✅ 1. نظام المحفظة (Wallet System)

### نعم! كل عميل له محفظة خاصة! ✅

#### 📁 ملفات قاعدة البيانات:
```
📄 supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql
   السطور 90-300
```

**ما تحتويه المحفظة:**
```sql
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE,                          -- معرف فريد لكل مستخدم
    
    -- الأرصدة
    available_balance NUMERIC DEFAULT 0,          -- الرصيد المتاح للسحب
    pending_balance NUMERIC DEFAULT 0,            -- الرصيد المعلق (مهام قيد المراجعة)
    total_earned NUMERIC DEFAULT 0,               -- إجمالي ما ربحه
    total_withdrawn NUMERIC DEFAULT 0,            -- إجمالي ما سحبه
    
    -- تفصيل الأرباح
    earnings_from_tasks NUMERIC DEFAULT 0,        -- الأرباح من المهام
    earnings_from_referrals NUMERIC DEFAULT 0,    -- الأرباح من الإحالات
    earnings_from_bonuses NUMERIC DEFAULT 0,      -- الأرباح من المكافآت
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 📁 ملف الخدمة (Service):
```
📄 src/services/walletService.js
```

**الوظائف المتاحة:**
- `getWallet(userId)` - جلب محفظة المستخدم
- `createWallet(userId)` - إنشاء محفظة جديدة
- `addBalance(userId, amount, category)` - إضافة رصيد تلقائياً
- `subtractBalance(userId, amount)` - خصم رصيد (للسحوبات)
- `getWalletStats(userId)` - إحصائيات كاملة

#### 🔄 الإنشاء التلقائي:
```sql
-- يتم إنشاء محفظة تلقائياً عند تسجيل مستخدم جديد
CREATE TRIGGER on_user_created_create_wallet
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_wallet();
```

---

## ✅ 2. النقاط والحسابات التلقائية

### نعم! النظام يحسب كل شيء تلقائياً! ✅

#### 📁 الوظيفة الرئيسية:
```
📄 supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql
   السطور 183-229
```

```sql
CREATE FUNCTION update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT,           -- 'add' أو 'subtract'
    p_category TEXT        -- 'tasks', 'referrals', 'bonuses'
)
```

**كيف يعمل تلقائياً:**

1. **عند إنهاء مهمة:**
```javascript
// في الكود التلقائي
await walletService.addBalance(
    userId, 
    taskReward,          // مبلغ المكافأة
    'tasks',             // الفئة
    'Task completion'    // الوصف
);
```

2. **عند موافقة الأدمن:**
```sql
-- في approve_task_submission function
UPDATE wallets
SET 
    available_balance = available_balance + task_reward,
    total_earned = total_earned + task_reward,
    earnings_from_tasks = earnings_from_tasks + task_reward
WHERE user_id = p_user_id;

-- إنشاء سجل معاملة تلقائي
INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
) VALUES (
    p_user_id,
    'task_completion',
    task_reward,
    'Task #' || task_id || ' approved',
    'completed'
);
```

3. **عند إحالة ناجحة:**
```sql
-- في check_referral_rewards function
UPDATE wallets
SET 
    available_balance = available_balance + reward_amount,
    earnings_from_referrals = earnings_from_referrals + reward_amount
WHERE user_id = referrer_id;
```

---

## ✅ 3. موافقة الأدمن على المهام

### نعم! كل مهمة تحتاج موافقة الأدمن! ✅

#### 📁 جدول إرسال المهام:
```sql
-- في قاعدة البيانات الموجودة
CREATE TABLE task_submissions (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    user_id UUID REFERENCES auth.users(id),
    proof_text TEXT,              -- الإثبات النصي
    proof_urls TEXT[],            -- روابط الإثبات
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,             -- ملاحظات الأدمن
    reviewed_by UUID,             -- من راجعها
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
);
```

#### 📁 صفحة مراجعة المهام (للأدمن):
```
📄 src/pages/proofs-review/index.jsx
```

**سير العمل:**

1. **المستخدم يُنهي المهمة:**
   - يذهب إلى `/tasks-list`
   - ينقر "Submit Proof"
   - يرفع الإثبات
   - الحالة = `pending`
   - الرصيد يذهب إلى `pending_balance`

2. **الأدمن يراجع:**
   - يذهب إلى `/proofs-review`
   - يرى جميع المهام المعلقة
   - ينقر "Approve" أو "Reject"

3. **عند الموافقة (تلقائي):**
```javascript
async approveTaskSubmission(submissionId, adminId) {
    // 1. تحديث حالة المهمة
    UPDATE task_submissions SET status = 'approved'
    
    // 2. نقل الرصيد من pending إلى available
    UPDATE wallets SET
        pending_balance = pending_balance - reward,
        available_balance = available_balance + reward,
        earnings_from_tasks = earnings_from_tasks + reward
    
    // 3. إنشاء سجل معاملة
    INSERT INTO transactions...
    
    // 4. تسجيل إجراء الأدمن
    INSERT INTO admin_actions...
}
```

---

## ✅ 4. رصيد الإحالات التلقائي

### نعم! يُحسب ويُضاف تلقائياً! ✅

#### 📁 الوظيفة التلقائية:
```
📄 supabase/migrations/20241031_complete_admin_system.sql
   السطور 320-390
```

```sql
CREATE FUNCTION check_referral_rewards(p_referrer_id UUID)
```

**كيف يعمل:**

1. **عند تسجيل مُحال جديد:**
```javascript
// يتم تسجيل الإحالة تلقائياً
INSERT INTO referrals (
    referrer_id,
    referred_id,
    level
);
```

2. **التحقق التلقائي من الشروط:**
```sql
-- يتم التحقق كل فترة (Cron Job)
-- إذا استوفى الشروط:
IF qualified_count >= required_count THEN
    -- إضافة المكافأة تلقائياً
    UPDATE wallets SET
        available_balance = available_balance + reward_amount,
        earnings_from_referrals = earnings_from_referrals + reward_amount;
    
    -- تسجيل المعاملة
    INSERT INTO transactions...
END IF;
```

**الشروط المخفية:**
- Level 1: 5 إحالات بنفس المستوى → $80
- Level 2: 5 إحالات بنفس المستوى → $150
- يجب أن يكونوا نشطين لمدة 7 أيام

---

## ✅ 5. التعرف التلقائي على الأدمن

### نعم! يتعرف تلقائياً ويظهر زر! ✅

#### 📁 ملف الأدمن Guard:
```
📄 src/contexts/AuthContext.jsx
   السطور 140-150
```

```javascript
const isAdmin = () => {
    if (!user || !profile) return false;
    
    // التحقق من دور المستخدم
    const userRole = user?.user_metadata?.role || profile?.role;
    return userRole === 'admin' || userRole === 'super_admin';
};
```

#### 📁 زر لوحة التحكم:
```
📄 src/components/ui/Header.jsx (أو Navigation)
```

```jsx
{isAdmin() && (
    <Link 
        to="/admin-dashboard"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
    >
        <Icon name="Shield" size={20} />
        Admin Dashboard
    </Link>
)}
```

#### 📁 الحماية التلقائية:
```
📄 src/components/ProtectedRoute.jsx
```

```javascript
// إذا كانت الصفحة تتطلب أدمن:
if (requireAdmin && !isAdmin()) {
    return <AccessDenied />;
}
```

---

## 📋 الملفات التي يجب تنفيذها في قاعدة البيانات

### 🔴 ملفان فقط! (بالترتيب):

#### 1️⃣ الملف الأول (الأساسي):
```
📂 supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql
```

**يحتوي على:**
- ✅ جدول `wallets` (المحافظ)
- ✅ وظيفة `approve_user()` (المحدثة)
- ✅ وظيفة `update_wallet_balance()` (إدارة الرصيد)
- ✅ وظيفة `create_user_wallet()` (إنشاء محفظة)
- ✅ Trigger لإنشاء المحفظة تلقائياً
- ✅ ترحيل الأرصدة الحالية

#### 2️⃣ الملف الثاني (النظام الكامل):
```
📂 supabase/migrations/20241031_complete_admin_system.sql
```

**يحتوي على:**
- ✅ جدول `admin_settings` (جميع الإعدادات)
- ✅ جدول `referrals` (نظام الإحالات)
- ✅ جدول `spin_prizes` (عجلة الحظ)
- ✅ جدول `level_upgrades` (ترقية المستويات)
- ✅ جدول `usdt_addresses` (عناوين المحافظ)
- ✅ جدول `admin_actions` (سجل الإجراءات)
- ✅ وظيفة `process_spin()` (عجلة الحظ)
- ✅ وظيفة `check_referral_rewards()` (مكافآت الإحالات)
- ✅ وظيفة `request_level_upgrade()` (طلب ترقية)
- ✅ جميع سياسات الأمان (RLS)

---

## 🎯 ملخص سريع للميزات

### ✅ المحفظة:
- محفظة لكل مستخدم (تُنشأ تلقائياً)
- رصيد متاح / معلق
- تتبع الأرباح من كل مصدر
- تحديث تلقائي

### ✅ المهام:
- المستخدم يُرسل الإثبات
- الحالة = pending
- الرصيد يذهب إلى pending_balance
- الأدمن يراجع
- عند الموافقة: يُنقل تلقائياً إلى available_balance
- يُسجل كل شيء في transactions

### ✅ الإحالات:
- تُسجل تلقائياً
- التحقق من الشروط تلقائياً
- المكافأة تُضاف تلقائياً
- الشروط مخفية عن المستخدمين

### ✅ الأدمن:
- يتعرف تلقائياً على دور admin/super_admin
- يظهر زر "Admin Dashboard"
- يحصل على صلاحيات كاملة:
  - موافقة/رفض المهام
  - موافقة/رفض المستخدمين
  - تعديل الإعدادات
  - إدارة المستويات
  - إدارة عناوين USDT
  - مراجعة السحوبات

---

## 📍 مواقع الملفات الكاملة

### قاعدة البيانات:
```
📂 supabase/migrations/
   ├── 20241031_fix_email_confirmation_and_wallet.sql  ← نفذ هذا أولاً
   └── 20241031_complete_admin_system.sql              ← ثم نفذ هذا
```

### الخدمات (Services):
```
📂 src/services/
   ├── walletService.js           ← إدارة المحافظ
   ├── adminService.js            ← وظائف الأدمن
   ├── taskService.js             ← إدارة المهام
   ├── referralService.js         ← نظام الإحالات
   ├── levelUpgradeService.js     ← ترقية المستويات
   └── emailNotificationService.js ← الإشعارات
```

### الصفحات (Pages):
```
📂 src/pages/
   ├── admin-dashboard/           ← لوحة الأدمن
   ├── admin-settings/            ← إعدادات الأدمن
   ├── proofs-review/             ← مراجعة المهام
   ├── users-management/          ← إدارة المستخدمين
   ├── withdrawals-processing/    ← معالجة السحوبات
   ├── tasks-list/                ← قائمة المهام (للمستخدم)
   ├── daily-spin-wheel/          ← عجلة الحظ
   └── level-upgrade/             ← طلب ترقية
```

---

## 🚀 كيف تُنفذ الملفات؟

### الطريقة السهلة (5 دقائق):

1. **افتح Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql
   ```

2. **اضغط "New Query"**

3. **افتح الملف الأول:**
   ```
   supabase/migrations/20241031_fix_email_confirmation_and_wallet.sql
   ```
   - انسخ كل المحتوى (Ctrl+A → Ctrl+C)
   - الصق في SQL Editor
   - اضغط "Run" أو Ctrl+Enter

4. **افتح الملف الثاني:**
   ```
   supabase/migrations/20241031_complete_admin_system.sql
   ```
   - نفس الخطوات

5. **انتهى!** ✅

---

## ✅ التحقق من النجاح

بعد التنفيذ، شغّل هذه الأوامر SQL للتحقق:

```sql
-- 1. تحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wallets', 'admin_settings', 'referrals', 'spin_prizes', 'level_upgrades');

-- 2. تحقق من وجود الوظائف
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_wallet_balance', 'check_referral_rewards', 'process_spin');

-- 3. تحقق من المحافظ الموجودة
SELECT COUNT(*) as wallet_count FROM wallets;

-- 4. تحقق من الإعدادات
SELECT key, value FROM admin_settings ORDER BY category, key;
```

**النتيجة المتوقعة:**
- ✅ 5 جداول موجودة
- ✅ 3+ وظائف موجودة
- ✅ عدد المحافظ = عدد المستخدمين
- ✅ 20+ إعداد موجود

---

## 🎊 الخلاصة

**نعم! كل شيء موجود ومُنفذ:**

✅ محفظة لكل عميل
✅ حسابات تلقائية للنقاط
✅ موافقة الأدمن على المهام
✅ إضافة الرصيد تلقائياً عند الموافقة
✅ رصيد الإحالات التلقائي
✅ التعرف التلقائي على الأدمن
✅ زر لوحة التحكم للأدمن
✅ صلاحيات كاملة للأدمن

**فقط قم بتنفيذ الملفين في قاعدة البيانات!** 🚀
