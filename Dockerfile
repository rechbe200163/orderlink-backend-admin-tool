FROM node:latest AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm run build

FROM node:latest
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "pnpm", "start:prod" ]
