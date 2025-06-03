import 'reflect-metadata';
import { ZenContainer } from '../../DI/zen-container';
import { ZEN_PROVIDER_METADATA } from '../../../constants';

export function ZenProvider() {
  return function (target: any) {
    Reflect.defineMetadata(ZEN_PROVIDER_METADATA, true, target);
  };
}
