# ---- Builder Stage ----
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ✅ Copy env file (optional if using Docker secrets or host variables)
COPY --from=builder /app/.env .env

EXPOSE 3006

CMD ["node", "dist/main"]

