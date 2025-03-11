import express from "express";
import { validation } from "../../middleware/validation.js";
import {
  userLoginSchema,
  registerValidation,
  emailValidationSchema,
  passwordValidationSchema,
} from "./auth.validation.js";
import {
  signinUser,
  register,
  logout,
  getAdminData,
  signinAdmin,
  updateAdminEmail,
  updateAdminPassword,
} from "./auth.controller.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.get("/me", protect, restrictTo("admin"), getAdminData);
userRoutes.post("/register", validation(registerValidation), register);
userRoutes.post("/signin", validation(userLoginSchema), signinUser);
userRoutes.post("/admin/signin", validation(userLoginSchema), signinAdmin);
userRoutes.post("/logout", protect, logout);
userRoutes.post(
  "/email",
  protect,
  restrictTo("admin"),
  validation(emailValidationSchema),
  updateAdminEmail
);
userRoutes.post(
  "/password",
  protect,
  restrictTo("admin"),
  validation(passwordValidationSchema),
  updateAdminPassword
);

export default userRoutes;
