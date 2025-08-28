import {
  getReceiptsService,
  getReceiptByIdService,
  downloadReceiptService,
} from "../services/reciept.service.js";

import { successResponse, errorResponse } from "../utils/response.util.js";
import { generateReceiptPDF } from "../utils/pdfDownload.util.js";
import { formatReceiptResponse } from "../utils/format.util.js";


export const getReceipts = async (req, res) => {
  try {
    const user = req.user._id;
    const receipts = await getReceiptsService(user);
    const data = formatReceiptResponse(receipts);
    

    return successResponse(res, 200, "Receipts fetched successfully", {
      count: receipts.length,
      receipts: data,
    });
  } catch (error) {
    return errorResponse(res, 400, "Failed to fetch receipts", error);
  }
};


export const getReceiptById = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const user = req.user._id;

    const receipt = await getReceiptByIdService(receiptId, user);
    const data = formatReceiptResponse(receipt);

    return successResponse(res, 200, "Receipt fetched successfully", data);
  } catch (error) {
    return errorResponse(res, 404, "Receipt not found", error);
  }
};


export const downloadReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const user = req.user._id;

    const receipt = await downloadReceiptService(receiptId, user);
    generateReceiptPDF(res, receipt);
  } catch (error) {
    return errorResponse(res, 400, "Failed to download receipt", error);
  }
};
