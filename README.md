# express-http-error-handler

`express-http-error-handler` is a package for handling HTTP errors in Express applications in a simple and efficient way. It provides specific error classes for the most common HTTP status codes.

## Installation

To install the package, use npm:

```bash
npm install express-http-error-handler
```

## Error List

Here are the available error classes in the package:

| Error Class            | HTTP Status Code | Description                                  |
|------------------------|------------------|----------------------------------------------|
| `NotFoundError`        | 404              | Represents a 404 Not Found error             |
| `BadRequestError`      | 400              | Represents a 400 Bad Request error           |
| `InternalServerError`  | 500              | Represents a 500 Internal Server Error       |
| `UnauthorizedError`    | 401              | Represents a 401 Unauthorized error          |
| `ForbiddenError`       | 403              | Represents a 403 Forbidden error             |

---

## Usage


### NotFoundError
`userService.ts`

In this example, we are trying to fetch a user by their ID. If the user does not exist in the database, a `NotFoundError` is thrown.

```typescript
    import { NotFoundError} from 'express-http-error-handler';

    async getUserById(id: string){
        const user = await this.prismaService.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError(`User not found with id ${id}`);
        return user;
    }
```

`userController.ts`

In the controller, we handle the request by catching the error and returning a proper HTTP response.

```typescript
    import { Request, Response } from 'express';
    import {HttpError} from 'express-http-error-handler'

    async getUserById(req : Request, res : Response){
        try{
            const {id} = req.params;
            const user = await this.userService.getUserById(id);
            return res.status(200).json(user);
        }catch(error : any){
            return error instanceof HttpError
            ? res.status(error.statusCode).json(error)
            : res.status(500).json(error);
        }
    }
```

`Response`

![alt text](https://res.cloudinary.com/dct54aary/image/upload/v1726602949/image_uqt1ol.png)

---

### BadRequestError
`userService.ts`

This example checks if the email is provided when creating a new user. If it's missing, a `BadRequestError` is thrown.


```typescript
    import { BadRequestError } from 'express-http-error-handler';

    async createUser(data: any){
        if (!data.email) throw new BadRequestError('Email is required');
        return await this.prismaService.user.create({ data });
    }
```
`userController.ts`

In the controller, we handle the request by catching the error and returning a proper HTTP response.

```typescript
    import { Request, Response } from 'express';
    import {HttpError} from 'express-http-error-handler'

    async createUserController(req: Request, res: Response) {
        try {
            const user = await this.userService.createUser(req.body);
            return res.status(201).json(user);
        } catch (error: any) {
            return error instanceof HttpError
                ? res.status(error.statusCode).json(error)
                : res.status(500).json(error);
        }
    }
```

`Response`

![Description of the image](https://res.cloudinary.com/dct54aary/image/upload/v1726602949/image-1_mnyekd.png)
---

### InternalServerError
`paymentService.ts`

In this example, we are processing a payment. If something goes wrong during the payment process, an `InternalServerError` is thrown.


```typescript
    import { InternalServerError } from 'express-http-error-handler';

    async processPaymentService(paymentData: any){
    try {
        // Process payment logic
        } catch (err) {
            throw new InternalServerError('Payment processing failed');
        }
    }
```

`paymentController.ts`

```typescript
    import { Request, Response } from 'express';
    import {HttpError} from 'express-http-error-handler'

    async processPaymentController(req: Request, res: Response) {
        try {
            await this.paymentService.processPaymentService(req.body);
            return res.status(200).json({ message: 'Payment successful' });
        } catch (error: any) {
            return error instanceof HttpError
                ? res.status(error.statusCode).json(error)
                : res.status(500).json(error);
        }
    }
```

`Response`

![alt text](https://res.cloudinary.com/dct54aary/image/upload/v1726602949/image-5_eaht2h.png)

---

### UnauthorizedError
`authService.ts`

Here, we validate the user's authentication token. If the token is invalid, an `UnauthorizedError` is thrown.

```typescript
    import { UnauthorizedError } from 'express-http-error-handler';

    async getUserProfileService(token: string){
        const user = await this.authService.validateToken(token);
        if (!user) throw new UnauthorizedError('Invalid token');
        return user;
    }
```

`authController`

In the controller, we handle the request by catching the error and returning a proper HTTP response.

```typescript
    import { Request, Response } from 'express';
    import {HttpError} from 'express-http-error-handler'

    async getUserProfileController(req: Request, res: Response) {
        try {
            const user = await this.authService.getUserProfileService(req.headers.authorization);
            return res.status(200).json(user);
        } catch (error: any) {
            return error instanceof HttpError
                ? res.status(error.statusCode).json(error)
                : res.status(500).json(error);
        }
    }
```

`Response`

![alt text](https://res.cloudinary.com/dct54aary/image/upload/v1726602949/image-2_h2eyeb.png)

---

### ForbiddenError
`adminService.ts`

In this example, we are verifying if the user has the role of 'admin' before granting access to the admin panel. If the user is not an admin, a `ForbiddenError` is thrown.

```typescript
    import { ForbiddenError } from 'express-http-error-handler';

    async accessAdminPanel(user: User){
        if (user.role !== 'admin') throw new ForbiddenError('Access denied: Admins only');
    }
```

`adminController.ts`

In the controller, we handle the request by catching the error and returning a proper HTTP response.

```typescript
    import { Request, Response } from 'express';
    import {HttpError} from 'express-http-error-handler'

    async accessAdminPanelController(req: Request, res: Response) {
        try {
            await this.adminService.accessAdminPanelService(req.user);
            return res.status(200).json({ message: 'Welcome to the admin panel' });
        } catch (error: any) {
            return error instanceof HttpError
                ? res.status(error.statusCode).json(error)
                : res.status(500).json(error);
        }
    }   
```

`Response`

![alt text](https://res.cloudinary.com/dct54aary/image/upload/v1726602949/image-4_j90dch.png)




