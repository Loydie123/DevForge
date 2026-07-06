# DevForge — Universal Developer Operating System (DevOS)

DevForge is an all-in-one developer platform that unifies the entire software development lifecycle into a single workspace. It replaces fragmented tools like Postman, DBeaver, Sentry, Grafana, and CLI generators into one unified developer operating system.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/devforge.git
cd devforge

# 2. Copy env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Start infrastructure (Postgres + Redis)
docker compose -f infra/docker/docker-compose.yml up -d

# 4. Install dependencies
pnpm install

# 5. Set up database
cd apps/backend && npx prisma generate && npx prisma db seed && cd ../..

# 6. Start development servers
pnpm dev
```

> Frontend: http://localhost:3000 · Backend API: http://localhost:4000 · Health: http://localhost:4000/health

> **Local dev only:** `npx prisma db seed` creates demo users. Change passwords before any shared/staging deploy. Default seed credentials are **not** used in production.

---

## Full Docker Stack

Run the entire stack (Postgres, Redis, Backend, Frontend, Nginx) in Docker:

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d
```

---

## Architecture

```
devforge/
├── apps/
│   ├── frontend/          # Next.js 14 — React UI
│   └── backend/           # NestJS — REST + WebSocket API
├── modules/               # Domain feature packages
│   ├── api-hub/
│   ├── db-hub/
│   ├── devops-hub/
│   ├── monitoring-hub/
│   ├── logs-hub/
│   ├── ai-engine/
│   ├── seo-engine/
│   ├── analytics-hub/
│   ├── error-tracker/
│   ├── performance-hub/
│   ├── security-center/
│   ├── env-manager/
│   ├── cicd-hub/
│   └── project-generator/
├── core/                  # Shared packages
│   ├── auth/
│   ├── permissions/
│   ├── event-bus/
│   ├── plugin-engine/
│   └── config/
├── infra/
│   ├── docker/            # Compose files (dev + full)
│   ├── nginx/             # Reverse proxy config
│   └── ci-cd/             # GitHub Actions workflows
└── .github/workflows/     # CI + CD pipelines
```

---

## Implemented Modules

### API Hub — Postman Alternative
- REST, GraphQL, WebSocket, and gRPC testing
- Request collections, environment variables, history
- JWT, OAuth2, and API Key authentication

### DB Hub — Database Manager
- MySQL, PostgreSQL, MongoDB, Redis, SQLite support
- Query editor, table explorer, ERD generator
- Schema visualization and data export

### DevOps Hub
- Docker container management
- Compose file editor
- Kubernetes config templates
- VPS deployment tools

### Monitoring Hub
- CPU / RAM / Disk usage tracking
- API latency and request throughput
- Service uptime and health check dashboard

### Error Tracker — Sentry Alternative
- Exception logging with full stack traces
- Error grouping, severity classification
- Reproduction context and filtering

### Logs Hub
- Backend, API, system, and Docker logs
- Real-time streaming via WebSocket
- Search, filter, and export

### Analytics Hub — GA Alternative
- Page views, unique visitors, sessions
- User behavior and event tracking
- Funnels, API usage analytics, real-time users

### Performance Hub
- API response time tracking
- Slow query detection and analysis
- Route-by-route performance breakdown
- Memory and bottleneck detection

### Security Center
- JWT inspection and validation
- Rate limiting monitoring and API abuse detection
- Suspicious IP detection
- Audit logs and vulnerability scanning

### SEO Engine
- Meta tag generator and validator
- Open Graph preview
- Sitemap generator
- Robots.txt manager
- Full SEO audit with page scoring

### Environment Manager
- Dev / Staging / Production config management
- Secrets management and API keys vault
- Config versioning with diff support

### CI/CD Hub
- Pipeline management (GitHub Actions, GitLab CI)
- Build runs, logs, and deploy tracking
- Deployment history and status

### Project Generator
- Multi-framework boilerplate scaffolding
- Supported: NestJS, Express, Fastify, Next.js, Angular, Laravel, Django, Spring Boot, ASP.NET Core, Go Fiber
- Generates auth, RBAC, logging, config, and clean architecture

### AI Engine
- Generate CRUD APIs, SQL schemas, and tests
- Explain errors and suggest fixes
- Refactor and architecture suggestions
- Supported providers: OpenAI, OpenRouter, Claude, Gemini

### Plugin System
- Extensible hook-based plugin architecture
- Plugin marketplace with install/uninstall
- Hooks: `onRequest`, `onResponse`, `onError`, `onLog`, `onMetric`

---

## UI Features

- **Command Palette** — `Ctrl+K` / `Cmd+K` to navigate anywhere instantly
- **Notifications Center** — Real-time bell with error, warning, and pipeline alerts
- **User Settings** — Profile management, password change, preferences
- **Skeleton Loaders** — Per-hub loading states for smooth UX
- **Custom 404 / Error pages** — Branded not-found and crash recovery pages
- **Per-page metadata** — Proper `<title>` and Open Graph for all pages
- **Dynamic favicon** — Served via Next.js `ImageResponse`

---

## Event-Driven Architecture

All modules communicate through a shared event bus:

```
API_REQUEST → API_RESPONSE → Logs + Monitoring + Analytics
ERROR_THROWN → Error Tracker → Notifications
DB_QUERY → Performance Hub
METRIC_UPDATED → Monitoring Hub
PLUGIN_TRIGGERED → Plugin System
```

---

## Infrastructure

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS, TanStack Query |
| Backend | NestJS, Prisma ORM, Socket.io |
| Database | PostgreSQL |
| Cache | Redis |
| Reverse Proxy | Nginx (rate limiting, SSL, WebSocket) |
| CI/CD | GitHub Actions (lint → build → deploy) |
| Containerization | Docker + Docker Compose |
| Monorepo | pnpm + Turborepo |

---

## CI/CD Pipelines

**CI** (`.github/workflows/ci.yml`) — runs on every push/PR:
- Lint, type-check, build all packages

**Deploy** (`.github/workflows/deploy.yml`) — runs on `main`/`production` branch:
- Docker build + push to GitHub Container Registry (GHCR)
- SSH deploy to staging / production server

See `infra/ci-cd/README.md` for required GitHub secrets.

---

## Database Schema

| Table | Key Fields |
|-------|-----------|
| `users` | id, email, password, role, created_at |
| `projects` | id, name, framework, type, created_at |
| `logs` | id, type, message, metadata, created_at |
| `metrics` | id, service, latency, cpu, memory, timestamp |
| `errors` | id, service, message, stack_trace, severity |
| `plugins` | id, name, version, config, enabled |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the modular architecture — new features go in `modules/` or `core/`
4. Ensure types are shared via module packages
5. Open a Pull Request

Guidelines:
- Avoid tight coupling between modules — use the event bus
- Keep shared types in the module's package (`modules/<name>/src/index.ts`)
- Frontend components go in `apps/frontend/app/<hub>/_components/`

---

## Roadmap

- [x] Phase 1 — API Hub, DB Hub, Logs, Auth, Project Generator
- [x] Phase 2 — Monitoring Hub, Error Tracker, AI Engine
- [x] Phase 3 — SEO Engine, Analytics Hub, Performance Hub, Security Center
- [x] Phase 4 — Environment Manager, CI/CD Hub, Plugin System
- [ ] Phase 5 — Desktop App (Electron/Tauri), Multi-user collaboration, Cloud sync

---

## License

MIT License

---

> **Status:** Active development · Production-level architecture · Built for real-world developers
