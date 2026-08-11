# ── Base commune ──────────────────────────────────
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Développement ─────────────────────────────────
FROM base AS development
RUN npm install
COPY . .
RUN npx prisma generate
RUN touch .env
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ── Build (compile TypeScript + génère le client Prisma) ──
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Production ────────────────────────────────────
# Image finale : uniquement les dépendances de prod + le JS compilé,
# sans TypeScript/ESLint/Vitest/Prisma CLI ni le code source.
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm rebuild sharp

COPY --from=build /app/dist ./dist

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs \
    && mkdir -p uploads && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/src/server.js"]