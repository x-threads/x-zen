import 'reflect-metadata';
import { ZEN_CONTROLLER_ROUTES_METADATA } from '../../../constants';

interface RouterOptions extends RouteOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
}

interface RouteOptions {
  path: string;
  statusCode?: number | string;
  message?: string;
}

export function Router(options: RouterOptions) {
  return function (target: any, propertyKey: string) {
    const existingRoutes = Reflect.getMetadata(ZEN_CONTROLLER_ROUTES_METADATA, target.constructor) || [];
    existingRoutes.push({
      methodName: propertyKey,
      ...options,
    });
    Reflect.defineMetadata(ZEN_CONTROLLER_ROUTES_METADATA, existingRoutes, target.constructor);
  };
}


/**
 * Decorator for defining an HTTP GET route handler.
 * @param path - The route path to handle GET requests for.
 */
export const Get = (options: RouteOptions) => Router({ method: 'get', ...options });


/**
 * Decorator for defining an HTTP POST route on a controller method.
 * @param path - The route path for the POST request.
 */
export const Post = (options: RouteOptions) => Router({ method: 'post', ...options });

/**
 * Decorator for defining an HTTP PUT route handler.
 * @param path - The route path for which this handler should be registered.
 */
export const Put = (options: RouteOptions) => Router({ method: 'put', ...options });

/**
 * Decorator to define a route handler for HTTP DELETE requests.
 * @param path - The route path to associate with the DELETE handler.
 */
export const Delete = (options: RouteOptions) => Router({ method: 'delete', ...options });

/**
 * Decorator that marks a method as an HTTP PATCH route handler for the specified path.
 * @param path - The route path to associate with this PATCH handler.
 */
export const Patch = (options: RouteOptions) => Router({ method: 'patch', ...options });
