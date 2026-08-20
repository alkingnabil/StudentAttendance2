# تدريبي — Node.js + MongoDB + Render

هذه نسخة مفصولة من التطبيق الأصلي: Frontend ثابت + Backend Node.js/Express + MongoDB عبر Mongoose.

## الوظائف
- حساب الطالب وحسابات الإدارة.
- إنشاء حساب الطالب بشرط وجود الاسم ورقم الجلوس في البيانات المستوردة.
- QR فريد لكل طالب، ويعرضه الطالب داخل حسابه.
- فحص QR من كاميرا المسؤول، ثم جلب ملف الطالب كاملًا من MongoDB.
- عرض بيانات الطالب، المجموعة، التدريب، الحضور، الغياب، نسبة الحضور، الدرجات والمجموع.
- تسجيل حضور الطالب بعد فحص QR.
- التقييم بجلسة تحدد الشهر والتاريخ والدرجة النهائية.
- شهور الدراسة.
- استيراد XLSX/XLS/CSV إلى MongoDB من حساب Master.
- إدارة المجموعات وصلاحيات الحسابات الإدارية.
- مراجعة واعتماد النتائج والتصدير إلى XLSX.

## التشغيل المحلي
1. أنشئ MongoDB Atlas Cluster أو MongoDB محلي.
2. انسخ `backend/.env.example` إلى `backend/.env`.
3. ضع `MONGODB_URI` و`JWT_SECRET`.
4. نفّذ:

```bash
cd backend
npm install
npm start
```

5. شغل `frontend` عبر خادم ثابت، وليس `file://`. مثال:

```bash
npx serve frontend -l 5500
```

6. افتح `http://localhost:5500`.

## إعداد عنوان API
افتراضيًا Frontend يستخدم:

`http://localhost:10000/api`

على Render، احفظ عنوان API الحقيقي في LocalStorage داخل المتصفح:

```js
localStorage.setItem('tadreebi_api_url', 'https://YOUR-API.onrender.com/api')
```

ثم أعد تحميل الصفحة.

## حسابات التجربة
- mai@tadreebi.local / 123456
- mostafa@tadreebi.local / 123456
- abohassan@tadreebi.local / 123456
- bodour@tadreebi.local / 123456
- hani@tadreebi.local / 123456
- master@tadreebi.local / master123

غيّر هذه الحسابات وكلمات المرور قبل الاستخدام الحقيقي.

## Render
الملف `render.yaml` يعرّف Web Service للـ API وStatic Site للـ Frontend. اضبط `MONGODB_URI` و`JWT_SECRET` و`FRONTEND_ORIGIN` في Render.

الكاميرا تحتاج HTTPS أو localhost. Static Sites على Render تُخدم عبر HTTPS، لذا يمكن تشغيل QR Scanner بعد منح المتصفح صلاحية الكاميرا.

## ملاحظة عن QR
الـ QR لا يحتوي الرقم القومي أو بيانات الطالب. يحتوي token عشوائي، والسيرفر هو الذي يحوّل token إلى الطالب بعد التحقق من صلاحية المسؤول.

## الفحص
من مجلد المشروع:

```bash
npm run check
```

هذا يفحص syntax لجميع ملفات JavaScript في Backend وFrontend. لم يتم اعتبار المشروع "جاهزًا للإنتاج" من ناحية الأمن التشغيلي قبل تغيير الحسابات التجريبية وضبط MongoDB Atlas وCORS وأي نسخ احتياطية مطلوبة.
