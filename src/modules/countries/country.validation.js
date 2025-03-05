import Joi from "joi";

export const countryValidation = Joi.object({
  name_ar: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "من فضلك قم بإدخال الدولة باللغة العربية",
      "string.min": "يجب أن يكون اسم الدولة على الأقل 3 أحرف",
      "string.max": "يجب ألا يتجاوز اسم الدولة 50 حرفًا",
    })
    .label("الدولة بالعربية"),
  name_en: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "من فضلك قم بإدخال الدولة باللغة الإنجليزية",
      "string.min": "يجب أن يكون اسم الدولة على الأقل 3 أحرف",
      "string.max": "يجب ألا يتجاوز اسم الدولة 50 حرفًا",
    })
    .label("الدولة بالإنجليزية"),
  isDeleted: Joi.boolean().default(false),
});
