import express from "express";
import { validation } from "../../middleware/validation.js";
import { userLoginSchema, registerValidation } from "./auth.validation.js";
import { signin, register, logout, getAdminData } from "./auth.controller.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.get("/me", protect, restrictTo("admin"), getAdminData);
userRoutes.post("/register", validation(registerValidation), register);
userRoutes.post("/signin", validation(userLoginSchema), signin);
userRoutes.post("/logout", protect, logout);

export default userRoutes;
