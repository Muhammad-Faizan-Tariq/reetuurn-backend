import express from "express";
import { createCustomer } from "../controllers/userProfile.controller.js";
import { registerValidator, validate } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/create-customer", registerValidator, validate, createCustomer);

export default router;
