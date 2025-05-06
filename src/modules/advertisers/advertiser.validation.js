import Joi from "joi";
import mongoose from "mongoose";

export const advertiserValidation = Joi.object({
  name_ar: Joi.string().trim().required().messages({
    "string.empty": "من فضلك قم بإدخال اسم المعلن بالعربية",
  }),
  name_en: Joi.string().trim().required().messages({
    "string.empty": "من فضلك قم بإدخال اسم المعلن بالإنجليزية",
  }),
  phone: Joi.string().trim().optional().allow(null, ""),
  extraPhone: Joi.string().trim().optional().allow(null, ""),
  email: Joi.string().trim().optional().allow(null, ""),
  extraEmail: Joi.string().trim().optional().allow(null, ""),
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
  name_ar: Joi.string().trim().optional().allow(null, ""),
  name_en: Joi.string().trim().optional().allow(null, ""),
  phone: Joi.string().trim().optional().allow(null, ""),
  extraPhone: Joi.string().trim().optional().allow(null, ""),
  email: Joi.string().trim().optional().allow(null, ""),
  extraEmail: Joi.string().trim().optional().allow(null, ""),
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
