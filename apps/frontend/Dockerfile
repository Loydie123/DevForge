# Build context must be the monorepo ROOT:
#   docker build -f apps/frontend/Dockerfile .

# ─── Dependencies Stage ───────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm

# Copy workspace configs for package resolution and layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package manifests for proper dependency locking
COPY core/auth/package.json              ./core/auth/
COPY core/event-bus/package.json         ./core/event-bus/
COPY core/permissions/package.json       ./core/permissions/
COPY modules/ai-engine/package.json      ./modules/ai-engine/
COPY modules/analytics-hub/package.json  ./modules/analytics-hub/
COPY modules/api-hub/package.json        ./modules/api-hub/
COPY modules/cicd-hub/package.json       ./modules/cicd-hub/
COPY modules/db-hub/package.json         ./modules/db-hub/
COPY modules/devops-hub/package.json     ./modules/devops-hub/
COPY modules/env-manager/package.json    ./modules/env-manager/
COPY modules/error-tracker/package.json  ./modules/error-tracker/
COPY modules/logs-hub/package.json       ./modules/logs-hub/
COPY modules/monitoring-hub/package.json ./modules/monitoring-hub/
COPY modules/performance-hub/package.json ./modules/performance-hub/
COPY modules/project-generator/package.json ./modules/project-generator/
COPY modules/security-center/package.json ./modules/security-center/
COPY modules/seo-engine/package.json     ./modules/seo-engine/
COPY apps/frontend/package.json          ./apps/frontend/

RUN pnpm install --frozen-lockfile

# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app ./

# Copy core modules and frontend source code
COPY core/          ./core/
COPY modules/       ./modules/
COPY apps/frontend/ ./apps/frontend/

# Build all shared packages first so Next.js can resolve imports
RUN pnpm --filter "@devforge/*" build

WORKDIR /app/apps/frontend
RUN DOCKER_BUILD=1 pnpm build

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# next.config.ts output: 'standalone' bundles everything needed
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static     ./.next/static
COPY --from=builder /app/apps/frontend/public           ./public

EXPOSE 3000

CMD ["node", "server.js"]
