/** Thrown when an account with the same email already exists. */
export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("An account with this email already exists. Use a different email.");
    this.name = "EmailAlreadyInUseError";
  }
}
