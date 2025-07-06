import Joi from "joi";

export const seoValidation = Joi.object({
  title_ar: Joi.string().trim().required().messages({
    "string.empty": "العنوان بالعربية مطلوب",
  }),
  title_en: Joi.string().trim().required().messages({
    "string.empty": "العنوان بالإنجليزية مطلوب",
  }),
  description_ar: Joi.string().trim().required().messages({
    "string.empty": "الوصف بالعربية مطلوب",
  }),
  description_en: Joi.string().trim().required().messages({
    "string.empty": "الوصف بالإنجليزية مطلوب",
  }),
});
