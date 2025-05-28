import "reflect-metadata";
import { ZEN_MODULE_METADATA } from "../../../constants";
import { ZenModuleOptions } from "../../../shared/interfaces/zen-module.interface";


export function ZenModule(options: ZenModuleOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(ZEN_MODULE_METADATA, options, target);
  };
}
