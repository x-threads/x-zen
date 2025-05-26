# x-zen

**x-zen** is a lightweight toolkit for structuring Express apps with TypeScript decorators. It simplifies error handling, routing, and response formatting for clean and maintainable code.

---

## 🚀 Installation

using npm
```bash
npm install x-zen
```

using yarn
```bash
yarn add x-zen
```

>[!IMPORTANT]
>Now we have to enable these options in our `tsconfig.json` to be able to use decorators in TypeScript:

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true  
```

## Error List

Here are the available error classes in the package:

| Error Class           | HTTP statusCode Code | Description                            |
| --------------------- | ---------------- | -------------------------------------- |
| `NotFoundError`       | 404              | Represents a 404 Not Found error       |
| `BadRequestError`     | 400              | Represents a 400 Bad Request error     |
| `InternalServerError` | 500              | Represents a 500 Internal Server Error |
| `UnauthorizedError`   | 401              | Represents a 401 Unauthorized error    |
| `ForbiddenError`      | 403              | Represents a 403 Forbidden error       |

## Error Responses

Here are the responses the client receives when an error is thrown:

* examples 
### `NotFoundError` (404)
```json
{
  "statusCode": 404,
  "errorMessage": "Not Found Error",
  "error" : "Not Found"
}
```

### `BadRequestError` (400)
```json
{
  "statusCode": 400,
  "errorMessage": "Bad Request Error",
  "error" : "Bad Request"
}
```

### `InternalServerError` (500)
```json
{
  "statusCode": 500,
  "errorMessage": "Internal Server Error",
  "error" : "Internal Server Error"
}
```


## Decorators List

These are some of the decorators provided at the moment:

| Decorator      | Type     | Description                                                                                          | Parameters                                                                                                                                               |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@RestController`  | Class    | Marks a class as a controller and defines a base path for all routes in that class.                 | - `basePath`: Base route path for all methods in the controller. Example: `/users`                                                                       |
| `@RestMethod`   | Method   | Handles HTTP success responses and errors thrown inside the method. Automatically formats the reply. | - `statusCode`: HTTP status code for success (e.g. `200`, `201`) *(optional)*<br>- `message`: Success message *(optional)*                               |
| `@Get`         | Method   | Maps the method to an HTTP GET route.                                                                | - `path`: Relative route path (e.g. `/list`, `/:id`)                                                                                                     |
| `@Post`        | Method   | Maps the method to an HTTP POST route.                                                               | - `path`: Relative route path                                                                                                                            |
| `@Put`         | Method   | Maps the method to an HTTP PUT route.                                                                | - `path`: Relative route path                                                                                                                            |
| `@Patch`       | Method   | Maps the method to an HTTP PATCH route.                                                              | - `path`: Relative route path                                                                                                                            |
| `@Delete`      | Method   | Maps the method to an HTTP DELETE route.                                                             | - `path`: Relative route path                                                                                                                            |



## Using the Package with TypeScript

### Example: `UserService.ts`

```typescript
import { NotFoundError } from 'x-zen';

export class UserService {
  constructor() {}

  async getUserById(id: string) {
    const user = await this.user.findById(id);
    if (!user) throw new NotFoundError(`User not found with ID ${id}`);
    return user;
  }
}
```

### Example: `UserController.ts` with @RestController decorator

```typescript
import { Request, Response } from 'express';
import { RestController, Get, RestMethod } from 'x-zen';
import { UserService } from './UserService';

const userService = new UserService();

@RestController('users')
export class UserController {
  constructor() {}

  @Get('/:id')
  @RestMethod({ statusCode: 200, message: "User Was Found" })
  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const foundUser = await userService.getUserById(id);
    return foundUser;
  }
}
```

### In case of success
If the operation is successful, this is what the response looks like:
```json
{
  "statusCode": 200,
  "error": false,
  "message": "User Was Found",
  "data": {
    "user": {
      "id" : "xxxxxx",
      "name": "John",
      "lastName": "Doe",
      "email": "JohnDoe@mail.com"
    }
  }
}
```

>[!TIP]
>you can omit the decorator parameters and the default values will be sent
### With default values

```json
{
  "statusCode": 200,
  "error": false,
  "message": "success",
  "data": {
    "user": {
      "id" : "xxxxxx",
      "name": "John",
      "lastName": "Doe",
      "email": "JohnDoe@mail.com"
    }
  }
}
```

### In case of error
If user is not found, this is what the response looks like:
```json
{
  "statusCode": 404,
  "errorMessage": "User not found with ID {id}",
  "error" : "Not Found"
}
```
---

## Using x-zen with JavaScript

If you're working in a JavaScript environment (where decorators aren't natively supported), you can still benefit from x-zen by manually using the provided utilities for response and error handling.

Here's how you can use ResponseHandler and ErrorHandler to handle responses and exceptions in a controller method:

### Example: `UserController.js`

```javascript
import { Request, Response } from 'express';
import { ErrorHandler, ResponseHandler  } from 'x-zen';
import { UserService } from './UserService';

const userService = new UserService();

export class UserController {
  constructor() {}

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      ResponseHandler(res, { statusCode: options.statusCode ?? 200, message: options.message ?? "success", data: result });
    } catch (error) {
      ErrorHandler(error, res);
    }
  }
}
```

### In this example:

    If userService.getUserById(id) throws a NotFoundError or another error, ErrorHandler will automatically handle the response with the appropriate status code and error message.

    ResponseHandler sends a standardized success response.

This approach provides the same consistency and structure as using decorators in TypeScript, ensuring your app responds with clean, predictable JSON payloads.


## Summary

With `x-zen`, you can easily handle HTTP responses and errors in Express applications using a clean and declarative decorator-based approach in TypeScript.

The package allows you to:

- Automatically format successful responses and handle exceptions using `@RestMethod`.
- Define routes directly in your controller methods using `@Get`, `@Post`, `@Put`, `@Patch`, and `@Delete`.
- Register controllers with base paths using `@RestController`.
- Keep your code modular, readable, and consistent by removing repetitive `try-catch` blocks and manual response handling.

This approach leads to better structure, reduces boilerplate, and improves maintainability of your Express applications.
