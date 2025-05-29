import chalk from "chalk";
import { ZenContainer } from "../../core/DI";

/**
 * Prints a dependency graph for providers and controllers in each module.
 */
export function printDependencyGraph(modules: string[], providers: any[], controllers: any[]) {
  console.log(chalk.bold.green("\n[Application Graph]"));

  for (const module of modules) {
    console.log(chalk.cyan(`Module: ${module}`));

    const moduleProviders = providers.filter(p => ZenContainer.getProviderModule(p) === module);
    const moduleControllers = controllers.filter(c => ZenContainer.getProviderModule(c) === module);

    for (const provider of moduleProviders) {
      console.log(`  ├─ ${chalk.yellow("Provider")}: ${provider.name}`);
      const deps = Reflect.getMetadata("design:paramtypes", provider) || [];
      if (deps.length > 0) {
        console.log(`  │    └─ Depends on: ${deps.map((d: any) => d.name).join(", ")}`);
      }
    }

    for (const controller of moduleControllers) {
      console.log(`  └─ ${chalk.magenta("Controller")}: ${controller.name}`);
      const deps = Reflect.getMetadata("design:paramtypes", controller) || [];
      if (deps.length > 0) {
        console.log(`       └─ Depends on: ${deps.map((d: any) => d.name).join(", ")}`);
      }
    }
  }
}