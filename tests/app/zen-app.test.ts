import { ZenApplication } from '../../src/core/app/zen-app';
import { StartZenApplication }  from '../../src/core/app/start-zen-app';

jest.mock('../../src/core/app/start-zen-app', () => ({
    StartZenApplication: jest.fn(),
}));


describe('ZenApplication', () => {
    let appMock: any;
    let rootModuleMock: any;
    let zenApp: ZenApplication;

    beforeEach(() => {
        appMock = {};
        rootModuleMock = {};
        zenApp = new ZenApplication(appMock, rootModuleMock);
    });

    it('should call StartZenApplication with app and rootModule', async () => {
        (StartZenApplication as jest.Mock).mockResolvedValue({
            modules: ['ModuleA'],
            providers: ['ProviderA'],
            controllers: ['ControllerA'],
        });

        await zenApp.start();

        expect(StartZenApplication).toHaveBeenCalledWith(appMock, rootModuleMock);
    });

    it('should set modules, providers, and controllers after start', async () => {
        const mockModules = ['Module1', 'Module2'];
        const mockProviders = ['Provider1'];
        const mockControllers = ['Controller1', 'Controller2'];
        (StartZenApplication as jest.Mock).mockResolvedValue({
            modules: mockModules,
            providers: mockProviders,
            controllers: mockControllers,
        });

        await zenApp.start();

        // @ts-ignore: access private for test
        expect(zenApp['modules']).toEqual(mockModules);
        // @ts-ignore: access private for test
        expect(zenApp['providers']).toEqual(mockProviders);
        // @ts-ignore: access private for test
        expect(zenApp['controllers']).toEqual(mockControllers);
    });

    it('should handle empty arrays from StartZenApplication', async () => {
        (StartZenApplication as jest.Mock).mockResolvedValue({
            modules: [],
            providers: [],
            controllers: [],
        });

        await zenApp.start();

        // @ts-ignore: access private for test
        expect(zenApp['modules']).toEqual([]);
        // @ts-ignore: access private for test
        expect(zenApp['providers']).toEqual([]);
        // @ts-ignore: access private for test
        expect(zenApp['controllers']).toEqual([]);
    });
});