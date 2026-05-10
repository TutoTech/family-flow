# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better cache
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build-time Supabase config (injected by Coolify as ARG)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=5 \
  CMD wget -qO- http://localhost:8080/ || exit 1
