import "reflect-metadata";
import { ZenContainer } from "../DI/zen-container";
import { RegisterControllers } from "../handlers/register-controller.handler";
import { ZEN_MODULE_METADATA } from "../../constants/decorators.contants";

export async function StartZenApplication(app: any, rootModule: any) {
  const moduleQueue = [rootModule];
  const visitedModules = new Set();

  const allControllers: any[] = [];
  const allProviders: any[] = [];

  while (moduleQueue.length) {
    const module = moduleQueue.shift();
    if (visitedModules.has(module)) continue;

    visitedModules.add(module);
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

  for (const provider of allProviders) {
    console.log(`Registering provider: ${provider.name}`);
    ZenContainer.registerProvider(provider);
  }

  for (const controller of allControllers) {
    console.log(`Registering controller: ${controller.name}`);
    ZenContainer.registerController(controller);
  }

  ZenContainer.initialize();

  const resolvedControllers = allControllers.map((controller) =>
    ZenContainer.getController(controller)
  );

  RegisterControllers(app, resolvedControllers);
}
