import mongoose from "mongoose";

const advertiserSchema = new mongoose.Schema(
  {
    name_ar: {
      type: String,
      required: [true, "يرجى إدخال اسم المُعلن بالعربية"],
      trim: true,
    },
    name_en: {
      type: String,
      required: [true, "يرجى إدخال اسم المُعلن بالإنجليزية"],
      trim: true,
    },
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
        "من فضلك قم بإدخال بريد إلكتروني صالح",
      ],
      index: true,
    },
    address_ar: {
      type: String,
      required: [true, "من فضلك قم بإدخال العنوان بالعربية"],
      trim: true,
    },
    address_en: {
      type: String,
      required: [true, "من فضلك قم بإدخال العنوان بالإنجليزية"],
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const advertiserModel = mongoose.model("Advertiser", advertiserSchema);
export default advertiserModel;
