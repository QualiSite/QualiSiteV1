# ── Base commune ──────────────────────────────────
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Développement ─────────────────────────────────
FROM base AS development
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Production ────────────────────────────────────
FROM base AS production
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start"]