import "reflect-metadata";
import { ZenContainer } from "../../src/core/DI/zen-container";
import { ZEN_PROVIDER_METADATA } from "../../src/constants";
import { InstanceLoaderException } from "../../src/core/exceptions/instance-loader.exception";
import { LogInstancer } from "../../src/common/instancer-logger/instancer-logger";
import { RegisterControllers } from "../../src/core/handlers/register-controller.handler";
import { ZenProvider } from "../../src/core/decorators/common/zen-provider.decorator";

// Mocks
jest.mock("../../src/common/instancer-logger/instancer-logger", () => ({
    LogInstancer: jest.fn(),
}));
jest.mock("../../src/core/handlers/register-controller.handler", () => ({
    RegisterControllers: jest.fn(),
}));


describe("ZenContainer", () => {
    beforeEach(() => {
        // Reset static maps
        (ZenContainer as any).providers = new Map();
        (ZenContainer as any).controllers = new Map();
        (ZenContainer as any).moduleProviders = new Map();
        (ZenContainer as any).providerToModule = new Map();
        jest.clearAllMocks();
    });

    class Dep { }
    class Provider {
        constructor(public dep: Dep) { }
    }
    class Controller {
        constructor(public provider: Provider) { }
    }

    it("registers providers and controllers", () => {
        ZenContainer.registerProvider(Provider);
        ZenContainer.registerController(Controller);

        expect((ZenContainer as any).providers.has(Provider)).toBe(true);
        expect((ZenContainer as any).controllers.has(Controller)).toBe(true);
    });

    it("registers module providers", () => {
        ZenContainer.registerModuleProvider("TestModule", [Provider]);
        expect((ZenContainer as any).moduleProviders.get("TestModule").has(Provider)).toBe(true);
    });

    it("sets and gets provider module", () => {
        ZenContainer.setProviderModule(Provider, "TestModule");
        expect(ZenContainer.getProviderModule(Provider)).toBe("TestModule");
    });

    describe("canInject", () => {
        it("returns false if provider not declared in any module", () => {
            expect(ZenContainer.canInject(Provider, "TestModule")).toBe(false);
        });

        it("returns true if provider declared in target module", () => {
            ZenContainer.setProviderModule(Provider, "TestModule");
            expect(ZenContainer.canInject(Provider, "TestModule")).toBe(true);
        });

        it("returns true if provider is imported in target module", () => {
            ZenContainer.setProviderModule(Provider, "OtherModule");
            ZenContainer.registerModuleProvider("TestModule", [Provider]);
            expect(ZenContainer.canInject(Provider, "TestModule")).toBe(true);
        });

        it("returns false if provider is not imported in target module", () => {
            ZenContainer.setProviderModule(Provider, "OtherModule");
            ZenContainer.registerModuleProvider("TestModule", []);
            expect(ZenContainer.canInject(Provider, "TestModule")).toBe(false);
        });
    });

    describe("decorating providers successfuly", () => {

        @ZenProvider()
        class provider { }

        it("return true if provider is decorated with @ZenProvider()", () => {
            const isZenProvider = Reflect.getMetadata(ZEN_PROVIDER_METADATA, provider); // Get metadata for ZenProvider
            expect(isZenProvider).toBe(true);
        })

    })

    describe("initialize", () => {
        beforeEach(() => {
            // Setup metadata for providers and controllers
            Reflect.defineMetadata(ZEN_PROVIDER_METADATA, true, Dep);
            Reflect.defineMetadata(ZEN_PROVIDER_METADATA, true, Provider);
            Reflect.defineMetadata("design:paramtypes", [], Dep);
            Reflect.defineMetadata("design:paramtypes", [Dep], Provider);
            Reflect.defineMetadata("design:paramtypes", [Provider], Controller);
        });

        it("throws if provider is not decorated with @ZenProvider", () => {
            ZenContainer.registerProvider(Dep);
            Reflect.defineMetadata(ZEN_PROVIDER_METADATA, undefined, Dep);
            ZenContainer.setProviderModule(Dep, "TestModule");
            expect(() => ZenContainer.initialize({})).toThrow(InstanceLoaderException);
        });

        it("throws if dependency cannot be injected", () => {
            ZenContainer.registerProvider(Provider);
            ZenContainer.setProviderModule(Provider, "TestModule");
            // Dep is not registered as provider
            expect(() => ZenContainer.initialize({})).toThrow(InstanceLoaderException);
        });

        it("throws if dependency instance is missing", () => {
            // ZenContainer.registerProvider(Dep);
            // ZenContainer.setProviderModule(Dep, "TestModule");
            ZenContainer.registerProvider(Provider);
            ZenContainer.setProviderModule(Provider, "TestModule");
            // Only Dep is registered, but not instantiated yet
            expect(() => ZenContainer.initialize({})).toThrow(InstanceLoaderException);
        });

        it("instantiates providers and controllers and calls RegisterControllers", () => {
            ZenContainer.registerProvider(Dep);
            ZenContainer.setProviderModule(Dep, "TestModule");
            ZenContainer.registerProvider(Provider);
            ZenContainer.setProviderModule(Provider, "TestModule");
            ZenContainer.registerController(Controller);

            // Pre-instantiate Dep to simulate dependency resolution
            (ZenContainer as any).providers.set(Dep, new Dep());

            const app = {};
            ZenContainer.initialize(app);

            // Provider should be instantiated with Dep
            const providerInstance = (ZenContainer as any).providers.get(Provider);
            expect(providerInstance).toBeInstanceOf(Provider);
            expect(providerInstance.dep).toBeInstanceOf(Dep);

            // Controller should be instantiated with Provider
            const controllerInstance = (ZenContainer as any).controllers.get(Controller);
            expect(controllerInstance).toBeInstanceOf(Controller);
            expect(controllerInstance.provider).toBe(providerInstance);

            // LogInstancer and RegisterControllers should be called
            expect(LogInstancer).toHaveBeenCalledWith("ZenProvider", Provider);
            expect(RegisterControllers).toHaveBeenCalledWith(app, [controllerInstance]);
        });
    });
});