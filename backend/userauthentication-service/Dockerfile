# Use Node.js base image
FROM node:20

# Install required build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with bcrypt built from source
RUN npm install --build-from-source

# Ensure bcrypt is rebuilt (in case it's skipped during npm install)
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
