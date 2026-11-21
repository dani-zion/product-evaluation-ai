import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validSignUp } from "@/test/in-memory-account-repository";
import { signInSchema, signUpSchema } from "./schemas";

function fieldErrors(input: unknown) {
  const result = signUpSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("signUpSchema", () => {
  it("accepts valid data", () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it("trims names and normalizes the email to lowercase", () => {
    const data = signUpSchema.parse({
      ...validSignUp,
      firstName: "  Ada ",
      lastName: " Lovelace  ",
      email: "  Ada@Example.COM ",
    });
    expect(data.firstName).toBe("Ada");
    expect(data.lastName).toBe("Lovelace");
    expect(data.email).toBe("ada@example.com");
  });

  it("requires first and last name separately", () => {
    const errors = fieldErrors({
      ...validSignUp,
      firstName: " ",
      lastName: "",
    });
    expect(errors.firstName).toEqual(["First name is required"]);
    expect(errors.lastName).toEqual(["Last name is required"]);
  });

  it("rejects an invalid email", () => {
    expect(
      fieldErrors({ ...validSignUp, email: "not-an-email" }).email,
    ).toEqual(["Enter a valid email address"]);
  });

  it("rejects a password shorter than 8 characters", () => {
    const errors = fieldErrors({
      ...validSignUp,
      password: "short",
      confirmPassword: "short",
    });
    expect(errors.password).toEqual(["Password must be at least 8 characters"]);
  });

  it("rejects a password longer than bcrypt's 72-byte limit", () => {
    const long = "a".repeat(73);
    const errors = fieldErrors({
      ...validSignUp,
      password: long,
      confirmPassword: long,
    });
    expect(errors.password).toEqual(["Password is too long"]);
  });

  it("rejects a confirmation that does not match", () => {
    const errors = fieldErrors({
      ...validSignUp,
      confirmPassword: "something-else",
    });
    expect(errors.confirmPassword).toEqual(["Passwords do not match"]);
  });
});

describe("signInSchema", () => {
  const valid = { email: "ada@example.com", password: "correct-horse-battery" };

  function signInErrors(input: unknown) {
    const result = signInSchema.safeParse(input);
    return result.success ? {} : z.flattenError(result.error).fieldErrors;
  }

  it("accepts valid data and normalizes the email", () => {
    expect(
      signInSchema.parse({ ...valid, email: " Ada@Example.COM " }),
    ).toEqual(valid);
  });

  it("rejects an invalid email", () => {
    expect(signInErrors({ ...valid, email: "not-an-email" }).email).toEqual([
      "Enter a valid email address",
    ]);
  });

  it("rejects an empty password", () => {
    expect(signInErrors({ ...valid, password: "" }).password).toEqual([
      "Enter your password",
    ]);
  });

  it("rejects a password longer than bcrypt's 72-byte limit", () => {
    expect(
      signInErrors({ ...valid, password: "a".repeat(73) }).password,
    ).toEqual(["Password is too long"]);
  });
});
