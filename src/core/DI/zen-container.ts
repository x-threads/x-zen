import "reflect-metadata";
import { ZEN_PROVIDER_METADATA } from "../../constants";
import { InstanceLoaderException } from "../exceptions/instance-loader.exception";
import { LogInstancer } from "../../common/instancer-logger/instancer-logger";
import { RegisterControllers } from "../handlers/register-controller.handler";

// Tipo genérico para cualquier constructor de clase
// Permite crear instancias de cualquier clase con parámetros variables
type Constructor<T = any> = new (...args: any[]) => T;

/**
 * Contenedor principal de inyección de dependencias del framework Zen
 * Maneja el registro, instanciación y resolución de dependencias entre módulos
 * Implementa el patrón Singleton para todas las dependencias
 */
export class ZenContainer {
  
  // ===== ESTRUCTURAS DE DATOS PRINCIPALES =====
  
  /**
   * Mapa que almacena las instancias de los proveedores (servicios)
   * Key: Constructor de la clase proveedor
   * Value: Instancia del proveedor (undefined si no se ha instanciado aún)
   * Propósito: Implementar patrón Singleton - una sola instancia por proveedor
   */
  private static providers = new Map<Constructor, any>();
  
  /**
   * Mapa que almacena las instancias de los controladores
   * Key: Constructor de la clase controlador  
   * Value: Instancia del controlador (undefined si no se ha instanciado aún)
   * Propósito: Gestionar controladores que manejan rutas HTTP
   */
  private static controllers = new Map<Constructor, any>();
  
  /**
   * Mapa que define qué proveedores están disponibles en cada módulo
   * Key: Nombre del módulo (string)
   * Value: Set de constructores que pueden ser inyectados en ese módulo
   * Propósito: Controlar el scope y visibilidad de dependencias por módulo
   */
  private static moduleProviders = new Map<string, Set<Constructor>>();
  
  /**
   * Mapa que registra a qué módulo pertenece cada proveedor
   * Key: Constructor del proveedor
   * Value: Nombre del módulo donde fue declarado
   * Propósito: Determinar el módulo "propietario" de cada dependencia
   */
  private static providerToModule = new Map<Constructor, string>();

  // ===== MÉTODOS DE REGISTRO =====

  /**
   * Registra un proveedor en el contenedor
   * @param provider Constructor de la clase proveedor a registrar
   * Propósito: Marcar una clase como disponible para inyección de dependencias
   * Se inicializa con undefined - la instancia se crea bajo demanda (lazy loading)
   */
  static registerProvider(provider: Constructor) {
    this.providers.set(provider, undefined);
  }

  /**
   * Registra un controlador en el contenedor
   * @param controller Constructor de la clase controlador a registrar
   * Propósito: Marcar una clase como controlador HTTP que manejará rutas
   * Se inicializa con undefined - la instancia se crea durante initialize()
   */
  static registerController(controller: Constructor) {
    this.controllers.set(controller, undefined);
  }

  /**
   * Registra qué proveedores están disponibles en un módulo específico
   * @param moduleName Nombre del módulo
   * @param providers Array de constructores de proveedores disponibles en el módulo
   * Propósito: Definir el scope de dependencias - qué puede inyectar cada módulo
   * Combina con proveedores existentes usando Set para evitar duplicados
   */
  static registerModuleProvider(moduleName: string, providers: Constructor[] = []) {
    // Obtiene proveedores existentes o crea un Set vacío
    const existing = this.moduleProviders.get(moduleName) || new Set();
    
    // Agrega cada nuevo proveedor al Set (evita duplicados automáticamente)
    providers.forEach((p) => existing.add(p));
    
    // Actualiza el mapa con el Set combinado
    this.moduleProviders.set(moduleName, existing);
  }

  /**
   * Establece a qué módulo pertenece un proveedor
   * @param provider Constructor del proveedor
   * @param moduleName Nombre del módulo propietario
   * Propósito: Crear la relación proveedor -> módulo para validaciones de inyección
   */
  static setProviderModule(provider: Constructor, moduleName: string) {
    this.providerToModule.set(provider, moduleName);
  }

  /**
   * Obtiene el módulo al que pertenece un proveedor
   * @param provider Constructor del proveedor
   * @returns Nombre del módulo o undefined si no está registrado
   * Propósito: Consultar el módulo propietario de una dependencia
   */
  static getProviderModule(provider: Constructor): string | undefined {
    return this.providerToModule.get(provider);
  }

  // ===== VALIDACIÓN DE INYECCIÓN =====

  /**
   * Valida si una dependencia puede ser inyectada en un módulo específico
   * @param dep Constructor de la dependencia a inyectar
   * @param targetModule Módulo donde se quiere inyectar la dependencia
   * @returns true si la inyección es válida, false en caso contrario
   * 
   * Lógica de validación:
   * 1. La dependencia debe estar declarada en algún módulo
   * 2. Si pertenece al mismo módulo del target -> ✅ permitido
   * 3. Si pertenece a otro módulo -> debe estar en los imports del target
   */
  static canInject(dep: Constructor, targetModule: string): boolean {
    // Busca el módulo donde fue declarada la dependencia
    const declaredModule = this.providerToModule.get(dep);
    
    // Si no está declarada en ningún módulo -> ❌ rechazado
    if (!declaredModule) return false;
    
    // Si pertenece al mismo módulo -> ✅ permitido (acceso directo)
    if (declaredModule === targetModule) return true;

    // Busca si el módulo target importó esta dependencia
    const importedProviders = this.moduleProviders.get(targetModule);
    
    // Si está en los imports del módulo -> ✅ permitido, sino -> ❌ rechazado
    return importedProviders?.has(dep) ?? false;
  }

  // ===== INSTANCIACIÓN DE DEPENDENCIAS =====

  /**
   * Instancia una dependencia y todas sus sub-dependencias de forma recursiva
   * Implementa patrón Singleton y resolución automática de dependencias
   * 
   * @param dep Constructor de la dependencia a instanciar
   * @param targetModule Módulo desde donde se solicita la dependencia
   * @returns Instancia de la dependencia lista para usar
   * 
   * Proceso:
   * 1. Valida permisos de inyección
   * 2. Verifica si ya existe (Singleton)
   * 3. Valida decorador @ZenProvider
   * 4. Resuelve sub-dependencias recursivamente
   * 5. Crea e instancia la dependencia
   * 6. Almacena la instancia (cache para Singleton)
   */
  public static instantiateDependency(dep: Constructor, targetModule: string) {
    
    // ===== VALIDACIÓN DE PERMISOS =====
    // Verifica si el módulo puede inyectar esta dependencia
    if (!this.canInject(dep, targetModule)) {
      throw new InstanceLoaderException(
        `
        Dependence ${dep.name} cannot be injected into ${targetModule}. 
        Make sure it is declared in the providers array of ${targetModule} module or in an imported module.
        Ensure it is decorated with @ZenProvider().`
      );
    }

    // ===== VERIFICACIÓN DE SINGLETON =====
    // Busca si ya existe una instancia (patrón Singleton)
    let instance = this.providers.get(dep);

    // Si no existe instancia, la crea
    if (instance === undefined) {
      
      // ===== VALIDACIÓN DE DECORADOR =====
      // Verifica que la clase tenga el decorador @ZenProvider
      const isZenProvider = Reflect.getMetadata(ZEN_PROVIDER_METADATA, dep);
      
      if (!isZenProvider) {
        throw new InstanceLoaderException(
          `
          Dependence ${dep.name} is not decorated with @ZenProvider(). 
          Please add @ZenProvider() to ${dep.name} to use it as a dependency.`
        );
      }

      // ===== RESOLUCIÓN RECURSIVA DE DEPENDENCIAS =====
      // Obtiene los tipos de parámetros del constructor usando reflection
      const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", dep) || [];
      
      // Instancia recursivamente cada dependencia del constructor
      const deps = paramTypes.map((d) => this.instantiateDependency(d, targetModule));

      // ===== CREACIÓN DE INSTANCIA =====
      // Crea la instancia pasando todas las dependencias resueltas
      instance = new dep(...deps);
      
      // Almacena la instancia para futuras solicitudes (Singleton)
      this.providers.set(dep, instance);
      
      // Log para debugging/monitoring
      LogInstancer("ZenProvider", dep);
    }

    return instance;
  }

  // ===== INICIALIZACIÓN DEL CONTENEDOR =====

  /**
   * Inicializa todo el contenedor de dependencias
   * Se ejecuta al final del proceso de arranque de la aplicación
   * 
   * @param app Instancia de la aplicación (ej: Express app)
   * 
   * Proceso:
   * 1. Instancia todos los proveedores registrados
   * 2. Instancia todos los controladores con sus dependencias
   * 3. Registra los controladores en la aplicación web
   */
  static initialize(app: any) {
    
    // ===== INICIALIZACIÓN DE PROVEEDORES =====
    // Recorre todos los proveedores registrados
    for (const [Provider] of this.providers) {
      
      // Solo instancia si no se ha creado aún
      if (this.providers.get(Provider) === undefined) {
        
        // Obtiene los tipos de parámetros del constructor
        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Provider) || [];
        
        // Busca el módulo propietario del proveedor
        const providerModule = this.providerToModule.get(Provider)!;

        // Resuelve todas las dependencias del proveedor
        const dependencies = paramTypes.map(dep =>
          this.instantiateDependency(dep, providerModule)
        );

        // Crea la instancia del proveedor
        const instance = new Provider(...dependencies);
        
        // Almacena la instancia
        this.providers.set(Provider, instance);
        
        // Log para debugging
        LogInstancer("ZenProvider", Provider);
      }
    }

    // ===== INICIALIZACIÓN DE CONTROLADORES =====
    // Recorre todos los controladores registrados
    for (const [Controller] of this.controllers) {
      
      // Solo instancia si no se ha creado aún
      if (this.controllers.get(Controller) === undefined) {
        
        // Obtiene los tipos de parámetros del constructor
        const paramTypes: Constructor[] = Reflect.getMetadata("design:paramtypes", Controller) || [];
        
        // NOTA: Aquí hay un BUG - debería usar instantiateDependency
        // en lugar de get directo para manejar dependencias no instanciadas
        const dependencies = paramTypes.map((dep) => this.providers.get(dep));
        
        // Crea la instancia del controlador
        const instance = new Controller(...dependencies);
        
        // Almacena la instancia
        this.controllers.set(Controller, instance);
      }
    }

    // ===== REGISTRO EN LA APLICACIÓN WEB =====
    // Registra todos los controladores en la aplicación (ej: Express routes)
    RegisterControllers(app, Array.from(this.controllers.values()));
  }
}