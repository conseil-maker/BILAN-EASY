# Multi-stage build for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build frontend with environment variables
ARG VITE_GEMINI_API_KEY
ARG GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY:-${GEMINI_API_KEY}}
RUN npm run build

# Production stage for frontend
FROM nginx:alpine AS frontend

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

