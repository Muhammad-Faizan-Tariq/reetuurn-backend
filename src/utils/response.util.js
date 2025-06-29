export const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.toString() : undefined
  });
};
