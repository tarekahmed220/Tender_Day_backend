import express from "express";

import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { getSiteInfo, updateSiteInfo } from "./siteInfo.controller.js";
import { validation } from "../../middleware/validation.js";
import { siteInfoValidation } from "./siteInfo.validation.js";

const siteInfoRoutes = express.Router();

siteInfoRoutes.get("/get-site-info", getSiteInfo);
siteInfoRoutes.put(
  "/update-site-info",
  protect,
  restrictTo("admin"),
  validation(siteInfoValidation),
  updateSiteInfo
);

export default siteInfoRoutes;
