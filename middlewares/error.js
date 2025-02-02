class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddlewares = (err, req, res, next) => {
    err.message = err.message || "Internal Server error";
    err.statusCode = err.statusCode || 500;

    //Handle specific errors

    if (err.name === "jsonWebTokenError") {
        const message = "Json web token is invalid";
        err = new ErrorHandler(message, 400);
    }

    if (err.name === "TokenExpiredError") {
        const message = "Json web token is expired,Try Again";
        err = new ErrorHandler(message, 400);
    }

    if (err.name === "Cast Error") {
        const message = `Invalid ${err.path}`;  //if you give different data as assigned in modal
        err = new ErrorHandler(message, 400);
    }
    //Handle Validation Errors

    const errorMessage = err.errors
        ? Object.values(err.errors)
            .map((error) => error.message)
            .join(" ")
        : err.message;

    // Send response
    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

export default ErrorHandler;
