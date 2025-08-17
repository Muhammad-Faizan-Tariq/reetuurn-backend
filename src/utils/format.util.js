export const formatReceiptResponse = (receipts) => {
  const list = Array.isArray(receipts) ? receipts : [receipts];

  const formatted = list.map((r) => ({
    id: r._id,
    orderId: r.returnOrderId?._id,
    packages: r.returnOrderId?.packages || [],
    status: r.returnOrderId?.status,
    date: r.generatedAt || r.createdAt,
    total: r.returnOrderId?.totalAmount ?? null,
    currency: r.returnOrderId?.currency || "PKR",
    downloadUrl: `/api/receipts/${r._id}/download`,
  }));

  return Array.isArray(receipts) ? formatted : formatted[0];
};
