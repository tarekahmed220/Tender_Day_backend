import mongoose from "mongoose";

const siteInfoSchema = new mongoose.Schema(
  {
    aboutUs_ar: {
      type: String,
      trim: true,
      default: "",
    },
    aboutUs_en: {
      type: String,
      trim: true,
      default: "",
    },
    whatsapp: {
      type: String,
      match: [/^\+?\d{10,15}$/, "رقم واتساب غير صالح"],
      default: "",
    },
    viber: {
      type: String,
      match: [/^\+?\d{10,15}$/, "رقم فايبر غير صالح"],
      default: "",
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "البريد الإلكتروني غير صالح"],
      default: "",
    },
    whySubscribe_ar: {
      type: String,
      trim: true,
      default: "",
    },
    whySubscribe_en: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { versionKey: false }
);

const SiteInfo = mongoose.model("SiteInfo", siteInfoSchema);
export default SiteInfo;
