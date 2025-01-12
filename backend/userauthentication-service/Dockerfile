FROM node:20
RUN apt-get update && apt-get install -y python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm rebuild bcrypt --build-from-source
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]