# Product Evaluation AI

Next.js app (front-end + API). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the stack and [specs/](specs/) for features.

## Setup

1. Install [Bun](https://bun.sh), then dependencies:
   ```sh
   bun install
   ```
2. Create the database table: run [supabase/migrations/20261117000000_create_accounts.sql](supabase/migrations/20261117000000_create_accounts.sql) in the Supabase SQL editor (or `supabase db push` with the Supabase CLI).
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Start the dev server and open http://localhost:3000:
   ```sh
   bun run dev
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
    api/v1/sign-up/    REST endpoint
    api/trpc/[trpc]/   tRPC endpoint (used by the front-end)
    auth/sign-up/      sign-up page and success page
  components/ui/       Shadcn components (generated)
  features/auth/       sign-up form, hook and shared Zod schema
  server/              server-only code
    services/          business logic (shared by REST and tRPC)
    repositories/      database access (Supabase)
    trpc/              tRPC setup and routers
    http/              REST handlers
  lib/                 helpers (password hashing, ids, tRPC client)
supabase/migrations/   SQL migrations
```
