# Build stage
FROM node:23-slim AS build
WORKDIR /app
COPY package*.json ./

# Install dependencies from package.json
RUN npm ci

# Install additional required dependencies that might not be in package.json
RUN npm install --save react-bootstrap bootstrap chart.js react-chartjs-2 axios react-router-dom

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk --no-cache add curl

COPY --from=build /app/build /usr/share/nginx/html

# Add proper routing for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]