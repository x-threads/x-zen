import "reflect-metadata";

type Constructor<T = any> = new (...args: any[]) => T;

interface ProviderMap {
  [key: string]: any;
}

export class ZenContainer {
  private static providers = new Map<Constructor, any>();
  private static controllers = new Map<Constructor, any>();

  static registerProvider(provider: Constructor) {
    this.providers.set(provider, null);
  }

  static registerController(controller: Constructor) {
    this.controllers.set(controller, null);
  }

  static initialize() {
    for (const [Provider] of this.providers) {
      if (!this.providers.get(Provider)) {
        this.providers.set(Provider, new Provider());
      }
    }

    for (const [Controller] of this.controllers) {
      if (!this.controllers.get(Controller)) {
        const paramTypes: Constructor[] =
          Reflect.getMetadata("design:paramtypes", Controller) || [];
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
