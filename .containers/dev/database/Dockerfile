# PostgreSQL 18 Database Container
FROM postgres:18-alpine

# Copy initialization scripts
COPY .containers/dev/database/init/*.sql /docker-entrypoint-initdb.d/

# Set default environment variables (can be overridden in docker-compose)
ENV POSTGRES_DB=pagebuilder
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Expose PostgreSQL port
EXPOSE 5432

# Health check to ensure database is ready
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD pg_isready -U postgres || exit 1
