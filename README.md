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
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Auth0 M2M (Management API)
AUTH0_M2M_CLIENT_ID=
AUTH0_M2M_CLIENT_SECRET=

# Database
DATABASE_URL=

# LLM
OPENROUTER_API_KEY=
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
      about/                # About page
      login/                # Login / sign-up
      chat/                 # Main journaling interface
      account/              # Account settings
      api/
        auth/               # Auth0 callbacks and delete
        chat/               # Chat sessions, messages, persistence
    components/
      Chat.tsx              # Core chat UI
      ChatSideBar.tsx       # Session navigation
      Navbar.tsx            # Top navigation
      Account.tsx           # Account management
      AuthBox.tsx           # Auth UI
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
