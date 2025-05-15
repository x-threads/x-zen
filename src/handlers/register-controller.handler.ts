
export function registerControllers(app: any, controllers: any[]) {
  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    const basePath: string = Reflect.getMetadata('basePath', controllerClass) || '';
    const routes = Reflect.getMetadata('routes', controllerClass) || [];

    for (const route of routes) {
      const fullPath = basePath + route.path;
      app[route.method](fullPath, controllerInstance[route.methodName].bind(controllerInstance));
    }
  }
}
