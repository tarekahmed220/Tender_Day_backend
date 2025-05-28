import express from "express";
import path from "path";
import fs from "fs";
import { generateSitemap } from "../utility/sitemapGenerator.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    // const sitemapDir = path.resolve("public");
    // const sitemapPath = path.join(sitemapDir, "sitemap.xml");
    const sitemapDir = path.resolve(process.cwd(), "public");
    const sitemapPath = path.join(sitemapDir, "sitemap.xml");

    if (!fs.existsSync(sitemapDir)) {
      fs.mkdirSync(sitemapDir, { recursive: true });
    }

    if (!fs.existsSync(sitemapPath)) {
      await generateSitemap();
    }

    res.sendFile(sitemapPath);
  } catch (err) {
    next(err);
  }
});

export default router;
