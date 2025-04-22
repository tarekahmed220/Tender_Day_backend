import express from "express";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { validation } from "../../middleware/validation.js";
import {
  createClientByAdmin,
  getAdminData,
  getClientData,
  logout,
  registerClient,
  signinAdmin,
  signinUser,
  updateAdminEmail,
  updateAdminPassword,
  updateClientPassword,
} from "./auth.controller.js";
import {
  emailValidationSchema,
  passwordValidationSchema,
  registerByAdminValidation,
  registerClientValidation,
  userLoginSchema,
} from "./auth.validation.js";

const userRoutes = express.Router();
userRoutes.post(
  "/register",
  validation(registerClientValidation),
  registerClient
);

userRoutes.post(
  "/admin/users",
  protect,
  restrictTo("admin"),
  validation(registerByAdminValidation),
  createClientByAdmin
);
userRoutes.get("/me", protect, restrictTo("admin"), getAdminData);
userRoutes.get("/client/me", protect, getClientData);
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
userRoutes.post(
  "/password-client",
  protect,
  validation(passwordValidationSchema),
  updateClientPassword
);

export default userRoutes;
