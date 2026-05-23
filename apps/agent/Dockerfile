FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/agent/package*.json ./apps/agent/
RUN npm ci
COPY apps/agent ./apps/agent
RUN npm run build -w @gridflow/agent

FROM node:20-alpine
LABEL maintainer="GRIDFLOW" \
      description="GRIDFLOW Agent - Real-time Infrastructure Monitoring"

WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/agent/package*.json ./apps/agent/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/apps/agent/dist ./apps/agent/dist

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

ENTRYPOINT ["node", "apps/agent/dist/index.js"]
