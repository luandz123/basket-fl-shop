FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/upload ./upload

# Create upload directory if it doesn't exist
RUN mkdir -p upload

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]