
# 🧘 x-zen — Minimal Framework for Scalable Node.js Applications

![x-zen logo](https://user-images.githubusercontent.com/yourusername/x-zen-logo.png)

**x-zen** is a lightweight and modular TypeScript framework inspired by NestJS, built with a simple core to provide flexibility and clarity.

It enables building scalable backend apps with decorators, dependency injection, modular architecture, and expressive HTTP routing — without unnecessary overhead.

---

## ✨ Features

- **📦 Dependency Injection** — Automatic class resolution with `@ZenProvider()` decorator.
- **🧱 Modular Architecture** — Group related components using `@ZenModule`, import modules effortlessly.
- **🌐 Route Controllers** — Use `@ZenController` with `@Get`, `@Post`, etc., for clean REST APIs.
- **🧩 Middleware Support** — Attach middleware at controller or route level.
- **🚀 Express Compatible** — Built on Express.js for maximum compatibility.
- **🔁 Extensible** — Minimal core, maximum control.

---

## 🚀 Installation

```bash
npm install x-zen
# or
yarn add x-zen
```

> **Note:** Enable these TypeScript options to use decorators:
> ```json
> "experimentalDecorators": true,
> "emitDecoratorMetadata": true
> ```

---

## Quick Start

### Create a provider

```typescript
import { ZenProvider } from 'x-zen';

@ZenProvider()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'Zen' }];
  }
}
```

### Create a controller

```typescript
import { ZenController, Get } from 'x-zen';
import { UserService } from './user.service';

@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  getAll(req, res) {
    return res.json(this.userService.getUsers());
  }
}
```

### Use middleware

```typescript
export function LogMiddleware(req, res, next) {
  console.log('Request logged');
  next();
}
```

Attach at controller level:

```typescript
import { ZenController, Get, UseMiddleware } from 'x-zen';
import { LogMiddleware } from './log.middleware';
import { UserService } from './user.service';

@UseMiddleware(LogMiddleware)
@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  getAll(req, res) {
    return res.json(this.userService.getUsers());
  }
}
```

Or at route level:

```typescript
import { ZenController, Get, UseMiddleware } from 'x-zen';
import { LogMiddleware } from './log.middleware';
import { UserService } from './user.service';

@ZenController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseMiddleware(LogMiddleware)
  @Get('/list')
  getAll(req, res) {
    return res.json(this.userService.getUsers());
  }
}
```

### Create a module
#### you can create a zenModule to group modules, controllers and providers

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

### Bootstrap application

```typescript
import express from 'express';
import { StartZenApplication } from 'x-zen';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = express();
  app.use(express.json());

  await StartZenApplication(app, UserModule);

  app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
}

bootstrap();
```

### Import other modules

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

---

## Using `@RestMethod` Decorator

The `@RestMethod` decorator handles HTTP responses automatically.

- You **do not** need to manually catch or handle errors inside methods decorated with `@RestMethod`. Any thrown error will be caught and formatted into a consistent HTTP error response.
- Simply **return** the data from your method, and `@RestMethod` will send a standardized success response.
- Error responses and success responses follow a consistent JSON format (see below).

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

### Success response format

```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    /* returned user data */
  }
}
```

### Error response format

```json
{
  "statusCode": 404,
  "errorMessage": "User not found with ID {id}",
  "error": "Not Found"
}
```

---

## HTTP Error Classes

| Class Name            | HTTP Status | Description                          |
| --------------------- | ----------- | ---------------------------------- |
| `NotFoundError`       | 404         | Resource not found                  |
| `BadRequestError`     | 400         | Bad request                        |
| `UnauthorizedError`   | 401         | Authentication required             |
| `ForbiddenError`      | 403         | Access forbidden                   |
| `InternalServerError` | 500         | Internal server error               |

---

## Decorators Summary

| Decorator        | Type   | Description                                   | Parameters                            |
| ---------------- | ------ | ---------------------------------------------| ----------------------------------- |
| `@ZenController` | Class  | Marks a class as a route controller           | `basePath` - base route for controller |
| `@RestMethod`    | Method | Handles HTTP success and error responses      | `statusCode` (optional), `message` (optional) |
| `@Get`           | Method | Maps method to HTTP GET route                   | `path` (relative route)             |
| `@Post`          | Method | Maps method to HTTP POST route                  | `path` (relative route)             |
| `@Put`           | Method | Maps method to HTTP PUT route                   | `path` (relative route)             |
| `@Patch`         | Method | Maps method to HTTP PATCH route                 | `path` (relative route)             |
| `@Delete`        | Method | Maps method to HTTP DELETE route                | `path` (relative route)             |
| `@UseMiddleware` | Class / Method | Attaches middleware(s) at controller or route level | Middleware function or array        |

---

## Notes

- The framework uses Express.js under the hood, so all Express middleware and routing features are available.
- Use the `@RestMethod` decorator on async controller methods to automatically handle response formatting and error catching.
- The error classes are designed to help you throw HTTP errors with proper status codes and messages that `@RestMethod` will catch.
- Middleware can be applied globally, at the controller level, or per-route.


