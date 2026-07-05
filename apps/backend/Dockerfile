# Build context must be the monorepo ROOT:
#   docker build -f apps/backend/Dockerfile .

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl
RUN npm install -g pnpm

# Copy workspace manifests for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY core/auth/package.json              ./core/auth/
COPY core/event-bus/package.json         ./core/event-bus/
COPY core/permissions/package.json       ./core/permissions/
COPY modules/ai-engine/package.json      ./modules/ai-engine/
COPY modules/api-hub/package.json        ./modules/api-hub/
COPY modules/db-hub/package.json         ./modules/db-hub/
COPY modules/devops-hub/package.json     ./modules/devops-hub/
COPY modules/logs-hub/package.json       ./modules/logs-hub/
COPY modules/monitoring-hub/package.json ./modules/monitoring-hub/
COPY modules/project-generator/package.json ./modules/project-generator/
COPY apps/backend/package.json           ./apps/backend/

# Install all deps (including dev) — needed for build + prisma generate
RUN pnpm install --frozen-lockfile

# Copy source
COPY core/    ./core/
COPY modules/ ./modules/
COPY apps/backend/ ./apps/backend/

# Build shared packages, then backend, then generate Prisma client
RUN pnpm --filter "@devforge/*" build
RUN pnpm --filter backend build
RUN pnpm --filter backend exec prisma generate

WORKDIR /app/apps/backend
EXPOSE 4000

CMD ["node", "dist/main.js"]
