import "reflect-metadata";
import { ZEN_PROVIDER_METADATA } from "../../constants";
import { InstanceLoaderException } from "../exceptions/instance-loader.exception";
import { LogInstancer } from "../../common/instancer-logger/instancer-logger";
import { RegisterControllers } from "../handlers";

type Constructor<T = any> = new (...args: any[]) => T;

export class ZenContainer {
  private static providers = new Map<Constructor, any>();
  private static controllers = new Map<Constructor, any>();
  private static moduleProviders = new Map<string, Set<Constructor>>();
  private static providerToModule = new Map<Constructor, string>();

  static registerProvider(provider: Constructor) {
    this.providers.set(provider, null);
  }

  static registerController(controller: Constructor) {
    this.controllers.set(controller, null);
  }

  static registerModuleProvider(moduleName: string, providers: Constructor[] = []) {
    const existing = this.moduleProviders.get(moduleName) || new Set();
    providers.forEach(p => existing.add(p));
    this.moduleProviders.set(moduleName, existing);
  }

  static setProviderModule(provider: Constructor, moduleName: string) {
    this.providerToModule.set(provider, moduleName);
  }

  static getProviderModule(provider: Constructor): string | undefined {
    return this.providerToModule.get(provider);
  }

  static canInject(dep: Constructor, targetModule: string): boolean {
    const declaredModule = this.providerToModule.get(dep);
    if (!declaredModule) return false;
    if (declaredModule === targetModule) return true;

    const importedProviders = this.moduleProviders.get(targetModule);
    return importedProviders?.has(dep) ?? false;
  }

  static initialize(app: any) {
    for (const [Provider] of this.providers) {
      if (!this.providers.get(Provider)) {

        const isZenProvider: boolean = Reflect.getMetadata(ZEN_PROVIDER_METADATA, Provider);

        if (!isZenProvider) {
          throw new InstanceLoaderException(
            `Error when instantiating provider ${Provider.name}. Make sure it is decorated with @ZenProvider() decorator`
          );
        }

        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Provider) || [];
        const providerModule = this.providerToModule.get(Provider);

        const dependencies = paramTypes.map((dep) => {
          if (!this.canInject(dep, providerModule!)) {
            throw new InstanceLoaderException(
              `
                Dependence ${dep.name} cannot be injected into ${Provider.name}. 
                Make sure it is declared in the providers array of ${providerModule} module or in the providers array of imported module 
                Import in the ${providerModule} module the module where ${dep.name} is declared
                Make sure ${dep.name} is decorated with @ZenProvider() decorator`
            );
          }

          const instance = this.providers.get(dep);

          if (!instance) {
            throw new InstanceLoaderException(
              `
                Dependence ${dep.name} cannot be injected into ${Provider.name}. 
                Make sure it is declared in the providers array of ${providerModule} module or in the providers array of imported module 
                Import in the ${providerModule} module the module where ${dep.name} is declared
                Make sure ${dep.name} is decorated with @ZenProvider() decorator`
            );
          }

          return instance;
        });

        this.providers.set(Provider, new Provider(...dependencies));
        LogInstancer("ZenProvider", Provider);
      }
    }

    for (const [Controller] of this.controllers) {
      if (!this.controllers.get(Controller)) {
        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Controller) || [];
        const dependencies = paramTypes.map((dep) => this.providers.get(dep) || null);
        this.controllers.set(Controller, new Controller(...dependencies));
      }
    }

    RegisterControllers(app, Array.from(this.controllers.values()));
  }

}

