import express from "express";
import {
  getProfile,
  updatePhones,
  updateCustomerAddresses,
  createAddress,
  verifyPhone,
} from "../controllers/customter.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/phones", verifyToken, updatePhones);
router.put("/addresses", verifyToken, updateCustomerAddresses);
router.post("/secondary-address", verifyToken, createAddress);
router.post("/secondary-phone", verifyToken, verifyPhone);

export default router;
