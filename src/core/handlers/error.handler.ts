import { HttpErrors } from "../http-exceptions";

/**
 * Handles errors and sends an appropriate HTTP response.
 *
 * If the error is an instance of `HttpErrors`, it responds with the error's status code,
 * message, and additional error details. Otherwise, it sends a generic 500 Internal Server Error
 * response with the error message if available.
 *
 * @param error - The error object to handle. Can be any type, but typically an Error or HttpErrors instance.
 * @param res - The Express response object used to send the HTTP response.
 */
export function ErrorHandler(error: any, res: any) {
  if (error instanceof HttpErrors)
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      errorMessage: error.errorMessage || "Error Message Not Provided",
      error: error.error,
    });

  return res.status(500).json({
    statusCode: 500,
    errorMessage: error.message || "Error Message Not Provided",
    error: "Internal Server Error",
  });
}
