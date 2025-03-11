import mongoose from "mongoose";
import AppError from "../modules/utility/appError.js";
import userModel from "../../db/models/user.model.js";

const validateUserId = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError("من فضلك أدخل معرف المستخدم", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("معرف المستخدم غير صالح", 400));
  }

  const targetUser = await userModel.findById(userId);
  if (!targetUser) {
    return next(new AppError("المستخدم غير موجود", 404));
  }

  req.targetUser = targetUser;
  next();
};

export default validateUserId;
