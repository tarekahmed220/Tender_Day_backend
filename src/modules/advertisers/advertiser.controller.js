import advertiserModel from "../../../db/models/advertiser.model.js";
import countryModel from "../../../db/models/country.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

export const getAllAdvertisers = catchError(async (req, res, next) => {
  const totalCount = await advertiserModel.countDocuments({ isDeleted: false });
  const features = new APIFeatures(
    advertiserModel.find({ isDeleted: false }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const advertisers = await features.query;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  if (!advertisers.length) {
    return next(new AppError("لا تتوفر قائمة معلنين ", 404));
  }

  res.status(200).json({ data: advertisers, totalCount, skip });
});

export const addAdvertiser = catchError(async (req, res, next) => {
  const { phone, email, address } = req.body;

  const existingAdvertiser = await advertiserModel.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingAdvertiser) {
    if (existingAdvertiser.isDeleted) {
      existingAdvertiser.isDeleted = false;
      existingAdvertiser.phone = phone;
      existingAdvertiser.email = email;
      existingAdvertiser.address = address;
      await existingAdvertiser.save();

      return res.status(200).json({
        message: "تمت إعادة تفعيل الجهة بنجاح",
        advertiser: existingAdvertiser,
      });
    }
    return next(new AppError("هذه الجهة موجودة بالفعل", 400));
  }

  const newAdvertiser = new advertiserModel({ phone, email, address });
  await newAdvertiser.save();

  res
    .status(201)
    .json({ message: "تمت إضافة الجهة بنجاح", advertiser: newAdvertiser });
});

export const updateAdvertiser = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { phone, email, address } = req.body;

  const advertiser = await advertiserModel.findById(id);
  if (!advertiser || advertiser.isDeleted) {
    return next(new AppError("المعلن غير موجود", 404));
  }

  advertiser.phone = phone || advertiser.phone;
  advertiser.email = email || advertiser.email;
  advertiser.address = address || advertiser.address;
  await advertiser.save();

  res.status(200).json({ message: "تم تحديث بيانات الجهة بنجاح" });
});

export const deleteAdvertiser = catchError(async (req, res, next) => {
  const { id } = req.params;
  const advertiser = await advertiserModel.findById(id);
  if (!advertiser) {
    return next(new AppError("الجهة غير موجودة", 404));
  }
  if (advertiser.isDeleted === true) {
    return next(new AppError("الجهة محذوفة بالفعل", 404));
  }

  advertiser.isDeleted = true;
  await advertiser.save();
  res.status(200).json({ message: "تم حذف الجهة المعلنة بنجاح" });
});
