import 'reflect-metadata';
import { ZEN_CONTROLLER_ROUTES_METADATA } from '../../../constants';

interface RouterOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
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
export const Get = (path: string) => Router({ method: 'get', path });


/**
 * Decorator for defining an HTTP POST route on a controller method.
 * @param path - The route path for the POST request.
 */
export const Post = (path: string) => Router({ method: 'post', path });

/**
 * Decorator for defining an HTTP PUT route handler.
 * @param path - The route path for which this handler should be registered.
 */
export const Put = (path: string) => Router({ method: 'put', path });

/**
 * Decorator to define a route handler for HTTP DELETE requests.
 * @param path - The route path to associate with the DELETE handler.
 */
export const Delete = (path: string) => Router({ method: 'delete', path });

/**
 * Decorator that marks a method as an HTTP PATCH route handler for the specified path.
 * @param path - The route path to associate with this PATCH handler.
 */
export const Patch = (path: string) => Router({ method: 'patch', path });
