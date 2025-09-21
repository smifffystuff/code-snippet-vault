# Dockerfile for backend
FROM node:18-alpine AS backend

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]

# Dockerfile for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS frontend

# Copy built files
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]