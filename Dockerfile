ARG NODE_VERSION=22.19.0

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

COPY scripts/docker-entrypoint.sh ./scripts/

FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /usr/src/app .

USER node

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]

CMD [ "node", "src/server.js" ]
