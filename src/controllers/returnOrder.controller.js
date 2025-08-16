import {
  handleReturnOrder,
  getPaymentOptions,
  updateOrderStatus,
} from "../services/returnOrder.service.js";
import {
  formatOrderResponse,
  handleControllerError,
} from "../utils/controller.util.js";


export const createReturnOrder = async (req, res) => {
  try {
    const result = await handleReturnOrder(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: formatOrderResponse(result),
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
    const order = await updateOrderStatus(req.params.orderId, req.body.status);
    res.json({ success: true, data: formatOrderResponse(order) });
  } catch (error) {
    handleControllerError(res, error);
  }
};
