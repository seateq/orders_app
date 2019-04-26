FROM node:8.10.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY ./ /app

EXPOSE 3004
CMD [ "node", "bin/www" ]