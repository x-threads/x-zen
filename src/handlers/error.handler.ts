import { HttpErrors } from "../httpErrors";

export function ErrorHandler(error: any, res: any) {
  if (error instanceof HttpErrors) return res.status(error.status).json(error);

  return res.status(500).json({status: 500, error: true, message: error.message || "Internal Server Error"});
}