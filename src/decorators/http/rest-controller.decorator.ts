import 'reflect-metadata';

export function RestController(basePath: string = '') {
  return function (target: any) {
    Reflect.defineMetadata('basePath', basePath, target);
  };
}
