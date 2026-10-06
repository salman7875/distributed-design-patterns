FROM node:22.23-bookworm-slim 

WORKDIR /app
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]