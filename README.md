# express-http-error-handler

`express-http-error-handler` is a package for handling HTTP errors in Express applications in a simple and efficient way. It provides specific error classes for the most common HTTP status codes.

## Installation

To install the package, use npm:

```bash
    npm install express-http-error-handler
```
## Usage

### NotFoundError

```typescript
    import { NotFoundError} from 'express-http-error-handler';

    async function getUserById(id: string): Promise<User | null> {
        const user = await this.prismaService.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError(`User not found with id ${id}`);
        return user;
    }
```

### BadRequestError

```typescript
    import { BadRequestError } from 'express-http-error-handler';

    async function createUser(data: any): Promise<User> {
        if (!data.email) throw new BadRequestError('Email is required');
        return await this.prismaService.user.create({ data });
    }
```
### InternalServerError

```typescript
    import { InternalServerError } from 'express-http-error-handler';

    async function processPayment(paymentData: any): Promise<void> {
        try {
            // Process payment logic
        } catch (err) {
            throw new InternalServerError('Payment processing failed');
        }
    }
```

### UnauthorizedError

```typescript
    import { UnauthorizedError } from 'express-http-error-handler';

    async function getUserProfile(token: string): Promise<User> {
        const user = await this.authService.validateToken(token);
        if (!user) throw new UnauthorizedError('Invalid token');
        return user;
    }
```

### ForbiddenError

```typescript
import { ForbiddenError } from 'express-http-error-handler';

   async function accessAdminPanel(user: User): Promise<void> {
        if (user.role !== 'admin') throw new ForbiddenError('Access denied: Admins only');
        // Proceed with providing access to the admin panel
   }
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
