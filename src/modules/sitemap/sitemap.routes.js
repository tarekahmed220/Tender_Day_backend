import express from "express";
import path from "path";
import fs from "fs";
import { generateSitemap } from "../utility/sitemapGenerator.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const sitemapDir = path.resolve(process.cwd(), "public");
    const sitemapPath = path.join(sitemapDir, "sitemap.xml");

    if (!fs.existsSync(sitemapPath)) {
      await generateSitemap();
    }

    res.setHeader("Content-Type", "application/xml");
    res.sendFile(sitemapPath);
  } catch (err) {
    next(err);
  }
});

export default router;
