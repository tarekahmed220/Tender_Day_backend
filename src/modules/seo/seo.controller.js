import Seo from "../../../db/models/seo.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import APIFeatures from "../utility/APIFeatures.js";

export const getAllSeo = catchError(async (req, res, next) => {
  const features = new APIFeatures(Seo.find({ deleted: false }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const data = await features.query.lean();
  const totalCount = await Seo.countDocuments({ deleted: false });
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  res
    .status(200)
    .json({ data, totalCount, pageCount: Math.ceil(totalCount / limit), skip });
});

export const getSeoById = catchError(async (req, res, next) => {
  const { id } = req.params;
  const seo = await Seo.findOne({ id, deleted: false });
  if (!seo) return next(new AppError("الصفحة غير موجودة", 404));
  res.status(200).json({ data: seo });
});

export const updateSeo = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { title_ar, title_en, description_ar, description_en } = req.body;
  const seo = await Seo.findOne({ id, deleted: false });
  if (!seo) return next(new AppError("الصفحة غير موجودة", 404));
  if (title_ar) seo.title_ar = title_ar;
  if (title_en) seo.title_en = title_en;
  if (description_ar) seo.description_ar = description_ar;
  if (description_en) seo.description_en = description_en;
  await seo.save();
  res.status(200).json({ message: "تم التحديث بنجاح", data: seo });
});
