import {
  handleReturnOrder,
  getPaymentOptions,
  updateOrderStatus,
} from "../services/returnOrder.service.js";
import {
  formatOrderResponse,
  handleControllerError,
} from "../utils/controller.util.js";

import ReturnReceipt from "../models/receipt.model.js";


export const createReturnOrder = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }


    const result = await handleReturnOrder(req.user._id, req.body);

    
    const receipt = await ReturnReceipt.create({
      user: req.user._id,
      returnOrderId: result.order._id, 
    });

   
    res.status(201).json({
      success: true,
      message: "Return order & receipt created successfully",
      data: {
        order: formatOrderResponse(result.order),
        receipt: {
          id: receipt._id,
          generatedAt: receipt.generatedAt,
        },
      },
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};


export const listPaymentOptions = (req, res) => {
  try {
    res.json({ success: true, data: getPaymentOptions() });
  } catch (error) {
    handleControllerError(res, error);
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const order = await updateOrderStatus(orderId, status);

    res.json({ success: true, data: formatOrderResponse(order) });
  } catch (error) {
    handleControllerError(res, error);
  }
};
