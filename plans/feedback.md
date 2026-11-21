# Plan: Feedback (product details and evaluations)

Spec: [specs/feedback.md](../specs/feedback.md)
Wave: 2. Starts after [sign-in](sign-in.md) and [home](home.md) are merged and verified. It uses their shared contracts: `getSession` and `protectedProcedure` from sign-in, and `ProductService.getById` from home.

## Goal
`/products/{id}` shows the product's details, then every evaluation of it, then a form for adding one. Signed-in users can add an evaluation, which is a score from 1 to 5 and a comment. Visitors see a block asking them to sign in.

## Decisions that fill gaps in the spec
| Topic | Decision | Why |
|---|---|---|
| Missing columns | Add `product_id` and `account_id` to `product_feedback`. `product_id` references products and cascades on delete. `account_id` references accounts. | The spec's table has no link to a product or an author, so evaluations couldn't be listed per product. |
| Score | `smallint not null`, with a check of 1–5. | — |
| Comment | `text not null`, 3–1,000 characters after trimming. | — |
| Author shown publicly | First name plus last initial ("Ada L.") and the DiceBear avatar seeded with the account id. The email is never exposed. | — |
| Several evaluations per user | Allowed. | The spec doesn't restrict it. **Tell me if you want one per user per product.** |
| `products.score` | Kept equal to the rounded average of the product's evaluations by a database trigger on insert and delete. The details page also shows the exact average ("4.3 from 12 evaluations"), computed from the list. | Home cards get a real score without extra queries. **Needs your OK.** |
| Listing | `GET` returns all evaluations of a product, newest first, as the spec says. There is no pagination for now. | — |
| Speed | Use an optimistic insert: the new evaluation appears at the top of the list immediately, and the list rolls back with an error alert if the request fails. | — |

## Database
`supabase/migrations/20261121000100_create_product_feedback.sql` creates the `product_feedback` table:
- **Columns:**
  - `id text primary key`
  - `product_id text not null references products(id) on delete cascade`
  - `account_id text not null references accounts(id)`
  - `score smallint not null check (score between 1 and 5)`
  - `comment text not null check (char_length(comment) between 3 and 1000)`
  - `created_at timestamptz not null default now()`
- **Index:** on `(product_id, created_at desc)`.
- **Score trigger:** recomputes `products.score` with `round(avg(score))` after an insert or delete.
- **Access:** RLS enabled with no policies.

## API
`GET /api/v1/evaluations?productId=<id>`:
- **200** `{ items: Evaluation[] }`, newest first. `items` is `[]` when the product has no evaluations.
- **400** when `productId` is missing.
- **404** when the product doesn't exist.

`POST /api/v1/evaluations`:
- Request body: `{ productId, score, comment }`.
- Requires the session cookie.
- **201** `{ evaluation }`.
- **400** `{ error, fieldErrors? }`.
- **401** when the caller isn't signed in.
- **404** when the product is unknown.
- **500**.

`Evaluation`:
```ts
{
  id: string;
  productId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  author: { id: string; displayName: string };
}
```

tRPC:
- `evaluations.list({ productId })` is a public procedure.
- `evaluations.create({ productId, score, comment })` is a `protectedProcedure`. It uses the same service and the same errors.

## Files
- **Schemas:** `src/features/evaluations/schemas.ts`.
- **Repository:** `src/server/repositories/evaluation-repository.ts`, which joins accounts for the author's name. Its in-memory version is `src/test/in-memory-evaluation-repository.ts`.
- **Service:** `src/server/services/evaluation-service.ts`, which checks that the product exists through `ProductService.getById`. Add a test, and register the service in `container.ts`.
- **REST:**
  - `src/server/http/evaluations-handler.ts`, with tests.
  - `src/app/api/v1/evaluations/route.ts`, which reads the session with `getSession()`.
- **tRPC:** `src/server/trpc/routers/evaluations.ts`, with a test, registered in `_app.ts`.
- **Page:** `src/app/products/[id]/page.tsx`, which is a server component.
  - It loads the product and calls `notFound()` when the product is missing.
  - It uses `generateMetadata`, setting the title to "{name} | Product Evaluation AI".
  - Add `not-found.tsx` with a link back to products.
- **Components** in `src/features/evaluations/components/`:
  - `product-details.tsx`
  - `evaluation-list.tsx`
  - `evaluation-item.tsx`
  - `evaluation-form.tsx`
  - `score-input.tsx`
  - `sign-in-prompt.tsx`
- **Shadcn:** `bunx shadcn add textarea` if it's missing.

## UI and UX
Follow the existing design system in `src/app/globals.css`: dark plum, the marker highlight, Bricolage, left-aligned.
- **Product header:** a "← All products" back link, the image (or the same placeholder the home cards use), the name in the display font, and the description. Also show "View on store", an external link that opens in a new tab with `rel="noopener noreferrer nofollow"`. The score summary goes in a marker highlight, for example "4.3 / 5 · 12 evaluations", or "No evaluations yet".
- **Evaluation list:**
  - Each item shows the author's avatar and display name, the score as 5 small filled or empty marks, and a relative date from date-fns ("3 days ago", with the full date in a `title`), followed by the comment.
  - When the product has no evaluations, the list shows: "No evaluations yet. Be the first."
- **Form for signed-in users** (below the list, as the spec orders):
  - **Score input:** five large choices built as a radio group. It uses arrow keys, has visible focus, and each choice has a label such as "3 out of 5". It must be at least 44px tall.
  - **Comment:** a textarea with a live character counter ("120 / 1000").
  - **Validation:** RHF with `zodResolver` and `mode: "onTouched"`. Show field errors, and a red `Alert` for server errors.
  - **Submit:** a button labelled "Add evaluation", or "Adding" while pending.
  - **On success:** reset the form, add the new item optimistically, and show a toast reading "Evaluation added".
- **Visitors:** see a quiet block reading "Sign in to add your evaluation" with a "Sign in" button that links to `/auth/sign-in?next=/products/{id}`, and a secondary "Create account" link.
- **Session handling:** the page reads the session on the server inside `<Suspense>` because cacheComponents is on. It passes a boolean to choose between the form and the prompt. The browser never decides on its own whether the user is signed in.

## Tests
- **Schema:**
  - The score must be from 1 to 5; 0 and 6 are rejected.
  - The comment is trimmed, then checked for its length limits.
- **Service:**
  - Creating an evaluation for an unknown product throws `ProductNotFoundError`.
  - Lists are ordered newest first.
  - The author's display name is formatted correctly.
- **REST GET:** returns 200 with an empty array, 200 with items, 400 when `productId` is missing, and 404.
- **REST POST:** returns 201, 400, 401 without a session, and 404.
- **tRPC:** `create` without a session returns `UNAUTHORIZED`.

## Done when
- `bun run lint`, `bun run typecheck`, `bun run test` and `bun run build` all pass.
- `/products/{id}` renders for products in the in-memory repository, and an unknown id shows the not-found page.
- The migration is written. **Do not apply it.**

## Rules for the executing agent
- Don't connect to or write to the real Supabase project.
- Don't edit the session, sign-in or home code apart from registering routers and services. Report any change you need in those areas instead of making it.
- If you start a dev server, use port **3203**. Never stop processes you didn't start.
- Don't commit. Report the changed files and any deviations from this plan.
