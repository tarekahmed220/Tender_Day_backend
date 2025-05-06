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
});
