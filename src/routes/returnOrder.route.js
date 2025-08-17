import express from "express";
import { createReturnOrder } from "../controllers/returnOrder.controller.js";
import { validateReturnOrder } from "../validations/returnOrder.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  //   verifyToken,
  (req, res, next) => {
    // Hardcode the user for testing
    req.user = { _id: "689e1ee74d1d69d5344d0749", name: "John ali" };
    next();
  },
  validateReturnOrder,
  createReturnOrder
);

export default router;
