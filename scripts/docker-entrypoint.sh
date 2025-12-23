#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for database..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "Database started"

# Run migrations first to ensure tables are created
echo "Running database migrations..."
npx sequelize-cli db:migrate


# Check if the users table is empty and seed if necessary
USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;")

if [ -z "$USER_COUNT" ] || [ "$(echo $USER_COUNT | tr -d '[:space:]')" = "0" ]; then
  echo "Users table is empty. Seeding database..."
  node scripts/db/seed.js
else
  echo "Database already seeded."
fi

# Start the application
exec "$@"
