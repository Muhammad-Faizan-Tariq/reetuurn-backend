import express from "express";
import { createReturnOrder } from "../controllers/returnOrder.controller.js";
import { validateReturnOrder } from "../validations/returnOrder.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
    verifyToken,
  // (req, res, next) => {
  //   // Hardcode the user for testing
  //   req.user = { _id: "68a23177cf3e43f2f83df68c", name: "John Ali" };
  //   next();
  // },
  validateReturnOrder,
  createReturnOrder
);

export default router;
