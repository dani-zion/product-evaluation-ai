<p align="center">
  <img src="src/app/icon.svg" alt="Tally robot logo" width="112" height="112">
</p>

<h1 align="center">Tally</h1>

<p align="center"><strong>Reads the reviews so you can buy with confidence.</strong></p>

<p align="center">
  <a href="#getting-started">Getting started</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#api">API</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#project-structure">Project structure</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="docs/ARCHITECTURE.md">Architecture</a>
</p>

---

Tally helps shoppers decide before they buy. It collects products from online stores, shows them in one place, and lets people score them and say what they think, so the next shopper gets a clear answer instead of a wall of reviews.

## What you can do

- **Browse products.** The home page lists every product, with its image, a short description and its score. More load as you scroll, and no account is needed.
- **See what people think.** Each product page shows the average score, every evaluation, and a link to buy it in the store.
- **Read Tally's summary.** An AI agent reads a product's evaluations and sums them up in one sentence, with what people like and what to watch for.
- **Add your evaluation.** Signed-in users give a score from 1 to 5 and a comment. It appears instantly, and the product's score updates.
- **Bring in products automatically.** An [n8n](https://n8n.io) workflow scrapes store pages and sends products to Tally's API, protected by an API key.

## How it works

1. An n8n workflow reads a store page and sends each product (name, link, image) to `POST /api/v1/products`.
2. The products appear on the home page.
3. Shoppers open a product, read the evaluations, and add their own after signing in.
4. Each new evaluation updates the product's average score, and Tally's AI agent writes a fresh summary of the evaluations on the next visit.

## Built with

| Area | Tools |
|---|---|
| App | [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on Base UI, Bricolage Grotesque |
| Data fetching | tRPC 11 with TanStack Query, plus REST endpoints for external clients |
| Forms and validation | React Hook Form, Zod |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| AI | [Mastra](https://mastra.ai) agent with OpenAI `gpt-4o-mini` |
| Auth | bcrypt password hashing, signed JWT session in an HttpOnly cookie |
| Tooling | [Bun](https://bun.sh), Vitest, Biome |
| Hosting and automation | Vercel, n8n |

## Getting started

You need [Bun](https://bun.sh) and a [Supabase](https://supabase.com) project.

**1. Install dependencies**

```sh
bun install
```

**2. Create the database tables**

In the Supabase SQL editor, run the files in [`supabase/migrations/`](supabase/migrations/) in order, or use `supabase db push` with the Supabase CLI.

Optionally, run [`supabase/seed.sql`](supabase/seed.sql) to add 32 sample products to the home page.

**3. Add your settings**

Copy `.env.example` to `.env.local` and fill in:

| Variable | What it's for |
|---|---|
| `SUPABASE_URL` | Your project's URL, from Supabase: Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | The server key from the same page. Keep it secret: it is only used on the server |
| `SESSION_SECRET` | Signs the sign-in cookie. Use at least 32 characters. Changing it signs everyone out |
| `PRODUCTS_API_KEY` | Lets n8n and other clients create products. Only needed if you import products |
| `OPENAI_API_KEY` | Lets the AI agent write product summaries. Without it, product pages say the summary isn't available |
| `PRODUCT_SUMMARY_MODEL` | Optional. The model for summaries, such as `openai/gpt-4.1-mini`. Defaults to `openai/gpt-4o-mini` |

Generate `SESSION_SECRET` and `PRODUCTS_API_KEY` with:

```sh
openssl rand -base64 32
```

**4. Start the app**

```sh
bun run dev
```

Then open http://localhost:3000.

## API

The app and its API run on the same server. The REST endpoints below are for external clients such as n8n; the app's own pages use tRPC, and both call the same services.

| Method and path | Access | What it does |
|---|---|---|
| `GET /api/v1/products?limit=12&cursor=…` | Public | Lists products, newest first, one page at a time |
| `POST /api/v1/products` | API key | Creates a product |
| `GET /api/v1/evaluations?productId=…` | Public | Lists a product's evaluations, newest first |
| `POST /api/v1/evaluations` | Signed in | Adds an evaluation (`productId`, `score` 1–5, `comment`) |
| `POST /api/v1/sign-up` | Public | Creates an account |
| `POST /api/v1/sign-in` | Public | Signs in and sets the session cookie |
| `POST /api/v1/sign-out` | Public | Clears the session cookie |

### Adding a product

Send the API key as a bearer token, with a JSON body:

| Field | Required | Rules |
|---|---|---|
| `name` | Yes | 1 to 200 characters |
| `link` | Yes | Absolute `http://` or `https://` URL of the product page |
| `image` | No | Absolute `https://` URL of the product image |
| `description` | No | Up to 2,000 characters |

```sh
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $PRODUCTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kettle","link":"https://shop.example.com/kettle","image":"https://cdn.example.com/kettle.jpg"}'
```

It returns `201` with the new product. A missing or wrong key returns `401`, and invalid fields return `400` with a message for each field.

To go through the list, pass the `nextCursor` from one page as `cursor` to get the next. It is `null` on the last page.

> [!TIP]
> Calling the API from n8n running in Docker? Use `http://host.docker.internal:3000` instead of `localhost`, which points at the n8n container itself.

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Starts the development server |
| `bun run build` | Builds for production |
| `bun run start` | Runs the production build |
| `bun run test` | Runs the unit and API tests (Vitest) |
| `bun run typecheck` | Checks types |
| `bun run lint` | Checks linting and formatting (Biome) |

## Project structure

```
src/
  app/                     pages and API routes, kept thin
    page.tsx               home: the product list
    products/[id]/         product page with evaluations
    auth/sign-in/          sign-in page
    auth/sign-up/          sign-up and success pages
    api/v1/                REST endpoints (products, evaluations, sign-up, sign-in, sign-out)
    api/trpc/[trpc]/       tRPC endpoint used by the pages
    icon.svg               favicon
  components/              header, Tally logo, account menu, avatar
  components/ui/           shadcn/ui components (generated)
  features/
    summaries/             Tally's AI summary panel and its schema
    auth/                  sign-in and sign-up forms, hooks, schemas
    products/              product grid and cards, schemas
    evaluations/           product page, evaluation list and form, schemas
  server/                  server-only code
    ai/                    Mastra summary agent and its cache
    services/              business logic, shared by REST and tRPC
    repositories/          database access (Supabase)
    http/                  REST handlers
    trpc/                  tRPC setup and routers
    auth/                  session cookie
  lib/                     helpers: password hashing, ids, tRPC client
supabase/
  migrations/              database tables, in order
  seed.sql                 sample products (optional)
specs/                     feature specs
plans/                     implementation plans for each spec
```

## Learn more

- [Architecture](docs/ARCHITECTURE.md): the stack and how the layers fit together
- [Specs](specs/): what each feature does and how it is accepted
