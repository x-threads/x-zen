import { HttpErrors } from "../errors/http-errors";

export function ErrorHandler(error: any, res: any) {
  if (error instanceof HttpErrors) return res.status(error.statusCode).json(error);

  return res.status(500).json({statusCode: 500, error: true, message: error.message || "Internal Server Error"});
}