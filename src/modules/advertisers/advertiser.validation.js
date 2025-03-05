import Joi from "joi";
import mongoose from "mongoose";

export const advertiserValidation = Joi.object({
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.empty": "من فضلك قم بإدخال رقم الموبايل",
      "string.pattern.base":
        "رقم الهاتف غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا ",
    }),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "من فضلك قم بإدخال البريد الإلكتروني",
    "string.email": "من فضلك قم بإدخال بريد إلكتروني صالح",
  }),

  address: Joi.string().trim().min(5).max(100).required().messages({
    "string.empty": "من فضلك قم بإدخال العنوان",
    "string.min": "يجب أن يكون العنوان على الأقل 5 أحرف",
    "string.max": "يجب ألا يتجاوز العنوان 100 حرف",
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
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "رقم الهاتف غير صالح، يجب أن يتكون من 10 إلى 15 رقمًا ",
    }),

  email: Joi.string().trim().email().allow(null, "").optional().messages({
    "string.email": "من فضلك قم بإدخال بريد إلكتروني صالح",
  }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(100)
    .allow(null, "")
    .optional()
    .messages({
      "string.min": "يجب أن يكون العنوان على الأقل 5 أحرف",
      "string.max": "يجب ألا يتجاوز العنوان 100 حرف",
    }),

  isDeleted: Joi.boolean().default(false),
});
