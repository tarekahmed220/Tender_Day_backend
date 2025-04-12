// controllers/message.controller.js
import messageModel from "../../../db/models/message.model.js";
import catchError from "../../middleware/handleError.js";
import APIFeatures from "../utility/APIFeatures.js";
import AppError from "../utility/appError.js";

// إرسال رسالة جديدة
export const sendMessage = catchError(async (req, res, next) => {
  const { name, email, country, phone, message } = req.body;

  const newMessage = new messageModel({
    name,
    email,
    country,
    phone,
    message,
  });

  await newMessage.save();

  res.status(201).json({
    message: "تم إرسال الرسالة بنجاح",
    data: newMessage,
  });
});

export const getAllMessages = catchError(async (req, res, next) => {
  let query = messageModel.find({ isDeleted: false });

  const featuresForCount = new APIFeatures(query.clone(), req.query)
    .search()
    .filter();

  const filteredCount = await featuresForCount.query.countDocuments();
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const features = new APIFeatures(query, req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const messages = await features.query.lean();

  res.status(200).json({
    data: messages,
    totalCount: filteredCount,
    pageCount: Math.ceil(filteredCount / (req.query.limit || 10)),
    skip,
  });
});
