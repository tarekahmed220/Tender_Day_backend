import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "من فضلك قم بإدخال الاسم"],
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
    password: {
      type: String,
      required: [true, "من فضلك قم بإدخال كلمة المرور"],
      minlength: [6, "يجب أن تحتوي كلمة المرور علي 6 أحرف علي الأقل"],
    },
    role: {
      type: String,
      enum: ["client"],
      default: "client",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      default: "Unknown",
      required: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
    subscriptionPaymentDate: {
      type: Date,
      default: null,
    },
    subscriptionExpiryDate: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
