/** Thrown when an account with the same email already exists. */
export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("An account with this email already exists. Use a different email.");
    this.name = "EmailAlreadyInUseError";
  }
}

/** Thrown when a products page cursor cannot be decoded. */
export class InvalidCursorError extends Error {
  constructor() {
    super("Invalid cursor. Start again without a cursor.");
    this.name = "InvalidCursorError";
  }
}

/**
 * Thrown when sign-in fails. The same error (and message) is used for an
 * unknown email, a wrong password and an inactive account so callers can't
 * tell which emails have accounts.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email or password is incorrect.");
    this.name = "InvalidCredentialsError";
  }
}

/** Thrown when an evaluation refers to a product that doesn't exist. */
export class ProductNotFoundError extends Error {
  constructor() {
    super("This product doesn't exist. It may have been removed.");
    this.name = "ProductNotFoundError";
  }
}
