FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Create tsconfig.build.json if not exists
RUN if [ ! -f tsconfig.build.json ]; then echo '{"extends": "./tsconfig.json","exclude": ["node_modules", "test", "dist", "**/*spec.ts"]}' > tsconfig.build.json; fi

# Build the app
RUN npm run build

# Show directory structure for debugging
RUN ls -la && ls -la dist && ls -la dist/src

# Start the app
CMD ["node", "dist/src/main.js"]