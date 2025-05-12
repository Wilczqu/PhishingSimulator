# Build stage
FROM node:23.11.0-slim AS build
WORKDIR /app
COPY phishing-simulator-frontend/package*.json ./

# First install dependencies without using the lock file
RUN npm install --no-package-lock

# Install your specific packages and TypeScript to resolve version conflict
RUN npm install --save react-bootstrap bootstrap bootstrap-icons chart.js react-chartjs-2 axios react-router-dom
RUN npm install --save-dev typescript@4.9.5

COPY phishing-simulator-frontend/ ./
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
