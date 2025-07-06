import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title_ar: {
      type: String,
      required: true,
      trim: true,
    },
    title_en: {
      type: String,
      required: true,
      trim: true,
    },
    description_ar: {
      type: String,
      required: true,
      trim: true,
    },
    description_en: {
      type: String,
      required: true,
      trim: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Seo = mongoose.model("Seo", seoSchema);
export default Seo;
