import 'reflect-metadata';
import { ZenContainer } from '../../DI/zen-container';

export function ZenProvider() {
  return function (target: any) {
    ZenContainer.registerProvider(target);
  };
}
