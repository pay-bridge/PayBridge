# PayBridge

**PayBridge** is an open-source Node.js microservice that offers a unified API for seamless, plug-and-play integration of multiple payment gateways. It abstracts the complexities of various payment providers, providing a modular, extensible, and secure solution tailored for SaaS products and developers.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Service](#running-the-service)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)
- [Support](#support)

---

## Features

- **Unified API:** Single interface for multiple payment gateways (e.g., Stripe, PayPal).
- **Adapter Pattern:** Modular gateway adapters for easy addition of new payment providers.
- **Secure Payment Handling:** Follows best practices for handling sensitive data.
- **Extensible Design:** Easily extend or customize functionality.
- **Scalable Architecture:** Built with Node.js and Express for scalability and performance.
- **Webhook Handling:** Standardized handling of payment gateway webhooks and events.

---

## Architecture Overview

PayBridge is structured into distinct modules:

- **Database Abstraction Layer:** Multi-database support with unified interface
- **Payment Gateway Adapters:** Each payment gateway (Stripe, Razorpay, etc.) has its own adapter implementing a common interface
- **Services:** Core business logic that orchestrates calls to various adapters
- **Routes/Controllers:** Define API endpoints for initiating payments, refunds, subscriptions, etc.
- **Configuration:** Centralized configuration management via environment variables
- **Error Handling & Logging:** Robust mechanisms for monitoring, logging, and error recovery

---

## Folder Structure

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

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- npm (comes with Node.js)
- Sandbox or test credentials for payment gateways (e.g., Stripe API keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pay-bridge/PayBridge.git
   cd PayBridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Choose your database provider:**

   **Option A: SQLite (Quick Setup - Recommended for Development)**
   ```bash
   export DATABASE_PROVIDER=sqlite
   npm run setup:sqlite
   npm run dev
   ```

   **Option B: Supabase (Production Ready)**
   ```bash
   cp env.example .env.local
   # Configure your Supabase credentials in .env.local
   export DATABASE_PROVIDER=supabase
   npm run dev
   ```

   **Option C: PostgreSQL (Self-hosted)**
   ```bash
   export DATABASE_PROVIDER=postgresql
   export POSTGRES_HOST=localhost
   export POSTGRES_PORT=5432
   export POSTGRES_DB=paybridge
   export POSTGRES_USER=postgres
   export POSTGRES_PASSWORD=your_password
   npm run dev
   ```

   **Option D: MySQL (Self-hosted)**
   ```bash
   export DATABASE_PROVIDER=mysql
   export MYSQL_HOST=localhost
   export MYSQL_PORT=3306
   export MYSQL_DB=paybridge
   export MYSQL_USER=root
   export MYSQL_PASSWORD=your_password
   npm run dev
   ```

---

## Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env.local
```

- **Database Configuration:**
  - `DATABASE_PROVIDER`: Choose from `sqlite`, `supabase`, `postgresql`, `mysql`
  - Database-specific variables (see `env.example` for details)
- **Payment Gateway Configuration:**
  - Set up environment variables for your payment gateways (see `env.example`)

---

## Usage

- Add new payment gateways in `core/payments/adapters/`
- Add new database adapters in `db/adapters/`
- Add new business logic in `core/`
- Add new UI components in `components/ui/`
- Add tests and demos in `tests/`

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on contributing, coding standards, and best practices.

---

## License

MIT

---

## Roadmap

- More payment gateway adapters (PayPal, Square, etc.)
- More database adapters (MongoDB, etc.)
- Advanced analytics and reporting
- Multi-currency and tax support
- ...and more!

---

## Support

- Open an issue for bugs, questions, or feature requests.
- Join the community discussions (if available).
