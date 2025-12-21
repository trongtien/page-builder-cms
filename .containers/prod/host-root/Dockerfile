# Multi-stage Production Build for host-root

# Stage 1: Build
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all packages and apps
COPY packages/ ./packages/
COPY apps/host-root/ ./apps/host-root/

# Install dependencies (including dev dependencies needed for build)
RUN pnpm install --frozen-lockfile

# Build the host-root application
RUN pnpm --filter @page-builder/host-root build

# Stage 2: Production Runtime
FROM nginx:alpine

# Copy built static files from builder stage
COPY --from=builder /app/apps/host-root/dist /usr/share/nginx/html

# Copy nginx configuration
COPY .containers/prod/nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
