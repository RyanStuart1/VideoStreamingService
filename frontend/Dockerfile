FROM node:20

WORKDIR /app

# Install dependencies for the React app (which lives in ./app)
COPY app/package*.json ./app/
RUN cd app && npm install

# Copy the React app source
COPY app ./app

EXPOSE 3000

# Run the React dev server
CMD ["sh", "-c", "cd app && npm start"]