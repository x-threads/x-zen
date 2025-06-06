# Sistema de Inyección de Dependencias Zen Framework

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [ZenContainer - Contenedor de Dependencias](#zencontainer---contenedor-de-dependencias)
4. [StartZenApplication - Inicializador de la Aplicación](#startzenaplication---inicializador-de-la-aplicación)
5. [Flujo de Ejecución](#flujo-de-ejecución)
6. [Patrones de Diseño Implementados](#patrones-de-diseño-implementados)
7. [Análisis de Fortalezas y Debilidades](#análisis-de-fortalezas-y-debilidades)
8. [Mejoras Recomendadas](#mejoras-recomendadas)

---

## Introducción

El sistema de inyección de dependencias del Zen Framework es una implementación robusta y modular inspirada en NestJS. Proporciona un mecanismo completo para gestionar dependencias entre módulos, servicios y controladores en aplicaciones Node.js con Express.

### Características Principales
- **Inyección de dependencias automática** basada en decoradores
- **Sistema de módulos** con imports
- **Patrón Singleton** para todos los proveedores
- **Validación de permisos** entre módulos
- **Resolución recursiva** de dependencias
- **Integración con Express.js**

---

## Arquitectura General

El sistema consta de dos componentes principales:

```
┌─────────────────────┐    ┌─────────────────────┐
│  StartZenApplication │    │    ZenContainer     │
│                     │    │                     │
│ • Descubrimiento    │───▶│ • Almacenamiento    │
│ • Registro          │    │ • Instanciación     │
│ • Configuración     │    │ • Resolución        │
└─────────────────────┘    └─────────────────────┘
```

### Responsabilidades

**StartZenApplication:**
- Escanea el árbol de módulos
- Extrae metadatos de decoradores
- Configura permisos de inyección
- Registra componentes en el contenedor

**ZenContainer:**
- Almacena instancias de dependencias
- Valida permisos de inyección
- Resuelve dependencias recursivamente
- Inicializa la aplicación

---

## ZenContainer - Contenedor de Dependencias

### Estructuras de Datos Internas

El contenedor utiliza cuatro Map estáticos para gestionar las dependencias:

```typescript
// Almacena instancias de proveedores (patrón Singleton)
private static providers = new Map<Constructor, any>();

// Almacena instancias de controladores
private static controllers = new Map<Constructor, any>();

// Define qué proveedores están disponibles por módulo
private static moduleProviders = new Map<string, Set<Constructor>>();

// Registra a qué módulo pertenece cada proveedor
private static providerToModule = new Map<Constructor, string>();
```

### Métodos Principales

#### 1. Registro de Componentes

```typescript
// Registra un proveedor para instanciación lazy
static registerProvider(provider: Constructor)

// Registra un controlador HTTP
static registerController(controller: Constructor)

// Define proveedores disponibles en un módulo
static registerModuleProvider(moduleName: string, providers: Constructor[])

// Establece relación proveedor -> módulo
static setProviderModule(provider: Constructor, moduleName: string)
```

#### 2. Validación de Inyección

```typescript
static canInject(dep: Constructor, targetModule: string): boolean
```

**Lógica de Validación:**
1. La dependencia debe estar declarada en algún módulo
2. Si pertenece al mismo módulo → ✅ Permitido
3. Si pertenece a otro módulo → Debe estar en los imports

#### 3. Instanciación de Dependencias

```typescript
static instantiateDependency(dep: Constructor, targetModule: string)
```

**Proceso de Instanciación:**
1. **Validación de permisos** - Verifica canInject()
2. **Verificación Singleton** - Retorna instancia existente si existe
3. **Validación de decorador** - Verifica @ZenProvider
4. **Resolución recursiva** - Instancia todas las sub-dependencias
5. **Creación de instancia** - Invoca constructor con dependencias
6. **Cache** - Almacena para futuras solicitudes

#### 4. Inicialización del Sistema

```typescript
static initialize(app: any)
```

**Proceso de Inicialización:**
1. Instancia todos los proveedores registrados
2. Instancia todos los controladores
3. Registra controladores en la aplicación Express

### Ejemplo de Uso

```typescript
// Registro
ZenContainer.registerProvider(UserService);
ZenContainer.setProviderModule(UserService, 'UserModule');

// Validación
const canInject = ZenContainer.canInject(UserService, 'UserModule'); // true

// Instanciación
const userService = ZenContainer.instantiateDependency(UserService, 'UserModule');
```

---

## StartZenApplication - Inicializador de la Aplicación

### Propósito Principal

Realiza el descubrimiento automático de todos los módulos, proveedores y controladores de la aplicación mediante un recorrido en anchura (BFS) del árbol de módulos.

### Algoritmo de Descubrimiento

```typescript
export async function StartZenApplication(app: any, rootModule: any): Promise<ZenApplicationResult>
```

#### Paso 1: Recorrido BFS de Módulos

```typescript
const moduleQueue = [rootModule];        // Cola para BFS
const visitedModules = new Set();        // Prevenir duplicados
const allControllers: any[] = [];        // Acumular controladores
const allProviders: any[] = [];          // Acumular proveedores
const allModules: any[] = [];            // Acumular módulos

while (moduleQueue.length) {
    const module = moduleQueue.shift();
    
    // Prevenir procesamiento duplicado
    if (visitedModules.has(module)) continue;
    visitedModules.add(module);
    
    // Procesar módulo...
}
```

#### Paso 2: Extracción de Metadatos

```typescript
// Obtener metadatos del decorador @ZenModule
const moduleMetadata: ZenModuleOptions = Reflect.getMetadata(ZEN_MODULE_METADATA, module);
```

#### Paso 3: Procesamiento de Imports

```typescript
// Agregar imports a la cola para procesamiento
if (moduleMetadata.imports) {
    moduleQueue.push(...moduleMetadata.imports);
}
```

#### Paso 4: Registro de Proveedores

```typescript
if (moduleMetadata.providers) {
    for (const provider of moduleMetadata.providers) {
        allProviders.push(provider);
        ZenContainer.setProviderModule(provider, module.name);
    }
}
```

#### Paso 5: Configuración de Permisos

```typescript
// Proveedores propios del módulo
ZenContainer.registerModuleProvider(module.name, moduleMetadata.providers || []);

// Proveedores importados
if (moduleMetadata.imports) {
    for (const imported of moduleMetadata.imports) {
        const importedMetadata = Reflect.getMetadata(ZEN_MODULE_METADATA, imported);
        if (importedMetadata?.providers) {
            ZenContainer.registerModuleProvider(module.name, importedMetadata.providers);
        }
    }
}
```

#### Paso 6: Registro Final

```typescript
// Registro masivo en el contenedor
for (const provider of allProviders) {
    ZenContainer.registerProvider(provider);
}

for (const controller of allControllers) {
    ZenContainer.registerController(controller);
}

// Inicialización del sistema
ZenContainer.initialize(app);
```

### Ejemplo de Estructura de Módulos

```typescript
@ZenModule({
    imports: [DatabaseModule, AuthModule],
    providers: [UserService, OrderService],
    controllers: [UserController]
})
class UserModule {}

@ZenModule({
    providers: [DatabaseService]
})
class DatabaseModule {}
```

**Procesamiento paso a paso:**
1. Procesa `UserModule`
2. Encuentra imports: `DatabaseModule`, `AuthModule`
3. Los agrega a la cola
4. Registra `UserService`, `OrderService` como pertenecientes a `UserModule`
5. Permite que `UserModule` use `DatabaseService` (por import)
6. Procesa `DatabaseModule` y `AuthModule`
7. Registra todos los componentes en `ZenContainer`

---

## Flujo de Ejecución

### 1. Arranque de la Aplicación

```typescript
const app = express();
const result = await StartZenApplication(app, AppModule);
```

### 2. Descubrimiento de Módulos

```
AppModule
├── UserModule
│   ├── UserService
│   ├── UserController
│   └── imports: [DatabaseModule]
├── DatabaseModule
│   └── DatabaseService
└── AuthModule
    ├── AuthService
    └── AuthController
```

### 3. Registro de Dependencias

```typescript
// Proveedores registrados
providers.set(UserService, undefined);
providers.set(DatabaseService, undefined);
providers.set(AuthService, undefined);

// Relaciones módulo-proveedor
providerToModule.set(UserService, 'UserModule');
providerToModule.set(DatabaseService, 'DatabaseModule');

// Permisos de inyección
moduleProviders.set('UserModule', [UserService, DatabaseService]);
```

### 4. Instanciación bajo Demanda

```typescript
// Cuando UserController necesita UserService
const userService = ZenContainer.instantiateDependency(UserService, 'UserModule');

// Si UserService necesita DatabaseService
const dbService = ZenContainer.instantiateDependency(DatabaseService, 'UserModule');
```

### 5. Inicialización Final

```typescript
// Todas las instancias se crean
// Los controladores se registran en Express
// La aplicación está lista para recibir requests
```

---

## Patrones de Diseño Implementados

### 1. Patrón Singleton
- **Implementación:** Cada proveedor se instancia una sola vez
- **Beneficio:** Consistencia de estado y eficiencia de memoria
- **Código:** `this.providers.set(dep, instance);`

### 2. Patrón Container/Registry
- **Implementación:** ZenContainer gestiona todas las dependencias
- **Beneficio:** Centralización de la gestión de dependencias
- **Código:** Maps para almacenar instancias y metadatos

### 3. Patrón Dependency Injection
- **Implementación:** Inyección automática via constructor
- **Beneficio:** Bajo acoplamiento y alta testabilidad
- **Código:** `new dep(...deps);`

### 4. Patrón Module/Facade
- **Implementación:** Módulos que encapsulan funcionalidad
- **Beneficio:** Organización y encapsulación
- **Código:** Sistema de imports/exports

### 5. Patrón Lazy Loading
- **Implementación:** Instanciación bajo demanda
- **Beneficio:** Mejora en tiempo de arranque
- **Código:** `if (instance === undefined) { ... }`

---

## Análisis de Fortalezas y Debilidades

### ✅ Fortalezas

1. **Arquitectura Sólida**
   - Separación clara de responsabilidades
   - Diseño modular y extensible
   - Inspirado en frameworks maduros (NestJS)

2. **Sistema de Módulos Robusto**
   - Gestión correcta de imports/exports
   - Validación de permisos entre módulos
   - Prevención de acceso no autorizado

3. **Patrón Singleton Bien Implementado**
   - Una instancia por proveedor
   - Cache eficiente de instancias
   - Consistencia de estado

4. **Validaciones Comprehensivas**
   - Verificación de decoradores
   - Validación de permisos de inyección
   - Mensajes de error descriptivos

5. **Uso Correcto de Reflection**
   - Aprovecha TypeScript metadata
   - Resolución automática de tipos
   - Inyección transparente

### ⚠️ Debilidades

1. **Falta de Detección de Dependencias Circulares**
   ```typescript
   // Problema: UserService → OrderService → UserService
   // Resultado: Stack overflow
   ```

2. **Bug en Inicialización de Controladores**
   ```typescript
   // ❌ Código actual
   const dependencies = paramTypes.map((dep) => this.providers.get(dep));
   
   // ✅ Debería ser
   const dependencies = paramTypes.map((dep) => 
       this.instantiateDependency(dep, controllerModule)
   );
   ```

3. **Solo Soporta Patrón Singleton**
   - No hay soporte para scope Request o Transient
   - Limitado para casos de uso específicos

4. **Falta de Soporte para Tokens/Interfaces**
   - Solo inyección por tipo concreto
   - No hay abstracción de interfaces

5. **Gestión de Memoria**
   - Maps estáticos nunca se limpian
   - Potencial memory leak en aplicaciones long-running

6. **Falta de Proveedores Personalizados**
   - No hay soporte para factory providers
   - No hay soporte para useValue/useFactory

---

## Mejoras Recomendadas

### Prioridad Alta

#### 1. Arreglar Bug de Controladores
```typescript
// En ZenContainer.initialize()
const controllerModule = this.providerToModule.get(Controller)!;
const dependencies = paramTypes.map((dep) => 
    this.instantiateDependency(dep, controllerModule)
);
```

#### 2. Detectar Dependencias Circulares
```typescript
static instantiateDependency(dep: Constructor, targetModule: string, visitedDeps = new Set()) {
    if (visitedDeps.has(dep)) {
        throw new InstanceLoaderException(`Circular dependency detected: ${dep.name}`);
    }
    visitedDeps.add(dep);
    // ... resto del código
    visitedDeps.delete(dep);
}
```

### Prioridad Media

#### 3. Soporte para Diferentes Scopes
```typescript
enum ProviderScope {
    SINGLETON = 'singleton',
    TRANSIENT = 'transient',
    REQUEST = 'request'
}

@ZenProvider({ scope: ProviderScope.TRANSIENT })
class TransientService {}
```

#### 4. Soporte para Tokens/Interfaces
```typescript
const DATABASE_TOKEN = Symbol('Database');

@ZenProvider({ provide: DATABASE_TOKEN, useClass: DatabaseService })
class DatabaseService {}
```

#### 5. Custom Providers
```typescript
{
    provide: 'CONFIG',
    useFactory: () => loadConfig(),
    inject: [ConfigService]
}
```

### Prioridad Baja

#### 6. Cleanup de Memoria
```typescript
static cleanup() {
    this.providers.clear();
    this.controllers.clear();
    this.moduleProviders.clear();
    this.providerToModule.clear();
}
```

#### 7. Proveedores Asíncronos
```typescript
@ZenProvider({ async: true })
class AsyncDatabaseService {
    async onModuleInit() {
        await this.connect();
    }
}
```

---

## Conclusión

El sistema de inyección de dependencias del Zen Framework es una implementación sólida y bien arquitecturada que proporciona las funcionalidades esenciales para un framework moderno. Con las mejoras sugeridas, especialmente la corrección del bug de controladores y la detección de dependencias circulares, sería completamente production-ready.

La implementación demuestra un entendimiento profundo de los patrones de diseño y las mejores prácticas en el desarrollo de frameworks, creando una base robusta para aplicaciones Node.js escalables.

### Métricas de Calidad

- **Complejidad:** Media-Alta
- **Mantenibilidad:** Alta
- **Extensibilidad:** Alta
- **Performance:** Buena (con optimizaciones pendientes)
- **Estabilidad:** Alta (con fixes menores)

### Recomendación Final

**Excelente trabajo** en la implementación del sistema de DI. Con las mejoras sugeridas, el framework estará a la altura de soluciones comerciales como NestJS, manteniendo la simplicidad y flexibilidad características de un micro-framework.
