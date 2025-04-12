import Joi from "joi";

export const registerClientValidation = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "يجب أن يكون الاسم على الأقل 2 أحرف",
    "string.max": "يجب ألا يتجاوز الاسم 50 حرفًا",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يجب إدخال بريد إلكتروني صالح",
    }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "كلمة المرور مطلوبة",
    "string.min": "يجب أن تكون كلمة المرور على الأقل 6 أحرف",
  }),

  phone: Joi.string()
    .pattern(/^(\+?\d{6,15})$/)
    .required()
    .messages({
      "string.pattern.base":
        "رقم الهاتف غير صالح. يجب أن يحتوي على 6 إلى 15 رقم، مع أو بدون رمز الدولة.",
      "string.empty": "رقم الهاتف مطلوب",
    }),

  country: Joi.string().min(2).max(50).required().messages({
    "string.empty": "الدولة مطلوبة",
    "string.min": "الدولة يجب أن تكون على الأقل حرفين",
    "string.max": "الدولة يجب ألا تتجاوز 50 حرفًا",
  }),

  subscriptionCountries: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      "array.base": "يجب اختيار دولة أو أكثر للاشتراك",
      "array.min": "يجب اختيار دولة واحدة على الأقل",
      "any.required": "دول الاشتراك مطلوبة",
    }),
});

export const registerByAdminValidation = Joi.object({
  name: Joi.string().min(3).max(50).trim().required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "يجب أن يكون الاسم على الأقل 3 أحرف",
    "string.max": "يجب ألا يتجاوز الاسم 50 حرفًا",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يجب إدخال بريد إلكتروني صالح",
    }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "كلمة المرور مطلوبة",
    "string.min": "يجب أن تكون كلمة المرور على الأقل 6 أحرف",
  }),

  phone: Joi.string()
    .pattern(/^(\+?\d{6,15})$/)
    .required()
    .messages({
      "string.pattern.base":
        "رقم الهاتف غير صالح. يجب أن يحتوي على 6 إلى 15 رقم، مع أو بدون رمز الدولة.",
      "string.empty": "رقم الهاتف مطلوب",
    }),

  country: Joi.string().min(2).max(50).required().messages({
    "string.empty": "الدولة مطلوبة",
    "string.min": "الدولة يجب أن تكون على الأقل حرفين",
    "string.max": "الدولة يجب ألا تتجاوز 50 حرفًا",
  }),

  subscriptionCountries: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      "array.base": "يجب اختيار دولة أو أكثر للاشتراك",
      "array.min": "يجب اختيار دولة واحدة على الأقل",
      "any.required": "دول الاشتراك مطلوبة",
    }),

  subscriptionStatus: Joi.string()
    .valid("active", "inactive", "expired")
    .default("inactive")
    .messages({
      "any.only":
        "حالة الاشتراك يجب أن تكون 'active' أو 'inactive' أو 'expired'",
    }),

  subscriptionPaymentDate: Joi.date()
    .allow(null)
    .messages({ "date.base": "تاريخ بداية الاشتراك غير صالح" }),

  subscriptionExpiryDate: Joi.date()
    .allow(null)
    .messages({ "date.base": "تاريخ نهاية الاشتراك غير صالح" }),
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

export const emailValidationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "من فضلك أدخل بريد إلكتروني صالح",
      "any.required": "البريد الإلكتروني مطلوب",
    }),
});

export const passwordValidationSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "كلمة المرور الحالية مطلوبة",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    "any.required": "كلمة المرور الجديدة مطلوبة",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "كلمة المرور الجديدة غير متطابقة",
      "any.required": "تأكيد كلمة المرور مطلوب",
    }),
});
