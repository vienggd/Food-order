# One image for Cloud Run, CI and local compose: Express serves /api and the built React app on port 3000.
# The same image runs the migration job: npx prisma migrate deploy && node dist/prisma/seed.js
# No secrets here: DATABASE_URL, SEED_PASSWORD (and SMOKE_PASSWORD) come from the environment at run time.

# Stage 1: install the npm workspace (one root lock file) and build server + client.
FROM node:24-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
# server's postinstall runs "prisma generate", which needs the schema.
COPY server/prisma server/prisma
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime. Only build output, the Prisma schema/migrations and node_modules.
# ponytail: node_modules keeps dev packages because the migration job needs the prisma CLI;
# prune to production + prisma if image size ever matters.
FROM node:24-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/package.json server/
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/prisma server/prisma
COPY --from=build /app/client/dist client/dist
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "dist/src/index.js"]
