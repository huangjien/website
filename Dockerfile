FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
ENV HUSKY=0
RUN npm install -g pnpm@10.33.0 \
  && pnpm install --frozen-lockfile --ignore-scripts

FROM node:25-alpine AS builder
RUN npm install -g pnpm@10.33.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build:webpack

FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080

CMD ["node", "server.js"]
