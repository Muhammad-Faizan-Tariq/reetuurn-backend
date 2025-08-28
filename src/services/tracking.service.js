import ReturnOrder from "../models/return-order.model.js";
import { formatTrackingResponse } from "../utils/tracking.util.js";
import mongoose from "mongoose";


export const getOrderTracking = async (user, orderIdentifier) => {
  try {
    const order = await ReturnOrder.findOne({
      user: user,
      $or: [
        { "metadata.orderNumber": orderIdentifier },
        { _id: orderIdentifier },
      ],
    }).populate("user", "name email");

    if (!order) {
      throw new Error("Return order not found");
    }

    return formatTrackingResponse(order);
  } catch (error) {
    throw error;
  }
};

export const getUserTrackings = async (user) => {
  try {
    const orders = await ReturnOrder.find({ user: user })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    return orders.map((order) => formatTrackingResponse(order));
  } catch (error) {
    throw error;
  }
};

export const updateTrackingStatus = async (orderIdentifier, statusData) => {
  try {
    const update = buildStatusUpdate(statusData);

    const order = await ReturnOrder.findOneAndUpdate(
      {
        $or: [
          { "metadata.orderNumber": orderIdentifier },
          { _id: orderIdentifier },
        ],
      },
      update,
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      throw new Error("Order not found");
    }

    return formatTrackingResponse(order);
  } catch (error) {
    throw error;
  }
};

const buildStatusUpdate = (statusData) => {
  const { status, date, timeWindow, notes } = statusData;

  const statusUpdate = {
    status,
    $push: {
      statusHistory: {
        status,
        changedAt: date,
        ...(notes && { notes }),
      },
    },
    updatedAt: new Date(),
  };

  switch (status) {
    case "planned":
      statusUpdate.schedule = {
        date,
        timeWindow,
      };
      break;
    case "picked_up":
      statusUpdate.pickedUpAt = date;
      break;
    case "returned":
      statusUpdate.returnedAt = date;
      break;
    case "cancelled":
      statusUpdate.cancelledAt = date;
      statusUpdate.cancelReason = notes;
      break;
  }

  return { $set: statusUpdate };
};


const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const buildIdentifierFilter = (identifier, userId) => {
  const or = [
    { "metadata.orderNumber": identifier },
    { "metadata.trackingNumber": identifier },
  ];
  if (isObjectId(identifier)) or.push({ _id: identifier });
  const filter = { $or: or };
  if (userId) filter.user = userId;
  return filter;
};

export const cancelTracking = async (userId, orderIdentifier, cancelData = {}) => {
  const filter = buildIdentifierFilter(orderIdentifier, userId);

  const order = await ReturnOrder.findOne(filter).populate("user", "name email");
  if (!order) throw new Error("Order not found");

  if (userId && order.user && order.user._id.toString() !== userId.toString()) {
    throw new Error("Not authorized to cancel this order");
  }

  if (order.status === "cancelled") {
    return {
      success: true,
      message: "Pickup already cancelled",
      data: formatTrackingResponse(order),
    };
  }

  const allowedToCancel = ["planned", "scheduled"];
if (!allowedToCancel.includes(order.status)) {
  if (order.status === "cancelled") {
    throw new Error("Order is already cancelled");
  }
  throw new Error("Only planned pickups can be cancelled");
}

order.status = "cancelled";
order.cancelledAt = cancelData.date || new Date();
order.cancelReason = cancelData.notes || cancelData.reason || "No reason provided";
order.updatedAt = new Date();

order.statusHistory = order.statusHistory || [];
order.statusHistory.push({
  status: "cancelled",
  changedAt: cancelData.date || new Date(),
  notes: cancelData.notes || cancelData.reason || undefined,
});

await order.save();
// return formatTrackingResponse(order);

  return {
    success: true,
    message: "Pickup cancelled successfully",
    data: formatTrackingResponse(order),
  };
};

