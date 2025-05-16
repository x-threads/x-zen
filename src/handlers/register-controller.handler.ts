import chalk from 'chalk'

export function registerControllers(app: any, controllers: any[]) {
  const log = console.log;
  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    let basePath: string = Reflect.getMetadata('basePath', controllerClass) || '';
    const routes = Reflect.getMetadata('routes', controllerClass) || [];

    log(chalk.blue(`x-zen router - [${controllerClass.name}] - [${basePath}]`));

    if(!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    if (!basePath) {
      log(chalk.yellow(`Controller ${controllerClass.name} does not have a base path. Skipping.`));
      continue;
    }

    for (const route of routes) {
      if (!route.path.startsWith('/')) {
        route.path = '/' + route.path;
      }
      const fullPath = basePath + route.path;
      app[route.method](fullPath, controllerInstance[route.methodName].bind(controllerInstance));
      log(chalk.blue(`x-zen router - [${route.method.toUpperCase()}] ${fullPath}`));
    }
  }
}
