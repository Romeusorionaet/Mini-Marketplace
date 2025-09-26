# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=optional 

RUN apk add --no-cache postgresql-client

COPY --from=builder /app/build ./build

COPY drizzle.config.json ./

RUN mkdir -p /app/src/database/migrations

COPY src/database/migrations ./src/database/migrations

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3333

CMD ["./entrypoint.sh"]
