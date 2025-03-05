import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";
import AppError from "../modules/utility/appError.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("غير مصرح به، الرجاء تسجيل الدخول", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded.id);
    if (!req.user) {
      return next(new AppError("مستخدم غير موجود", 404));
    }
    if (req.user.subscriptionStatus === "expired") {
      res.clearCookie("token");
      return next(
        new AppError(
          "لقد انتهت صلاحية اشتراكك. يرجى تسجيل الدخول مرة أخرى",
          403
        )
      );
    }

    next();
  } catch (error) {
    return next(new AppError("رمز تحقق غير صالح", 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("غير مصرح لك ، عملية مرفوضة", 403));
    }
    next();
  };
};
