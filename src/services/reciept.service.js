import ReturnReceipt from "../models/receipt.model.js";

export const getReceiptsService = (user) => {
  return ReturnReceipt.find({ user })
    .populate({
      path: "returnOrderId",
      select:
        "metadata.orderNumber metadata.trackingNumber status packages pickupAddress createdAt updatedAt payment.amount payment.currency",
    })
    .sort({ createdAt: -1 });
};

export const getReceiptByIdService = async (receiptId, user) => {
  const receipt = await ReturnReceipt.findOne({ _id: receiptId, user }).populate({
    path: "returnOrderId",
    select:
      "metadata.orderNumber metadata.trackingNumber status packages pickupAddress createdAt updatedAt payment.amount payment.currency",
  });
  if (!receipt) throw new Error("Receipt not found");
  return receipt;
};

export const downloadReceiptService = (receiptId, user) => getReceiptByIdService(receiptId, user);
