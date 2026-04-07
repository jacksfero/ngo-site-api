# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install


COPY . .


RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# 🔥 Copy node_modules from builder (KEY FIX)
COPY --from=builder /app/node_modules ./node_modules

# Copy dist
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]