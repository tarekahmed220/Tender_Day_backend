import mongoose, { Mongoose, Schema } from "mongoose";
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
      enum: ["client", "admin"],
      default: "client",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "يجب اختيار الدولة"],
    },

    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
    subscriptions: [
      {
        paymentDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
          required: true,
        },
      },
    ],
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
