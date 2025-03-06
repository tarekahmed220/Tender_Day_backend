import express from "express";
import {
  getAllTenders,
  addTender,
  updateTender,
  deleteTender,
} from "./tenders.controller.js";

import { validation } from "../../middleware/validation.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  addTenderValidation,
  updateTenderValidation,
} from "./tenders.validation.js";

const tenderRoutes = express.Router();

tenderRoutes.get("/get-all-tenders", protect, getAllTenders);
tenderRoutes.post(
  "/add-tender",
  protect,
  restrictTo("admin"),
  validation(addTenderValidation),
  addTender
);
tenderRoutes.put(
  "/update-tender/:id",
  protect,
  restrictTo("admin"),
  validation(updateTenderValidation),
  updateTender
);
tenderRoutes.delete(
  "/delete-tender/:id",
  protect,
  restrictTo("admin"),
  deleteTender
);

export default tenderRoutes;
