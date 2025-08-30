export const formatReceiptResponse = (receipts) => {
  const list = Array.isArray(receipts) ? receipts : [receipts];

  const formatted = list.map((r) => {
    const o = r.returnOrderId;
    return {
      id: r._id,
      orderId: o?._id || null,
      orderNumber: o?.metadata?.orderNumber ?? o?.orderNumber ?? null,
      // trackingNumber: o?.metadata?.trackingNumber ?? o?.trackingNumber ?? null,
      packages: o?.packages || [],
      status: o?.status || null,
      pickupAddress: o?.formattedAddress || null,
      createdAt: o?.createdAt || r.createdAt || null,
      updatedAt: o?.updatedAt || r.updatedAt || null,
      total: o?.payment?.amount ?? null,
      currency: o?.payment?.currency || "PKR",
      downloadUrl: `/api/receipts/${r._id}/download`,
    };
  });

  return Array.isArray(receipts) ? formatted : formatted[0];
};
