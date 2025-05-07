# Build stage
FROM node:23-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --save react-bootstrap bootstrap bootstrap-icons chart.js react-chartjs-2 axios react-router-dom
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
