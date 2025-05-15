
export function registerControllers(app: any, controllers: any[]) {
  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    const basePath: string = Reflect.getMetadata('basePath', controllerClass) || '';
    const routes = Reflect.getMetadata('routes', controllerClass) || [];

    console.log(`Registering controller: ${controllerClass.name} at base path: ${basePath}`);

    if (!basePath) {
      console.warn(`Controller ${controllerClass.name} does not have a base path. Skipping.`);
      continue;
    }

    for (const route of routes) {
      const fullPath = basePath + route.path;
      app[route.method](fullPath, controllerInstance[route.methodName].bind(controllerInstance));
      console.log(`Registered route: ${route.method.toUpperCase()} ${fullPath}`);
    }
  }
}
