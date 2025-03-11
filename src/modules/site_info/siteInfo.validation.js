import Joi from "joi";

export const siteInfoValidation = Joi.object({
  aboutUs_ar: Joi.string().trim().allow("", null).messages({
    "string.empty": "يجب إدخال نبذة عن الموقع باللغة العربية",
  }),

  aboutUs_en: Joi.string().trim().allow("", null).messages({
    "string.empty": "يجب إدخال نبذة عن الموقع باللغة الإنجليزية",
  }),
  whySubscribe_ar: Joi.string().trim().allow("", null).messages({
    "string.empty": "يجب إدخال لماذا تشترك باللغة العربية",
  }),

  whySubscribe_en: Joi.string().trim().allow("", null).messages({
    "string.empty": "يجب إدخال لماذا تشترك باللغة الإنجليزية",
  }),

  whatsapp: Joi.string()
    .trim()
    .pattern(/^\+?\d{10,15}$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "رقم واتساب غير صالح، يجب أن يكون بين 10 و 15 رقمًا",
    }),

  viber: Joi.string()
    .trim()
    .pattern(/^\+?\d{10,15}$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "رقم فايبر غير صالح، يجب أن يكون بين 10 و 15 رقمًا",
    }),

  email: Joi.string().trim().email().allow("", null).messages({
    "string.email": "البريد الإلكتروني غير صالح",
  }),
});
