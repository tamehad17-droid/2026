# 🎉 AdGem - الإعداد النهائي

## ✅ المعلومات المستلمة:

```
App ID: 31283
Postback Key: 6b133h6i0674mfcca9bnfaid
API Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
Offerwall URL: https://api.adgem.com/v1/wall?appid=31283&playerid=
Property URL: https://globalpromonetwork.store/
```

---

## 🚀 الخطوات النهائية (15 دقيقة):

### الخطوة 1: إضافة Secrets في Supabase

**افتح:**
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
```

**في قسم "Secrets"، أضف:**

| Name | Value |
|------|-------|
| `ADGEM_API_KEY` | `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODYxNWM5MjMxZGJlNzA1NDBkYzNkNTE4NTMwZTk1MmI5NzQ2Y2FmZmI2ZTIyZjUyODY4NGFiZmE5NjgzMmYwMjBlZDA2Y2VkMjY4YzQ4OTkiLCJpYXQiOjE3NjE3ODc2MDUuMjE2Njg1LCJuYmYiOjE3NjE3ODc2MDUuMjE2Njg3LCJleHAiOjE3OTMzMjM2MDUuMjEzMTI1LCJzdWIiOiIyODk2NyIsInNjb3BlcyI6W119.YXjX9d5nch4wVQcEHXmsIjafQMkzHyKVRWC0q-1No_T1CrxkpPqExG5s032kQcq-x1hS-Lhu-bjIeqp7yqXv401ksi4RO-YYyC9Xp1o2kTKAkIk0Vq_SKB5UirdPeyqK737b8pLzi_QntUTTFVhW9WvrJkE26SwP-uzzoNpnmDRR6gp2q4o_x_HUSlkZSRD5cKpHO4tAXvyZsDT5ipQfADNxJcU9oNjBdcpzftV8cowDkvJGcYX5GbOYs4DBir-530DGg3Y-fUe22rtTNArIfw9WXC-781aE2-l3jQGjGfec-9yvS6dZPvOsBQQr3d5fOu2_6RrhFHxufv5NxWZSc2hVLzCU8_vm__dpbOJAU6oaTJNM8PdqdMISfDta-E1kv_6YmowNKbqr63LzN617Cd1jTin70vXJtd367Faff4UBIZNScyu-m8Sxjmm9B_Uc5qhvckUAd7m6m5MaV3nPZMkbTdYLjeFxPWEAuKCP_5EXGS4BOOHhcvR2f5X9H1bh3yMuy-UZu1aGT8kPDHgZoxJjHNmvzJ6_PlVuC9fuXsBLgaxSr5q5xPh5S72HmqmhM1GSx8AjU6iuV6zmSIs821PYpsG1OLlb9vrlXgMInIqSjG_ClOvjZnmIqNuYBaaFe_T7X0M4aYfI_tsaz3_Co0rHRZDcD78Ic9o6dVzjm1s` |
| `ADGEM_PUBLISHER_ID` | `31283` |
| `ADGEM_APP_ID` | `31283` |
| `ADGEM_POSTBACK_KEY` | `6b133h6i0674mfcca9bnfaid` |

---

### الخطوة 2: رفع Edge Functions (3 دالات)

#### أ) adgem-postback (الأهم!)
**هذه الدالة تستقبل إشعارات إكمال المهام من AdGem**

```bash
# عبر CLI
supabase functions deploy adgem-postback

# أو يدوياً عبر Dashboard
```

**الكود في:**
```
promohive/supabase/functions/adgem-postback/index.ts
```

#### ب) sync-adgem-offers (المحدث)
**لجلب العروض تلقائياً**

```bash
supabase functions deploy sync-adgem-offers
```

**الكود في:**
```
promohive/supabase/functions/sync-adgem-offers/index.ts
```

---

### الخطوة 3: تحديث Postback URL في AdGem

**ارجع لـ AdGem Dashboard:**
```
https://dashboard.adgem.com/apps/31283/edit
```

**غير Postback URL إلى:**
```
https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/adgem-postback?appid={app_id}&userid={player_id}&offerid={offer_id}&amount={amount}&payout={payout}&transaction_id={transaction_id}&offer_name={offer_name}
```

**اضغط "Save"** ✅

---

### الخطوة 4: اختبار النظام

#### A. اختبار Postback يدوياً:

```bash
curl "https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/adgem-postback?userid=USER_UUID_HERE&offerid=12345&payout=10.00&transaction_id=test123"
```

**النتيجة المتوقعة:**
```json
{
  "status": "success",
  "user_reward": 1.00,
  "message": "Postback processed successfully"
}
```

#### B. اختبار Sync Offers:

```bash
curl -X POST \
  https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/sync-adgem-offers \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

### الخطوة 5: إضافة Offerwall في التطبيق

#### في صفحة Tasks، أضف رابط:

```javascript
const adgemWallUrl = `https://api.adgem.com/v1/wall?appid=31283&playerid=${userId}`;

// في Component:
<a 
  href={adgemWallUrl} 
  target="_blank"
  className="btn-primary"
>
  View AdGem Offers
</a>

// أو في iFrame:
<iframe 
  src={adgemWallUrl}
  style={{ width: '100%', height: '600px', border: 'none' }}
/>
```

---

## 📊 كيف يعمل النظام:

### السيناريو الكامل:

```
1. المستخدم يفتح Offerwall
   ↓
   URL: https://api.adgem.com/v1/wall?appid=31283&playerid=USER_ID

2. المستخدم يختار عرض ويكمله
   ↓
   AdGem يرسل Postback إلى تطبيقك

3. Postback يصل إلى adgem-postback function
   ↓
   الدالة تحسب المكافأة حسب مستوى المستخدم:
   - Level 0: 10% من $10 = $1.00
   - Level 2: 40% من $10 = $4.00
   - Level 5: 85% من $10 = $8.50

4. الدالة تضيف المبلغ لرصيد المستخدم
   ↓
   تسجل Transaction في قاعدة البيانات

5. أنت تربح الفرق!
   ↓
   AdGem يدفع لك $10
   المستخدم Level 2 حصل على $4
   أنت ربحت $6 💰
```

---

## 🎯 نظام المكافآت المطبق:

| مستوى | نسبة | عرض $10 | عرض $50 | عرض $100 |
|-------|------|---------|---------|----------|
| 0 | 10% | $1.00 | $5.00 | $10.00 |
| 1 | 25% | $2.50 | $12.50 | $25.00 |
| 2 | 40% | $4.00 | $20.00 | $40.00 |
| 3 | 55% | $5.50 | $27.50 | $55.00 |
| 4 | 70% | $7.00 | $35.00 | $70.00 |
| 5+ | 85% | $8.50 | $42.50 | $85.00 |

**القيمة الحقيقية مخفية تماماً عن المستخدم!** ✅

---

## 🔐 الأمان:

### Postback Verification:
الدالة تتحقق من:
- ✅ وجود المستخدم
- ✅ عدم تكرار Transaction ID
- ✅ صحة البيانات
- ✅ تسجيل كل التفاصيل في admin_notes

---

## 📈 المزامنة التلقائية:

### إعداد Cron Job:

```sql
SELECT cron.schedule(
  'sync-adgem-offers',
  '0 */6 * * *', -- كل 6 ساعات
  $$
  SELECT net.http_post(
    url:='https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/sync-adgem-offers',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    )
  );
  $$
);
```

---

## ✅ قائمة التحقق النهائية:

- [ ] إضافة Secrets في Supabase (4 قيم)
- [ ] رفع adgem-postback function
- [ ] رفع sync-adgem-offers function
- [ ] تحديث Postback URL في AdGem Dashboard
- [ ] اختبار Postback
- [ ] اختبار Sync
- [ ] إضافة Offerwall في التطبيق
- [ ] إعداد Cron Job (اختياري)

---

## 🎉 بعد الانتهاء:

- ✅ العروض تُجلب تلقائياً من AdGem
- ✅ Postback يعمل فوراً
- ✅ نظام المكافآت الذكي نشط
- ✅ القيمة الحقيقية مخفية
- ✅ أنت تربح الفرق

---

## 🆘 للدعم:

إذا واجهت أي مشكلة:
1. تحقق من Logs في Supabase
2. تحقق من Postback logs في AdGem
3. اختبر الدالات يدوياً
4. أخبرني وسأساعدك!

---

**ابدأ الآن بالخطوة 1!** 🚀
