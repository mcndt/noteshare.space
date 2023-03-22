FROM node:16-alpine AS BUILD_IMAGE

RUN apk add openssl1.1-compat

# install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy all local files into the image.
COPY . .

RUN npx prisma generate

RUN npm run build

# remove development dependencies
RUN npm prune --production

FROM node:16-alpine

RUN apk add openssl1.1-compat

WORKDIR /app
COPY --from=0 /app .

ENV PORT 8080
EXPOSE 8080

CMD ["node", "./build/src/server.js"]