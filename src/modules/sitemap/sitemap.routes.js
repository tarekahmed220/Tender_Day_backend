import express from "express";
import path from "path";
import fs from "fs";
import { generateSitemap } from "../utility/sitemapGenerator.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const sitemapPath = path.resolve("public", "sitemap.xml");

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
