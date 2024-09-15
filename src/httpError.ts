/**
 * Base class for HTTP-related errors.
 * 
 * This class is used as a base for specific HTTP errors, encapsulating an error message and a status code.
 * 
 * @param {string} [errorMessage] - The error message describing the issue.
 * @param {number} statusCode - The HTTP status code associated with the error.
 */
export class HttpError extends Error {
  constructor(public statusCode: number, public errorMessage: string) {
    super(errorMessage || 'Error not especified');
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
* Throws new Not Found Error - Represents an 404 http error
*
* This error is thrown when a requested resource cannot be found.
*
* @param {string} [errorMessage] - Optional custom error message. Defaults to "Not Found Error".
*/
export class NotFoundError extends HttpError {
  constructor( errorMessage : string = "Not found Error") {
    super(404, errorMessage);
    this.name = "Not Found Error";
  }
}

/**
* Throws new Bad Request Error - Represents an 400 http error
*
* This error is thrown when the server cannot process the request due to client-side errors (e.g., invalid input).
*
* @param {string} [errorMessage] - Optional custom error message. Defaults to "Bad Request Error".
*/
export class BadRequestError extends HttpError {
  constructor( errorMessage : string = "Bad Request Error") {
    super(400, errorMessage);
    this.name = "Bad Request Error";
  }
}

/**
 * Throws new Internal Server Error - Represents an 500 http error
 * 
 * This error is thrown when the server encounters an unexpected condition that prevents it from fulfilling the request.
 * 
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Internal Server Error".
 */
export class InternalServerError extends HttpError {
  constructor(errorMessage: string = 'Internal server Error') {
    super(500, errorMessage);
    this.name = "Internal Server Error";
  }
}

/**
 * Throws new Unauthorized Error - Represents a 401 HTTP error
 *
 * This error is thrown when the client makes a request that requires authentication but fails to provide valid credentials.
 *
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Unauthorized".
 */
export class UnauthorizedError extends HttpError {
  constructor(errorMessage = 'Unauthorized Error') {
    super(401, errorMessage);
  }
}

/**
 * Throws new Forbidden Error - Represents a 403 HTTP error
 * 
 * This error is thrown when the client is authenticated but does not have the necessary permissions to access the requested resource.
 * 
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Forbidden".
 */
export class ForbiddenError extends HttpError {
  constructor(errorMessage = 'Forbidden Error') {
    super(403, errorMessage);
  }
}