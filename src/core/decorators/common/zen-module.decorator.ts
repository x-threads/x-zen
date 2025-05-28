import "reflect-metadata";
import { ZEN_MODULE_METADATA } from "../../../constants";

interface ZenModuleOptions {
  controllers?: any[];
  providers?: any[];
  imports?: any[];
}

export function ZenModule(options: ZenModuleOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(ZEN_MODULE_METADATA, options, target);
  };
}
