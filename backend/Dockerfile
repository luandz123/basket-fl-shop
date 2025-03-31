FROM node:18-alpine

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production=false

# Cài đặt Nest CLI
RUN npm install -g @nestjs/cli

# Copy mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Môi trường sản xuất
ENV NODE_ENV production

# Mở cổng
EXPOSE 3001

# Chạy ứng dụng
CMD ["node", "dist/main.js"]