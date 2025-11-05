# 🚀 طريقة تحديث Netlify بعد تعديل الكود

## الطريقة الأولى: Automatic Deploy (موصى بها)

### إذا كان Netlify متصل بـ GitHub:
التحديثات تُنشر **تلقائياً** عند Push إلى GitHub!

1. بعد كل `git push`
2. انتظر 2-3 دقائق
3. Netlify سيبني الموقع تلقائياً
4. راقب Build في: https://app.netlify.com/sites/YOUR_SITE/deploys

---

## الطريقة الثانية: Manual Trigger Deploy

### إذا لم يبدأ Build تلقائياً:

#### الخطوات:
1. افتح: https://app.netlify.com/sites/startling-moonbeam-f8fa0b/deploys
2. اضغط **"Trigger deploy"**
3. اختر **"Clear cache and deploy site"**
4. انتظر Build ينتهي (2-3 دقائق)

---

## الطريقة الثالثة: Deploy من CLI (متقدم)

### إذا كنت تريد Deploy يدوي من Terminal:

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# Deploy الموقع
cd /workspace/promohive
netlify deploy --prod
```

---

## ✅ التحقق من نجاح Deploy:

### في Netlify Dashboard:
```
Status: Published ✅
Deploy time: Few seconds ago
URL: https://startling-moonbeam-f8fa0b.netlify.app
```

### في المتصفح:
1. افتح الموقع
2. اضغط `Ctrl + Shift + R` لمسح Cache
3. تحقق من التغييرات

---

## 🔧 حل مشاكل Build الشائعة:

### ❌ Build Failed - Missing dependencies
```bash
# تأكد من package.json صحيح
# في Netlify Build Settings:
Build command: npm run build
Publish directory: dist
```

### ❌ Build Failed - Environment variables
```bash
# أضف في: Site settings → Environment variables
VITE_SUPABASE_URL=https://jtxmijnxrgcwjvtdlgxy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### ❌ Page not found after deploy
```bash
# تأكد من وجود ملف: public/_redirects
/*    /index.html   200
```

---

## 📊 متى تحتاج Clear Cache؟

### امسح Cache في هذه الحالات:
- ✅ بعد تعديل ملفات Static (CSS, JS)
- ✅ بعد تغيير Environment Variables
- ✅ عند ظهور نسخة قديمة من الموقع
- ✅ عند مشاكل في الـ Routing

### لا تحتاج Clear Cache:
- ❌ تعديلات بسيطة في الكود
- ❌ Deploy عادي بدون مشاكل

---

## 🎯 الخلاصة:

### أسهل طريقة:
```
git add .
git commit -m "Update"
git push

→ انتظر 3 دقائق
→ الموقع يتحدث تلقائياً! ✅
```

### إذا لم يتحدث تلقائياً:
```
1. افتح Netlify Dashboard
2. اضغط "Trigger deploy"
3. اختر "Clear cache and deploy site"
```

---

## 📞 الدعم:

إذا لم تنجح أي طريقة:
1. تحقق من Git connection في Netlify
2. تحقق من Build logs للأخطاء
3. تحقق من Environment Variables
