#!/bin/sh

echo "Waiting for database to be ready..."
until nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

echo "Creating database and running migrations..."
npx sequelize-cli db:create --env production || echo "Database already exists or creation failed"
npx sequelize-cli db:migrate --env production

echo "Starting application..."
exec "$@"
