import ReturnReceipt from "../models/receipt.model.js";

export const getReceiptsService = (user) => {
  return ReturnReceipt.find({ user })
    .populate({
      path: "returnOrderId",
      select: "status packages totalAmount currency createdAt",
    })
    .sort({ createdAt: -1 });
};

export const getReceiptByIdService = async (receiptId, user) => {
  const receipt = await ReturnReceipt.findOne({
    _id: receiptId,
    user,
  }).populate({
    path: "returnOrderId",
    select: "status packages totalAmount currency createdAt",
  });
  if (!receipt) throw new Error("Receipt not found");
  return receipt;
};


export const downloadReceiptService = (receiptId, user) =>
  getReceiptByIdService(receiptId, user);
