import 'reflect-metadata';

export interface RouterOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
}

export function Router(options: RouterOptions) {
  return function (target: any, propertyKey: string) {
    const existingRoutes = Reflect.getMetadata('routes', target.constructor) || [];
    existingRoutes.push({
      methodName: propertyKey,
      ...options,
    });
    Reflect.defineMetadata('routes', existingRoutes, target.constructor);
  };
}


/**
 * Decorator for defining an HTTP GET route handler.
 *
 * @param path - The route path to handle GET requests for.
 * @returns A method decorator that registers the route with the specified path and HTTP GET method.
 *
 * @example
 * @Get('/users')
 * getUsers() {
 *   // handler logic
 * }
 */
export const Get = (path: string) => Router({ method: 'get', path });


/**
 * Decorator for defining an HTTP POST route on a controller method.
 *
 * @param path - The route path for the POST request.
 * @returns A method decorator that registers the route with the specified path and HTTP POST method.
 *
 * @example
 * @Post('/users')
 * createUser(req: Request, res: Response) {
 *   // handle POST /users
 * }
 */
export const Post = (path: string) => Router({ method: 'post', path });

/**
 * Decorator for defining an HTTP PUT route handler.
 *
 * @param path - The route path for which this handler should be registered.
 * @returns A method decorator that registers the method as a PUT endpoint at the specified path.
 *
 * @example
 * @Put('/users/:id')
 * updateUser(req, res) {
 *   // handle update logic
 * }
 */
export const Put = (path: string) => Router({ method: 'put', path });

/**
 * Decorator to define a route handler for HTTP DELETE requests.
 *
 * @param path - The route path to associate with the DELETE handler.
 * @returns A method decorator that registers the handler for the specified path and HTTP DELETE method.
 */
export const Delete = (path: string) => Router({ method: 'delete', path });

/**
 * Decorator that marks a method as an HTTP PATCH route handler for the specified path.
 *
 * @param path - The route path to associate with this PATCH handler.
 * @returns A method decorator that registers the handler for PATCH requests.
 *
 * @example
 * @Patch('/update')
 * updateResource() {
 *   // handle PATCH /update
 * }
 */
export const Patch = (path: string) => Router({ method: 'patch', path });
