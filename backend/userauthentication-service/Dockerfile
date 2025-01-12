# Use Node.js base image
FROM node:20

# Set working directory for the backend
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application code
COPY . .

# Expose the backend service port
EXPOSE 3000

# Start the backend service
CMD ["node", "index.js"]
