import "reflect-metadata";
import { ZEN_PROVIDER_METADATA } from "../../constants";
import { InstanceLoaderException } from "../exceptions/instance-loader.exception";

type Constructor<T = any> = new (...args: any[]) => T;

interface ProviderMap {
  [key: string]: any;
}

export class ZenContainer {
  private static providers = new Map<Constructor, any>();
  private static controllers = new Map<Constructor, any>();
  private static moduleProviders = new Map<string, any>();

  static registerProvider(provider: Constructor) {
    this.providers.set(provider, null);
  }

  static registerController(controller: Constructor) {
    this.controllers.set(controller, null);
  }

  static registerModuleProvider(module: string, provider: any) {
    this.moduleProviders.set(module, provider);
  }

  static initialize() {

    for (const [Provider] of this.providers) {
      if (!this.providers.get(Provider)) {

        const isZenProvider: Boolean = Reflect.getMetadata(ZEN_PROVIDER_METADATA, Provider)

        if (!isZenProvider) {
          throw new InstanceLoaderException(`Error when instantiating provider ${Provider.name}, make sure it is decorated with @ZenProvider() decorator`);
        }

        this.providers.set(Provider, new Provider());
      }
    }

    for (const [Controller] of this.controllers) {
      if (!this.controllers.get(Controller)) {

        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Controller) || [];
        const dependencies = paramTypes.map(
          (dep) => this.providers.get(dep) || null
        );

        this.controllers.set(Controller, new Controller(...dependencies));
      }

    }

  }

  static getController<T>(Controller: Constructor<T>): T {
    return this.controllers.get(Controller);
  }
}
