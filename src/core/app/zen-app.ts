import { printDependencyGraph } from "../../common/graph-printer/grahp-printer";
import { IZenApp } from "../../shared/interfaces/zen-app.interface";
import { StartZenApplication } from "./start-zen-app";


/**
 * Represents the main application class for the Zen framework.
 * 
 * `ZenApplication` is responsible for managing the core lifecycle of the application,
 * including initialization, dependency injection, etc.
 * 
 * @implements {IZenApp} interface
 */
export class ZenApplication implements IZenApp {
    private app: any;
    private rootModule: any;
    private modules: string[] = [];
    private providers: any[] = [];
    private controllers: any[] = [];

    constructor(app: any, rootModule: any) {
        this.app = app;
        this.rootModule = rootModule;
    }

    /**
     * Initializes and starts the Zen application using the provided app instance and root module.
     *
     * @returns {Promise<void>} A promise that resolves when the application has started.
     */
    async start(): Promise<void> {
        const { modules, providers, controllers } = await StartZenApplication(this.app, this.rootModule);
        this.modules = modules;
        this.providers = providers;
        this.controllers = controllers;
    }

    /**
     * Displays the dependency graph of the application, showing modules, providers, and controllers.
     * This method uses the `printDependencyGraph` function to visualize the relationships.
     */
    showAppGraph(): void {
        printDependencyGraph(this.modules, this.providers, this.controllers);
    }
}