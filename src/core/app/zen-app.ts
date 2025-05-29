import { printDependencyGraph } from "../../common/graph-printer/grahp-printer";
import { IZenApp } from "../../shared/interfaces/zen-app.interface";
import { ZenContainer } from "../DI";


/**
 * Represents the main application class for the Zen framework.
 * 
 * `ZenApplication` is responsible for managing the core lifecycle of the application,
 * including initialization, dependency injection, and displaying the dependency graph.
 * 
 * @implements {IZenApp}
 * 
 * @example
 * app.showDependencyGraph();
 */
export class ZenApplication implements IZenApp {
    private app: any;
    private modules: string[] = [];
    private providers: any[] = [];
    private controllers: any[] = [];

    constructor(app: any) {
        this.app = app;
     }

    async start(): Promise<void> {
        ZenContainer.initialize(this.app);
    }

    setInstancers(modules: string[], providers: any[], controllers: any[]): void {
        this.modules = modules;
        this.providers = providers;
        this.controllers = controllers;
    }

    /**
     * Displays the dependency graph of the application, showing modules, providers, and controllers.
     * This method uses the `printDependencyGraph` function to visualize the relationships.
     */
    showDependencyGraph(): void {
        printDependencyGraph(this.modules, this.providers, this.controllers);
    }
}