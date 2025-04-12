import catchError from "../../middleware/handleError.js";
import SiteInfo from "../../../db/models/siteInfo.model.js";
import fs from "fs";
import path from "path";

export const getSiteInfo = catchError(async (req, res, next) => {
  const siteInfo = (await SiteInfo.findOne())?.toObject() || {};

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (siteInfo.mainImage)
    siteInfo.mainImage = `${baseUrl}/uploads/siteInfo/${siteInfo.mainImage}`;

  if (Array.isArray(siteInfo.brands)) {
    siteInfo.brands = siteInfo.brands.map(
      (logo) => `${baseUrl}/uploads/siteInfo/${logo}`
    );
  }

  res.status(200).json({ data: siteInfo });
});

export const updateSiteInfo = catchError(async (req, res, next) => {
  let siteInfo = await SiteInfo.findOne();

  if (!siteInfo) {
    siteInfo = new SiteInfo(req.body);
    await siteInfo.save();
    return res.status(201).json({ message: "تم حفظ البيانات بنجاح", siteInfo });
  }

  const updatedData = {
    aboutUs_ar: req.body.aboutUs_ar ?? siteInfo.aboutUs_ar,
    aboutUs_en: req.body.aboutUs_en ?? siteInfo.aboutUs_en,
    whySubscribe_ar: req.body.whySubscribe_ar ?? siteInfo.whySubscribe_ar,
    whySubscribe_en: req.body.whySubscribe_en ?? siteInfo.whySubscribe_en,
    whatsapp: req.body.whatsapp ?? siteInfo.whatsapp,
    viber: req.body.viber ?? siteInfo.viber,
    email: req.body.email ?? siteInfo.email,
  };

  Object.assign(siteInfo, updatedData);
  await siteInfo.save();

  res.status(200).json({ message: "تم تحديث البيانات بنجاح", siteInfo });
});

export const uploadMainImage = catchError(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع الصورة" });
  }

  let siteInfo = await SiteInfo.findOne();
  if (!siteInfo) siteInfo = new SiteInfo();

  if (siteInfo.mainImage) {
    const oldPath = path.resolve(`uploads/${siteInfo.mainImage}`);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  siteInfo.mainImage = req.file.filename;
  await siteInfo.save();

  res
    .status(200)
    .json({ message: "تم رفع الصورة بنجاح", mainImage: siteInfo.mainImage });
});

export const removeMainImage = catchError(async (req, res, next) => {
  const siteInfo = await SiteInfo.findOne();
  if (!siteInfo || !siteInfo.mainImage) {
    return res.status(404).json({ message: "لا توجد صورة رئيسية لحذفها" });
  }

  const filePath = path.resolve("uploads", "siteInfo", siteInfo.mainImage);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  siteInfo.mainImage = "";
  await siteInfo.save();

  res.status(200).json({ message: "تم حذف الصورة الرئيسية بنجاح" });
});

export const addBrandLogo = catchError(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع صورة" });
  }

  let siteInfo = await SiteInfo.findOne();
  if (!siteInfo) {
    siteInfo = new SiteInfo();
  }

  siteInfo.brands.push(req.file.filename);
  await siteInfo.save();

  res
    .status(200)
    .json({ message: "تم رفع الشعار بنجاح", brands: siteInfo.brands });
});

export const removeBrandLogo = catchError(async (req, res, next) => {
  let { filename } = req.params;

  filename = filename.split("/").pop();

  const siteInfo = await SiteInfo.findOne();

  if (!siteInfo || !siteInfo.brands.includes(filename)) {
    return res.status(404).json({ message: "الشعار غير موجود" });
  }

  const filePath = path.resolve("uploads", "siteInfo", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  siteInfo.brands = siteInfo.brands.filter((f) => f !== filename);
  await siteInfo.save();

  res
    .status(200)
    .json({ message: "تم حذف الشعار بنجاح", brands: siteInfo.brands });
});
