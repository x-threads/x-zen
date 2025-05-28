import chalk from "chalk";

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
export function RegisterControllers(app: any, controllers: any[]) {
  const log = console.log;
  const timestamp = new Date().toLocaleString();

  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    let basePath: string = Reflect.getMetadata("basePath", controllerClass) || "";
    const routes = Reflect.getMetadata("routes", controllerClass) || [];
    const classMiddlewares = Reflect.getMetadata("middlewares", controllerClass) || [];

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }

    log(
      chalk.blue(`${timestamp} -`),
      chalk.magenta(`[ZenController] - ${controllerClass.name} - {${basePath}}`),
      classMiddlewares.length > 0
        ? chalk.white(
            ` - (+${classMiddlewares.length} middleware${
              classMiddlewares.length > 1 ? "s" : ""
            } applied for every route)`
          )
        : ""
    );

    if (!basePath) {
      log(
        chalk.yellow(
          `ZenController ${controllerClass.name} does not have a base path. Skipping.`
        )
      );
      continue;
    }

    for (const route of routes) {

      if (!route.path.startsWith("/")) {
        route.path = "/" + route.path;
      }

      const fullPath = basePath + route.path;

      const methodMiddlewares: any[] = Reflect.getMetadata("middlewares",controllerClass.prototype,route.methodName) || [];
        
      const combinedMiddlewares = [...classMiddlewares, ...methodMiddlewares];

      app[route.method](
        fullPath,
        ...combinedMiddlewares,
        controllerInstance[route.methodName].bind(controllerInstance)
      );

      log(
        chalk.blue(`${timestamp} -`),
        chalk.magenta(`[Route] - ${route.method.toUpperCase()} - {${fullPath}}`),
        methodMiddlewares.length > 0
          ? chalk.white(
              ` - (+${methodMiddlewares.length} middleware${
                methodMiddlewares.length > 1 ? "s" : ""
              })`
            )
          : chalk.white(` - (no middleware)`)
      );
    }
  }
}
