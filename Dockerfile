# Stage 1: BUILD - has all dev tools to compile TS -> JS
FROM node:20-alpine AS builder
WORKDIR /app

 # Copy package files first. Why? Docker layer cache. 
# If code changes but package.json same, this layer reused = fast build
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build   # nest build = creates /dist folder  

# Stage 2: RUN - only prod stuff, small & secure
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only package files again, install ONLY prod deps
COPY package*.json ./
 
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled code from builder stage. No TS, no src, no tests
COPY --from=builder /app/dist ./dist

# Wipro security: Don't run as root. 'node' user exists in base image
USER node

EXPOSE 3000

# Healthcheck = K8s/ECS can auto-restart if app hangs
#HEALTHCHECK --interval=30s --timeout=3s \
#  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
# Start app
CMD ["node", "dist/main"]