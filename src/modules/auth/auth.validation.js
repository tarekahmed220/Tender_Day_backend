import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "الاسم مطلوب",
      "string.min": "يجب أن يكون الاسم على الأقل 3 أحرف",
      "string.max": "يجب ألا يتجاوز الاسم 50 حرفًا",
    })
    .label("الاسم"),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يجب إدخال بريد إلكتروني صالح",
    })
    .label("البريد الإلكتروني"),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "كلمة المرور مطلوبة",
      "string.min": "يجب أن تكون كلمة المرور على الأقل 6 أحرف",
    })
    .label("كلمة المرور"),

  role: Joi.string()
    .valid("client", "admin")
    .default("client")
    .messages({
      "any.only": "الدور يجب أن يكون إما 'client' أو 'admin'",
    })
    .label("الدور"),

  isActive: Joi.boolean().default(true),

  country: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "برجاء إدخال الدولة التابع لها",
      "string.min": "يجب أن يكون اسم الدولة على الأقل حرفين",
      "string.max": "يجب ألا يتجاوز اسم الدولة 50 حرفًا",
    })
    .label("الدولة"),

  subscriptionStatus: Joi.string()
    .valid("active", "inactive", "expired")
    .default("inactive")
    .messages({
      "any.only":
        "حالة الاشتراك يجب أن تكون 'active' أو 'inactive' أو 'expired'",
    })
    .label("حالة الاشتراك"),

  subscriptionPaymentDate: Joi.date().allow(null),
  subscriptionExpiryDate: Joi.date().allow(null),

  isDeleted: Joi.boolean().default(false),
});

export const updateValidation = Joi.object({
  name: Joi.string().min(3).max(50).trim().optional(),

  email: Joi.string().email().lowercase().trim().optional(),

  password: Joi.string().min(6).optional(),

  role: Joi.string().valid("client").optional(),

  isActive: Joi.boolean().optional(),

  country: Joi.string().min(2).max(50).trim().optional(),

  subscriptionStatus: Joi.string()
    .valid("active", "inactive", "expired")
    .optional(),

  subscriptionPaymentDate: Joi.date().allow(null).optional(),
  subscriptionExpiryDate: Joi.date().allow(null).optional(),
  isDeleted: Joi.boolean().optional(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "يجب إدخال بريد إلكتروني صالح",
    "string.empty": "البريد الإلكتروني مطلوب",
    "any.required": "البريد الإلكتروني مطلوب",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "يجب أن تحتوي كلمة المرور على الأقل {#limit} أحرف",
    "string.empty": "كلمة المرور مطلوبة",
    "any.required": "كلمة المرور مطلوبة",
  }),
});
