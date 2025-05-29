export interface IZenApp {
    start(): Promise<void>;
    setInstancers(modules: string[], providers: any[], controllers: any[]): void;
    showDependencyGraph(): void;
}