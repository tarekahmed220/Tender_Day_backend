import express from "express";
import { validation } from "../../middleware/validation.js";
import messageValidation from "./messages.validation.js";
import { getAllMessages, sendMessage } from "./message.controller.js";
import { protect, restrictTo } from "../../middleware/authMiddleware.js";

const messagesRoutes = express.Router();

messagesRoutes.get(
  "/get-all-messages",
  protect,
  restrictTo("admin"),
  getAllMessages
);
messagesRoutes.post(
  "/send-message",
  validation(messageValidation),
  sendMessage
);

export default messagesRoutes;
