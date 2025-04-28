import Joi from "joi";
import mongoose from "mongoose";

export const advertiserValidation = Joi.object({
  name_ar: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "من فضلك قم بإدخال اسم المعلن بالعربية",
    "string.min": "يجب أن يكون الاسم على الأقل حرفين",
  }),
  name_en: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "من فضلك قم بإدخال اسم المعلن بالإنجليزية",
    "string.min": "يجب أن يكون الاسم على الأقل حرفين",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "رقم الهاتف غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا",
    }),
  extraPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "رقم الهاتف الإضافي غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا",
    }),
  email: Joi.string().trim().email().optional().allow(null, "").messages({
    "string.email": "من فضلك قم بإدخال بريد إلكتروني صالح",
  }),
  extraEmail: Joi.string().trim().email().optional().allow(null, "").messages({
    "string.email": "من فضلك قم بإدخال بريد إلكتروني إضافي صالح",
  }),
  address_ar: Joi.string().trim().min(5).max(100).optional().allow(null, ""),
  address_en: Joi.string().trim().min(5).max(100).optional().allow(null, ""),
  country: Joi.string()
    .trim()
    .optional()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("معرف الدولة غير صالح");
      }
      return value;
    }),
  parent: Joi.string()
    .trim()
    .optional()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("المعرف الأب غير صالح");
      }
      return value;
    }),
  isDeleted: Joi.boolean().default(false),
});

export const updateAdvertiserValidation = Joi.object({
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
  name_ar: Joi.string().trim().min(2).max(100).optional().allow(null, ""),
  name_en: Joi.string().trim().min(2).max(100).optional().allow(null, ""),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "رقم الهاتف غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا",
    }),
  extraPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "رقم الهاتف الإضافي غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا",
    }),
  email: Joi.string().trim().email().optional().allow(null, "").messages({
    "string.email": "من فضلك قم بإدخال بريد إلكتروني صالح",
  }),
  extraEmail: Joi.string().trim().email().optional().allow(null, "").messages({
    "string.email": "من فضلك قم بإدخال بريد إلكتروني إضافي صالح",
  }),
  address_ar: Joi.string().trim().min(5).max(100).optional().allow(null, ""),
  address_en: Joi.string().trim().min(5).max(100).optional().allow(null, ""),
  country: Joi.string()
    .trim()
    .optional()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("معرف الدولة غير صالح");
      }
      return value;
    }),
  parent: Joi.string()
    .trim()
    .optional()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("المعرف الأب غير صالح");
      }
      return value;
    }),
  isDeleted: Joi.boolean().default(false),
});
