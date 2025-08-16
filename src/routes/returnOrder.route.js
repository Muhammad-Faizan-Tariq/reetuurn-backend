import express from "express";
import { createReturnOrder } from "../controllers/returnOrder.controller.js";
import { validateReturnOrder } from "../validations/returnOrder.validation.js";
import {validate} from "../validations/return.validation.js"
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  validateReturnOrder, 
  validate, 
  createReturnOrder
);

export default router;
