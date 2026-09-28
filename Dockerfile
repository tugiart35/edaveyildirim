# Düğün davetiyesi — Dokploy / Docker dağıtımı
#
# Veritabanı imajın içinde değil, bağlanan bir volume üzerindedir.
# DATABASE_FILE o volume'e işaret etmelidir; aksi halde her dağıtımda
# davetli listesi silinir.

# ---------------------------------------------------------------------------
# Bağımlılıklar
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Next.js'in yerel ikilileri glibc bekler; Alpine musl kullanıyor.
# Bu paket olmadan derleyici yüklenemez.
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Derleme
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# Çalıştırma
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Veritabanı kalıcı diskte durur.
ENV DATABASE_FILE=/data/wedding.db

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs \
 && mkdir -p /data \
 && chown nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Şema ve yer tutucu düğün kaydı ilk istekte otomatik oluşur;
# ayrıca bir kurulum adımı gerekmez.
CMD ["node", "server.js"]
