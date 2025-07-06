import Seo from "../../../db/models/seo.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import APIFeatures from "../utility/APIFeatures.js";

export const createSeo = catchError(async (req, res, next) => {
  const { id, name, title, description } = req.body;
  const exists = await Seo.findOne({ id });
  if (exists) return next(new AppError("هذه الصفحة موجودة بالفعل", 400));
  const seo = await Seo.create({ id, name, title, description });
  res.status(201).json({ message: "تمت الإضافة بنجاح", data: seo });
});

export const updateSeo = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const seo = await Seo.findOne({ id, deleted: false });
  if (!seo) return next(new AppError("الصفحة غير موجودة", 404));
  if (title) seo.title = title;
  if (description) seo.description = description;
  await seo.save();
  res.status(200).json({ message: "تم التحديث بنجاح", data: seo });
});

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
