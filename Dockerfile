FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY web.js ./
COPY release/app/dist/renderer ./build

EXPOSE 3000
CMD [ "node", "web.js" ]
