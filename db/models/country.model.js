import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name_ar: { type: String, required: true, unique: true, trim: true },
    name_en: { type: String, required: true, unique: true, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const countryModel = mongoose.model("Country", countrySchema);
export default countryModel;
