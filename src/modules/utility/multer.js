// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import fs from "fs";

// const uploadDir = path.resolve("uploads", "tenders");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.memoryStorage();

// export const upload = multer({
//   storage,
//   limits: { fileSize: 30 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "application/pdf",
//       "application/zip",
//       "application/x-zip-compressed",
//       "multipart/x-zip",
//       "application/x-7z-compressed",
//       "application/x-rar-compressed",
//       "application/vnd.rar",
//       "application/x-tar",
//       "application/gzip",
//       "application/x-bzip2",
//       "application/rar",
//     ];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(new Error("صيغة الملف غير مدعومة"), false);
//     }
//     cb(null, true);
//   },
// });
import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = path.resolve("uploads", "tenders");
const tempDir = path.resolve("uploads", "temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // حفظ الملف مؤقتًا في مجلد temp
  },
  filename: (req, file, cb) => {
    const fileName = `temp-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // زيادة الحد إلى 50 ميجا إذا لزم الأمر
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
      "application/vnd.rar",
      "application/x-tar",
      "application/gzip",
      "application/x-bzip2",
      "application/rar",
      "application/x-compressed",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("صيغة الملف غير مدعومة"), false);
    }
    cb(null, true);
  },
});
