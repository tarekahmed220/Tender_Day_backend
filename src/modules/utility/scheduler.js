import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import Tender from "../../../db/models/tender.model.js";

const uploadDir = path.resolve("uploads", "tenders");

export const manageTenders = async () => {
  const currentDate = new Date();

  const activeTenders = await Tender.find({ isDeleted: false });
  for (const tender of activeTenders) {
    if (new Date(tender.closingDate) < currentDate) {
      if (tender.fileUrl) {
        const filePath = path.join(uploadDir, path.basename(tender.fileUrl));
        if (
          await fs
            .access(filePath)
            .then(() => true)
            .catch(() => false)
        ) {
          await fs.unlink(filePath);
        }
        tender.fileUrl = null;
        await tender.save();
      }
    }
  }

  // 2. فحص المناقصات المحذوفة مبدئيًا (isDeleted: true) والتأكد من حذف الملف
  const archivedTenders = await Tender.find({ isDeleted: true });
  for (const tender of archivedTenders) {
    if (tender.fileUrl) {
      const filePath = path.join(uploadDir, path.basename(tender.fileUrl));
      if (
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false)
      ) {
        await fs.unlink(filePath);
      }
      tender.fileUrl = null;
      await tender.save();
    }
  }
};

// جدولة الفحص كل يوم في منتصف الليل
cron.schedule("* * * * *", () => {
  manageTenders().catch((err) => console.error("Error in cron job:", err));
});
// cron.schedule("0 0 * * *", () => {
//   manageTenders().catch((err) => console.error("Error in cron job:", err));
// });

// استدعاء الفحص يدويًا عند بدء السيرفر
manageTenders().catch((err) => console.error("Initial check failed:", err));
