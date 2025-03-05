import mongoose, { Schema } from "mongoose";

const fieldSchema = new Schema(
  {
    name_ar: {
      type: String,
      required: [true, "يرجى إدخال اسم المجال بالعربية"],
      trim: true,
    },
    name_en: {
      type: String,
      required: [true, "يرجى إدخال اسم المجال بالإنجليزية"],
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const fieldModel = mongoose.model("Field", fieldSchema);
export default fieldModel;
