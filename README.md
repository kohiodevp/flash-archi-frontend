# Flash-Archi — Frontend (SPA Vue 3 + Vite + TailwindCSS)

Interface web de **flash-archi-saas** : génération de plans 2D et façades par IA.

## Stack

- **Vue 3** (TypeScript) — Composition API `<script setup>`
- **Vite 6** — build ultra-rapide, chunks manuels (MapLibre séparé)
- **TailwindCSS 3** — palette de marque (bleu profond `brand-*`, orange `accent-*`)
- **Vue Router 4** — navigation SPA
- **Pinia 3** — état (auth, jobs)
- **Axios** — client API (intercepteur Bearer)
- **MapLibre GL JS** — visualisation géospatiale (V2, chargée par chunk)

## Démarrage (développement)

```bash
npm install
npm run dev        # http://localhost:5173 — proxy /api → :8080
```

La clé API est saisie au runtime (auth) et transmise en `Authorization: Bearer`.
Elle n'est jamais écrite dans le bundle.

## Build de production

```bash
npm run build      # vue-tsc --noEmit && vite build → dist/
```

## Déploiement (Docker + Nginx Proxy Manager)

```bash
docker compose build --no-cache
docker compose up -d
```

- Conteneur `flash-archi-frontend` sur le réseau **npm-net**, port interne **80**.
- Aucun port hôte : NPM route `https://app.flash-archi.com` vers ce conteneur
  et `/api/**` vers le conteneur API `flash-archi-api:8080`.

## Structure

```
├── Dockerfile            # multi-stage (build Vite → nginx:alpine)
├── docker-compose.yml    # réseau npm-net externe, healthcheck
├── index.html
├── vite.config.ts        # alias @, proxy dev /api, chunks manuels
├── tailwind.config.js    # palette brand (bleu profond) + accent (orange)
├── src/
│   ├── main.ts           # bootstrap Vue + Pinia + Router
│   ├── App.vue           # coquille (navbar + footer)
│   ├── router/index.ts   # routes SPA
│   ├── stores/auth.ts    # état auth (clé en session, jamais dans le bundle)
│   ├── api/client.ts     # Axios + intercepteur Bearer + wrappers métier
│   ├── views/            # vues scaffoldées (remplissables Phase 2/3)
│   └── components/       # AppNavBar.vue
└── public/
```

## Sécurité (principes)

- Clé API **jamais** dans le JavaScript buildé : saisie au runtime, gardée en
  session (`sessionStorage`), injectée par intercepteur.
- Paquets statiques avec hash de contenu (cache immutable 1 an).
- Headers de sécurité nginx (`nosniff`, `X-Frame-Options`, `Referrer-Policy`).
- Contraste WCAG AA, labels ARIA, navigation clavier (Phase 2).