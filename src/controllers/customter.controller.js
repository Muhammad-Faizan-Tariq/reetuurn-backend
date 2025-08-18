import {
  getCustomerProfile,
  updatePhoneNumbers,
  updateAddresses,
  addNewAddress,
  verifyPhoneNumber,
} from "../services/customer.service.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await getCustomerProfile(req.user._id);
    successResponse(res, 200, "Profile retrieved", profile);
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const updatePhones = async (req, res) => {
  try {
    const phones = await updatePhoneNumbers(req.user._id, req.body.phones);
    successResponse(res, 200, "Phone numbers updated", { phones });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const updateCustomerAddresses = async (req, res) => {
  try {
    const addresses = await updateAddresses(req.user._id, req.body.addresses);
    successResponse(res, 200, "Addresses updated", { addresses });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const createAddress = async (req, res) => {
  try {
    const addresses = await addNewAddress(req.user._id, req.body);
    successResponse(res, 201, "Address added", { addresses });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const verifyPhone = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const result = await verifyPhoneNumber(req.user._id, phoneNumber, otp);
    successResponse(res, 200, "Phone verified", result);
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};
