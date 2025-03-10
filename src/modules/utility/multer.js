import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads", "tenders");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/zip",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("صيغة الملف غير مدعومة"), false);
    }
    cb(null, true);
  },
});
