import mongoose from "mongoose";

const advertiserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "من فضلك قم بإدخال رقم الموبايل"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "من فضلك قم بإدخال البريد الالكتروني"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "من فضلك قم بإدخال بريد صالح",
      ],
      index: true,
    },
    address: {
      type: String,
      required: [true, "من فضلك قم بإدخال العنوان"],
      trim: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const advertiserModel = mongoose.model("Advertiser", advertiserSchema);
export default advertiserModel;
