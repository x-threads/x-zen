# express-http-error-handler

`express-http-error-handler` is a package for handling HTTP errors in Express applications in a simple and efficient way. It provides specific error classes for the most common HTTP status codes.

## Installation

To install the package, use npm:

```bash
    npm install express-http-error-handler
```
## Usage

```bash
    import { NotFoundError} from 'express-http-error-handler';

    async function getBookById(id: string): Promise<User | null> {
        const user = await this.prismaService.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError(`User not found with id ${id}`);
        return user;
    }
```
## Error List

### Error Classes

Here are the available error classes in the package:

| Error Class            | HTTP Status Code | Description                                  |
|------------------------|------------------|----------------------------------------------|
| `NotFoundError`        | 404              | Represents a 404 Not Found error             |
| `BadRequestError`      | 400              | Represents a 400 Bad Request error           |
| `InternalServerError`  | 500              | Represents a 500 Internal Server Error       |
