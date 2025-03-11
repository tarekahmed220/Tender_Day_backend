import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../../../db/models/user.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import generateToken from "../utility/generateToken.js";

const register = catchError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    country,
    subscriptionStatus,
    subscriptionPaymentDate,
    subscriptionExpiryDate,
  } = req.body;

  const targetUser = await userModel.findOne({ email });
  if (targetUser) {
    return next(
      new AppError(
        "هذا البريد مسجل بالفعل من قبل، من فضلك قم بتسجيل الدخول",
        400
      )
    );
  }

  let subscriptions = [];
  if (subscriptionStatus === "active") {
    if (!subscriptionPaymentDate || !subscriptionExpiryDate) {
      return next(
        new AppError(
          "تاريخ بداية ونهاية الاشتراك مطلوبان عند تفعيل الاشتراك",
          400
        )
      );
    }

    const startDate = new Date(subscriptionPaymentDate);
    const endDate = new Date(subscriptionExpiryDate);

    if (isNaN(startDate) || isNaN(endDate)) {
      return next(new AppError("التواريخ غير صالحة", 400));
    }

    if (startDate >= endDate) {
      return next(
        new AppError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية", 400)
      );
    }

    subscriptions.unshift({
      paymentDate: startDate,
      expiryDate: endDate,
    });
  }

  const newUser = new userModel({
    name,
    email,
    password,
    role: "client",
    country: country,
    subscriptionStatus: subscriptionStatus || "inactive",
    subscriptions,
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: "تم التسجيل بنجاح",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      subscriptionStatus: newUser.subscriptionStatus,
      subscriptions: newUser.subscriptions,
    },
  });
});

const signinUser = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من إن المستخدم client بس
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
const getAdminData = catchError(async (req, res) => {
  const adminData = req.user;
  res.json({
    user: { id: adminData.id, email: adminData.email, name: adminData.name },
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

export {
  register,
  signinUser,
  logout,
  getAdminData,
  signinAdmin,
  updateAdminEmail,
  updateAdminPassword,
};
