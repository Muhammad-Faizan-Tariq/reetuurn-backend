export const formatTrackingResponse = (order) => {
  const statusHistory = {
    planned: order.statusHistory.find((s) => s.status === "planned" || s.status === "scheduled"),
    picked_up: order.statusHistory.find((s) => s.status === "picked_up"),
    returned: order.statusHistory.find((s) => s.status === "returned"),
    cancelled: order.statusHistory.find((s) => s.status === "cancelled"),
  };

  const currentStatus = getCurrentStatusDisplay(order.status);

  return {
    orderNumber: order.metadata.orderNumber,
    trackingNumber: order.metadata.trackingNumber,
    packages: order.packages.map((pkg) => ({
      size: pkg.size,
      carrier: pkg.carrier,
      price: pkg.price,
      labelAttached: pkg.labelAttached,
    })),
    status: {
      current: currentStatus,
      planned: statusHistory.planned
        ? {
            date: formatDisplayDate(order.schedule.date),
            timeWindow: order.schedule.timeWindow,
          }
        : null,
      pickedUp: statusHistory.picked_up
        ? { date: formatDisplayDate(statusHistory.picked_up.changedAt) }
        : null,
      returned: statusHistory.returned
        ? { date: formatDisplayDate(statusHistory.returned.changedAt) }
        : null,
      cancelled: statusHistory.cancelled
        ? {
            date: formatDisplayDate(statusHistory.cancelled.changedAt),
            reason: statusHistory.cancelled.notes,
          }
        : null,
    },
    pickupAddress: order.formattedAddress,
    createdAt: formatDisplayDate(order.createdAt),
    updatedAt: formatDisplayDate(order.updatedAt),
  };
};


const getCurrentStatusDisplay = (status) => {
  const statusMap = {
    draft: "Draft",
    pending: "Pending Approval",
    scheduled: "Planned Pickup",
    picked_up: "Picked Up",
    returned: "Return Completed",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};
