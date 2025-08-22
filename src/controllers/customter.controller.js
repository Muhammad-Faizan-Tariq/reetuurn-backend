import {
  getCustomerProfile,
  updatePhoneNumbers,
  addPhoneNumber,
  updateCustomerAddresses,
  addCustomerAddress,
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

export const addPhone = async (req, res) => {
  try {
    const phones = await addPhoneNumber(req.user._id, req.body);
    successResponse(res, 201, "Phone added", { phones });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const updateAddresses = async (req, res) => {
  try {
    const addresses = await updateCustomerAddresses(req.user._id, req.body.addresses);
    successResponse(res, 200, "Addresses updated", { addresses });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

export const addAddress = async (req, res) => {
  try {
    const addresses = await addCustomerAddress(req.user._id, req.body);
    successResponse(res, 201, "Address added", { addresses });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};
