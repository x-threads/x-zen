
interface ResponseData {
  statusCode: number;
  message?: string;
  data?: any;
}

export function ResponseHandler(res: any,{ statusCode, message = "", data = null }: ResponseData) {
  return res.status(statusCode).json({ statusCode, message, data });
}