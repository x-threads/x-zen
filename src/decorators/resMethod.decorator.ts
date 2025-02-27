import { ResponseHandler } from "../handlers/response.handler";
import { ErrorHandler } from "../handlers/error.handler";

interface IResMethodOptions {
  statusCode?: 200 | 201;
  message?: string;
}

/**
 * A decorator function that wraps a method to handle responses and errors.
 * 
 * @param options - An object containing options for the response method.
 * @param options.statusCode - The status code to be sent in the response. Defaults to 200.
 * @param options.message - The message to be sent in the response. Defaults to "success".
 * 
 * 
 * @example
 * ```typescript
 * class MyController {
 *   @ResMethod({ statusCode: 201, message: "Created successfully" })
 *   async createResource(req: Request, res: Response) {
 *     // method implementation
 *   }
 * }
 * ```
 */
export function ResMethod(options: IResMethodOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const res: Response = args[1]; 
      try {
        const result = await originalMethod.apply(this, args);
        ResponseHandler(res, { statusCode: options.statusCode ?? 200, message: options.message ?? "success", data: result });
      } catch (error) {
        ErrorHandler(error, res);
      }
    };

    return descriptor;
  };
}
