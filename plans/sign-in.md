# Plan: Sign-in

Spec: [specs/sign-in.md](../specs/sign-in.md)
Wave: 1, runs in parallel with [home](home.md). [feedback](feedback.md) depends on this plan.

## Goal
Signed-up users can sign in with email and password. A successful sign-in creates a session stored in a cookie. The header shows a "Sign in" button to visitors and an avatar with name and email to signed-in users.

## Decisions that fill gaps in the spec
| Topic | Decision | Why |
|---|---|---|
| Session storage | A stateless signed JWT (HS256, `jose`) in an HttpOnly cookie. There is no sessions table. | The spec scope is frontend and backend only, with no database work. |
| Cookie | Named `pe_session`. Flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production. Max age 7 days. | The cookie can't be read by scripts and isn't sent on cross-site POSTs. |
| Secret | A new env var, `SESSION_SECRET` (at least 32 characters). If it's missing, fail loudly at sign-in time, not at import. | `next build` must still work without env vars. |
| Session payload | `{ sub: accountId, firstName, lastName, email }`. No password data. | The header renders from the payload without querying the database. |
| Wrong email, wrong password and inactive account | All three return the same 401 and the message "Email or password is incorrect." When the email doesn't exist, the server still runs a bcrypt compare against a dummy hash. | This stops attackers from finding out which emails have accounts, whether by the message or by response time. |
| Avatar | Generated locally with `@dicebear/core` and `@dicebear/collection`, seeded with the account id, and rendered as an inline SVG data URI. | No user data is sent to a third-party URL. |
| Sign-out | Include a minimal sign-out: `POST /api/v1/sign-out` plus a "Sign out" item in the avatar menu. | Without it, users have no way to leave a session. **Needs your OK, since the spec doesn't list it.** |
| `?next=` redirect | `/auth/sign-in?next=/products/abc` returns the user to that page after sign-in. Only same-site relative paths are accepted, so the value must start with `/` and not with `//`. Otherwise the user goes to `/`. | [feedback](feedback.md) uses it for its "Sign in to add your evaluation" link. |
| Home page | **Do not edit `src/app/page.tsx`.** The spec's "create the home empty" is replaced by [home](home.md). | That avoids a conflict with the other Wave 1 agent. |

## API
`POST /api/v1/sign-in`, with a JSON body of `{ email, password }`:
- **200** `{ account: { id, firstName, lastName, email } }`, and the response sets the `pe_session` cookie.
- **400** `{ error, fieldErrors? }` for invalid JSON or a body that fails validation.
- **401** `{ error: "Email or password is incorrect." }`.
- **500** `{ error: "We couldn't sign you in. Try again in a moment." }`. The spec doesn't list this status. It is reported the same way as the 500 already used for sign-up.

`POST /api/v1/sign-out` returns 204 and clears the cookie.

tRPC (used by the front end), with the same service and the same errors:
- `auth.signIn`: duplicate of the REST endpoint. It returns `UNAUTHORIZED` on bad credentials and sets the cookie through `cookies()` from `next/headers`.
- `auth.signOut`.
- `auth.me`: returns the session account or `null`.

## Shared contract (other plans depend on this; keep the names)
- `src/server/auth/session.ts` (`server-only`). These exports are frozen:
  - `createSessionToken(account)`
  - `verifySessionToken(token)`
  - `getSession(): Promise<Session | null>`, which reads the cookie
  - `setSessionCookie(token)`
  - `clearSessionCookie()`
  - `type Session = { accountId: string; firstName: string; lastName: string; email: string }`
- `src/server/trpc/init.ts`:
  - the context gains `session: Session | null`;
  - a new `protectedProcedure` throws `UNAUTHORIZED` when there is no session and narrows `ctx.session` to non-null;
  - `createTRPCContext` becomes async and reads the session.
- `src/components/user-avatar.tsx`: exports `<UserAvatar seed name size />`, which renders the DiceBear SVG.

## Files
New:
- `src/features/auth/schemas.ts`: add `signInSchema`. Email is trimmed, lowercased and must be a valid email. The password is required, with a 72-byte maximum.
- `src/server/auth/session.ts`, plus its tests.
- Repository: add `findByEmail(email)` to the `AccountRepository` interface, the Supabase implementation and `src/test/in-memory-account-repository.ts`.
- `src/server/services/account-service.ts`: add `signIn({ email, password })`. It returns a `PublicAccount` or throws `InvalidCredentialsError`, which goes in `src/server/errors.ts`.
- `src/server/http/sign-in-handler.ts` and `sign-out-handler.ts`, plus their tests.
- Routes: `src/app/api/v1/sign-in/route.ts` and `src/app/api/v1/sign-out/route.ts`.
- `src/server/trpc/routers/auth.ts`: add `signIn`, `signOut` and `me`, with tests.
- Front end:
  - `src/app/auth/sign-in/page.tsx`
  - `src/features/auth/components/sign-in-form.tsx`
  - `src/features/auth/hooks/use-sign-in.ts`
- Header:
  - `src/components/site-header.tsx` becomes an async server component that reads the session inside `<Suspense>` (cacheComponents is on).
  - `src/components/user-menu.tsx` is a client component that shows the avatar, full name, email and "Sign out".
- `bunx shadcn add avatar dropdown-menu` as needed.
- `.env.example`: add `SESSION_SECRET=` with a comment explaining how to generate it (`openssl rand -base64 32`).
- README: document the new env var.

## UI and UX
Follow the existing design system in `src/app/globals.css`: dark plum, the marker highlight, Bricolage, left-aligned. Copy the layout of `src/app/auth/sign-up/page.tsx`.
- Page title: "Sign in | Product Evaluation AI". Heading: "Welcome back."
- Fields: Email and Password. The password field reuses `PasswordInput` with its show/hide toggle.
- Validation: RHF with `zodResolver`, `mode: "onTouched"`, and focus on the first invalid field. No request is sent while the form is invalid.
- Errors: a red `Alert` above the form with the generic message (destructive tokens), as in the sign-up form.
- Submit button: "Sign in", or "Signing in" while the request is pending.
- On success:
  - `router.replace(next ?? "/")` and then `router.refresh()`, so the header re-renders;
  - no toast is needed.
- Cross-links between pages:
  - sign-in links to sign-up: "No account yet? Create one";
  - sign-up links to sign-in: "Already have an account? Sign in". This is a one-line change to the sign-up page.
- Header for visitors: a "Sign in" button on the right, styled as the outline/ghost button. It is hidden on `/auth/*` pages.
- Header for signed-in users:
  - Show the avatar button. Its menu shows the full name, the email and "Sign out".
  - Show the name next to the avatar at sm+ widths.
  - The avatar has a 40px hit area and an `aria-label` of "Account menu for {name}".
- If a signed-in user visits `/auth/sign-in`, redirect them to `/`.
- Read `node_modules/next/dist/docs/01-app/02-guides/authentication.md`, `authentication-with-cache-components.md` and `03-api-reference/04-functions/cookies.md` before writing session code.

## Tests (Vitest, in-memory repository, no network)
- Schema: invalid email, empty password.
- Session: a token round-trips; a tampered or expired token returns `null`.
- Service:
  - correct credentials return the public account with no password or salt;
  - a wrong password, an unknown email and an inactive account all throw `InvalidCredentialsError`.
- REST handler: 200 sets a cookie with `HttpOnly` and `SameSite=Lax`; 400 for bad JSON and invalid fields; 401; 500.
- tRPC:
  - `signIn` and `me` behave as specified;
  - `protectedProcedure` rejects calls without a session.
- `next` sanitiser: `/products/x` is allowed; `//evil.com`, `https://evil.com` and `javascript:` are rejected.

## Done when
- `bun run lint`, `bun run typecheck`, `bun run test` and `bun run build` all pass.
- `/auth/sign-in` renders.
- The header switches between the visitor and signed-in states. This is verified by unit tests of the header logic and by a manual run with a hand-made cookie, without using the real database.
- No changes outside the files listed above.

## Rules for the executing agent
- Don't connect to or write to the real Supabase project, and don't create real accounts.
- If you start a dev server, use port **3201**. Never stop processes you didn't start.
- Don't commit. Report the changed files and any deviations from this plan.
