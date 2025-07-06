import express from "express";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { updateSeo, getAllSeo, getSeoById } from "./seo.controller.js";
import { validation } from "../../middleware/validation.js";
import { seoValidation } from "./seo.validation.js";

const router = express.Router();
router.get("/", getAllSeo);
router.get("/:id", getSeoById);

router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validation(seoValidation),
  updateSeo
);

export default router;
