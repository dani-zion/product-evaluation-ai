# Sign-Up (account creation)

## Scope
- Front-end, back-end and database

## Context
- Account creation workflow. Users will give:
 - First name
 - Last name
 - Email
 - Password
 - Password confirmation

## Functional Requirements
- We will need form validation on the client side
 - If form is valid, send account creation request to the API
 - First and last name should be separated
 - A new account should be created on the database (accounts table):
  - id: ('nanoid'generated on the API)
  - first_name: text
  - last_name: text
  - created_at: timestamp
  - updated_at: timestamp
  - active: boolean
  - email: text
  - password: text (bcrypt hash of the password, created with the salt below)
  - salt: text (generated with `bcrypt.genSalt(12)` and stored as-is, not hashed)
- Request should be a 'POST' to the '/api/v1/sign-up' and receive the data as JSON on the body
- If it works return success 201 code. Instead return 400 error

## Non-functional requirements
- Use https to prevent network sniff
- Securely store the hashed passwords on the database
- Moderns and elegant UI
- Should be fast

## Do's
- Create the initial backend project with the initial /sign-up endpoint for account creation
- Create the initial frontend project with a start/initial page and account creation page/interface
- Config all base libraries

## Don't Do's
- Implement other features not related with sign-up
- Don`t send any email for while, only create the account

## Technology (Stack)
- React.js, Next.js, React-Hook-Form, Shadcn, Tailwind, Supabase, TRCP, Bunjs

## Acceptance criteria
- When we have a new page/UI to create a new account in `/auth/sign-up`
- The account creation form has validation
- Inform possible errors, with a red alert on the form 
- Navigate to `/auth/sign-up/success` when successfully created the account and also show a popup/alert with a confirmation message

## Result
- Users can create a new account on the platform

