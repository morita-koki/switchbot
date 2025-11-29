FROM node:22-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# 0.0.0.0で公開しないとコンテナ外(Nginx)から見えない
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]