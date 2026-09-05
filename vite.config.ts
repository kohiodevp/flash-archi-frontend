import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// =============================================================
// Flash-Archi Frontend — Configuration Vite
//
//  DEV : Vite sert le frontend et proxy /api vers flash-archi-saas
//        (VITE_DEV_API_TARGET, défaut http://localhost:8080).
//  PROD: le frontend appelle l'API en URL relative (/api/**) ;
//        Nginx Proxy Manager reverse-proxy vers le conteneur API.
//  La clé API n'est jamais dans le bundle (saisie au runtime, injectée
//  par intercepteur Axios).
// =============================================================

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8080'

  return {
    plugins: [vue()],
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // Ne réécrit pas /api : le backend monte ses routes sous /api.
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 8081,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2020',
      rollupOptions: {
        output: {
          // Lazy chunks : MapLibre (V2) chargé à la demande, vendor séparé.
          manualChunks(id) {
            if (id.includes('maplibre-gl')) return 'maplibre'
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
  }
})