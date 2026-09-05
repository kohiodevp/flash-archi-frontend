# =============================================================
# Flash-Archi Frontend — Dockerfile multi-stage
#
#  STAGE 1 (builder) : compilation Vite + TypeScript
#  STAGE 2 (runtime) : Nginx Alpine, fichiers statiques dist/
#
#  Réseau : le conteneur est rattaché au réseau `npm-net` via
#  docker-compose. Nginx écoute sur le port 80 (interne) — le port
#  hôte est géré par Nginx Proxy Manager (NPM), AUCUN port hôte
#  exposé. La SPA route en relative /api/** (proxy NPM vers l'API).
# =============================================================

# ---------- STAGE 1 : build -------------
FROM node:20-alpine AS build
WORKDIR /app

# IMPORTANT : ne PAS poser NODE_ENV=production ici, sinon npm omet
# les devDependencies (vue-tsc, vite) et le build échoue (127).
# Le build définit lui-même son environnement de prod.

# D'abord les dépendances (cache Docker efficace) — npm ci reproduit
# exactement le package-lock.json (devDependencies comprises).
COPY package.json package-lock.json* ./
RUN npm ci

# Ensuite les sources
COPY index.html vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# Build de production (vue-tsc + vite build) → /app/dist
RUN npm run build

# ---------- STAGE 2 : nginx -------------
FROM nginx:alpine

# wget est requis par le healthcheck (nginx:alpine n'a pas curl)
RUN apk add --no-cache wget

# Configuration Nginx générée EN LIGNE (le pattern COPY échoue sur
# overlayfs read-only avec USER nginx — voir skill docker-static-pwa).
# listen 80 = port interne conteneur, jamais un port d'hôte.
RUN rm -f /etc/nginx/conf.d/default.conf \
 && echo 'server { \
      listen 80; \
      server_name _; \
      root /usr/share/nginx/html; \
      index index.html; \
      gzip on; \
      gzip_vary on; \
      gzip_min_length 1024; \
      gzip_types text/plain text/css application/javascript application/json image/svg+xml; \
      add_header X-Frame-Options "SAMEORIGIN" always; \
      add_header X-Content-Type-Options "nosniff" always; \
      add_header X-XSS-Protection "1; mode=block" always; \
      add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
      location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
      } \
      location / { \
        try_files $uri $uri/ /index.html; \
      } \
    }' > /etc/nginx/conf.d/default.conf

# Copie des assets dist
COPY --from=build /app/dist /usr/share/nginx/html

# Permissions : nginx tourne en uid 101 ; fichiers copiés en 600 → 403
RUN chown -R 101:101 /usr/share/nginx/html \
 && chmod -R 755 /usr/share/nginx/html \
 && find /usr/share/nginx/html -type f -exec chmod 644 {} \;

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]