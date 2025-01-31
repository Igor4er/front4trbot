
# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Download Caddy stage
FROM alpine:latest AS caddy
ARG TARGETARCH
RUN wget -O /caddy "https://caddyserver.com/api/download?os=linux&arch=${TARGETARCH}&idempotency=stat" && \
    chmod +x /caddy

# Production stage
FROM gcr.io/distroless/static-debian12:nonroot
LABEL docker.restart-policy="unless-stopped"
USER nonroot:nonroot

COPY --from=caddy --chown=nonroot:nonroot /caddy /caddy
COPY --chown=nonroot:nonroot Caddyfile /Caddyfile
COPY --from=build --chown=nonroot:nonroot /app/dist /srv

EXPOSE 8080

ENTRYPOINT ["/caddy", "run", "--config", "/Caddyfile"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:8080 || exit 1
