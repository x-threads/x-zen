import { HttpError } from './httpError'

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
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const res = args.find((arg) => arg && typeof arg.status === "function" && typeof arg.json === "function");
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.catch((error: any) => handleError(res, error));
        }
        return result;
      } catch (error: any) {
        return handleError(res, error);
      }
    };
  };
}

function handleError(res: any, error: any) {
  if (res) {
    return error instanceof HttpError
      ? res.status(error.statusCode).json(error)
      : res.status(500).json({ message: "Internal Server Error", error: error.message });
  } else {
    throw error;
  }
}

