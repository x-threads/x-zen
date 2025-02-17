# express-zen

`express-zen` is a package for handling HTTP errors in Express applications in a simple and efficient way. It provides specific error classes for the most common HTTP status codes.

## Installation and configuration

To install the package, use npm:

```bash
npm install express-zen
```

Now we have to enable these options in our tsconfig.json to be able to use decorators in typescript..

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true,  
```


## Error List

Here are the available error classes in the package:

| Error Class           | HTTP Status Code | Description                            |
| --------------------- | ---------------- | -------------------------------------- |
| `NotFoundError`       | 404              | Represents a 404 Not Found error       |
| `BadRequestError`     | 400              | Represents a 400 Bad Request error     |
| `InternalServerError` | 500              | Represents a 500 Internal Server Error |
| `UnauthorizedError`   | 401              | Represents a 401 Unauthorized error    |
| `ForbiddenError`      | 403              | Represents a 403 Forbidden error       |

---

## Decorators List

These are some of the decorators providing for the moment

| Decorator            | Description                                                                |
| ---------------------| ---------------------------------------------------------------------------|
| `ResMethod`          | handles and validates the errors thrown and returns them to the customer   | 

---

### Using Package with `Typescript`


### suppose we have a service class called UserService

we created our basic methods 

`UserService.ts`

```typescript
import { NotFoundError} from 'express-zen';

export class UserService{

    constructor(){}

    async getUserById(id : string){
        const user = await this.user.findById(id);
        if(!user) throw new NotFoundError(`user not found with id ${id}`);
        return user;
    }
}

```

### now in our controllers

we can use the decorator provided by express-http-error-handler, which helps us to handle and validate the thrown errors

**it is not necessary using a try catch block, since this decorator does the error handling and validation for you, you just return your correct operation.**

`UserController.ts`

```typescript
import { Request, Response } from 'express';
import { ResMethod } from 'express-zen';

export class UserController{

    constructor(){}

    @ResMethod()
    async getUserById(req : Request, res : Response){
        const {id} = req.params;
        const user = await userService.getUserById(id);
        return user;
    }
}

```
`Response`

In this case, we throw a NotFoundError (status code 400) from our service, using our @ResMethod decorator, we handle this error and any other error that is not thrown using this package will also be handled by returning a status code 500.

**The response client receives looks like this:**

---

### Example using `javascript`

As we know in pure JavaScript, decorators are not natively supported, so we can handle and trap our errors by simply validating the type of error in the try catch block of our controller.

`UserController.js`


```javascript
import { Request, Response } from 'express';
import { HttpErrors } from 'express-zen';

export class UserController{

    constructor(){}

    async getUserById(req : Request, res : Response){
       try{
        const {id} = req.params;
        const user = await userService.getUserById(id);
        return res.status(200).json(user);
       }catch(error : any){
        return error instanceof HttpErrors
        ? res.status(error.status).json(error)
        : res.status(500).json(error);
       }
    }
}
```

`Response`

the answer ends up being the same, the difference is that now we must validate the instance the error to know if it is of type **HttpError**


**In this way we can use and thorw errors in express, either from services, middlewares or other validations.**
