export class InstanceLoaderException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InstanceLoaderException";
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}