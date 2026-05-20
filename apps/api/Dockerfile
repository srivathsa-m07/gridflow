FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci
COPY apps/api ./apps/api
RUN npm run build -w @gridflow/api

FROM node:20-alpine
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --omit=dev
COPY --from=builder /app/apps/api/dist ./apps/api/dist
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start", "-w", "@gridflow/api"]
