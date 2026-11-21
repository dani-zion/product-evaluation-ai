import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected
// instead of being silently truncated.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be at most 100 characters`);

/**
 * Sign-up input, shared by the form (client validation) and the API
 * (server validation) so both always apply the same rules.
 */
export const signUpSchema = z
  .object({
    firstName: name("First name"),
    lastName: name("Last name"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address")),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      )
      .refine(
        (value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES,
        "Password is too long",
      ),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.input<typeof signUpSchema>;
export type SignUpInput = z.output<typeof signUpSchema>;
