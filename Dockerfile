# Dockerfile
FROM node:20

WORKDIR /usr/src/app

# Installiere pnpm global
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .

# Dummy ENV für Prisma generate im Build
ENV MASTER_DATABASE_URL="postgresql://user:password@localhost:5432/master"
ENV DATABASE_URL="postgresql://user:password@localhost:5432/tenant"

# Optional: Falls du .npmrc brauchst (z. B. Registry oder pnpm settings)
# COPY .npmrc .npmrc

# Installiere Dependencies mit pnpm
RUN pnpm install --frozen-lockfile

# Clean alte Artefakte
RUN rm -rf generated dist

# Prisma Clients generieren
RUN pnpm prisma generate --schema=prisma/schema.master.prisma
RUN pnpm prisma generate --schema=prisma/schema.tenant.prisma

# Build
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
