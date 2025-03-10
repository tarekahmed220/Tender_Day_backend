import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Tender from "../../../db/models/tender.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

export const getAllTenders = catchError(async (req, res, next) => {
  const featuresForCount = new APIFeatures(
    Tender.find({ isDeleted: false }),
    req.query
  )
    .search()
    .filter();

  const filteredCount = await featuresForCount.query.countDocuments();

  const features = new APIFeatures(
    Tender.find({ isDeleted: false })
      .populate("country", "name_ar name_en")
      .populate("mainField", "name_ar name_en")
      .populate("subField", "name_ar name_en")
      .populate("advertiser", "phone email address"),
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
    fileUrl: tender.fileUrl ? `${baseUrl}${tender.fileUrl}` : null,
  }));

  res.status(200).json({
    data: tendersWithImageUrls,
    totalCount: filteredCount,
    pageCount: Math.ceil(filteredCount / (req.query.limit || 10)),
  });
});

export const getTenderById = catchError(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("معرّف المناقصة غير صالح", 400));
  }

  const tender = await Tender.findById(id)
    .populate("country", "name_ar name_en")
    .populate("mainField", "name_ar name_en")
    .populate("subField", "name_ar name_en")
    .populate("advertiser", "phone email address")
    .lean();

  if (!tender || tender.isDeleted) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const tenderWithImageUrl = {
    ...tender,
    fileUrl: tender.fileUrl ? `${baseUrl}${tender.fileUrl}` : null,
  };

  res.status(200).json({ data: tenderWithImageUrl });
});

const uploadDir = path.resolve("uploads", "tenders");

export const addTender = catchError(async (req, res, next) => {
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    tenderNumber,
    serialNumber,
    country,
    currency,
    mainField,
    subField,
    province,
    advertiser,
    closingDate,
    documentPrice,
    guaranteeAmount,
    sourceInfo,
  } = req.body;

  const existingTender = await Tender.findOne({
    $or: [{ tenderNumber }, { serialNumber }],
  });

  if (existingTender) {
    if (!existingTender.isDeleted) {
      return next(new AppError("رقم المناقصة موجود بالفعل", 400));
    } else {
      Object.assign(existingTender, req.body);
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
          existingTender.fileUrl = `/uploads/tenders/${fileName}`;
        } catch (error) {
          return next(new AppError(`فشل في حفظ الملف: ${error.message}`, 500));
        }
      }
      existingTender.isDeleted = false;
      await existingTender.save();
      return res.status(200).json({
        message: "تم استرجاع المناقصة المحذوفة بنجاح",
        tender: existingTender,
      });
    }
  }

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
    serialNumber,
    country,
    currency,
    mainField,
    subField,
    province,
    advertiser,
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
    "serialNumber",
    "country",
    "currency",
    "mainField",
    "subField",
    "province",
    "advertiser",
    "closingDate",
    "documentPrice",
    "guaranteeAmount",
    "sourceInfo",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      tender[field] = req.body[field];
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
      // 🛑 **حذف الملف القديم إذا كان موجودًا**
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

      // ✅ **حفظ الملف الجديد**
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

// export const updateTender = catchError(async (req, res, next) => {
//   const { id } = req.params;
//   const tender = await Tender.findById(id);

//   if (!tender || tender.isDeleted) {
//     return next(new AppError("المناقصة غير موجودة", 404));
//   }

//   const allowedFields = [
//     "name_ar",
//     "name_en",
//     "description_ar",
//     "description_en",
//     "tenderNumber",
//     "serialNumber",
//     "country",
//     "currency",
//     "mainField",
//     "subField",
//     "province",
//     "advertiser",
//     "closingDate",
//     "documentPrice",
//     "guaranteeAmount",
//     "sourceInfo",
//   ];

//   allowedFields.forEach((field) => {
//     if (req.body[field] !== undefined) {
//       tender[field] = req.body[field];
//     }
//   });

//   if (req.file) {
//     const fileName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(req.file.originalname)}`;
//     const filePath = path.join(uploadDir, fileName);

//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     try {
//       fs.writeFileSync(filePath, req.file.buffer);
//       tender.fileUrl = `/uploads/tenders/${fileName}`;
//     } catch (error) {
//       return next(new AppError(`فشل في حفظ الملف: ${error.message}`, 500));
//     }
//   }

//   await tender.save();

//   res.status(200).json({
//     message: "تم تحديث بيانات المناقصة بنجاح",
//     tender,
//   });
// });

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
