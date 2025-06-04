/**
 * Base class for HTTP-related errors.
 * 
 * This class is used as a base for specific HTTP errors, encapsulating an error message and a status code.
 * 
 * @param {string} [errorMessage] - The error message describing the issue.
 * @param {number} [statusCode] - The HTTP status code associated with the error.
 * @param {string} [error] - The HTTP status code associated with the error.
 */
export class HttpErrors extends Error {
  public error : string;
  constructor(public statusCode: number, public errorMessage: string, error : string) {
    super(errorMessage || 'Error not especified');
    this.statusCode = statusCode;
    this.error = error;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

/**
* Throws new Not Found Error - Represents an 404 http error
*
* This error is thrown when a requested resource cannot be found.
*
* @param {string} [errorMessage] - Optional custom error message. Defaults to "Not Found Error".
*/
export class NotFoundError extends HttpErrors {
  constructor( errorMessage : string = "Not found Error") {
    super(404, errorMessage, 'Not Found');
  }
}

/**
* Throws new Bad Request Error - Represents an 400 http error
*
* This error is thrown when the server cannot process the request due to client-side errors (e.g., invalid input).
*
* @param {string} [errorMessage] - Optional custom error message. Defaults to "Bad Request Error".
*/
export class BadRequestError extends HttpErrors {
  constructor( errorMessage : string = "Bad Request Error") {
    super(400, errorMessage, 'Bad Request');
  }
}

/**
 * Throws new Internal Server Error - Represents an 500 http error
 * 
 * This error is thrown when the server encounters an unexpected condition that prevents it from fulfilling the request.
 * 
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Internal Server Error".
 */
export class InternalServerError extends HttpErrors {
  constructor(errorMessage: string = 'Internal server Error') {
    super(500, errorMessage, 'Internal Server Error');
  }
}

/**
 * Throws new Unauthorized Error - Represents a 401 HTTP error
 *
 * This error is thrown when the client makes a request that requires authentication but fails to provide valid credentials.
 *
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Unauthorized".
 */
export class UnauthorizedError extends HttpErrors {
  constructor(errorMessage = 'Unauthorized Error') {
    super(401, errorMessage, 'Unauthorized');
  }
}

/**
 * Throws new Forbidden Error - Represents a 403 HTTP error
 * 
 * This error is thrown when the client is authenticated but does not have the necessary permissions to access the requested resource.
 * 
 * @param {string} [errorMessage] - Optional custom error message. Defaults to "Forbidden".
 */
export class ForbiddenError extends HttpErrors {
  constructor(errorMessage = 'Forbidden Error') {
    super(403, errorMessage, 'Forbidden');
  }
}

/**
 * Throws new Not Implemented Error - Represents a 501 HTTP error
 * 
 * This error is thrown to indicate that a requested HTTP operation is not implemented.
 *
 * @param {string} errorMessage - Optional custom error message. Defaults to 'Not Implemented Error'.
 */
export class NotImplementedError extends HttpErrors {
  constructor(errorMessage = 'Not Implemented Error') {
    super(501, errorMessage, 'Not Implemented');
  }
}

/**
 * Throws new Bad Gateway error - Representes a 502 HTTP error.
 * 
 * This exception should be thrown when a server acting as a gateway or proxy
 * receives an invalid response from the upstream server.
 *
 * @param {string} errorMessage - Optional custom error message. Defaults to 'Bad Gateway Error'.
 */
export class BadGatewayError extends HttpErrors {
  constructor(errorMessage = 'Bad Gateway Error') {
    super(502, errorMessage, 'Bad Gateway');
  }
}

/**
 * Throws new Service Unavailable Error - Represents a 503 HTTP error.
 * 
 * Thrown when a service is temporarily unavailable, typically due to maintenance or overload.
 *
 * @example
 * throw new ServiceUnavailableError('Database is down for maintenance');
 *
 * @param errorMessage - Optional custom error message. Defaults to 'Service Unavailable Error'.
 */
export class ServiceUnavailableError extends HttpErrors {
  constructor(errorMessage = 'Service Unavailable Error') {
    super(503, errorMessage, 'Service Unavailable');
  }
}