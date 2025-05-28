import 'reflect-metadata';
import { ZEN_MIDDLEWARE_METADATA } from '../../../constants';

/**
 * Decorator to attach middleware functions to a class or method.
 *
 * @param middlewares - One or more middleware functions to be applied.
 * @returns A decorator function that assigns the provided middlewares as metadata
 *          to the target class or method using Reflect metadata.
 *
 * @example
 * @UseMiddleware(authMiddleware, loggingMiddleware)
 * class MyController { ... }
 *
 * @UseMiddleware(validationMiddleware)
 * myMethod() { ... }
 */
export function UseMiddleware(...middlewares: Function[]) {
  return function (target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
      Reflect.defineMetadata(ZEN_MIDDLEWARE_METADATA, middlewares, target, propertyKey);
    } else {
      Reflect.defineMetadata(ZEN_MIDDLEWARE_METADATA, middlewares, target);
    }
  };
}
