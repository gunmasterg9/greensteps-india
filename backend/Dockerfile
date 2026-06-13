# Use lightweight production Node LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code files
COPY src/ ./src/

# Expose API port
EXPOSE 5000

# Set production environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start Express server
CMD ["npm", "start"]
