# 🔄 دليل المزامنة التلقائية مع AdGem

## 📋 المطلوب من AdGem:

### 1. حساب Publisher نشط ✅

**سجل في AdGem كـ Publisher:**
```
https://dashboard.adgem.com/signup
```

**املأ المعلومات:**
- نوع الموقع/التطبيق
- الدولة المستهدفة
- طريقة الدفع
- معلومات التواصل

**انتظر الموافقة** (عادة 24-48 ساعة)

---

### 2. API Credentials (بعد الموافقة)

بعد قبولك كـ Publisher، احصل على:

#### A. Publisher ID
**الموقع:**
```
https://dashboard.adgem.com/settings
```

ستجد:
```
Publisher ID: 123456
```

#### B. API Key
**الموقع:**
```
https://dashboard.adgem.com/api-settings
أو
https://dashboard.adgem.com/developer
```

**اضغط "Generate API Key"** وانسخ:
```
API Key: ag_live_abc123def456ghi789...
```

⚠️ **مهم:** لا تشارك هذا المفتاح مع أحد!

---

### 3. Offerwall Configuration

**في AdGem Dashboard:**

#### A. اذهب إلى Offerwall Settings:
```
https://dashboard.adgem.com/offerwall
```

#### B. أضف Application:
- **App Name:** PromoHive
- **App Type:** Web/Mobile
- **Platform:** iOS, Android, Web
- **Package Name/URL:** your-domain.com

#### C. احصل على Offerwall URL:
```
https://api.adgem.com/v1/wall?appid=YOUR_APP_ID&playerid={USER_ID}
```

---

## 🔧 الإعداد في تطبيقك:

### الخطوة 1: إضافة Credentials في Supabase

**افتح Settings:**
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
```

**في قسم "Secrets"، أضف:**

| Name | Value | مثال |
|------|-------|------|
| `ADGEM_API_KEY` | [المفتاح من AdGem] | `ag_live_abc123...` |
| `ADGEM_PUBLISHER_ID` | [معرف الـ Publisher] | `123456` |
| `ADGEM_APP_ID` | [معرف التطبيق] | `789012` |

---

### الخطوة 2: رفع Edge Function للمزامنة

#### الطريقة A: عبر Supabase CLI

```bash
cd /workspace/promohive
supabase functions deploy sync-adgem-offers
```

#### الطريقة B: يدوياً عبر Dashboard

1. **افتح Edge Functions:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
   ```

2. **اضغط "Create a new function"**

3. **الاسم:** `sync-adgem-offers`

4. **الكود:** انسخ من:
   ```
   promohive/supabase/functions/sync-adgem-offers/index.ts
   ```

5. **اضغط "Deploy"**

---

### الخطوة 3: تحديث Edge Function حسب AdGem API

**ملاحظة مهمة:** API endpoint قد يختلف حسب AdGem.

#### التنسيق الشائع:

```typescript
// في sync-adgem-offers/index.ts
const adgemResponse = await fetch(
  `https://api.adgem.com/v1/publisher/${ADGEM_PUBLISHER_ID}/offers`,
  {
    headers: {
      'Authorization': `Bearer ${ADGEM_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

#### أو:

```typescript
const adgemResponse = await fetch(
  `https://api.adgem.com/v1/offers?appid=${ADGEM_APP_ID}`,
  {
    headers: {
      'X-API-Key': ADGEM_API_KEY,
      'Content-Type': 'application/json'
    }
  }
);
```

**تحتاج للتحقق من AdGem API Documentation:**
```
https://dashboard.adgem.com/docs/api
```

---

## 🧪 اختبار المزامنة:

### الخطوة 1: تشغيل يدوي

```bash
curl -X POST \
  https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/sync-adgem-offers \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "AdGem offers synced successfully",
  "stats": {
    "total": 45,
    "inserted": 20,
    "updated": 25,
    "errors": 0
  }
}
```

---

### الخطوة 2: جدولة تلقائية (كل 24 ساعة)

#### استخدام Supabase Cron Jobs:

**افتح Database:**
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/database/cron
```

**أضف Cron Job:**
```sql
SELECT cron.schedule(
  'sync-adgem-offers-daily',
  '0 0 * * *', -- كل يوم الساعة 12 صباحاً
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

## 🔍 فهم بنية AdGem API Response:

### الشكل المتوقع:

```json
{
  "offers": [
    {
      "id": "offer_12345",
      "name": "Download Gaming App",
      "description": "Download and play for 5 minutes",
      "payout": 5.00,
      "currency": "USD",
      "countries": ["US", "CA", "UK"],
      "platform": ["iOS", "Android"],
      "category": "gaming",
      "click_url": "https://tracking.adgem.com/...",
      "status": "active",
      "requirements": {
        "min_level": 3,
        "device": "mobile"
      }
    }
  ]
}
```

**إذا كان مختلفاً، سأحتاج تعديل الكود!**

---

## 🔄 Webhook من AdGem (اختياري)

### لتحديث فوري عند تغيير العروض:

#### 1. في AdGem Dashboard:
```
https://dashboard.adgem.com/webhooks
```

#### 2. أضف Webhook URL:
```
https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/adgem-webhook
```

#### 3. اختر Events:
- Offer Added
- Offer Updated
- Offer Removed

---

## 🎯 Postback URL (مهم جداً!)

### لتأكيد إكمال المستخدم للمهمة:

#### في AdGem Dashboard:
```
https://dashboard.adgem.com/postback
```

#### أضف Postback URL:
```
https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/adgem-postback?user_id={USER_ID}&offer_id={OFFER_ID}&payout={PAYOUT}&status={STATUS}
```

#### المتغيرات:
- `{USER_ID}` - معرف المستخدم في تطبيقك
- `{OFFER_ID}` - معرف العرض
- `{PAYOUT}` - القيمة المدفوعة
- `{STATUS}` - حالة (completed, rejected, pending)

---

## 📊 ملخص الخطوات:

| الخطوة | المدة | الحالة |
|--------|------|--------|
| 1. التسجيل في AdGem | 10 دقائق | ⏳ |
| 2. انتظار الموافقة | 24-48 ساعة | ⏳ |
| 3. الحصول على API Credentials | 5 دقائق | ⏳ |
| 4. إضافة Secrets في Supabase | 2 دقيقة | ⏳ |
| 5. رفع sync-adgem-offers | 3 دقائق | ⏳ |
| 6. تحديث API endpoint | 5 دقائق | ⏳ |
| 7. اختبار المزامنة | 2 دقيقة | ⏳ |
| 8. إعداد Cron Job | 3 دقائق | ⏳ |
| 9. إعداد Postback URL | 5 دقائق | ⏳ |

**المجموع:** ~35 دقيقة + وقت انتظار الموافقة

---

## ⚠️ ملاحظات مهمة:

### 1. API Documentation
- **كل publisher قد يكون له API مختلف قليلاً**
- تحقق من: `https://dashboard.adgem.com/docs`
- أو اطلب من AdGem Support

### 2. Rate Limiting
- AdGem قد يحد عدد الطلبات
- لا تزامن أكثر من مرة كل ساعة
- استخدم Cron Job مرة يومياً

### 3. Postback Security
- استخدم Hash للتحقق من صحة Postback
- AdGem عادة يرسل Signature للتحقق

---

## 🆘 إذا واجهت مشاكل:

### المشكلة: "Invalid API Key"
**الحل:** 
- تحقق من نسخ المفتاح كاملاً
- تأكد من عدم وجود مسافات
- تحقق من أن الحساب مفعّل

### المشكلة: "No offers returned"
**الحل:**
- تأكد من موافقة AdGem على حسابك
- تحقق من إعدادات Offerwall
- تأكد من اختيار البلدان الصحيحة

### المشكلة: "401 Unauthorized"
**الحل:**
- تحقق من Publisher ID
- تحقق من API Key
- تحقق من header format

---

## 📞 احصل على المساعدة:

### من AdGem:
- Support: support@adgem.com
- Documentation: https://dashboard.adgem.com/docs
- Discord: (إذا متوفر)

### مني:
بعد حصولك على:
1. API Key
2. Publisher ID
3. مثال على API Response

**أستطيع تحديث الكود بالضبط حسب API الخاص بـ AdGem!**

---

**ابدأ الآن بالتسجيل في AdGem، وأخبرني عندما تحصل على Credentials!** 🚀
