import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { Job, JobSummary, SseEvent } from './types'

// =============================================================
// Client API — Flash-Archi SaaS
//
//  - baseURL : /api (relatif). En dev, Vite proxy vers l'API
//    (vite.config.ts) ; en prod, NPM reverse-proxy.
//  - L'intercepteur injecte `Authorization: Bearer <clé>` depuis le
//    store d'auth — la clé n'est jamais dans le bundle.
//  - 401 → la session est purgée (logout silencieux).
// =============================================================

const baseURL = import.meta.env.VITE_API_BASE || '/api'

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 30_000,
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.apiKey) config.headers.Authorization = `Bearer ${auth.apiKey}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && !error.config?.__ignoreAuthError) {
      useAuthStore().logout()
    }
    return Promise.reject(error)
  }
)

// ---- Wrappers métier ----
export const jobsApi = {
  async create(prompt: string): Promise<{ jobId: string; status: string }> {
    const { data } = await http.post('/flash-archi/generate', { prompt })
    return data
  },
  async list(limit = 50, offset = 0): Promise<{ items: JobSummary[]; limit: number; offset: number; count: number }> {
    const { data } = await http.get('/flash-archi/jobs', { params: { limit, offset } })
    return data
  },
  async get(id: string): Promise<Job> {
    const { data } = await http.get(`/flash-archi/jobs/${encodeURIComponent(id)}`)
    return data
  },
}

/**
 * Abonnement SSE au flux `/flash-archi/events/:id`.
 * - Utilise fetch (stream) pour ne pas dépendre du polyfill EventSource
 *   (résout aussi le cas du flux authentifié sans cookie).
 * - Resolve automatiquement (et ferme l'AbortController) quand le job
 *   atteint un statut terminal (completed | failed).
 * - `onEvent` reçoit chaque événement parsé.
 * - Renvoie une fonction d'annulation (à appeler au désabonnement).
 */
export function subscribeJob(
  id: string,
  onEvent: (ev: SseEvent) => void,
  onError?: (err: unknown) => void
): () => void {
  const ac = new AbortController()
  const auth = useAuthStore()

  ;(async () => {
    try {
      const res = await fetch(`${baseURL}/flash-archi/events/${encodeURIComponent(id)}`, {
        headers: { Accept: 'text/event-stream', ...(auth.apiKey ? { Authorization: `Bearer ${auth.apiKey}` } : {}) },
        signal: ac.signal,
      })
      if (!res.ok || !res.body) {
        onError?.(new Error(`SSE: HTTP ${res.status}`))
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // Chaque événement SSE est séparé par une ligne blanche.
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() ?? ''
        for (const block of blocks) {
          for (const line of block.split('\n')) {
            if (!line.startsWith('data:')) continue
            const json = line.replace(/^data:\s*/, '').trim()
            if (!json) continue
            try {
              const ev = JSON.parse(json) as SseEvent
              onEvent(ev)
              if (ev.status === 'completed' || ev.status === 'failed') {
                ac.abort()
                return
              }
            } catch {
              /* JSON malformé : ignore l'événement */
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return
      onError?.(err)
    }
  })()

  return () => ac.abort()
}

export const healthApi = {
  async get() {
    const { data } = await axios.get('/health', { baseURL: import.meta.env.VITE_API_BASE || '' })
    return data
  },
}