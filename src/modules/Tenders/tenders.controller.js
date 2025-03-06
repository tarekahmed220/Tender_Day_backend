import Tender from "../../../db/models/tender.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import { upload } from "../utility/multer.js";

export const getAllTenders = catchError(async (req, res, next) => {
  const tenders = await Tender.find({ isDeleted: false })
    .populate("country", "name_ar name_en")
    .populate("mainField", "name_ar name_en")
    .populate("subField", "name_ar name_en")
    .populate("advertiser", "phone email address")
    .lean();

  res.status(200).json({ data: tenders });
});

export const addTender = catchError(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }

    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      tenderNumber,
      serialNumber,
      country,
      mainField,
      subField,
      province,
      advertiser,
      closingDate,
      documentPrice,
      guaranteeAmount,
      sourceInfo,
    } = req.body;

    const existingTender = await Tender.findOne({ tenderNumber });
    if (existingTender) {
      return next(new AppError("رقم المناقصة موجود بالفعل", 400));
    }

    const newTender = new Tender({
      name_ar,
      name_en,
      description_ar,
      description_en,
      tenderNumber,
      serialNumber,
      country,
      mainField,
      subField,
      province,
      advertiser,
      closingDate,
      documentPrice,
      guaranteeAmount,
      sourceInfo,
      fileUrl: req.file ? `/uploads/tenders/${req.file.filename}` : "",
    });

    await newTender.save();

    res
      .status(201)
      .json({ message: "تمت إضافة المناقصة بنجاح", tender: newTender });
  });
});

export const updateTender = catchError(async (req, res, next) => {
  const { id } = req.params;
  const tender = await Tender.findById(id);
  if (!tender || tender.isDeleted) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  Object.assign(tender, req.body);
  await tender.save();

  res.status(200).json({ message: "تم تحديث بيانات المناقصة بنجاح", tender });
});

export const deleteTender = catchError(async (req, res, next) => {
  const { id } = req.params;
  const tender = await Tender.findById(id);
  if (!tender || tender.isDeleted) {
    return next(new AppError("المناقصة غير موجودة", 404));
  }

  tender.isDeleted = true;
  await tender.save();

  res.status(200).json({ message: "تم حذف المناقصة بنجاح" });
});
