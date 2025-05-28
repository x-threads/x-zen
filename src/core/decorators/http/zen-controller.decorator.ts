import 'reflect-metadata';
import { ZEN_CONTROLLER_BASE_PATH_METADATA } from '../../../constants';

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
export function ZenController(basePath: string = '') {
  return function (target: any) {
    Reflect.defineMetadata(ZEN_CONTROLLER_BASE_PATH_METADATA, basePath, target);
  };
}
