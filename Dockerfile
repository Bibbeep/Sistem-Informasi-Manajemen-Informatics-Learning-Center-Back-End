ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

COPY scripts/docker-entrypoint.sh ./scripts/

FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache netcat-openbsd curl postgresql-client

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /usr/src/app .

USER node

ARG PORT=3000
EXPOSE ${PORT}

ENTRYPOINT ["/entrypoint.sh"]

CMD [ "node", "src/server.js" ]
