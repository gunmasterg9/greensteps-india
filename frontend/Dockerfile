# ─── Stage 1: Build React + Vite bundle ────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Accept dynamic API URL at build time
ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ─── Stage 2: Serve via Nginx ───────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy custom Nginx config (SPA routing + gzip + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled React bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run listens on port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
