import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";
import AppError from "../modules/utility/appError.js";
import catchError from "./handleError.js";
import isSubscriptionValid from "../modules/utility/isSubscriptionValid.js";

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    return next(new AppError("من فضلك قم بتسجيل الدخول أولا", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new AppError("مستخدم غير موجود", 404));
    }

    req.user = user;
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

export const restrictToSubscription = catchError(async (req, res, next) => {
  if (!isSubscriptionValid(req.user)) {
    return next(new AppError("اشتراكك منتهي، من فضلك جدد الاشتراك", 403));
  }
  next();
});
