# Product Evaluation AI

Next.js app (front-end + API). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the stack and [specs/](specs/) for features.

## Setup

1. Install [Bun](https://bun.sh), then dependencies:
   ```sh
   bun install
   ```
2. Create the database tables: run the files in [supabase/migrations/](supabase/migrations/) in order in the Supabase SQL editor (or `supabase db push` with the Supabase CLI). Optionally run [supabase/seed.sql](supabase/seed.sql) to add about 30 fictional products to the home page.
3. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, from Supabase: Project Settings > API.
   - `SESSION_SECRET`, which signs the session cookie. Use at least 32 characters, for example the output of `openssl rand -base64 32`. Changing it signs everyone out. Without it, sign-in fails with a 500 error.
   - `PRODUCTS_API_KEY`, a long random string (`openssl rand -base64 32`), only if external clients will create products.
4. Start the dev server and open http://localhost:3000:
   ```sh
   bun run dev
   ```

## Products API

`GET /api/v1/products?limit=12&cursor=<nextCursor>` is public and returns `{ items, nextCursor }`, newest first. Pass the `nextCursor` of one page to get the next; it is `null` on the last page.

`POST /api/v1/products` creates a product. It requires `Authorization: Bearer <PRODUCTS_API_KEY>` and a JSON body `{ name, description?, imageUrl?, externalLink }` (`imageUrl` must be `https://`). It returns `201 { product }`.

```sh
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $PRODUCTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kettle","externalLink":"https://shop.example.com/kettle"}'
```

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Development server |
| `bun run build` / `bun run start` | Production build / server |
| `bun run test` | Unit and API tests (Vitest) |
| `bun run typecheck` | TypeScript check |
| `bun run lint` | Biome lint + format check |

## Project structure

```
src/
  app/                 routes (pages + API route handlers), kept thin
    api/v1/sign-up/    REST endpoints (also sign-in/ and sign-out/)
    api/v1/products/   REST endpoint (list, create)
    api/trpc/[trpc]/   tRPC endpoint (used by the front-end)
    auth/sign-up/      sign-up page and success page
    auth/sign-in/      sign-in page
  components/          site header, account menu and avatar
  components/ui/       Shadcn components (generated)
  features/auth/       sign-up and sign-in forms, hooks and shared Zod schemas
  features/products/   home product grid, hook and shared Zod schema
  server/              server-only code
    auth/              session cookie (signed JWT)
    services/          business logic (shared by REST and tRPC)
    repositories/      database access (Supabase)
    trpc/              tRPC setup and routers
    http/              REST handlers
  lib/                 helpers (password hashing, ids, tRPC client)
supabase/migrations/   SQL migrations
supabase/seed.sql      sample products (optional)
```
