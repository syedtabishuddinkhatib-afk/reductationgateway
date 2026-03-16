# ═══════════════════════════════════════════════════════════════
#  NextStopRussia — Multi-stage Dockerfile
#  Stage 1 (builder) : install deps + build frontend & API server
#  Stage 2 (runner)  : lean image with nginx + supervisord
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Builder ────────────────────────────────────────────
FROM node:20-slim AS builder

# Enable corepack so pnpm is available
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

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

# Install all dependencies (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

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

# ── API server: bundled JS + its (few) external node_modules ────
COPY --from=builder /app/artifacts/api-server/dist         ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
# Only node_modules needed at runtime (cookie-parser and any other external deps)
COPY --from=builder /app/node_modules                      ./node_modules

# ── Default data files (will be shadowed by the Docker volume) ──
COPY --from=builder /app/artifacts/api-server/data         ./artifacts/api-server/data

# ── Frontend static files served by nginx ───────────────────────
COPY --from=builder /app/artifacts/nextstoprussia/dist/public /var/www/nextstoprussia

# ── Public assets (favicon, og image, etc.) ─────────────────────
COPY artifacts/nextstoprussia/public/favicon.svg   /var/www/nextstoprussia/
COPY artifacts/nextstoprussia/public/opengraph.jpg /var/www/nextstoprussia/

# ── Uploads dir (will be shadowed by the Docker volume) ─────────
RUN mkdir -p ./artifacts/nextstoprussia/public/images/uploads

# ── nginx & supervisord config ───────────────────────────────────
COPY deploy/nginx.conf      /etc/nginx/nginx.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/nextstoprussia.conf

# Create log dirs
RUN mkdir -p /var/log/supervisor /var/log/nginx

# Expose HTTP
EXPOSE 80

# supervisord is PID 1 — it starts nginx and the node API server
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/nextstoprussia.conf"]
