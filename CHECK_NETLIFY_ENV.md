# ⚠️ CHECK NETLIFY ENVIRONMENT VARIABLES

## الخطوة 1: افتح Netlify Site Settings
```
https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/env
```

## الخطوة 2: تأكد من وجود هذه المتغيرات:

### ✅ يجب أن تكون موجودة:
```
VITE_SUPABASE_URL = https://jtxmijnxrgcwjvtdlgxy.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.wyPqe5j3VeCYGOaYmN6e9Yp-LW4n7bUxsOVwCCpJM6o
```

## الخطوة 3: إذا كانت ناقصة أو خاطئة

1. اضغط **"Add a variable"**
2. Key: `VITE_SUPABASE_URL`
3. Value: `https://jtxmijnxrgcwjvtdlgxy.supabase.co`
4. Scope: "All scopes" أو "All deploys"
5. Save

كرر نفس الشيء لـ `VITE_SUPABASE_ANON_KEY`

## الخطوة 4: بعد التعديل

1. اضغط **"Trigger deploy"** → **"Clear cache and deploy site"**
2. انتظر حتى ينتهي Build (2-3 دقائق)
3. جرب التسجيل مرة أخرى

---

## 🔍 كيف تعرف إذا كان الموقع يستخدم Environment Variables الصحيحة؟

افتح موقعك واضغط F12، ثم في Console نفذ:

```javascript
// سترى undefined (وهذا طبيعي لأسباب أمنية)
// لكن جرب هذا:
console.log(window.location.origin)

// ثم افتح Network tab في F12
// وجرب التسجيل
// راقب الطلبات - يجب أن ترى:
// https://jtxmijnxrgcwjvtdlgxy.supabase.co/rest/v1/rpc/create_verification_code
```

إذا رأيت URL مختلف، Environment Variables خاطئة!
