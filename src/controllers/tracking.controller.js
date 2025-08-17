// controllers/tracking.controller.js
import {
  getOrderTracking,
  getUserTrackings,
  updateTrackingStatus,
} from "../services/tracking.service.js";
import { handleControllerError } from "../utils/controller.util.js";

export const trackOrder = async (req, res) => {
  try {
    const tracking = await getOrderTracking(
      req.user._id,
      req.params.orderNumber
    );
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getUserTracking = async (req, res) => {
  try {
    const trackings = await getUserTrackings(req.user._id);
    res.json({
      success: true,
      data: trackings,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const tracking = await updateTrackingStatus(req.params.orderNumber, {
      status: req.body.status,
      date: req.body.date,
      timeWindow: req.body.timeWindow,
      notes: req.body.notes,
    });
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
