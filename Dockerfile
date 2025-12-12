# Finance Tracker Frontend - Production Dockerfile
# Multi-stage build: Node for building, Nginx for serving

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

# Stage 2: Production - serve with Nginx
FROM nginx:alpine

# Install CA certificates for HTTPS proxy
RUN apk add --no-cache ca-certificates

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (will be overridden by Railway's PORT)
EXPOSE 3000

# Substitute PORT env variable and start nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
