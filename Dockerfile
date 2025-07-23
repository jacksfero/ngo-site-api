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

# Only copy built code and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3006

CMD ["node", "dist/main"]

