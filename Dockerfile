# Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Installiere pnpm global
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .

# Optional: Falls du .npmrc brauchst (z. B. Registry oder pnpm settings)
# COPY .npmrc .npmrc

# Installiere Dependencies mit pnpm
RUN pnpm install --frozen-lockfile

RUN pnpm prisma generate
# Baue dein Projekt (optional)
RUN pnpm build

CMD ["pnpm", "start"]
