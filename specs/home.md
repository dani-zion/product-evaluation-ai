# Home

## Scope
- Frontend
- Backend
- Databaseß

## Context
- Build the feature to list the products to be evaluated

## Functional Requirements
- The home page should list the products with infinite loading pagingation
    - Each product should show the title, image and a brief description
- Create the `product` table on the database to store products:
    - id: nanoid (API generated)
    - name: text
    - description: text (optional)
    - created_at: timestamp
    - updated_at: timestamp
    - score: int
    - external_link: text
    - image: ?
- To list the products, make a request to (GET) to `/api/v1/products`
- If case everything works fine, should return `200` http status code or an empty array
- Clicking on the product should redirect to the product details page (we will build this later)

## Non-functional requirements
- UI/UX: Great user experience with a modern and elegant design. Use your frontend skill
- Product creation should be fast

## Do's
- Create a new endpoint on the backend to list all the products `/api/v1/products`
    - The new products endpoint should allow create bew products ass well (`POST`)
- Improve the existing home or create a new one, without evaluation examples
- Create the new `product` table on the database
- Create the nbew migration for Supabase


## Don't Do's
- Implement anything not related with home page
- Send any notification

## Technology (Stack)
- React.js: React-Hook-Form
- Next.js
- Shadcn
- Tailwind
- Supabase
- TRCP
- Bun.js

## Acceptance criteria
- Home page with the paginated list of all the existing products with infinite loading (scrolling)

## Result
- Users can see the list of products (paginated with infinite loading) in a public way, without require authentication
- Unatuhenticated users can`t create new evaluationsß