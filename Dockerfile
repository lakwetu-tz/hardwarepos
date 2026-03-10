# ───────────────────────────────────────────────────────────────
# Stage 1: Build backend only (no frontend build!)
FROM node:20-slim AS backend-builder

WORKDIR /app/server

# Prisma needs openssl
RUN apt-get update -yq && \
    apt-get install -yq --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund --omit=dev   # only prod deps + build tools

COPY . ./
RUN npx prisma generate
RUN npm run build               

# ───────────────────────────────────────────────────────────────
# Final image — very small
FROM node:20-slim

RUN apt-get update -yq && \
    apt-get install -yq --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled backend
COPY --from=backend-builder /app/server/dist          ./server/dist
COPY --from=backend-builder /app/server/package*.json ./server/
COPY --from=backend-builder /app/server/prisma        ./server/prisma
COPY --from=backend-builder /app/server/node_modules  ./server/node_modules   

# Copy pre-built frontend
COPY public  ./server/public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/server
CMD ["npm", "start"]