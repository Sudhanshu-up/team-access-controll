import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors = [];

  
  // 1. Our custom ApiError
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }


  // 2. Mongoose invalid ObjectId
  
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // 3. Mongoose schema validation error
  
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  
  // 4. MongoDB duplicate key
  
  else if (err.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(err.keyValue || {});

    message = fields.length
      ? `${fields.join(", ")} already exists`
      : "Duplicate value already exists";
  }

  
  // 5. Unknown error
  
  else {
    // Log the real error on the server
    console.error("UNHANDLED ERROR:", err);

    statusCode = 500;
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
  });
};

export default errorHandler;

