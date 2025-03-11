import express from "express";

import { protect, restrictTo } from "../../middleware/authMiddleware.js";
import {
  getAllClients,
  deleteClient,
  activateSubscription,
  updateSubscriptionStatus,
} from "./clients.controller.js";
import validateUserId from "../../middleware/validateUserId.js";

const clientRoutes = express.Router();

clientRoutes.get(
  "/get-all-clients",
  protect,
  restrictTo("admin"),
  getAllClients
);

clientRoutes.post(
  "/subscribe",
  protect,
  restrictTo("admin"),
  validateUserId,
  activateSubscription
);
clientRoutes.patch(
  "/clients/subscription",
  protect,
  restrictTo("admin"),
  validateUserId,
  updateSubscriptionStatus
);

clientRoutes.delete(
  "/clients/:userId",
  protect,
  restrictTo("admin"),
  deleteClient
);
// clientRoutes.get(
//   "/premium-content",
//   protect,
//   restrictToSubscription,
//   (req, res) => {
//     res.json({ message: "هذا المحتوى متاح للمشتركين فقط" });
//   }
// );

export default clientRoutes;
