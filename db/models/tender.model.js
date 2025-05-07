import mongoose from "mongoose";

const descriptionPointSchema = new mongoose.Schema({
  point_ar: {
    type: String,
    required: [true, "يجب إدخال وصف الفقرة  بالعربية"],
    trim: true,
  },
  point_en: {
    type: String,
    required: [true, "يجب إدخال وصف الفقرة بالإنجليزية"],
    trim: true,
  },
});
const tenderSchema = new mongoose.Schema(
  {
    name_ar: {
      type: String,
      required: [true, "يجب إدخال اسم المناقصة بالعربية"],
      trim: true,
    },
    name_en: {
      type: String,
      required: [true, "يجب إدخال اسم المناقصة بالإنجليزية"],
      trim: true,
    },
    description: {
      type: [descriptionPointSchema],
      required: [true, "يجب إدخال وصف المناقصة"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "يجب إدخال فقرة واحدة على الأقل للوصف",
      },
    },
    tenderNumber: {
      type: String,
      required: [true, "يجب إدخال رقم المناقصة"],
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "يجب اختيار الدولة"],
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: [true, "يجب اختيار العملة"],
    },
    mainField: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: [true, "يجب اختيار المجال الرئيسي"],
    },
    subField: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: [true, "يجب اختيار المجال الفرعي"],
    },
    province: {
      type: String,
      required: [true, "يجب إدخال المحافظة"],
    },
    mainAdvertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
      required: [true, "يجب اختيار الجهة المعلنة الرئيسية"],
    },
    subAdvertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
      required: false,
    },
    closingDate: {
      type: Date,
      required: [true, "يجب إدخال تاريخ الإغلاق"],
    },
    documentPrice: {
      type: String,
      required: [true, "يجب إدخال قيمة وثائق المناقصة"],
    },
    guaranteeAmount: {
      type: String,
      required: [true, "يجب إدخال مبلغ التأمين"],
    },
    sourceInfo: {
      type: String,
      required: [true, "يجب إدخال مصدر المعلومات"],
    },
    fileUrl: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Tender = mongoose.model("Tender", tenderSchema);
export default Tender;
