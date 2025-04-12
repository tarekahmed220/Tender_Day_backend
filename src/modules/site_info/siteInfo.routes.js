import express from "express";

import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  addBrandLogo,
  getSiteInfo,
  removeBrandLogo,
  removeMainImage,
  updateSiteInfo,
  uploadMainImage,
} from "./siteInfo.controller.js";
import { validation } from "../../middleware/validation.js";
import { siteInfoValidation } from "./siteInfo.validation.js";
import { uploadSiteInfo } from "../utility/uploadSiteInfo.js";

const siteInfoRoutes = express.Router();

siteInfoRoutes.get("/get-site-info", getSiteInfo);

siteInfoRoutes.put(
  "/update-site-info",
  protect,
  restrictTo("admin"),
  validation(siteInfoValidation),
  updateSiteInfo
);

siteInfoRoutes.post(
  "/upload-main-image",
  protect,
  restrictTo("admin"),
  uploadSiteInfo.single("mainImage"),
  uploadMainImage
);
siteInfoRoutes.delete(
  "/remove-main-image",
  protect,
  restrictTo("admin"),
  removeMainImage
);
siteInfoRoutes.post(
  "/add-brand",
  protect,
  restrictTo("admin"),
  uploadSiteInfo.single("brandLogo"),
  addBrandLogo
);

siteInfoRoutes.delete(
  "/remove-brand/:filename",
  protect,
  restrictTo("admin"),
  removeBrandLogo
);
export default siteInfoRoutes;
