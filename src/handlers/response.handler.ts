interface ResponseData {
  statusCode: number;
  message?: string;
  data?: any;
}


/**
 * Handles sending a standardized JSON response.
 *
 * @param res - The response object, typically from an Express handler.
 * @param param1 - An object containing response details.
 * @param param1.statusCode - The HTTP status code to send.
 * @param param1.message - An optional message to include in the response body.
 * @param param1.data - Optional data to include in the response body.
 * @returns The response object with the specified status and JSON body.
 */
export function ResponseHandler(res: any,{ statusCode, message = "", data = null }: ResponseData) {
  return res.status(statusCode).json({ statusCode, message, data });
}