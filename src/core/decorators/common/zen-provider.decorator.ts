import 'reflect-metadata';
import { ZEN_PROVIDER_METADATA } from '../../../constants';

export function ZenProvider() {
  return function (target: any) {
    Reflect.defineMetadata(ZEN_PROVIDER_METADATA, true, target);
  };
}
