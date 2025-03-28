FROM node:16-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có) để cài đặt dependencies
COPY package*.json ./

# Cài đặt production dependencies
RUN npm install --production

# Copy toàn bộ source code
COPY . .

# Build ứng dụng
RUN npm run build

# Expose cổng ứng dụng (Render sẽ sử dụng PORT được cung cấp qua biến môi trường)
EXPOSE 3001

# Chạy ứng dụng (lưu ý: Render sẽ gán biến môi trường PORT, bạn có thể cấu hình trong code hoặc dùng PORT ở đây)
CMD [ "node", "dist/main" ]