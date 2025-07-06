import express from "express";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { createSeo, updateSeo, getAllSeo } from "./seo.controller.js";
import { validation } from "../../middleware/validation.js";
import { seoValidation } from "./seo.validation.js";

const router = express.Router();
router.get("/", getAllSeo);

router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validation(seoValidation),
  updateSeo
);

export default router;
