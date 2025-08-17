export const formatTrackingResponse = (order) => {

  const statusHistory = {
    planned: order.statusHistory.find((s) => s.status === "scheduled"),
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
            date: order.schedule.date,
            timeWindow: order.schedule.timeWindow,
          }
        : null,
      pickedUp: statusHistory.picked_up
        ? {
            date: statusHistory.picked_up.changedAt,
          }
        : null,
      returned: statusHistory.returned
        ? {
            date: statusHistory.returned.changedAt,
          }
        : null,
      cancelled: statusHistory.cancelled
        ? {
            date: statusHistory.cancelled.changedAt,
            reason: statusHistory.cancelled.notes,
          }
        : null,
    },
    pickupAddress: order.formattedAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};


export const generateTrackingNumber = () => {
  const prefix = "TRK";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
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


export const calculateTotalPrice = (packages) => {
  return packages.reduce((total, pkg) => total + (pkg.price || 0), 0);
};


export const formatDisplayDate = (date) => {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
