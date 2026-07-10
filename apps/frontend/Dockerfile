# Build context must be the monorepo ROOT:
#   docker build -f apps/frontend/Dockerfile .
# Or via docker-compose.full.yml which sets context to ../../ (repo root)

# ─── Dependencies Stage ───────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules        ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/ ./apps/frontend/

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
