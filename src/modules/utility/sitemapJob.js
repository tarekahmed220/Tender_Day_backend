import cron from "node-cron";
import { generateSitemap } from "./sitemapGenerator.js";

export const startSitemapJob = () => {
  cron.schedule("0 3 * * *", async () => {
    try {
      await generateSitemap();
      console.log("✅ Sitemap generated via cron.");
    } catch (err) {
      console.error("❌ Error generating sitemap via cron:", err);
    }
  });

  (async () => {
    try {
      await generateSitemap();
      console.log("✅ Sitemap generated on server start.");
    } catch (err) {
      console.error("❌ Error generating sitemap on start:", err);
    }
  })();
};
