module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    console.log("Error caught:", err);
  
    if (process.env.NODE_ENV === "DEVELOPMENT") {
      res.status(err.statusCode).json({
        status: false,
        error: err,
        errorMessage: err.message,
        stackTrace: err.stack,
      });
    } else if (process.env.NODE_ENV === "PRODUCTION") {
      // Clone the error
      let errorToSend = { ...err };
      errorToSend.message = err.message;
  
      // Handle specific errors
      if (err.name === "CastError") {
        errorToSend.message = `Resource not found: Invalid ${err.path}`;
        errorToSend.statusCode = 400;
      } else if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((value) => value.message);
        errorToSend.message = messages.join(", ");
        errorToSend.statusCode = 400;
      } else if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        errorToSend.message = `Duplicate field value: ${value}. Please use another value.`;
        errorToSend.statusCode = 400;
      } else if (err.name === "JsonWebTokenError") {
        errorToSend.message =
          "Invalid JSON Web Token. Please provide a valid token.";
        errorToSend.statusCode = 400;
      } else if (err.name === "TokenExpiredError") {
        errorToSend.message = "JSON Web Token has expired. Please log in again.";
        errorToSend.statusCode = 400;
      }
  
      // Send the error response
      res.status(errorToSend.statusCode || 500).json({
        status: false,
        message: errorToSend.message || "Internal Server Error",
      });
    }
  };
  