import express from "express";
import catchError from "../../middleware/handleError.js";

import { protect } from "../../middleware/authMiddleware.js";
import Currency from "../../../db/models/currency.model.js";

const currencyRoutes = express.Router();
currencyRoutes.get(
  "/get-all-currencies",
  catchError(async (req, res) => {
    const currencies = await Currency.find();
    res.status(200).json({ success: true, data: currencies });
  })
);

export default currencyRoutes;
