import countryModel from "../../../db/models/country.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

export const getAllCountries = catchError(async (req, res, next) => {
  const totalCount = await countryModel.countDocuments({ isDeleted: false });
  const features = new APIFeatures(
    countryModel.find({ isDeleted: false }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const countries = await features.query;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  if (!countries.length) {
    return next(new AppError("لا توجد دول متاحة", 404));
  }

  res.status(200).json({ data: countries, totalCount, skip });
});

export const addCountry = catchError(async (req, res, next) => {
  const { name_ar, name_en } = req.body;

  const existingCountry = await countryModel.findOne({
    $or: [{ name_ar }, { name_en }],
    isDeleted: false,
  });
  if (existingCountry) {
    if (existingCountry.isDeleted) {
      existingCountry.isDeleted = false;
      await existingCountry.save();
      return res.status(200).json({
        message: "تمت إعادة إضافة الدولة بنجاح",
        country: existingCountry,
      });
    }
    return next(new AppError("هذه الدولة موجودة بالفعل", 400));
  }

  const newCountry = new countryModel({ name_ar, name_en });
  await newCountry.save();

  res
    .status(201)
    .json({ message: "تمت إضافة الدولة بنجاح", country: newCountry });
});

export const deleteCountry = catchError(async (req, res, next) => {
  const { id } = req.params;
  const country = await countryModel.findById(id);
  if (!country) {
    return next(new AppError("الدولة غير موجودة", 404));
  }

  country.isDeleted = true;
  await country.save();
  res.status(200).json({ message: "تم حذف الدولة بنجاح" });
});
