# Use Node.js base image
FROM node:20

# Install required build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory for the backend
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies with bcrypt built from source
RUN npm install --build-from-source

# Rebuild bcrypt to ensure compatibility with Linux
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the backend application code
COPY . .

# Expose the backend service port
EXPOSE 3000

# Start the backend service
CMD ["node", "index.js"]
