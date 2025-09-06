# Contributing to PayBridge

Thank you for your interest in contributing to **PayBridge**! This document will help you get started as a developer or contributor.

---

## 🚀 Project Overview

PayBridge is an open-source platform that provides a unified API and client for integrating multiple payment gateways (Stripe, Razorpay, etc.) with a standard interface. It supports multiple database backends (Supabase, SQLite, PostgreSQL, MySQL) and is designed for extensibility, security, and developer-friendliness.

---

## 🗂️ Folder Structure (Optimized)

```
PayBridge/
│
├── app/                        # Next.js app directory (routes, pages, API)
├── components/                 # Reusable React components (UI only)
├── core/                       # Core business logic
│   ├── payments/
│   │   └── adapters/           # Payment gateway adapters (stripe, razorpay, ...)
│   ├── users/                  # User management logic (auth-helpers, supabase, ...)
│   ├── subscriptions/          # Subscription logic
│   ├── helpers.ts              # Shared helpers
│   ├── cn.ts                   # Classname utility
│   └── types_db.ts             # Shared DB types
├── db/
│   ├── adapters/               # Database adapters (supabase, sqlite, ...)
│   ├── migrations/             # Migration scripts (SQL or JS/TS)
│   ├── schema.sql              # Main schema (for Postgres/Supabase)
│   └── seed.sql                # Seed data
├── scripts/                    # Setup, migration, and utility scripts
├── tests/                      # Unit/integration/e2e tests and demos
├── public/                     # Static assets (images, icons, etc.)
├── styles/                     # Global styles (CSS, Tailwind, etc.)
├── env.example                 # Example environment variables
├── CONTRIBUTING.md
├── README.md
├── package.json
├── tsconfig.json
└── ...                         # Other config files
```

---

## 🛠️ Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/pay-bridge/PayBridge.git
cd PayBridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Choose Your Database

- **SQLite (Quick Start):**
  ```bash
  export DATABASE_PROVIDER=sqlite
  npm run setup:sqlite
  npm run dev
  ```
- **Supabase (Production):**
  ```bash
  cp env.example .env.local
  # Edit .env.local with your Supabase credentials
  export DATABASE_PROVIDER=supabase
  npm run dev
  ```
- **PostgreSQL/MySQL:**
  See `env.example` for configuration options.

---

## 🧑‍💻 Development Workflow

### 1. Branching
- Use feature branches: `feature/your-feature`, `bugfix/your-bug`, etc.
- Keep your branch up to date with `main`.

### 2. Coding Standards
- Use **TypeScript** for all code.
- Follow existing code style (Prettier, ESLint, and Tailwind CSS conventions).
- Use descriptive variable and function names.
- Write modular, reusable code.
- Add comments for complex logic.

### 3. Database Abstraction
- Use the unified database client (`db/adapters/client.ts`) for all data access.
- Do **not** use raw SQL or direct Supabase/SQLite calls outside of adapters.
- To add a new database provider, implement the `DatabaseClient` interface in `db/adapters/types.ts` and add your adapter in `db/adapters/`.

### 4. Payment Gateway Adapters
- Add new gateways by creating a new adapter in `core/payments/adapters/`.
- Follow the adapter pattern for consistency.

### 5. UI Components
- Place reusable UI in `components/ui/`.
- Use Tailwind CSS for styling.
- Keep components small and focused.

### 6. Environment Variables
- Document any new environment variables in `env.example`.

### 7. Testing
- Add tests for new features and bug fixes (unit, integration, or e2e as appropriate).
- Manual testing: Use both SQLite and Supabase setups to verify changes.
- Place all test and demo files in `tests/`.

### 8. Pull Requests
- Open a PR against `main`.
- Fill out the PR template (if available).
- Describe your changes and reference any related issues.
- Ensure your branch passes all CI checks.
- Be responsive to code review feedback.

---

## 🏗️ Project Structure

See the folder structure section above for where to add new features, adapters, or tests.

---

## 🤝 Best Practices

- Keep PRs focused and small.
- Write clear commit messages.
- Prefer composition over inheritance.
- Use environment variables for secrets/configuration.
- Document your code and update docs as needed.
- Be kind and respectful in code reviews and discussions.

---

## 💡 Need Help?
- Check the [README.md](./README.md) for more details.
- Open an issue for bugs, questions, or feature requests.
- Join the community discussions (if available).

---

Thank you for making PayBridge better! 🎉 