# ─── Production Node.js Backend ────────────────────────────────────────────────
FROM node:18-alpine

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy and install production dependencies only
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Switch to non-root user
USER nodeuser

# Cloud Run listens on PORT env variable (default 5000)
EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:$PORT/health || exit 1

# Use dumb-init to handle signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
