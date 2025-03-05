import express from "express";
import { validation } from "../../middleware/validation.js";
import {
  addCountry,
  deleteCountry,
  getAllCountries,
} from "./country.controller.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { countryValidation } from "./country.validation.js";

const countryRoutes = express.Router();

countryRoutes.get(
  "/get-all-countries",
  protect,
  restrictTo("admin"),
  getAllCountries
);
countryRoutes.post(
  "/add-country",
  protect,
  restrictTo("admin"),
  validation(countryValidation),
  addCountry
);
countryRoutes.delete(
  "/delete-country/:id",
  protect,
  restrictTo("admin"),
  deleteCountry
);

export default countryRoutes;
