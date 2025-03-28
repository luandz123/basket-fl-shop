FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Cài đặt tất cả dependencies (bao gồm devDependencies) để build
RUN npm install

# Cài đặt Nest CLI toàn cục
RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 3001

CMD [ "node", "dist/main" ]