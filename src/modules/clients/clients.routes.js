import express from "express";

import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import { getAllClients } from "./clients.controller.js";

const clientRoutes = express.Router();

clientRoutes.get(
  "/get-all-clients",
  protect,
  restrictTo("admin"),
  getAllClients
);

export default clientRoutes;
