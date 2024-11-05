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

# Production stage
FROM node:18-alpine

# Install serve
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy build files from build stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 80

# Start serve
CMD ["serve", "-s", "build", "-l", "80"]