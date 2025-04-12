import express from "express";
import { validation } from "../../middleware/validation.js";
import {
  addAdvertiser,
  deleteAdvertiser,
  getMainAdvertisers,
  updateAdvertiser,
  getSubAdvertisersByParentId,
  getAllAdvertisersGrouped,
} from "./advertiser.controller.js";
import {
  protect,
  restrictTo,
  restrictToSubscription,
} from "../../middleware/authMiddleware.js";
import {
  advertiserValidation,
  updateAdvertiserValidation,
} from "./advertiser.validation.js";

const advertiserRoutes = express.Router();

advertiserRoutes.get(
  "/get-all-advertisers",
  protect,
  restrictTo("admin"),
  getMainAdvertisers
);

advertiserRoutes.get(
  "/get-all-advertisers-group",
  protect,
  // restrictTo("admin"),
  restrictToSubscription,
  getAllAdvertisersGrouped
);

advertiserRoutes.get(
  "/get-sub-advertisers/:id",
  protect,
  restrictTo("admin"),
  getSubAdvertisersByParentId
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
