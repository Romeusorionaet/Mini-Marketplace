#!/bin/sh
set -e

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}

echo "Aguardando banco..."

while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; do
  echo "Banco ainda não está pronto, tentando novamente em 2s..."
  sleep 2
done

echo "Banco pronto!"

echo "Rodando migrations..."
npx drizzle-kit migrate

echo "Iniciando servidor..."
exec node build/server.js
