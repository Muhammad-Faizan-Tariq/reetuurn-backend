import express from "express";
import {
  getReceipts,
  getReceiptById,
  downloadReceipt,
} from "../controllers/receipt.controller.js";
import {
  receiptIdParamValidator,
  validate,
} from "../validations/reciept.validation.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getReceipts);
router.get("/:receiptId", verifyToken, receiptIdParamValidator, validate, getReceiptById);
router.get(
  "/:receiptId/download",
  verifyToken,
  receiptIdParamValidator,
  validate,
  downloadReceipt
);

export default router;
