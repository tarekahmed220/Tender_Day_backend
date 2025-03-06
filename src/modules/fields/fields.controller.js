import fieldModel from "../../../db/models/fields.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";

export const getAllFields = catchError(async (req, res, next) => {
  const fields = await fieldModel
    .find({ isDeleted: false })
    .populate("parent", "name_ar name_en")
    .lean();

  const groupedFields = fields.reduce((acc, field) => {
    if (!field.parent) {
      const subFields = fields.filter(
        (f) => f.parent && f.parent._id.equals(field._id)
      );

      acc.push({
        ...field,
        subFields,
        subFieldsCount: subFields.length,
      });
    }
    return acc;
  }, []);

  res.status(200).json({ data: groupedFields });
});

export const getFieldById = catchError(async (req, res, next) => {
  const { id } = req.params;

  const field = await fieldModel
    .findById(id)
    .populate("parent", "name_ar name_en")
    .lean();

  if (!field || field.isDeleted) {
    return next(new AppError("المجال غير موجود", 404));
  }

  const subFields = await fieldModel.find({ parent: id, isDeleted: false });

  res.status(200).json({
    data: field,
    subFields,
    subFieldsCount: subFields.length,
  });
});

export const addField = catchError(async (req, res, next) => {
  const { name_ar, name_en, parent } = req.body;

  const existingField = await fieldModel.findOne({
    name_ar,
    name_en,
    parent: parent || null,
  });

  if (existingField) {
    if (existingField.isDeleted) {
      existingField.isDeleted = false;
      await existingField.save();
      return res.status(200).json({
        message: "تمت إعادة تفعيل المجال بنجاح",
        field: existingField,
      });
    }
    return next(new AppError("هذا المجال موجود بالفعل", 400));
  }

  const newField = new fieldModel({ name_ar, name_en, parent: parent || null });
  await newField.save();

  res.status(201).json({ message: "تمت إضافة المجال بنجاح", field: newField });
});

export const updateField = catchError(async (req, res, next) => {
  const { id } = req.params;
  const { name_ar, name_en, parent } = req.body;

  const field = await fieldModel.findById(id);
  if (!field || field.isDeleted) {
    return next(new AppError("المجال غير موجود", 404));
  }

  const duplicateField = await fieldModel.findOne({
    _id: { $ne: id },
    name_ar,
    name_en,
    parent: parent || null,
  });

  if (duplicateField) {
    return next(new AppError("هذا المجال موجود بالفعل", 400));
  }

  field.name_ar = name_ar || field.name_ar;
  field.name_en = name_en || field.name_en;
  field.parent = parent !== undefined ? parent : field.parent;
  await field.save();

  res.status(200).json({ message: "تم تحديث بيانات المجال بنجاح", field });
});

export const deleteField = catchError(async (req, res, next) => {
  const { id } = req.params;
  const field = await fieldModel.findById(id);

  if (!field) {
    return next(new AppError("المجال غير موجود", 404));
  }

  if (field.isDeleted) {
    return next(new AppError("المجال محذوف بالفعل", 404));
  }

  if (!field.parent) {
    await fieldModel.updateMany({ parent: field._id }, { isDeleted: true });
  }

  field.isDeleted = true;
  await field.save();

  res.status(200).json({ message: "تم حذف المجال بنجاح" });
});
