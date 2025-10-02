FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=optional 

RUN apk add --no-cache postgresql-client curl

COPY --from=builder /app/build ./build
COPY drizzle.config.json ./
COPY src ./src
COPY .env.production .env.production
COPY entrypoint.sh ./
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 3333

CMD ["./entrypoint.sh"]
