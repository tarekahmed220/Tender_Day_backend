import express from "express";
import path from "path";
import fs from "fs";
import { generateSitemap } from "../utility/sitemapGenerator.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const sitemapPath = path.resolve("public", "sitemap.xml");

    // Generate sitemap if it doesn't exist
    if (!fs.existsSync(sitemapPath)) {
      await generateSitemap();
    }

    // Explicitly set Content-Type and charset
    res.setHeader("Content-Type", "application/xml; charset=utf-8");

    // Stream the file to ensure proper delivery
    const stream = fs.createReadStream(sitemapPath);
    stream.pipe(res);
  } catch (err) {
    console.error("Sitemap error:", err);
    next(err);
  }
});

export default router;
