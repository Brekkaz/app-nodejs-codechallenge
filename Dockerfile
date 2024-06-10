FROM node:alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

HEALTHCHECK CMD curl --fail http://localhost:3000 || exit 1

CMD ["node", "dist/main"]