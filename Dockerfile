FROM node:16-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn

EXPOSE 3000

CMD ["node", "./dist/app.js"]