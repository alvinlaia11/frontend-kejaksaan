# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=https://backend-kejaksaan-production.up.railway.app
ENV NODE_ENV=production
ENV CI=false

# Create production build
RUN npm run build

# Production stage - Gunakan salah satu: nginx ATAU serve
# Pilihan 1: Menggunakan nginx
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ATAU Pilihan 2: Menggunakan serve
# FROM node:18-alpine
# RUN npm install -g serve
# WORKDIR /app
# COPY --from=build /app/build ./build
# EXPOSE 80
# CMD ["serve", "-s", "build", "-l", "80"] 