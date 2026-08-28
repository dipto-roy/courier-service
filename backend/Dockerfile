FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci


# Dev target: source arrives via bind mount, nest --watch recompiles in place.
# No image rebuild is needed when application code changes.
# node_modules is chowned so the anonymous volume masking it stays writable
# for the non-root user the dev container runs as.
FROM node:20-alpine AS development
WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs \
 && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
