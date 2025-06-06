import "reflect-metadata";
import { ZenContainer } from "../DI";
import { ZEN_MODULE_METADATA } from "../../constants";
import { ZenModuleOptions } from "../../shared/interfaces/zen-module.interface";
import { LogInstancer } from "../../common/instancer-logger/instancer-logger";

/**
 * Interfaz que define el resultado del proceso de arranque de la aplicación
 * Contiene información sobre todos los componentes descubiertos y registrados
 */
export interface ZenApplicationResult {
  modules: string[];      // Nombres de todos los módulos procesados
  controllers: any[];     // Constructores de todos los controladores encontrados
  providers: any[];       // Constructores de todos los proveedores encontrados
}

/**
 * Función principal que arranca la aplicación Zen
 * Realiza el descubrimiento y registro de todos los módulos, proveedores y controladores
 * Implementa un recorrido en anchura (BFS) para procesar el árbol de módulos
 * 
 * @param app - Instancia de la aplicación web (ej: Express app) donde se registrarán las rutas
 * @param rootModule - Módulo raíz de la aplicación (punto de entrada del árbol de módulos)
 * @returns Promise con información sobre todos los componentes registrados
 * 
 * Proceso principal:
 * 1. Descubrimiento de módulos (BFS traversal)
 * 2. Extracción de metadatos de cada módulo
 * 3. Registro de relaciones proveedor-módulo
 * 4. Configuración de permisos de inyección
 * 5. Inicialización del contenedor de dependencias
 */
export async function StartZenApplication(app: any, rootModule: any): Promise<ZenApplicationResult> {
  
  // ===== ESTRUCTURAS DE DATOS PARA EL RECORRIDO =====
  
  /**
   * Cola para implementar recorrido en anchura (BFS)
   * Comienza con el módulo raíz y se van agregando los imports encontrados
   */
  const moduleQueue = [rootModule];
  
  /**
   * Set para evitar procesar el mismo módulo múltiples veces
   * Previene bucles infinitos en caso de imports circulares entre módulos
   */
  const visitedModules = new Set();
  
  /**
   * Arrays para acumular todos los componentes encontrados
   * Se usan para el resultado final y para registro masivo
   */
  const allControllers: any[] = [];  // Todos los controladores encontrados
  const allProviders: any[] = [];    // Todos los proveedores encontrados  
  const allModules: any[] = [];      // Nombres de todos los módulos procesados

  // ===== RECORRIDO EN ANCHURA DE MÓDULOS =====
  
  /**
   * Bucle principal que procesa cada módulo en la cola
   * Implementa BFS para garantizar que se procesen todos los módulos
   * y sus imports de forma ordenada
   */
  while (moduleQueue.length) {
    
    // Toma el siguiente módulo de la cola (FIFO)
    const module = moduleQueue.shift();
    
    // ===== PREVENCIÓN DE DUPLICADOS =====
    // Si ya fue visitado, continúa con el siguiente
    if (visitedModules.has(module)) continue;
    
    // Marca el módulo como visitado
    visitedModules.add(module);
    
    // Registra el nombre del módulo para el resultado final
    allModules.push(module.name);
    
    // ===== EXTRACCIÓN DE METADATOS =====
    
    /**
     * Obtiene los metadatos del decorador @ZenModule
     * Los metadatos contienen: imports, providers, controllers, exports
     * Si no tiene metadatos, significa que no es un módulo válido
     */
    const moduleMetadata: ZenModuleOptions = Reflect.getMetadata(ZEN_MODULE_METADATA, module);
    
    // Si no tiene metadatos de módulo, lo salta
    if (!moduleMetadata) continue;
    
    // ===== PROCESAMIENTO DE IMPORTS =====
    
    /**
     * Agrega todos los módulos importados a la cola para procesarlos
     * Esto permite el recorrido recursivo de todo el árbol de módulos
     */
    if (moduleMetadata.imports) {
      moduleQueue.push(...moduleMetadata.imports);
    }
    
    // ===== PROCESAMIENTO DE PROVEEDORES =====
    
    /**
     * Registra cada proveedor del módulo
     * 1. Lo agrega a la lista global de proveedores
     * 2. Establece la relación proveedor -> módulo propietario
     */
    if (moduleMetadata.providers) {
      for (const provider of moduleMetadata.providers) {
        // Acumula para registro masivo posterior
        allProviders.push(provider);
        
        // Establece que este proveedor pertenece a este módulo
        // Esto es crucial para las validaciones de inyección
        ZenContainer.setProviderModule(provider, module.name);
      }
    }
    
    // ===== PROCESAMIENTO DE CONTROLADORES =====
    
    /**
     * Registra cada controlador del módulo
     * Similar a proveedores, pero para controladores HTTP
     */
    if (moduleMetadata.controllers) {
      for (const controller of moduleMetadata.controllers) {
        // Acumula para registro masivo posterior  
        allControllers.push(controller);
        
        // Establece que este controlador pertenece a este módulo
        // Los controladores también pueden tener dependencias inyectadas
        ZenContainer.setProviderModule(controller, module.name);
      }
    }
    
    // ===== CONFIGURACIÓN DE PERMISOS DE INYECCIÓN =====
    
    /**
     * Registra qué proveedores están disponibles en este módulo
     * Incluye los proveedores propios del módulo
     */
    ZenContainer.registerModuleProvider(module.name, moduleMetadata.providers || []);
    
    /**
     * PROCESAMIENTO DE IMPORTS PARA PERMISOS
     * 
     * Por cada módulo importado, hace que sus proveedores estén
     * disponibles en el módulo actual. Esto implementa el sistema
     * de imports que permite inyectar dependencias entre módulos.
     */
    if (moduleMetadata.imports) {
      for (const imported of moduleMetadata.imports) {
        
        // Obtiene los metadatos del módulo importado
        const importedMetadata: ZenModuleOptions = Reflect.getMetadata(ZEN_MODULE_METADATA, imported);
        
        // Si el módulo importado tiene proveedores, los hace disponibles
        // en el módulo actual
        if (importedMetadata?.providers) {
          ZenContainer.registerModuleProvider(module.name, importedMetadata.providers);
        }
      }
    }
  }
  
  // ===== LOGGING DE DESCUBRIMIENTO =====
  
  /**
   * Registra todos los módulos encontrados para debugging/monitoring
   */
  for (const moduleName of allModules) {
    LogInstancer("ZenModule", moduleName);
  }
  
  // ===== REGISTRO MASIVO EN EL CONTENEDOR =====
  
  /**
   * Registra todos los proveedores encontrados en el contenedor
   * Los marca como disponibles para instanciación bajo demanda
   */
  for (const provider of allProviders) {
    ZenContainer.registerProvider(provider);
  }
  
  /**
   * Registra todos los controladores encontrados en el contenedor
   * Los prepara para instanciación e integración con la app web
   */
  for (const controller of allControllers) {
    ZenContainer.registerController(controller);
  }
  
  // ===== INICIALIZACIÓN FINAL =====
  
  /**
   * Inicializa el contenedor de dependencias
   * Esto desencadena:
   * 1. Instanciación de todos los proveedores
   * 2. Instanciación de todos los controladores  
   * 3. Registro de rutas HTTP en la aplicación
   */
  ZenContainer.initialize(app);
  
  // ===== RESULTADO FINAL =====
  
  /**
   * Retorna información completa sobre el proceso de arranque
   * Útil para debugging, testing y monitoring
   */
  return {
    modules: allModules,           // Lista de módulos procesados
    controllers: allControllers,   // Lista de controladores encontrados
    providers: allProviders        // Lista de proveedores encontrados
  }
}