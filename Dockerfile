# Finance Tracker Frontend - Production Dockerfile
# Multi-stage build: Node for building, Caddy for serving

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production - serve with Caddy
FROM caddy:2-alpine

# Copy built assets from builder
COPY --from=builder /app/dist /srv

# Copy Caddyfile for SPA routing
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port (Railway will set $PORT)
EXPOSE 3000

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
