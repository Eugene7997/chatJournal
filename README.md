# ChatJournal

A conversational journaling app. Instead of staring at a blank page, you journal through natural dialogue — write your thoughts, reflect on past entries, and grow over time.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Auth0
- **Database:** PostgreSQL (Supabase)
- **LLM:** OpenRouter API (default model: `google/gemini-2.5-flash-lite`)
- **Runtime:** React 19, Node.js 20

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
RUN_LLM_TESTS=true
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
| `npx playwright test --project=public-chromium --project=public-firefox --project=public-webkit` | Run public-page tests only (no credentials needed) |

## Testing

### Jest (unit + component)

Tests live in `frontend/src/__tests__/`. Covers API routes, helper functions, and React components via React Testing Library.

```bash
cd frontend
npm test
```

### Playwright (E2E)

Tests live in `frontend/tests/`. Runs on Chromium, Firefox, and WebKit.

Install the browsers once:
```bash
cd frontend
npx playwright install chromium firefox webkit
```

**Projects:**

| Project | Auth | Spec files |
|---------|------|------------|
| `setup` | — | `global.setup.ts` — logs in via Auth0, writes session cookie |
| `public-{chromium,firefox,webkit}` | None | All specs except `chat.spec.ts`, `journals.spec.ts` |
| `authenticated-{chromium,firefox,webkit}` | Auth0 session | `chat.spec.ts`, `journals.spec.ts` |

Run public tests (no credentials required):
```bash
npx playwright test --project=public-chromium --project=public-firefox --project=public-webkit
```

Run all tests including authenticated pages:
```bash
cd frontend
npx playwright test
```

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

| Job | Trigger | What it does |
|-----|---------|--------------|
| Lint | push + PR | Runs ESLint |
| Unit Tests | push + PR | Runs Jest with coverage; uploads report as artifact |
| Build | push + PR | Builds the Next.js production bundle |
| E2E Public | push + PR | Runs Playwright public-page tests on Chromium, Firefox, and WebKit |
| E2E Authenticated | push to `main` only | Runs Playwright authenticated tests on all three browsers |

## Known Limitations

- Stream cancellation is not implemented

## Future works

- OCR for physical diaries
- Implement stream cancellation
- Experiment integration with messaging platforms to generate journals based on text messages and calls.
- Add page loading screen.
- Improve vercel deployment performance.
