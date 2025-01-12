# Use Node.js base image
FROM node:20

# Install required build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory 
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with bcrypt built from source x
RUN npm install --build-from-source

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 3000

# Set NODE_PATH to ensure proper module resolution
ENV NODE_PATH=/app/node_modules

# Start the app
CMD ["node", "index.js"]
