import { HttpErrors } from "../errors/http-errors";

export function ErrorHandler(error: any, res: any) {
  if (error instanceof HttpErrors) return res.status(error.statusCode).json({
    statusCode: error.statusCode,
    errorMessage: error.errorMessage || "Error Message Not Provided",
    error: error.error
  });

  return res.status(500).json({
    statusCode: 500,
    errorMessage: error.message || "Error Message Not Provided",
    error: 'Internal Server Error'
  });
}