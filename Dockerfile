FROM node:22-alpine 

WORKDIR /src

COPY package*.json ./
COPY tsconfig.json ./
COPY views/ ./views/
COPY public/ ./public/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]