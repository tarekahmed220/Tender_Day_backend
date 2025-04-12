import advertiserModel from "../../../db/models/advertiser.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

export const getAllAdvertisersGrouped = catchError(async (req, res, next) => {
  const allAdvertisers = await advertiserModel
    .find({ isDeleted: false })
    .select("_id name_ar name_en parent");

  const mainAdvertisers = allAdvertisers.filter((adv) => !adv.parent);

  const subAdvertisers = allAdvertisers.filter((adv) => adv.parent);

  res.status(200).json({
    mainAdvertisers,
    subAdvertisers,
  });
});

export const getMainAdvertisers = catchError(async (req, res, next) => {
  const totalCount = await advertiserModel.countDocuments({
    isDeleted: false,
    parent: null,
  });

  const features = new APIFeatures(
    advertiserModel
      .find({ isDeleted: false, parent: null })
      .populate("parent", "name_ar name_en"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const mainAdvertisers = await features.query;

  const advertisersWithChildrenCount = await Promise.all(
    mainAdvertisers.map(async (advertiser) => {
      const count = await advertiserModel.countDocuments({
        isDeleted: false,
        parent: advertiser._id,
      });
      return {
        ...advertiser.toObject(), // مهم عشان نقدر نضيف خصائص
        childrenCount: count,
      };
    })
  );

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  if (!advertisersWithChildrenCount.length) {
    return next(new AppError("لا توجد جهات رئيسية", 404));
  }

  res
    .status(200)
    .json({ data: advertisersWithChildrenCount, totalCount, skip });
});

// إضافة معلن جديد
export const addAdvertiser = catchError(async (req, res, next) => {
  const { name_ar, name_en, phone, email, address_ar, address_en, parent } =
    req.body;

  const existingAdvertiser = await advertiserModel.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingAdvertiser) {
    if (existingAdvertiser.isDeleted) {
      existingAdvertiser.isDeleted = false;
      existingAdvertiser.name_ar = name_ar;
      existingAdvertiser.name_en = name_en;
      existingAdvertiser.phone = phone;
      existingAdvertiser.email = email;
      existingAdvertiser.address_ar = address_ar;
      existingAdvertiser.address_en = address_en;
      existingAdvertiser.parent = parent || null;

      await existingAdvertiser.save();

      return res.status(200).json({
        message: "تمت إعادة تفعيل الجهة بنجاح",
        advertiser: existingAdvertiser,
      });
    }
    return next(new AppError("هذه الجهة موجودة بالفعل", 400));
  }

  const newAdvertiser = new advertiserModel({
    name_ar,
    name_en,
    phone,
    email,
    address_ar,
    address_en,
    parent: parent || null,
  });

  await newAdvertiser.save();

  res
    .status(201)
    .json({ message: "تمت إضافة الجهة بنجاح", advertiser: newAdvertiser });
});

// تحديث معلن
export const updateAdvertiser = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { name_ar, name_en, phone, email, address_ar, address_en, parent } =
    req.body;

  const advertiser = await advertiserModel.findById(id);
  if (!advertiser || advertiser.isDeleted) {
    return next(new AppError("المعلن غير موجود", 404));
  }

  advertiser.name_ar = name_ar || advertiser.name_ar;
  advertiser.name_en = name_en || advertiser.name_en;
  advertiser.phone = phone || advertiser.phone;
  advertiser.email = email || advertiser.email;
  advertiser.address_ar = address_ar || advertiser.address_ar;
  advertiser.address_en = address_en || advertiser.address_en;
  advertiser.parent = parent !== undefined ? parent : advertiser.parent;

  await advertiser.save();

  res.status(200).json({ message: "تم تحديث بيانات الجهة بنجاح", advertiser });
});

// حذف معلن
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

export const getSubAdvertisersByParentId = catchError(
  async (req, res, next) => {
    const { id } = req.params;

    const parentExists = await advertiserModel
      .findOne({
        _id: id,
        isDeleted: false,
        parent: null,
      })
      .select("name_ar name_en");

    if (!parentExists) {
      return next(new AppError("الجهة الرئيسية غير موجودة", 404));
    }

    const totalCount = await advertiserModel.countDocuments({
      isDeleted: false,
      parent: id,
    });

    const features = new APIFeatures(
      advertiserModel
        .find({ isDeleted: false, parent: id })
        .populate("parent", "name_ar name_en"),
      req.query
    )
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const subAdvertisers = await features.query;

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    if (!subAdvertisers.length) {
      return res.status(200).json({
        message: "لا توجد جهات فرعية لهذا المعلن",
        parent: parentExists,
      });
    }

    res
      .status(200)
      .json({ data: subAdvertisers, parent: parentExists, totalCount, skip });
  }
);
