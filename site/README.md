## Site (Vite + React)

This directory contains the web app for the `website` component.

### Local development

Install dependencies:

```bash
cd /Users/Lucas/GitHub/rx-refill-reminders/website/site
npm install
```

Set up environment variables:

```bash
cp .env.example .env
```

Run the dev server:

```bash
npm run dev
```

### Cognito login flow

- The home page (`/`) has a **Login** button which starts the OAuth PKCE redirect to Cognito.
- Cognito redirects back to `/callback?code=...&state=...`.
- The callback page exchanges the authorization code for tokens and stores them in `localStorage`.

Required env vars:
- `VITE_COGNITO_DOMAIN`
- `VITE_COGNITO_CLIENT_ID`

