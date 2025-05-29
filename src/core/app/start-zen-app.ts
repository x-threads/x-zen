import "reflect-metadata";
import chalk from "chalk";
import { ZenContainer } from "../DI";
import { ZEN_MODULE_METADATA } from "../../constants";
import { RegisterControllers } from "../handlers/register-controller.handler";
import { ZenModuleOptions } from "../../shared/interfaces/zen-module.interface";
import { LogInstancer } from "../../common/instancer-logger/instancer-logger";

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
      for (const provider of moduleMetadata.providers) {
        allProviders.push(provider);
        ZenContainer.setProviderModule(provider, module.name); 
      }
    }

    if (moduleMetadata.controllers) {
      for (const controller of moduleMetadata.controllers) {
        allControllers.push(controller);
        ZenContainer.setProviderModule(controller, module.name); // Asignar módulo a controlador
      }
    }

    ZenContainer.registerModuleProvider(module.name, moduleMetadata.providers || []);

    if (moduleMetadata.imports) {
      for (const imported of moduleMetadata.imports) {
        const importedMetadata: ZenModuleOptions = Reflect.getMetadata(ZEN_MODULE_METADATA, imported);
        if (importedMetadata?.providers) {
          ZenContainer.registerModuleProvider(module.name, importedMetadata.providers);
        }
      }
    }

  }

  for (const moduleName of allModules) {
    LogInstancer("ZenModule", moduleName);
  }

  for (const provider of allProviders) {
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

  printDependencyGraph(allModules, allProviders, allControllers);
}


/**
 * Prints a dependency graph for providers and controllers in each module.
 */
function printDependencyGraph(modules: string[], providers: any[], controllers: any[]) {
  console.log(chalk.bold.green("\n[DI Graph]"));

  for (const module of modules) {
    console.log(chalk.cyan(`Module: ${module}`));

    const moduleProviders = providers.filter(p => ZenContainer.getProviderModule(p) === module);
    const moduleControllers = controllers.filter(c => ZenContainer.getProviderModule(c) === module);

    for (const provider of moduleProviders) {
      console.log(`  ├─ ${chalk.yellow("Provider")}: ${provider.name}`);
      const deps = Reflect.getMetadata("design:paramtypes", provider) || [];
      if (deps.length > 0) {
        console.log(`  │    └─ Depends on: ${deps.map((d: any) => d.name).join(", ")}`);
      }
    }

    for (const controller of moduleControllers) {
      console.log(`  └─ ${chalk.magenta("Controller")}: ${controller.name}`);
      const deps = Reflect.getMetadata("design:paramtypes", controller) || [];
      if (deps.length > 0) {
        console.log(`       └─ Depends on: ${deps.map((d: any) => d.name).join(", ")}`);
      }
    }
  }
}
