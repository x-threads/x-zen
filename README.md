# x-zen

`x-zen` is a package to manage and handle HTTP responses and errors in Express applications in a simple and efficient way. It provides specific error classes for the most common HTTP codes.

It also handles http responses in a very simple way.

## Installation and Configuration

To install the package, use npm:

```bash
npm install x-zen
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

### `UnauthorizedError` (401)
```json
{
  "statusCode": 401,
  "errorMessage": "Unauthorized Error",
  "error" : "Unauthorized"
}
```

### `ForbiddenError` (403)
```json
{
  "statusCode": 403,
  "errorMessage": "Forbidden Error",
  "error" : "Forbidden"
}
```

## Decorators List

These are some of the decorators provided at the moment:

| Decorator    | Description                                                                | Params                                                                 |
| ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `ResMethod`  | handles and validates the generated HTTP errors, processes the responses and sends them to the client appropriately.  | StatusCode: indicates the success status code for the operation (200, 201)

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

### Example: `UserController.ts`

```typescript
import { Request, Response } from 'express';
import { ResMethod } from 'x-zen';
import { UserService } from './UserService';

const userService = new UserService();

export class UserController {
  constructor() {}

  @ResMethod(200)
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

## Using the Package with JavaScript

In JavaScript, since decorators are not natively supported, we handle errors using a try-catch block:

### Example: `UserController.js`

```javascript
import { Request, Response } from 'express';
import { HttpErrors } from 'x-zen';
import { UserService } from './UserService';

const userService = new UserService();

export class UserController {
  constructor() {}

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return res.statusCode(200).json(user);
    } catch (error) {
      return error instanceof HttpErrors
        ? res.status(error.statusCode).json(error)
        : res.status(500).json({ 
        statusCode: 500, errorMessage: "Internal Server Error" });
    }
  }
}
```

## Summary

With `x-zen`, you can handle errors and HTTP responses in Express applications easily, either using decorators in TypeScript or a standard approach with `try-catch` in JavaScript. This ensures clear, efficient and easy-to-maintain error handling.
