import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import Tender from "../../../db/models/tender.model.js";

const uploadDir = path.resolve("uploads", "tenders");

const manageTenders = async () => {
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

cron.schedule("0 0 * * *", () => {
  manageTenders().catch((err) => console.error("Error in cron job:", err));
});

manageTenders().catch((err) => console.error("Initial check failed:", err));
