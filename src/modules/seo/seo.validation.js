import Joi from "joi";

export const seoValidation = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "العنوان مطلوب",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "الوصف مطلوب",
  }),
});
