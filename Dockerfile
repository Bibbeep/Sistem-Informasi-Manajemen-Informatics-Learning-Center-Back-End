# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.19.0

# == Build Stage ==
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh ./scripts/

# == Production Stage ==
FROM node:${NODE_VERSION}-alpine

# Install netcat for database health check
RUN apk add --no-cache netcat-openbsd

# Use production node environment by default.
# ENV NODE_ENV=production

WORKDIR /usr/src/app

# COPY package*.json ./
COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts

# Copy and set up entrypoint script (before switching user)
COPY --from=builder /usr/src/app/scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy the rest of the source files into the image.
# COPY . .

COPY --from=builder /usr/src/app .

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
# CMD ["npm", "run", "start:dev"]
ENTRYPOINT ["/entrypoint.sh"]
CMD [ "node", "src/server.js" ]
