# ---- Builder Stage ----
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # ---- Production Stage ----
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Only copy built code and package files
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/package*.json ./
    
    # Install only production dependencies
    RUN npm install --omit=dev
    
    EXPOSE 3006
    
    CMD ["node", "dist/main"]
    