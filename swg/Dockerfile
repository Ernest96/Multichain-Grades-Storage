FROM node:20-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# app code
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "swg.js"]
