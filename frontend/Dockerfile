# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install a simple HTTP server to serve the built app
RUN npm install -g http-server

COPY --from=builder /app/dist ./dist

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200"]
