import express from "express";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { createSeo, updateSeo, getAllSeo } from "./seo.controller.js";
import { validation } from "../../middleware/validation.js";
import { seoValidation } from "./seo.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  validation(seoValidation),
  createSeo
);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validation(seoValidation),
  updateSeo
);
router.get("/", getAllSeo);

export default router;
