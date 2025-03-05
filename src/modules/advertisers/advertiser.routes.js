import express from "express";
import { validation } from "../../middleware/validation.js";
import {
  addAdvertiser,
  deleteAdvertiser,
  getAllAdvertisers,
  updateAdvertiser,
} from "./advertiser.controller.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  advertiserValidation,
  updateAdvertiserValidation,
} from "./advertiser.validation.js";

const advertiserRoutes = express.Router();

advertiserRoutes.get(
  "/get-all-advertisers",
  protect,
  restrictTo("admin"),
  getAllAdvertisers
);
advertiserRoutes.post(
  "/add-advertiser",
  protect,
  restrictTo("admin"),
  validation(advertiserValidation),
  addAdvertiser
);
advertiserRoutes.put(
  "/update-advertiser/:id",
  protect,
  restrictTo("admin"),
  validation(updateAdvertiserValidation),
  updateAdvertiser
);
advertiserRoutes.delete(
  "/delete-advertiser/:id",
  protect,
  restrictTo("admin"),
  deleteAdvertiser
);

export default advertiserRoutes;
