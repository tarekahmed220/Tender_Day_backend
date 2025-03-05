import express from "express";
import { validation } from "../../middleware/validation.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  addField,
  deleteField,
  getAllFields,
  updateField,
} from "./fields.controller.js";
import { fieldValidation, updateFieldValidation } from "./fields.validation.js";

const fieldRoutes = express.Router();

fieldRoutes.get("/get-all-fields", protect, restrictTo("admin"), getAllFields);

fieldRoutes.post(
  "/add-field",
  protect,
  restrictTo("admin"),
  validation(fieldValidation),
  addField
);

fieldRoutes.put(
  "/update-field/:id",
  protect,
  restrictTo("admin"),
  validation(updateFieldValidation),
  updateField
);

fieldRoutes.delete(
  "/delete-field/:id",
  protect,
  restrictTo("admin"),
  deleteField
);

export default fieldRoutes;
