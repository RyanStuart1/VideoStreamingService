FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY app/public ./public
COPY app/src ./src
EXPOSE 3000
CMD ["npm", "start"]