import express from "express";
import {
  getAllTenders,
  addTender,
  updateTender,
  deleteTender,
  getTenderById,
  deleteTenderPermanently,
  restoreTender,
} from "./tenders.controller.js";

import { validation } from "../../middleware/validation.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  addTenderValidation,
  updateTenderValidation,
} from "./tenders.validation.js";
import { upload } from "../utility/multer.js";

const tenderRoutes = express.Router();
tenderRoutes.get("/get-all-tenders", protect, getAllTenders);
tenderRoutes.get("/get-tender-byid/:id", protect, getTenderById);
tenderRoutes.post(
  "/add-tender",
  protect,
  restrictTo("admin"),
  upload.single("fileUrl"),
  validation(addTenderValidation),
  addTender
);

tenderRoutes.put(
  "/update-tender/:id",
  protect,
  restrictTo("admin"),
  upload.single("fileUrl"),
  validation(updateTenderValidation),
  updateTender
);
tenderRoutes.patch("/restore/:id", protect, restrictTo("admin"), restoreTender);
tenderRoutes.delete(
  "/delete-tender/:id",
  protect,
  restrictTo("admin"),
  deleteTender
);
tenderRoutes.delete(
  "/delete-tender-permanently/:id",
  protect,
  restrictTo("admin"),
  deleteTenderPermanently
);

export default tenderRoutes;
