FROM node:23.11-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r nodejs && \
    mkdir -p /home/nodejs && \
    useradd -r -g nodejs -s /bin/bash -d /home/nodejs nodejs && \
    chown -R nodejs:nodejs /home/nodejs /app

# Copy package files first
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
RUN npm install --no-optional --legacy-peer-deps

# Copy application files
COPY --chown=nodejs:nodejs . .

# Setup wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Switch to non-root user
USER nodejs

EXPOSE 5050

# Wait for DB and run migrations before starting the app
CMD ["/wait-for-it.sh", "db:5432", "--", "sh", "-c", "npx sequelize-cli db:migrate && npm start"]
