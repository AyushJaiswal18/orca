const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    let statusCode = 500;
    let message = error.message || "Internal Server Error";

    // Handle specific errors
    if (error.code === 11000) {
      // MongoDB duplicate key error
      statusCode = 409;
      message = "MongoDB Duplicate Key Error";
    } else if (error.code >= 100 && error.code <= 599) {
      statusCode = error.code;
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export default asyncHandler;
