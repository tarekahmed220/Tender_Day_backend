import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../../../db/models/user.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import generateToken from "../utility/generateToken.js";

const registerClient = catchError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    country,
    subscriptionCountries,
    subscriptionStatus,
    subscriptionPaymentDate,
    subscriptionExpiryDate,
  } = req.body;

  if (subscriptionStatus || subscriptionPaymentDate || subscriptionExpiryDate) {
    return next(
      new AppError(
        "غير مسموح بإرسال بيانات الاشتراك أثناء التسجيل. سيتم تحديدها من قبل الإدارة.",
        403
      )
    );
  }

  const existingUser = await userModel.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    if (existingUser.role === "admin") {
      return next(new AppError("لا يمكن استخدام بيانات الأدمن الرئيسي", 403));
    }
    return next(new AppError("هذا البريد أو رقم الهاتف مسجل بالفعل", 400));
  }

  const newUser = new userModel({
    name,
    email,
    password,
    phone,
    role: "client",
    country,
    subscriptionCountries,
    subscriptionStatus: "inactive",
    subscriptions: [],
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: "تم التسجيل بنجاح. سيتم التواصل معك لتفعيل الاشتراك.",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      subscriptionStatus: newUser.subscriptionStatus,
    },
  });
});

const createClientByAdmin = catchError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    country,
    subscriptionCountries,
    subscriptionStatus,
    subscriptionPaymentDate,
    subscriptionExpiryDate,
  } = req.body;

  const existingUser = await userModel.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return next(new AppError("هذا البريد أو رقم الهاتف مسجل بالفعل", 400));
  }

  let subscriptions = [];
  if (subscriptionStatus === "active") {
    if (!subscriptionPaymentDate || !subscriptionExpiryDate) {
      return next(
        new AppError("يجب تحديد تواريخ الاشتراك عند تفعيل الحالة", 400)
      );
    }

    const start = new Date(subscriptionPaymentDate);
    const end = new Date(subscriptionExpiryDate);

    if (isNaN(start) || isNaN(end)) {
      return next(new AppError("تواريخ الاشتراك غير صالحة", 400));
    }

    if (start >= end) {
      return next(
        new AppError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية", 400)
      );
    }

    subscriptions.push({
      paymentDate: start,
      expiryDate: end,
    });
  }

  const newUser = new userModel({
    name,
    email,
    password,
    phone,
    role: "client",
    country,
    subscriptionCountries,
    subscriptionStatus: subscriptionStatus || "inactive",
    subscriptions,
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: "تم إضافة العميل بنجاح",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      subscriptionStatus: newUser.subscriptionStatus,
      subscriptions: newUser.subscriptions,
    },
  });
});

const signinUser = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  const targetUser = await userModel.findOne({ email, role: "client" });
  if (!targetUser || !(await targetUser.comparePassword(password))) {
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صالحة", 401)
    );
  }

  const token = generateToken(res, targetUser._id);
  res.json({
    message: "تم تسجيل الدخول بنجاح",
    token,
    role: "client",
    subscriptionStatus: targetUser.subscriptionStatus,
  });
});

const signinAdmin = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  const targetUser = await userModel.findOne({ email, role: "admin" });
  if (!targetUser || !(await targetUser.comparePassword(password))) {
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صالحة", 401)
    );
  }

  const token = generateToken(res, targetUser._id);
  res.json({
    message: "تم تسجيل دخول الأدمن بنجاح",
    token,
    role: "admin",
  });
});

const logout = catchError(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
});
const getAdminData = catchError(async (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return next(new AppError("غير مصرح لك بالوصول إلى بيانات الأدمن", 403));
  }

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

const getClientData = catchError(async (req, res, next) => {
  if (req.user.role !== "client") {
    return next(new AppError("غير مصرح لك", 403));
  }

  const user = await userModel
    .findById(req.user._id)
    .select("-password -__v -createdAt -updatedAt -isDeleted")
    .populate("subscriptionCountries", "name_ar name_en");

  res.status(200).json({
    success: true,
    user,
  });
});

const updateAdminEmail = catchError(async (req, res, next) => {
  const { email } = req.body;
  const userId = req.user._id;

  if (!email) {
    return next(new AppError("من فضلك أدخل البريد الإلكتروني الجديد", 400));
  }
  if (req.user.role !== "admin") {
    return next(new AppError("غير مصرح لك بتعديل هذا الحساب", 403));
  }

  const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
  if (emailExists) {
    return next(new AppError("هذا البريد مستخدم بالفعل", 400));
  }

  const user = await userModel.findByIdAndUpdate(
    userId,
    { email },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "تم تحديث البريد الإلكتروني بنجاح",
    data: { email: user.email },
  });
});

const updateAdminPassword = catchError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  if (req.user.role !== "admin") {
    return next(new AppError("غير مصرح لك بتعديل هذا الحساب", 403));
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError("من فضلك أدخل جميع الحقول", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError("كلمة المرور الجديدة غير متطابقة", 400));
  }

  const user = await userModel.findById(userId);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError("كلمة المرور الحالية غير صحيحة", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "تم تحديث كلمة المرور بنجاح",
  });
});

const updateClientPassword = catchError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  if (req.user.role !== "client") {
    return next(new AppError("غير مصرح لك بتعديل هذا الحساب", 403));
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError("من فضلك أدخل جميع الحقول", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError("كلمة المرور الجديدة غير متطابقة", 400));
  }

  const user = await userModel.findById(userId);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError("كلمة المرور الحالية غير صحيحة", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "تم تحديث كلمة المرور بنجاح",
  });
});

export {
  registerClient,
  createClientByAdmin,
  signinUser,
  logout,
  getAdminData,
  signinAdmin,
  updateAdminEmail,
  updateAdminPassword,
  getClientData,
  updateClientPassword,
};
