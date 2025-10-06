# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY main.js ./

# Expose port
EXPOSE 8080

# Run the application
CMD ["node", "main.js"]
