import { CustomError } from "./custom-error";


export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serilizeErrors() {
    return [{ message: "Not Authorized" }];
  }
}