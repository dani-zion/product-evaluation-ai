# Feedback

## Scope
- Frontend
- Backend
- Database

## Context
- This feature should allow authenticated users to create new product evaluations

## Functional Requirements
- If users not logged in, display a block asking for authentication to include new evaluations
- If user are authenticated (logged in), display the evaluation form, allowgin them to include new evaluations 
    - Each evaluation must have a score (1 - 5) and a comment
- Evaluation form should have the following structure:
    - table: product_feedback
        - id: nanoid
        - score: int
        - comment: text
        - created_at: timestamp
- The page/component should list all evaluations for the product, and after displays the form to include new evaluations

## Non-functional requirements
- UI/UX: Great user experience with a modern and elegant design. Use your frontend skill
- Evaluation creation process should be fast

## Do's
- Create the new endpoint `api/v1/evaluations` to include new evaluations (POST) and retrieve the ecisting ones (GET)
- Create a new component/page for product details '/products/id'

## Don't Do's
- Implement anything not related with feedback page
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
- Product details page showing product details + evaluations + form to include new evaluation