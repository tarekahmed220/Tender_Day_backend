import catchError from "../../middleware/handleError.js";
import SiteInfo from "../../../db/models/siteInfo.model.js";

export const getSiteInfo = catchError(async (req, res, next) => {
  const siteInfo = (await SiteInfo.findOne()) || {};
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
