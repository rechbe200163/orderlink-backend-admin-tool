# Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Installiere pnpm global
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .

# Installiere Dependencies mit pnpm
RUN pnpm install --frozen-lockfile

# Clean alte Artefakte
RUN rm -rf generated dist

# Prisma Clients generieren
RUN pnpm prisma generate

# Build
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
