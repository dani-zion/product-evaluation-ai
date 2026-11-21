# Sign-in

## Scope
- Frontend
- Backend

## Context
- Build the feature to allow users to access the platform
- The page/component should ask for:
     - Email
     - Password

## Functional Requirements
- Add client-side form validation
    - Only make the API request if form is valid
- If something goes wrong on the authentication process, display a generic error message
- Authenticate against the `account` table
- The request should be a `POST` to `/api/v1/sign-in` and receive a JSON body
- If everything works, return `200` http status code and create a new Next.js session with cookies, if not, the respective errors:
    - '400': Bad input
    - '401': credential fail
- If user are not authenticated, display the login button on the head
- If user are authenticated, display an avatar, with first and last name and email
    - You can use Dicebar (https://www.dicebear.com/) as avatar mockup

## Non-functional requirements 
- UI/UX: Great user experience with a modern and elegant design. Use your frontend skill
- New account creation should be fast

## Do's
- Create the base layout for the entire platform, keep the dark mode and keep it clean and safe
- Create the home empty for now
- New endpoint for authentication '/api/v1/sign-in'
- New page for authentication

## Don't Do's
- Implement anything not related with sign-in
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
- The sign-in page contains a form with validation
- The frontend could make a request to the backend and receive and parse the response
- Inform possible errors with a red alert on the form
-  Navigate to `/` home page in success cases

## Result
- Users can access their accounts/profiles