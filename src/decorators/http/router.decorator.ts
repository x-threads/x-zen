import 'reflect-metadata';

export interface RouterOptions {
  method: 'get' | 'post' | 'put' | 'delete';
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

// rest methods
export const Get = (path: string) => Router({ method: 'get', path });
export const Post = (path: string) => Router({ method: 'post', path });
export const Put = (path: string) => Router({ method: 'put', path });
export const Delete = (path: string) => Router({ method: 'delete', path });
