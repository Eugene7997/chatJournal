# ChatJournal

A conversational journaling app. Instead of staring at a blank page, you journal through natural dialogue — write your thoughts, reflect on past entries, and grow over time.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Auth0
- **Database:** PostgreSQL (Supabase)
- **LLM:** OpenRouter API

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. Supabase)
- An Auth0 application
- An OpenRouter API key

### Environment Variables

Create a `.env` file inside the `frontend/` directory:

```env
# App
APP_BASE_URL=http://localhost:3000

# Auth0
AUTH0_SECRET=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Auth0 M2M (Management API)
AUTH0_M2M_DOMAIN=
AUTH0_M2M_CLIENT_ID=
AUTH0_M2M_CLIENT_SECRET=

# Database
DB_URL=

# LLM
OPENROUTER_API_KEY=

# Playwright test
E2E_AUTH0_USERNAME=
E2E_AUTH0_PASSWORD=
```

### Running Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
frontend/
  src/
    app/
      page.tsx              # Landing page
      layout.tsx            # Root layout
      about/                # About page
      account/              # Account settings
      chat/                 # Main journaling interface
      journals/             # Saved journal entries
      login/                # Login / sign-up
      api/
        auth/delete/        # Account deletion
        chat/
          message/          # GET/POST chat messages (SSE streaming)
          chat_session/     # GET/POST/DELETE/PATCH sessions
          journal/          # POST generate journal entry from session
          save_message/     # POST persist a message
        journals/           # GET/POST journal entries
    components/
      ChatClient.tsx        # Core chat UI
      ChatSideBar.tsx       # Session navigation
      JournalModal.tsx      # Journal entry modal
      JournalsClient.tsx    # Journal list display
      Navbar.tsx            # Top navigation
      NavbarClient.tsx      # Navbar client wrapper
      NavbarProfile.tsx     # Profile section in navbar
      Account.tsx           # Account management
      AuthBox.tsx           # Auth UI
      Footer.tsx            # Footer
      ToastProvider.tsx     # Toast notifications
    lib/
      auth/auth0.ts         # Auth0 client
      db/db.ts              # PostgreSQL connection pool
      prompts/              # LLM system prompt templates
      types/types.tsx       # Shared TypeScript interfaces
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest unit + component tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage report |
| `npx playwright test` | Run all Playwright E2E tests |
| `npx playwright test --project=public` | Run public-page tests only (no credentials needed) |

## Testing

### Jest (unit + component)

Tests live in `frontend/src/__tests__/`. Covers API routes, helper functions, and React components via React Testing Library.

```bash
cd frontend
npm test
```

### Playwright (E2E)

Tests live in `frontend/tests/`. Three projects: `setup` (Auth0 login), `public` (unauthenticated), and `authenticated` (requires a real session).

Install the browser once:
```bash
cd frontend
npx playwright install chromium
```

Run public tests (no credentials required):
```bash
npx playwright test --project=public
```

Run all tests including authenticated pages:
```bash
cd frontend
npx playwright test
```
