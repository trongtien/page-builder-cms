# syntax=docker/dockerfile:1.4
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all workspace packages for dependency resolution
COPY packages/config ./packages/config
COPY packages/core ./packages/core
COPY packages/render-root/package.json ./packages/render-root/

FROM base AS builder
RUN pnpm install --frozen-lockfile

# Copy all source code for workspace packages
COPY packages/core/ui ./packages/core/ui
COPY packages/core/utils ./packages/core/utils
COPY packages/render-root ./packages/render-root

# Build workspace dependencies first
RUN pnpm --filter "@page-builder/core-ui" --filter "@page-builder/core-utils" build

# Then build render-root
RUN pnpm --filter @page-builder/render-root build

FROM nginx:alpine AS runtime
RUN apk add --no-cache nodejs npm

COPY --from=builder /app/packages/render-root/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Add OCI labels
LABEL org.opencontainers.image.title="Page Builder CMS - Render Root"
LABEL org.opencontainers.image.description="SSR application for Page Builder CMS"
LABEL org.opencontainers.image.vendor="Page Builder CMS"
LABEL org.opencontainers.image.source="https://github.com/trongtien/page-builder-cms"
LABEL org.opencontainers.image.licenses="MIT"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
