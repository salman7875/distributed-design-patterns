FROM node:22.23-bookworm-slim 

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4001

CMD [ "npm", "start" ]
