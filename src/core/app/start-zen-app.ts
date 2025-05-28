import "reflect-metadata";
import chalk from "chalk";
import { ZenContainer } from "../DI";
import { ZEN_MODULE_METADATA } from "../../constants";
import { RegisterControllers } from "../handlers/register-controller.handler";
import { ZenModuleOptions } from "../../shared/interfaces/zen-module.interface";

/**
 * Starts the Zen application by resolving all modules, providers, and controllers.
 * It initializes the ZenContainer and registers all controllers with the provided app instance.
 *
 * @param app - The application instance (e.g., an Express app) to register controllers on.
 * @param rootModule - The root module of the Zen application.
 */
export async function StartZenApplication(app: any, rootModule: any) {
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
    const moduleMetadata: ZenModuleOptions = Reflect.getMetadata(ZEN_MODULE_METADATA, module);

    if (!moduleMetadata) continue;

    if (moduleMetadata.imports) {
      moduleQueue.push(...moduleMetadata.imports);
    }

    if (moduleMetadata.providers) {
      allProviders.push(...moduleMetadata.providers);
    }

    if (moduleMetadata.controllers) {
      allControllers.push(...moduleMetadata.controllers);
    }

    ZenContainer.registerModuleProvider(module.name, moduleMetadata.providers)
  }

  for (const moduleName of allModules) {
    LogInstancer('ZenModule', moduleName)
  }

  for (const provider of allProviders) {
    LogInstancer('ZenProvider', provider);
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



export const LogInstancer = (context: string, module: any) => {
  const log = console.log;
  const timestamp = new Date().toLocaleString();
  log(chalk.blue(`${timestamp} -`),
    chalk.magenta(`[${context}] - ${module?.name || module}`));
}