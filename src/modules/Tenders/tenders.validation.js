import Joi from "joi";
import mongoose from "mongoose";

export const addTenderValidation = Joi.object({
  name_ar: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "يجب إدخال اسم المناقصة بالعربية",
    "string.min": "يجب أن يكون اسم المناقصة بالعربية على الأقل 3 أحرف",
    "string.max": "يجب ألا يتجاوز اسم المناقصة بالعربية 200 حرف",
  }),

  name_en: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "يجب إدخال اسم المناقصة بالإنجليزية",
    "string.min": "يجب أن يكون اسم المناقصة بالإنجليزية على الأقل 3 أحرف",
    "string.max": "يجب ألا يتجاوز اسم المناقصة بالإنجليزية 200 حرف",
  }),

  description: Joi.string()
    .required()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return helpers.error("any.invalid");
        }
        for (const item of parsed) {
          if (!item.point_ar || !item.point_en) {
            return helpers.error("any.invalid");
          }
        }
        return parsed;
      } catch (e) {
        return helpers.error("any.invalid");
      }
    })
    .messages({
      "any.invalid": "يجب أن يكون الوصف عبارة عن قائمة من النقاط",
    }),

  tenderNumber: Joi.string().trim().required().messages({
    "string.empty": "يجب إدخال رقم المناقصة",
  }),

  country: Joi.string().trim().required().messages({
    "string.empty": "يجب اختيار الدولة",
  }),
  currency: Joi.string().trim().required().messages({
    "string.empty": "يجب اختيار العملة",
  }),

  mainField: Joi.string().trim().required().messages({
    "string.empty": "يجب اختيار المجال الرئيسي",
  }),

  subField: Joi.string().trim().required().messages({
    "string.empty": "يجب اختيار المجال الفرعي",
  }),

  province: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "يجب إدخال المحافظة",
    "string.min": "يجب أن يكون اسم المحافظة على الأقل 3 أحرف",
    "string.max": "يجب ألا يتجاوز اسم المحافظة 100 حرف",
  }),

  mainAdvertiser: Joi.string().trim().required().messages({
    "string.empty": "يجب اختيار الجهة المعلنة الرئيسية",
  }),

  subAdvertiser: Joi.string().trim().optional().allow("").messages({
    "string.empty": "يجب اختيار الجهة المعلنة الفرعية",
  }),

  closingDate: Joi.date().iso().required().messages({
    "date.base": "يجب إدخال تاريخ صالح للإغلاق",
    "any.required": "يجب إدخال تاريخ الإغلاق",
  }),

  documentPrice: Joi.string().required().messages({
    "string.empty": "يجب إدخال قيمة وثائق المناقصة",
  }),

  guaranteeAmount: Joi.string().required().messages({
    "string.empty": "يجب إدخال مبلغ التأمين",
  }),

  sourceInfo: Joi.string().trim().required().messages({
    "string.empty": "يجب إدخال مصدر المعلومات",
  }),

  fileUrl: Joi.string().uri().optional().allow("").messages({
    "string.uri": "يجب إدخال رابط صالح للملف",
  }),
});

export const updateTenderValidation = addTenderValidation.keys({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.invalid": "يجب أن يكون معرف المناقصة صحيحًا",
      "any.required": "يجب إرسال معرف المناقصة",
    }),
});
