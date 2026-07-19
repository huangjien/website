FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
ENV HUSKY=0
RUN npm install -g pnpm@11.9.0 \
  && pnpm install --frozen-lockfile --ignore-scripts

FROM node:25-alpine AS builder
RUN npm install -g pnpm@11.9.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build:webpack

FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://localhost:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

USER node

# Bind to all interfaces so Docker's loopback-based healthcheck can reach the
# standalone server. Without this, the server picks up Docker's auto-set
# HOSTNAME env (the container ID) and binds only to that interface, making
# the container report as unhealthy even though external traffic works.
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
