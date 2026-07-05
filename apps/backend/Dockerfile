# Build context must be the monorepo ROOT:
#   docker build -f apps/backend/Dockerfile .
# Or via docker-compose.full.yml which sets context to ../../ (repo root)

# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace manifests first (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy shared package manifests
COPY core/auth/package.json          ./core/auth/
COPY core/event-bus/package.json     ./core/event-bus/
COPY core/permissions/package.json   ./core/permissions/
COPY modules/ai-engine/package.json  ./modules/ai-engine/
COPY modules/api-hub/package.json    ./modules/api-hub/
COPY modules/db-hub/package.json     ./modules/db-hub/
COPY modules/devops-hub/package.json ./modules/devops-hub/
COPY modules/logs-hub/package.json   ./modules/logs-hub/
COPY modules/monitoring-hub/package.json ./modules/monitoring-hub/
COPY modules/project-generator/package.json ./modules/project-generator/
COPY apps/backend/package.json       ./apps/backend/

RUN pnpm install --frozen-lockfile

# Copy all source
COPY core/    ./core/
COPY modules/ ./modules/
COPY apps/backend/ ./apps/backend/

# Build shared packages then backend
RUN pnpm --filter "@devforge/*" build
RUN pnpm --filter backend build
RUN pnpm --filter backend exec npx prisma generate

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY core/auth/package.json          ./core/auth/
COPY core/event-bus/package.json     ./core/event-bus/
COPY core/permissions/package.json   ./core/permissions/
COPY modules/ai-engine/package.json  ./modules/ai-engine/
COPY modules/api-hub/package.json    ./modules/api-hub/
COPY modules/db-hub/package.json     ./modules/db-hub/
COPY modules/devops-hub/package.json ./modules/devops-hub/
COPY modules/logs-hub/package.json   ./modules/logs-hub/
COPY modules/monitoring-hub/package.json ./modules/monitoring-hub/
COPY modules/project-generator/package.json ./modules/project-generator/
COPY apps/backend/package.json       ./apps/backend/

# Skip postinstall scripts — avoids @prisma/client trying to run `npx prisma generate`
# which would download the wrong (latest) Prisma version
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy Prisma schema, generated client, and full pnpm store from builder
COPY --from=builder /app/apps/backend/prisma  ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.pnpm   ./node_modules/.pnpm

# Copy built shared packages and backend dist
COPY --from=builder /app/core/    ./core/
COPY --from=builder /app/modules/ ./modules/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 4000

CMD ["node", "dist/main.js"]
