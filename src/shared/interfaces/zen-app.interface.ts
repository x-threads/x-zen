export interface IZenApp {
    start(): Promise<void>;
    showAppGraph(): void;
}