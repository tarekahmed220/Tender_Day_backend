import Joi from "joi";
import mongoose from "mongoose";

export const fieldValidation = Joi.object({
  name_ar: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "يرجى إدخال اسم المجال بالعربية",
    "string.min": "يجب أن يكون اسم المجال على الأقل حرفين",
    "string.max": "يجب ألا يتجاوز اسم المجال 50 حرفًا",
  }),
  name_en: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "يرجى إدخال اسم المجال بالإنجليزية",
    "string.min": "يجب أن يكون اسم المجال على الأقل حرفين",
    "string.max": "يجب ألا يتجاوز اسم المجال 50 حرفًا",
  }),
  parent: Joi.string().trim().allow(null, "").optional(),
});

export const updateFieldValidation = Joi.object({
  id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("المعرف غير صالح");
      }
      return value;
    })
    .required()
    .messages({
      "string.empty": "المعرف مطلوب",
    }),
  name_ar: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "يجب أن يكون اسم المجال على الأقل حرفين",
    "string.max": "يجب ألا يتجاوز اسم المجال 50 حرفًا",
  }),
  name_en: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "يجب أن يكون اسم المجال على الأقل حرفين",
    "string.max": "يجب ألا يتجاوز اسم المجال 50 حرفًا",
  }),
  parent: Joi.string().trim().allow(null, "").optional(),
});
