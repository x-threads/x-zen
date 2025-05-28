import "reflect-metadata";
import chalk from "chalk";
import { ZenContainer } from "../DI";
import { ZEN_MODULE_METADATA } from "../../constants";
import { RegisterControllers } from "../handlers/register-controller.handler";

/**
 * Starts the Zen application by resolving all modules, providers, and controllers.
 * It initializes the ZenContainer and registers all controllers with the provided app instance.
 *
 * @param app - The application instance (e.g., an Express app) to register controllers on.
 * @param rootModule - The root module of the Zen application.
 */
export async function StartZenApplication(app: any, rootModule: any) {
  const log = console.log;
  const timestamp = new Date().toLocaleString();
  const moduleQueue = [rootModule];
  const visitedModules = new Set();

  const allControllers: any[] = [];
  const allProviders: any[] = [];
  const allModules: any[] = [];

  while (moduleQueue.length) {
    const module = moduleQueue.shift();
    if (visitedModules.has(module)) continue;

    visitedModules.add(module);
    allModules.push(module.name);
    const metadata = Reflect.getMetadata(ZEN_MODULE_METADATA, module);

    if (!metadata) continue;

    if (metadata.imports) {
      moduleQueue.push(...metadata.imports);
    }

    if (metadata.providers) {
      allProviders.push(...metadata.providers);
    }

    if (metadata.controllers) {
      allControllers.push(...metadata.controllers);
    }
  }

  for (const moduleName of allModules) {
    log(chalk.blue(`${timestamp} -`),
      chalk.magenta(`[ZenModule] - ${moduleName}`));
  }

  for (const provider of allProviders) {
    log(chalk.blue(`${timestamp} -`),
      chalk.magenta(`[ZenProvider] - ${provider.name}`));
    ZenContainer.registerProvider(provider);
  }

  for (const controller of allControllers) {
    ZenContainer.registerController(controller);
  }

  ZenContainer.initialize();

  const resolvedControllers = allControllers.map((controller) =>
    ZenContainer.getController(controller)
  );

  RegisterControllers(app, resolvedControllers);
}
