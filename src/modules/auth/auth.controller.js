import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../../../db/models/user.model.js";
import catchError from "../../middleware/handleError.js";
import AppError from "../utility/appError.js";
import generateToken from "../utility/generateToken.js";

const register = catchError(async (req, res, next) => {
  const { name, email, password, role, country } = req.body;

  const targetUser = await userModel.findOne({ email });
  if (targetUser) {
    return next(
      new AppError(
        "هذا البريد مسجل بالفعل من قبل، من فضلك قم بتسجيل الدخول",
        400
      )
    );
  }

  const newUser = new userModel({
    name,
    email,
    password,
    role: role || "client",
    country,
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: "تم التسجيل بنجاح",
    user: { id: newUser._id, name: newUser.name, email: newUser.email },
  });
});

const signin = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  const targetUser = await userModel.findOne({ email });
  if (!targetUser || !(await targetUser.comparePassword(password))) {
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صالحة", 401)
    );
  }

  const token = generateToken(res, targetUser._id);
  res.json({ message: "تم تسجيل الدخول بنجاح", token });
});

const logout = catchError(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
});
const getAdminData = catchError(async (req, res) => {
  const adminData = req.user;
  res.json({
    user: { id: adminData.id, email: adminData.email, name: adminData.name },
  });
});

export { register, signin, logout, getAdminData };
