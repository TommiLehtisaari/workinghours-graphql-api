FROM node:13.8-alpine

EXPOSE 4000

WORKDIR /usr/app/

RUN apk add --no-cache --virtual .gyp python make g++

COPY package*.json ./

RUN npm install --only=production && npm cache clean --force

USER node
COPY . .

ENV MONGODB_URI=mongodb://localhost:27017 JWT_SECRET=DefaultToken

CMD ["node", "./src/index.js"]