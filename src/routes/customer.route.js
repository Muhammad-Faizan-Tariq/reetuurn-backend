import express from "express";
import {
  getProfile,
  updatePhones,
  addPhone,
  updateAddresses,
  addAddress,
} from "../controllers/customter.controller.js";

import {
  phoneArrayValidation,
  singlePhoneValidation,
  addressArrayValidation,
  singleAddressValidation,
  validate,
} from "../validations/customer.validation.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

router.put("/phones", verifyToken, phoneArrayValidation, validate, updatePhones);
router.post("/phones", verifyToken, singlePhoneValidation, validate, addPhone);

router.put("/addresses", verifyToken, addressArrayValidation, validate, updateAddresses);
router.post("/addresses", verifyToken, singleAddressValidation, validate, addAddress);

export default router;
