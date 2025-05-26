import 'reflect-metadata';

/**
 * Class decorator that marks a class as a REST controller and assigns a base path for its routes.
 *
 * @param basePath - The base URL path for all routes defined in the controller. Defaults to an empty string.
 * @returns A class decorator function that sets the 'basePath' metadata on the target class.
 *
 * @example
 * @RestController('/api/users')
 * class UserController { ... }
 */
export function RestController(basePath: string = '') {
  return function (target: any) {
    Reflect.defineMetadata('basePath', basePath, target);
  };
}
