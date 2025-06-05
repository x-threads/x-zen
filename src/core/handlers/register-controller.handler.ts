import chalk from "chalk";
import { ZEN_CONTROLLER_BASE_PATH_METADATA, ZEN_CONTROLLER_ROUTES_METADATA, ZEN_MIDDLEWARE_METADATA } from '../../constants'
import { ResponseHandler } from "./response.handler";
import { ErrorHandler } from "./error.handler";

/**
 * Registers controllers with their routes and middlewares to the provided application instance.
 * 
 * @param {any} app - The application instance (e.g., Express app).
 * @param {any[]} controllers - An array of controller instances to register.
 */
export function RegisterControllers(app: any, controllers: any[]) {
  const log = console.log;
  const timestamp = new Date().toLocaleString();

  for (const controllerInstance of controllers) {
    const controllerClass = controllerInstance.constructor;
    let basePath: string = Reflect.getMetadata(ZEN_CONTROLLER_BASE_PATH_METADATA, controllerClass) || "";
    const routes = Reflect.getMetadata(ZEN_CONTROLLER_ROUTES_METADATA, controllerClass) || [];
    const classMiddlewares = Reflect.getMetadata(ZEN_MIDDLEWARE_METADATA, controllerClass) || [];

    if (!basePath.startsWith("/")) {
      basePath = "/" + basePath;
    }

    log(
      chalk.blue(`${timestamp} -`),
      chalk.magenta(`[ZenController] - ${controllerClass.name} - {${basePath}}`),
      classMiddlewares.length > 0
        ? chalk.white(
          ` - (+${classMiddlewares.length} middleware${classMiddlewares.length > 1 ? "s" : ""
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

      const methodMiddlewares: any[] = Reflect.getMetadata(ZEN_MIDDLEWARE_METADATA, controllerClass.prototype, route.methodName) || [];

      const combinedMiddlewares = [...classMiddlewares, ...methodMiddlewares];

      const handler = async (req: any, res: any)=>{
        try{
          const result = await controllerInstance[route.methodName].apply(controllerInstance, [req, res]);
          ResponseHandler(res, { statusCode: 200, message: "success", data: result });
        }catch(error){
          ErrorHandler(error, res);
        }
      }

      app[route.method](
        fullPath,
        ...combinedMiddlewares,
        handler
      );

      log(
        chalk.blue(`${timestamp} -`),
        chalk.magenta(`[Route] - ${route.method.toUpperCase()} - {${fullPath}}`),
        methodMiddlewares.length > 0
          ? chalk.white(
            ` - (+${methodMiddlewares.length} middleware${methodMiddlewares.length > 1 ? "s" : ""
            })`
          )
          : chalk.white(` - (no middleware)`)
      );
    }
  }
}
