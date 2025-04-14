# استخدم صورة Node الرسمية
FROM node:20-alpine

# إعداد مجلد العمل داخل الكونتينر
WORKDIR /app

# نسخ ملفات البروجكت وتثبيت الباكج
COPY package*.json ./
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# البورت اللي التطبيق بيشتغل عليه
EXPOSE 3000

# أمر التشغيل
CMD ["node", "app.js"]
