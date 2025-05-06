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
      trim: true,
      default: null,
    },
    extraPhone: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    extraEmail: {
      type: String,
      trim: true,
      default: null,
    },
    address_ar: {
      type: String,
      trim: true,
      default: null,
    },
    address_en: {
      type: String,
      trim: true,
      default: null,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      default: null,
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
