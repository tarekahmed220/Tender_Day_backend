import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Tender from "../../../db/models/tender.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";
import advertiserModel from "../../../db/models/advertiser.model.js";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.tendersday.com"
    : (req) => `${req.protocol}://${req.get("host")}`;

export const getAllTenders = catchError(async (req, res, next) => {
  const featuresForCount = new APIFeatures(
    Tender.find({ isDeleted: false }),
    req.query
  )
    .search()
    .filter();

  const filteredCount = await featuresForCount.query.countDocuments();
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const features = new APIFeatures(
    Tender.find({ isDeleted: false })
      .populate("country", "name_ar name_en")
      .populate("mainField", "name_ar name_en")
      .populate("subField", "name_ar name_en")
      .populate("mainAdvertiser", "name_ar name_en phone email address")
      .populate("subAdvertiser", "name_ar name_en phone email address"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tenders = await features.query.lean();

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const tendersWithImageUrls = tenders.map((tender) => ({
    ...tender,
    fileUrl: tender.fileUrl
      ? `${typeof baseUrl === "function" ? baseUrl(req) : baseUrl}${
          tender.fileUrl
        }`
      : null,
  }));

  res.status(200).json({
    data: tendersWithImageUrls,
    totalCount: filteredCount,
    pageCount: Math.ceil(filteredCount / (req.query.limit || 10)),
    skip,
  });
});

export const getAllTendersForWebsite = catchError(async (req, res, next) => {
  console.log("query", req.query);
  let query = Tender.find({ isDeleted: false });

  if (req.body.countryIds && req.body.countryIds.length > 0) {
    query = query.find({
      country: {
        $in: req.body.countryIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
  }

  const featuresForCount = new APIFeatures(query.clone(), req.query)
    .search()
    .filter();

  const filteredCount = await featuresForCount.query.countDocuments();
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const features = new APIFeatures(
    query
      .select(
        "name_ar name_en tenderNumber createdAt closingDate mainField subField country"
      )
      .populate("mainField", "name_ar name_en")
      .populate("subField", "name_ar name_en")
      .populate("country", "name_ar name_en"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tenders = await features.query.lean();

  res.status(200).json({
    data: tenders,
    totalCount: filteredCount,
    pageCount: Math.ceil(filteredCount / (req.query.limit || 10)),
    skip,
  });
});

export const getTendersByAdvertiser = catchError(async (req, res, next) => {
  const { advertiserId, page = 1, limit = 10, search } = req.query;

  if (!advertiserId) {
    return next(new AppError("معرف المعلن مطلوب", 400));
  }

  const objectId = new mongoose.Types.ObjectId(advertiserId);

  const filterConditions = {
    isDeleted: false,
    $or: [{ mainAdvertiser: objectId }, { subAdvertiser: objectId }],
  };

  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search, "i");
    filterConditions.$and = [
      {
        $or: [
          { name_ar: searchRegex },
          { name_en: searchRegex },
          { tenderNumber: searchRegex },
        ],
      },
    ];
  }

  let query = Tender.find(filterConditions);

  const count = await query.clone().countDocuments();

  const tenders = await query
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("mainField", "name_ar name_en")
    .populate("subField", "name_ar name_en")
    .populate("country", "name_ar name_en")
    .populate("mainAdvertiser", "name_ar name_en")
    .populate("subAdvertiser", "name_ar name_en")
    .select(
      "name_ar name_en tenderNumber createdAt closingDate mainField subField country mainAdvertiser subAdvertiser"
    )
    .lean();

  res.status(200).json({
    data: tenders,
    totalCount: count,
    pageCount: Math.ceil(count / limit),
    skip: (page - 1) * limit,
  });
});

export const getTenderById = catchError(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("معرّف المناقصة غير صالح", 400));
  }

  const tender = await Tender.findById(id)
    .populate("country", "name_ar name_en ")
    .populate("mainField", "name_ar name_en ")
    .populate("subField", "name_ar name_en ")
    .populate("mainAdvertiser")
    .populate("subAdvertiser")
    .populate("currency")
    .lean();

  if (!tender) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const tenderWithImageUrl = {
    ...tender,
    fileUrl: tender.fileUrl
      ? `${typeof baseUrl === "function" ? baseUrl(req) : baseUrl}${
          tender.fileUrl
        }`
      : null,
  };

  res.status(200).json({ data: tenderWithImageUrl });
});

export const getTendersBySubField = catchError(async (req, res, next) => {
  const { subFieldId } = req.params;

  if (!mongoose.isValidObjectId(subFieldId)) {
    return next(new AppError("معرّف المجال الفرعي غير صالح", 400));
  }

  const tenders = await Tender.find({ subField: subFieldId, isDeleted: false })
    .select(
      "name_ar name_en tenderNumber createdAt closingDate mainField subField"
    )
    .populate("mainField", "name_ar name_en")
    .populate("subField", "name_ar name_en")
    .lean();

  if (!tenders.length) {
    return res
      .status(404)
      .json({ message: "لا توجد مناقصات تحت هذا المجال الفرعي" });
  }

  res.status(200).json({
    data: tenders,
    count: tenders.length,
  });
});

export const getTendersByAdvertisers = catchError(async (req, res, next) => {
  const { mainAdvertiserId, subAdvertiserId } = req.query;
  const filter = { isDeleted: false };

  if (mainAdvertiserId && mongoose.isValidObjectId(mainAdvertiserId)) {
    filter.mainAdvertiser = mainAdvertiserId;
  }
  if (subAdvertiserId && mongoose.isValidObjectId(subAdvertiserId)) {
    filter.subAdvertiser = subAdvertiserId;
  }

  const tenders = await Tender.find(filter)
    .populate("mainAdvertiser", "name_ar name_en")
    .populate("subAdvertiser", "name_ar name_en")
    .populate("mainField", "name_ar name_en")
    .populate("subField", "name_ar name_en")
    .populate("country", "name_ar name_en")
    .lean();

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const tendersWithImageUrls = tenders.map((tender) => ({
    ...tender,
    fileUrl: tender.fileUrl
      ? `${typeof baseUrl === "function" ? baseUrl(req) : baseUrl}${
          tender.fileUrl
        }`
      : null,
  }));

  res.status(200).json({
    data: tendersWithImageUrls,
    count: tendersWithImageUrls.length,
  });
});

const uploadDir = path.resolve("uploads", "tenders");

export const addTender = catchError(async (req, res, next) => {
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    tenderNumber,
    country,
    currency,
    mainField,
    subField,
    province,
    mainAdvertiser,
    subAdvertiser,
    closingDate,
    documentPrice,
    guaranteeAmount,
    sourceInfo,
  } = req.body;

  let fileUrl = null;
  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/tenders/${fileName}`;
    } catch (error) {
      return next(new AppError(`فشل في حفظ الملف: ${error.message}`, 500));
    }
  }

  const newTender = new Tender({
    name_ar,
    name_en,
    description_ar,
    description_en,
    tenderNumber,
    country,
    currency,
    mainField,
    subField,
    province,
    mainAdvertiser,
    subAdvertiser,
    closingDate,
    documentPrice,
    guaranteeAmount,
    sourceInfo,
    fileUrl,
  });

  await newTender.save();

  res.status(201).json({
    message: "تمت إضافة المناقصة بنجاح",
    tender: newTender,
  });
});

export const updateTender = catchError(async (req, res, next) => {
  const { id } = req.params;
  const tender = await Tender.findById(id);

  if (!tender || tender.isDeleted) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  const allowedFields = [
    "name_ar",
    "name_en",
    "description_ar",
    "description_en",
    "tenderNumber",
    "country",
    "currency",
    "mainField",
    "subField",
    "province",
    "mainAdvertiser",
    "subAdvertiser",
    "closingDate",
    "documentPrice",
    "guaranteeAmount",
    "sourceInfo",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      // تحويل السلسلة الفارغة أو "null" إلى null لـ subAdvertiser
      if (field === "subAdvertiser") {
        if (
          req.body[field] === "" ||
          req.body[field] === "null" ||
          req.body[field] === null
        ) {
          tender[field] = null;
        } else {
          tender[field] = req.body[field];
        }
      } else {
        tender[field] = req.body[field];
      }
    }
  });

  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      if (tender.fileUrl) {
        const oldFilePath = path.join(
          "uploads",
          "tenders",
          path.basename(tender.fileUrl)
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      fs.writeFileSync(filePath, req.file.buffer);
      tender.fileUrl = `/uploads/tenders/${fileName}`;
    } catch (error) {
      return next(new AppError(`فشل في حفظ الملف: ${error.message}`, 500));
    }
  }

  await tender.save();

  res.status(200).json({
    message: "تم تحديث بيانات المناقصة بنجاح",
    tender,
  });
});

export const deleteTender = catchError(async (req, res, next) => {
  const { id } = req.params;
  const tender = await Tender.findById(id);

  if (!tender) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  if (tender.isDeleted) {
    return res.status(200).json({ message: "المناقصة محذوفة بالفعل" });
  }

  tender.isDeleted = true;
  await tender.save();

  res.status(200).json({ message: "تم حذف المناقصة بنجاح" });
});

export const deleteTenderPermanently = catchError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("معرّف المناقصة غير صالح", 400));
  }

  const tender = await Tender.findById(id);

  if (!tender) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  if (tender.fileUrl) {
    const filePath = path.join(
      "uploads",
      "tenders",
      path.basename(tender.fileUrl)
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await Tender.deleteOne({ _id: id });

  res
    .status(200)
    .json({ message: "تم حذف المناقصة والملفات المرتبطة بها نهائيًا" });
});

export const restoreTender = catchError(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("معرّف المناقصة غير صالح", 400));
  }

  const tender = await Tender.findById(id);

  if (!tender) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  if (!tender.isDeleted) {
    return res.status(200).json({ message: "المناقصة غير محذوفة بالفعل" });
  }

  tender.isDeleted = false;
  await tender.save();

  res.status(200).json({ message: "تم استعادة المناقصة بنجاح", tender });
});
