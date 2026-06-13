# Stage 1: Build the static bundle
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy manifests
COPY package*.json ./

# Install all dependencies (dev required for Vite build)
RUN npm ci

# Copy source code files
COPY . .

# Set API URL for the build
ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Compile static assets
RUN npm run build

# Stage 2: Serve compiled assets using Nginx
FROM nginx:1.25-alpine

# Copy built bundle from builder stage to Nginx content root
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
