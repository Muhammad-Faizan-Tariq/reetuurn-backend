import ReturnOrder from "../models/return-order.model.js";
import { formatTrackingResponse } from "../utils/tracking.util.js";

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

export const cancelTracking = async (orderIdentifier, cancelData) => {
  try {
    const update = {
      $set: {
        status: "cancelled",
        cancelledAt: cancelData.date || new Date(),
        cancelReason: cancelData.notes || "No reason provided",
        updatedAt: new Date(),
      },
      $push: {
        statusHistory: {
          status: "cancelled",
          changedAt: cancelData.date || new Date(),
          ...(cancelData.notes && { notes: cancelData.notes }),
        },
      },
    };

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
