import advertiserModel from "../../../db/models/advertiser.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

// export const getAllAdvertisersGrouped = catchError(async (req, res, next) => {
//   const allAdvertisers = await advertiserModel
//     .find({ isDeleted: false })
//     .select("_id name_ar name_en parent");

//   const mainAdvertisers = allAdvertisers.filter((adv) => !adv.parent);

//   const subAdvertisers = allAdvertisers.filter((adv) => adv.parent);

//   res.status(200).json({
//     mainAdvertisers,
//     subAdvertisers,
//   });
// });

export const getAllAdvertisersGrouped = catchError(async (req, res, next) => {
  const filterConditions = { isDeleted: false };

  if (req.query.countryIds) {
    let countryIds = req.query.countryIds;

    // 🛠️ لو مش Array، خليه Array
    if (!Array.isArray(countryIds)) {
      countryIds = [countryIds];
    }

    filterConditions.country = { $in: countryIds };
  }

  const allAdvertisers = await advertiserModel
    .find(filterConditions)
    .select("_id name_ar name_en parent");

  const mainAdvertisers = allAdvertisers.filter((adv) => !adv.parent);
  const subAdvertisers = allAdvertisers.filter((adv) => adv.parent);

  res.status(200).json({
    mainAdvertisers,
    subAdvertisers,
  });
});

export const getMainAdvertisers = catchError(async (req, res, next) => {
  const filterConditions = { isDeleted: false, parent: null };

  if (req.query.countryIds) {
    const countryIds = Array.isArray(req.query.countryIds)
      ? req.query.countryIds
      : [req.query.countryIds];

    filterConditions.country = { $in: countryIds };
  }

  const totalCount = await advertiserModel.countDocuments(filterConditions);

  const features = new APIFeatures(
    advertiserModel
      .find(filterConditions)
      .populate("parent", "name_ar name_en"),
    req.query
  );

  features.search().filter().sort().limitFields().paginate(); // ✅ رجعت السلسلة طبيعية من غير await

  const mainAdvertisers = await features.query;

  const advertisersWithChildrenCount = await Promise.all(
    mainAdvertisers.map(async (advertiser) => {
      const count = await advertiserModel.countDocuments({
        isDeleted: false,
        parent: advertiser._id,
      });
      return {
        ...advertiser.toObject(),
        childrenCount: count,
      };
    })
  );

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  if (!advertisersWithChildrenCount.length) {
    return res.status(200).json({
      data: [],
      message: "لا توجد جهات رئيسية",
      totalCount,
      skip,
    });
  }

  res.status(200).json({
    data: advertisersWithChildrenCount,
    totalCount,
    skip,
  });
});

export const addAdvertiser = catchError(async (req, res, next) => {
  const {
    name_ar,
    name_en,
    phone,
    extraPhone,
    email,
    extraEmail,
    address_ar,
    address_en,
    parent,
    country,
  } = req.body;

  const searchConditions = [];
  if (email) searchConditions.push({ email });
  if (phone) searchConditions.push({ phone });

  let existingAdvertiser = null;
  if (searchConditions.length) {
    existingAdvertiser = await advertiserModel.findOne({
      isDeleted: false, // 🔥 هنا أضفناها
      $or: searchConditions,
    });
  }

  if (existingAdvertiser) {
    return next(new AppError("هذه الجهة موجودة بالفعل", 400));
  }

  const newAdvertiser = new advertiserModel({
    name_ar,
    name_en,
    phone: phone || null,
    extraPhone: extraPhone || null,
    email: email || null,
    extraEmail: extraEmail || null,
    address_ar: address_ar || null,
    address_en: address_en || null,
    parent: parent || null,
    country: country || null,
  });

  await newAdvertiser.save();

  res.status(201).json({
    message: "تمت إضافة الجهة بنجاح",
    advertiser: newAdvertiser,
  });
});

export const updateAdvertiser = catchError(async (req, res, next) => {
  const { id } = req.params;
  const {
    name_ar,
    name_en,
    phone,
    extraPhone,
    email,
    extraEmail,
    address_ar,
    address_en,
    parent,
    country,
  } = req.body;

  const advertiser = await advertiserModel.findById(id);

  if (!advertiser || advertiser.isDeleted) {
    return next(new AppError("المعلن غير موجود", 404));
  }

  // 🔥 تحقق قبل التحديث من عدم تكرار الإيميل أو التليفون
  if (email || phone) {
    const conflictingAdvertiser = await advertiserModel.findOne({
      _id: { $ne: id },
      isDeleted: false,
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (conflictingAdvertiser) {
      return next(
        new AppError("رقم الهاتف أو البريد الإلكتروني مستخدم بالفعل", 400)
      );
    }
  }

  advertiser.name_ar = name_ar ?? advertiser.name_ar;
  advertiser.name_en = name_en ?? advertiser.name_en;
  advertiser.phone = phone ?? advertiser.phone;
  advertiser.extraPhone = extraPhone === null ? null : extraPhone;
  advertiser.email = email ?? advertiser.email;
  advertiser.extraEmail = extraEmail === null ? null : extraEmail;
  advertiser.address_ar = address_ar ?? advertiser.address_ar;
  advertiser.address_en = address_en ?? advertiser.address_en;
  advertiser.parent = parent !== undefined ? parent : advertiser.parent;
  advertiser.country = country !== undefined ? country : advertiser.country;

  await advertiser.save();

  res.status(200).json({
    message: "تم تحديث بيانات الجهة بنجاح",
    advertiser,
  });
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
