# syntax=docker/dockerfile:1
# ═══════════════════════════════════════════════════════════════
#  NextStopRussia — Multi-stage Dockerfile
#  Stage 1 (builder) : install deps + build frontend & API server
#  Stage 2 (runner)  : lean image with nginx + supervisord
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Builder ────────────────────────────────────────────
FROM node:20-slim AS builder

# Install pnpm at the EXACT version that generated pnpm-lock.yaml
# (avoids frozen-lockfile mismatch and hanging installs)
RUN npm install -g pnpm@10.26.1 --loglevel=error

WORKDIR /app

# Copy workspace manifests first (layer-cache friendly)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files so pnpm can resolve the workspace graph
COPY lib/api-zod/package.json          lib/api-zod/
COPY lib/api-spec/package.json         lib/api-spec/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/db/package.json               lib/db/
COPY artifacts/api-server/package.json     artifacts/api-server/
COPY artifacts/nextstoprussia/package.json artifacts/nextstoprussia/

# Install all dependencies — cache the pnpm store between builds
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy full source
COPY . .

# 1. Build the Express API server → artifacts/api-server/dist/index.cjs
RUN pnpm --filter @workspace/api-server run build

# 2. Build the React/Vite frontend → artifacts/nextstoprussia/dist/public/
#    PORT is required by vite.config.ts (used only for dev server, not the build output).
#    BASE_PATH="/" deploys the SPA at the root of the domain.
RUN PORT=8080 BASE_PATH=/ NODE_ENV=production \
    pnpm --filter @workspace/nextstoprussia run build


# ── Stage 2: Runner ─────────────────────────────────────────────
FROM node:20-slim AS runner

# Install nginx and supervisord
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── API server: bundled CJS + external node_modules ─────────────
COPY --from=builder /app/artifacts/api-server/dist         ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=builder /app/node_modules                      ./node_modules

# ── Default data files (shadowed by Docker volume in production) ─
COPY --from=builder /app/artifacts/api-server/data         ./artifacts/api-server/data

# ── Frontend static files served by nginx ───────────────────────
COPY --from=builder /app/artifacts/nextstoprussia/dist/public /var/www/nextstoprussia

# ── Public assets (favicon, og image, etc.) ─────────────────────
COPY artifacts/nextstoprussia/public/favicon.svg   /var/www/nextstoprussia/
COPY artifacts/nextstoprussia/public/opengraph.jpg /var/www/nextstoprussia/

# ── Uploads dir (shadowed by Docker volume in production) ────────
RUN mkdir -p ./artifacts/nextstoprussia/public/images/uploads

# ── Bake path defaults so the server works even without supervisord ──
ENV DATA_DIR=/app/artifacts/api-server/data
ENV UPLOADS_DIR=/app/artifacts/nextstoprussia/public/images/uploads
ENV NODE_ENV=production
ENV PORT=3000

# ── nginx & supervisord config ───────────────────────────────────
COPY deploy/nginx.conf       /etc/nginx/nginx.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/nextstoprussia.conf

# Create log dirs
RUN mkdir -p /var/log/supervisor /var/log/nginx

# Expose HTTP
EXPOSE 80

# supervisord is PID 1 — manages both nginx and the Node API server
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/nextstoprussia.conf"]
