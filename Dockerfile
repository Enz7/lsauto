FROM node:20-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN mkdir -p uploads/images uploads/videos uploads/docs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend-server.js"]
