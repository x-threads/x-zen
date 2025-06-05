import "reflect-metadata";
import { ZEN_PROVIDER_METADATA } from "../../constants";
import { InstanceLoaderException } from "../exceptions/instance-loader.exception";
import { LogInstancer } from "../../common/instancer-logger/instancer-logger";
import { RegisterControllers } from "../handlers/register-controller.handler";

type Constructor<T = any> = new (...args: any[]) => T;

export class ZenContainer {
  private static providers = new Map<Constructor, any>();
  private static controllers = new Map<Constructor, any>();
  private static moduleProviders = new Map<string, Set<Constructor>>();
  private static providerToModule = new Map<Constructor, string>();

  static registerProvider(provider: Constructor) {
    this.providers.set(provider, undefined);
  }

  static registerController(controller: Constructor) {
    this.controllers.set(controller, undefined);
  }

  static registerModuleProvider(
    moduleName: string,
    providers: Constructor[] = []
  ) {
    const existing = this.moduleProviders.get(moduleName) || new Set();
    providers.forEach((p) => existing.add(p));
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

  private static instantiateDependency(dep: Constructor, targetModule: string) {
    if (!this.canInject(dep, targetModule)) {
      throw new InstanceLoaderException(
        `
        Dependence ${dep.name} cannot be injected into ${targetModule}. 
        Make sure it is declared in the providers array of ${targetModule} module or in an imported module.
        Ensure it is decorated with @ZenProvider().`
      );
    }

    let instance = this.providers.get(dep);

    if (instance === undefined) {
      const isZenProvider = Reflect.getMetadata(ZEN_PROVIDER_METADATA, dep);
      if (!isZenProvider) {
        throw new InstanceLoaderException(
          `
          Dependence ${dep.name} is not decorated with @ZenProvider(). 
          Please add @ZenProvider() to ${dep.name} to use it as a dependency.`
        );
      }

      const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", dep) || [];
      const deps = paramTypes.map((d) => this.instantiateDependency(d, targetModule));

      instance = new dep(...deps);
      this.providers.set(dep, instance);
      LogInstancer("ZenProvider", dep);
    }

    return instance;
  }

  static initialize(app: any) {
    for (const [Provider] of this.providers) {
      if (this.providers.get(Provider) === undefined) {
        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Provider) || [];
        const providerModule = this.providerToModule.get(Provider)!;

        const dependencies = paramTypes.map(dep =>
          this.instantiateDependency(dep, providerModule)
        );

        const instance = new Provider(...dependencies);
        this.providers.set(Provider, instance);
        LogInstancer("ZenProvider", Provider);
      }
    }

    for (const [Controller] of this.controllers) {
      if (this.controllers.get(Controller) === undefined) {
        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Controller) || [];
        const dependencies = paramTypes.map((dep) => this.providers.get(dep));
        const instance = new Controller(...dependencies);
        this.controllers.set(Controller, instance);
      }
    }

    RegisterControllers(app, Array.from(this.controllers.values()));
  }
}
