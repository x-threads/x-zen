import { ResponseHandler } from "../handlers/response.handler";
import { ErrorHandler } from "../handlers/error.handler";

/**
 * This decorator is designed to be used on controller methods to automatically handle and validate thrown exceptions.
 * **Note:** There is no need to use `try-catch` blocks within the method itself when using this decorator, as it already handles exceptions.
 * It captures errors that occur within the method, and if the error is an instance of `HttpError` (from the package),
 * it sends an appropriate HTTP response with the correct status code and error details.
 * 
 * For any other uncaught exceptions, it responds with a 500 Internal Server Error, ensuring consistent error handling.
 * 
 * @example
 * 
 * @ResMethod()
 * async someControllerMethod(req: Request, res: Response) {
 *   // controller logic
 * }
 * 
 * The decorator ensures that exceptions from the method are caught and handled properly.
 */
export function ResMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const res: Response = args[1]; 
      try {
        const result = await originalMethod.apply(this, args);
        ResponseHandler(res, { status: 200, message: "success", data: result });
      } catch (error) {
        ErrorHandler(error, res);
      }
    };

    return descriptor;
  };
}
