FROM node:23-slim

# Create app directory and set permissions
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
    useradd -r -g nodejs -s /bin/bash -d /home/nodejs nodejs && \
    mkdir -p /home/nodejs && \
    chown -R nodejs:nodejs /home/nodejs /app

# Copy package files first
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
RUN npm install --no-optional

# Copy rest of the application
COPY --chown=nodejs:nodejs . .

# Setup wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Switch to non-root user
USER nodejs

EXPOSE 5050

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5050/health || exit 1

CMD ["/wait-for-it.sh", "db:5432", "--", "npm", "start"]
