# Use Node.js base image
FROM node:26.1.0-bookworm-slim

# Set working directory
WORKDIR /usr/src/app

# Copy only package files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
