import "server-only";
import { z } from "zod";
import { signUpSchema } from "@/features/auth/schemas";
import { EmailAlreadyInUseError } from "@/server/errors";
import type { AccountService } from "@/server/services/account-service";

/**
 * POST /api/v1/sign-up
 * - 201 with the created account
 * - 400 for invalid JSON, invalid fields, or an email that is already in use
 * - 500 for unexpected server errors (e.g. database unavailable)
 */
export function createSignUpHandler(getService: () => AccountService) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid sign-up data",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const account = await getService().signUp(parsed.data);
      return Response.json({ account }, { status: 201 });
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.error("sign-up failed", error);
      return Response.json(
        { error: "We couldn't create your account. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}
