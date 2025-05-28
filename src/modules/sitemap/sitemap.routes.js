import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import Tender from "../../../db/models/tender.model.js";

const router = express.Router();
const BASE_URL = "https://tendersday.com";

router.get("/sitemap.xml", async (req, res) => {
  try {
    const sitemap = new SitemapStream({ hostname: BASE_URL });

    // الصفحات الثابتة
    sitemap.write({ url: "/", changefreq: "daily", priority: 1 });
    sitemap.write({ url: "/contactus", changefreq: "monthly", priority: 0.8 });
    sitemap.write({
      url: "/subscriptions",
      changefreq: "monthly",
      priority: 0.8,
    });

    // صفحات الدول
    const countryPages = [
      { id: "67000000000000000000006d", ar: "قطر", en: "Qatar" },
      { id: "6802c95e44a36004f4ab3620", ar: "العراق", en: "Iraq" },
      { id: "6803d7e244a36004f4ab6374", ar: "الامارات", en: "Emirates" },
      { id: "68106f19a025a2789f524bfc", ar: "عمان", en: "Oman" },
    ];

    countryPages.forEach((country) => {
      sitemap.write({
        url: `/tenders/countries/${
          country.id
        }?type=byCountry&ar=${encodeURIComponent(
          country.ar
        )}&en=${encodeURIComponent(country.en)}`,
        changefreq: "weekly",
        priority: 0.9,
      });
    });

    // المناقصات من قاعدة البيانات
    const tenders = await Tender.find({ isDeleted: false }, "_id").lean();
    tenders.forEach((tender) => {
      sitemap.write({
        url: `/tenders/tender-details/${tender._id}`,
        changefreq: "weekly",
        priority: 0.9,
      });
    });

    // إنهاء السيت ماب وتحويله لـ XML
    sitemap.end();
    const xml = await streamToPromise(sitemap).then((data) => data.toString());

    // إرسال الـ XML مباشرة
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    console.error("خطأ في إنشاء Sitemap:", err);
    res.status(500).send("خطأ في تحميل Sitemap");
  }
});

export default router;
