
# Этап 1: сборка фронтенда
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап 2: продакшен-образ
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY backend-server.js ./
COPY .env.example ./.env.example

RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "backend-server.js"]
