import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";
import AppError from "../modules/utility/appError.js";
import catchError from "./handleError.js";
import isSubscriptionValid, {
  isUserSubscribedToCountry,
} from "../modules/utility/isSubscriptionValid.js";
import Tender from "../../db/models/tender.model.js";

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

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
  const user = req.user;
  const isValid = await isSubscriptionValid(user);

  if (!isValid) {
    return next(
      new AppError("اشتراكك منتهي أو غير مفعل، من فضلك جدد الاشتراك", 403)
    );
  }
  next();
});

export const restrictToCountrySubscription = catchError(
  async (req, res, next) => {
    const tenderId = req.params.id;
    const tender = await Tender.findById(tenderId).populate("country");

    if (!tender) {
      return next(new AppError("المناقصة غير موجودة", 404));
    }

    if (!isUserSubscribedToCountry(req.user, tender)) {
      return next(
        new AppError("أنت غير مشترك في الدولة التي تخص هذه المناقصة", 403)
      );
    }

    next();
  }
);
