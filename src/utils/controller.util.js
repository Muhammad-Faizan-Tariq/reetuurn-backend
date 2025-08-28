
export const formatOrderResponse = (result) => {
  if (!result) return null;


  const order = result.order || result;

  return {
    id: order._id,
    status: order.status,
    pickupAddress: order.pickupAddress || null,
    packages:
      order.packages?.map((p) => ({
        size: p.size,
        dimensions: p.dimensions,
        labelAttached: p.labelAttached,
        carrier: p.carrier,
      })) || [],
    schedule: order.schedule
      ? {
          date: order.schedule.date,
          timeWindow: {
            start: order.schedule.timeWindow?.start,
            end: order.schedule.timeWindow?.end,
          },
        }
      : null,
    payment: {
      method: order.payment?.method,
      type: order.payment?.type,
      currency: order.payment?.currency,
      status: order.payment?.status,
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};


export const handleControllerError = (res, error) => {
  console.error("[Controller Error]", error);

  return res.status(400).json({
    success: false,
    message: error.message || "Something went wrong",
    error: error.errors || error.stack, 
  });
};
