import chalk from 'chalk'

/**
 * Registers controller routes with the provided application instance.
 *
 * Iterates over an array of controller instances, retrieves their metadata for base paths and routes,
 * and binds each route handler to the application using the specified HTTP method and path.
 * Logs registration details for each controller and route.
 *
 * @param app - The application instance (e.g., an Express app) to register routes on.
 * @param controllers - An array of controller instances containing route metadata by RestController decorator.
 */
export function registerControllers(app: any, controllers: any[]) {
  const log = console.log;
  const timestamp = new Date().toLocaleString();
  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    let basePath: string = Reflect.getMetadata('basePath', controllerClass) || '';
    const routes = Reflect.getMetadata('routes', controllerClass) || [];

    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    log(chalk.blue(`(RegisterControllers) - ${timestamp} - `), chalk.white(`[${controllerClass.name}] - {${basePath}}`));

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
      log(chalk.blue(`(Route) ${timestamp} - `), chalk.white(`[${route.method.toUpperCase()}] - {${fullPath}}`));
    }
  }
}
