import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { signInSchema } from "@/features/auth/schemas";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/server/auth/session";
import { InvalidCredentialsError } from "@/server/errors";
import type { AccountService } from "@/server/services/account-service";

/**
 * POST /api/v1/sign-in
 * - 200 with the account, and sets the session cookie
 * - 400 for invalid JSON or invalid fields
 * - 401 for a wrong email or password, or an inactive account
 * - 500 for unexpected server errors (e.g. database unavailable)
 */
export function createSignInHandler(getService: () => AccountService) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid sign-in data",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const { id, firstName, lastName, email } = await getService().signIn(
        parsed.data,
      );
      const account = { id, firstName, lastName, email };
      const token = await createSessionToken(account);

      const response = NextResponse.json({ account }, { status: 200 });
      response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
      return response;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      console.error("sign-in failed", error);
      return NextResponse.json(
        { error: "We couldn't sign you in. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}
