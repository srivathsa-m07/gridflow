FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/agent/package*.json ./apps/agent/
RUN npm ci
COPY apps/agent ./apps/agent
RUN npm run build -w @gridflow/agent

FROM node:20-alpine
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/agent/package*.json ./apps/agent/
RUN npm ci --omit=dev
COPY --from=builder /app/apps/agent/dist ./apps/agent/dist
ENV BACKEND_URL=http://api:3001
ENV AGENT_ID=gridflow-agent-docker
CMD ["npm", "start", "-w", "@gridflow/agent"]
