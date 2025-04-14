// auth.controller.js
import mongoose from "mongoose";
import userModel from "../../../db/models/user.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

const getAllClients = catchError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filteredCountFeatures = new APIFeatures(
    userModel.find({ isDeleted: false, role: "client" }),
    req.query
  )
    .search()
    .filter();
  const totalCount = await filteredCountFeatures.query.countDocuments();

  const features = new APIFeatures(
    userModel.find({ isDeleted: false, role: "client" }).select("-password"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  features.query = features.query
    .populate("country")
    .populate("subscriptionCountries");

  const clients = await features.query;

  if (!clients.length) {
    return res.status(200).json({ message: "لا يوجد عملاء" });
  }

  res.status(200).json({
    data: clients,
    totalCount,
    skip,
  });
});

const deleteClient = catchError(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("معرف المستخدم غير صالح", 400));
  }

  const client = await userModel.findById(userId);

  if (!client) {
    return next(new AppError("المستخدم غير موجود", 404));
  }

  if (client.role === "admin") {
    return next(new AppError("لا يمكن حذف حساب أدمن", 403));
  }

  if (client.isDeleted) {
    return next(new AppError("المستخدم محذوف بالفعل", 400));
  }

  await userModel.findByIdAndUpdate(userId, { isDeleted: true });

  res.status(200).json({
    message: "تم حذف العميل بنجاح",
  });
});

const activateSubscription = catchError(async (req, res, next) => {
  const { userId, subscriptionPaymentDate, subscriptionExpiryDate } = req.body;

  if (!userId) {
    return next(new AppError("من فضلك أدخل معرف المستخدم", 400));
  }

  if (!subscriptionPaymentDate || !subscriptionExpiryDate) {
    return next(new AppError("من فضلك أدخل تاريخ البداية وتاريخ النهاية", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("معرف المستخدم غير صالح", 400));
  }

  const targetUser = await userModel.findById(userId);
  if (!targetUser) {
    return next(new AppError("المستخدم غير موجود", 404));
  }

  if (targetUser.role === "admin") {
    return next(new AppError("لا يمكن تفعيل اشتراك للأدمن", 400));
  }

  const subscriptionStart = new Date(subscriptionPaymentDate);
  const subscriptionEnd = new Date(subscriptionExpiryDate);

  if (isNaN(subscriptionStart) || isNaN(subscriptionEnd)) {
    return next(new AppError("التواريخ غير صالحة", 400));
  }

  if (subscriptionStart >= subscriptionEnd) {
    return next(
      new AppError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية", 400)
    );
  }

  targetUser.subscriptions.unshift({
    paymentDate: subscriptionStart,
    expiryDate: subscriptionEnd,
  });
  targetUser.subscriptionStatus = "active";
  await targetUser.save();

  res.status(200).json({
    message: "تم تفعيل الاشتراك بنجاح",
  });
});

const updateSubscriptionStatus = catchError(async (req, res, next) => {
  const { userId, subscriptionStatus } = req.body;

  if (!userId) {
    return next(new AppError("من فضلك أدخل معرف المستخدم", 400));
  }

  if (
    !subscriptionStatus ||
    !["expired", "inactive"].includes(subscriptionStatus)
  ) {
    return next(
      new AppError("من فضلك أدخل حالة صالحة: expired أو inactive", 400)
    );
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("معرف المستخدم غير صالح", 400));
  }

  const targetUser = await userModel.findOne({
    _id: userId,
    role: "client",
    isDeleted: false,
  });
  if (!targetUser) {
    return next(new AppError("المستخدم غير موجود أو محذوف", 404));
  }

  targetUser.subscriptionStatus = subscriptionStatus;
  await targetUser.save();

  res.status(200).json({
    message: "تم تحديث حالة الاشتراك بنجاح",
    subscription: {
      userId: targetUser._id,
      status: targetUser.subscriptionStatus,
      subscriptions: targetUser.subscriptions,
    },
  });
});

export {
  getAllClients,
  deleteClient,
  activateSubscription,
  updateSubscriptionStatus,
};
