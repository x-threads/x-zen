# 🧘 x-zen — Minimalist Framework for Scalable Node.js Applications

**x-zen** is a minimalist, lightweight and modular typescript framework inspired by NestJS, designed to build scalable backend applications with decorators, dependency injection and modular architecture.

---

## ✨ Features

- **Dependency Injection**.
- **Modular Architecture**.
- **Route Controllers**.
- **Middleware Support**.
- **Express Compatible**.
- **Automatic Response Handling**.
- **Extensible**.
- **Decorators**.

---

## 🚀 Installation

```bash
npm install x-zen
```
```bash
yarn add x-zen
```

> **Note:** Enable these TypeScript options to use decorators:
> ```json
> "experimentalDecorators": true,
> "emitDecoratorMetadata": true
> ```

---

## Quick Start

### Create a Provider

A provider is a class that can be injected as a dependency into controllers or other providers. Use the `@ZenProvider()` decorator to register your class as a provider.

```typescript
import { ZenProvider } from 'x-zen';

@ZenProvider()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'Zen' }];
  }
}
```

### Create a Controller

Controllers handle incoming HTTP requests and return responses. Use the `@ZenController` decorator to define a controller and HTTP method decorators like `@Get` to define routes.

```typescript
import { ZenController, Get, RestMethod } from 'x-zen';
import { UserService } from './user.service';

@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  @RestMethod({ statusCode: 200, message: 'users' })
  getAll(req, res) {
    return this.userService.getUsers();
  }
}
```
### list of available method decorators

| Decorator        | Type   | Description                                   | Parameters                            |
| ---------------- | ------ | --------------------------------------------- | ------------------------------------- |
| `@Get`           | Method | Maps method to HTTP GET route                 | `path` (relative route)               |
| `@Post`          | Method | Maps method to HTTP POST route                | `path` (relative route)               |
| `@Put`           | Method | Maps method to HTTP PUT route                 | `path` (relative route)               |
| `@Patch`         | Method | Maps method to HTTP PATCH route               | `path` (relative route)               |
| `@Delete`        | Method | Maps method to HTTP DELETE route              | `path` 

### Use Middleware

Middleware functions can be attached to controllers or individual routes using the `@UseMiddleware` decorator.

```typescript
export function LogMiddleware(req, res, next) {
  console.log('Request logged');
  next();
}
```

Attach at controller level:

```typescript
import { ZenController, Get, UseMiddleware, RestMethod } from 'x-zen';
import { LogMiddleware } from './log.middleware';
import { UserService } from './user.service';

@UseMiddleware(LogMiddleware)
@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  @RestMethod({ statusCode: 200, message: 'users' })
  getAll(req, res) {
    return this.userService.getUsers();
  }
}
```

Or at route level:

```typescript
import { ZenController, Get, UseMiddleware, RestMethod } from 'x-zen';
import { LogMiddleware } from './log.middleware';
import { UserService } from './user.service';

@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  @UseMiddleware(LogMiddleware)
  @RestMethod({ statusCode: 200, message: 'users' })
  getAll(req, res) {
    return this.userService.getUsers();
  }
}
```

### Create a Module

Modules are used to organize related controllers and providers. Use the `@ZenModule` decorator to define a module. Modules can import other modules for better structure and reusability.

```typescript
import { ZenModule } from 'x-zen';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@ZenModule({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

### Import Other Modules

Modules can import other modules to compose features and share providers/controllers.

```typescript
import { ZenModule } from 'x-zen';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user.module';

@ZenModule({
  controllers: [AppController],
  providers: [AppService],
  imports: [UserModule],
})
export class AppModule {}
```

### Bootstrap Application

To start your application, use the `StartZenApplication` function, passing your root module and an Express app instance.

```typescript
import express from 'express';
import { StartZenApplication } from 'x-zen';
import { AppModule } from './user.module';

async function bootstrap() {
  const app = express();
  app.use(express.json());

  await StartZenApplication(app, AppModule);

  app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
}

bootstrap();
```
---

## Using `@RestMethod` Decorator

The `@RestMethod` decorator automatically handles HTTP responses and errors.

- **No need to manually catch errors** in methods decorated with `@RestMethod`. Any thrown error will be formatted as an HTTP error response.
- **Return** data from your method; `@RestMethod` sends a standardized success response.
- Responses follow a consistent JSON format.

### Example

```typescript
import { ZenController, Get, RestMethod, NotFoundError } from 'x-zen';

@ZenController('/users')
export class UserController {

  @Get('/:id')
  @RestMethod({ statusCode: 200, message: "User retrieved successfully" })
  async getUserById(req, res) {
    const id = req.params.id;
    const user = await findUser(id);
    if (!user) throw new NotFoundError(`User not found with ID ${id}`);
    return user;
  }
}
```

#### Success response format

```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": { /* returned user data */ }
}
```

#### Error response format

```json
{
  "statusCode": 404,
  "errorMessage": "User not found with ID {id}",
  "error": "Not Found"
}
```

---

## HTTP Error Classes

| Class Name            | HTTP Status | Description                |
| --------------------- | ----------- | --------------------------|
| `NotFoundError`       | 404         | Resource not found         |
| `BadRequestError`     | 400         | Bad request                |
| `UnauthorizedError`   | 401         | Authentication required    |
| `ForbiddenError`      | 403         | Access forbidden           |
| `InternalServerError` | 500         | Internal server error      |

---

## Decorators Summary

| Decorator        | Type   | Description                                   | Parameters                            |
| ---------------- | ------ | --------------------------------------------- | ------------------------------------- |
| `@ZenController` | Class  | Marks a class as a route controller           | `basePath` - base route for controller|
| `@ZenModule`     | Class  | Groups controllers and providers into a module| `controllers`, `providers`, `imports` |
| `@ZenProvider`   | Class  | Registers a class as an injectable provider   | None                                  |
| `@RestMethod`    | Method | Handles HTTP success and error responses      | `statusCode` (optional), `message` (optional) |
| `@Get`           | Method | Maps method to HTTP GET route                 | `path` (relative route)               |
| `@Post`          | Method | Maps method to HTTP POST route                | `path` (relative route)               |
| `@Put`           | Method | Maps method to HTTP PUT route                 | `path` (relative route)               |
| `@Patch`         | Method | Maps method to HTTP PATCH route               | `path` (relative route)               |
| `@Delete`        | Method | Maps method to HTTP DELETE route              | `path` (relative route)               |
| `@UseMiddleware` | Class/Method | Attaches middleware(s) at controller or route level | Middleware function(s)         |

---

## Notes

- The framework uses Express.js under the hood; all Express middleware and routing features are available.
- Use the `@RestMethod` decorator on async controller methods to automatically handle response formatting and error catching.
- The error classes help you throw HTTP errors with proper status codes and messages that `@RestMethod` will catch.
- Middleware can be applied globally, at the controller level, or per-route.




