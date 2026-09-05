import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/api/client'

// =============================================================
// Store d'authentification (Pinia)
//
// La clé est saisie au runtime, transmise en Authorization: Bearer
// par l'intercepteur Axios (src/api/client.ts). Elle n'est JAMAIS
// écrite dans le bundle. Persistance : sessionStorage (survit à un
// F5, purge à la fermeture de l'onglet — choix de sécurité, voir §6
// de API_REFERENCE.md : pas de localStorage persistant pour un secret).
// =============================================================

const STORAGE_KEY = 'flash-archi.apiKey'

export const useAuthStore = defineStore('auth', () => {
  const apiKey = ref<string>('')
  const isLoading = ref(false)

  const isAuthenticated = computed(() => apiKey.value.length > 0)

  /**
   * Valide la clé contre l'API réelle (GET /api/flash-archi/jobs?limit=1).
   *  - 200 → clé valide : persiste la session.
   *  - 401 → clé invalide (l'intercepteur Axios purge aussi la session).
   *  - autre/erreur réseau → API indisponible / erreur inattendue.
   * @throws Error avec un message affichable à l'utilisateur.
   */
  async function login(key: string): Promise<void> {
    const trimmed = key.trim()
    if (!trimmed) throw new Error('Veuillez saisir votre clé API.')
    apiKey.value = trimmed
    isLoading.value = true
    try {
      // Appel réel de vérification de la clé (l'intercepteur ajoute le Bearer).
      await http.get('/flash-archi/jobs', { params: { limit: 1 } })
      sessionStorage.setItem(STORAGE_KEY, trimmed)
    } catch (err: unknown) {
      apiKey.value = ''
      const status = (err as { response?: { status?: number } })?.response?.status
      const isNetwork = !(err as { response?: unknown })?.response
      if (status === 401) throw new Error('Clé API invalide. Vérifiez votre clé puis réessayez.')
      if (isNetwork) throw new Error('API indisponible. Réessayez plus tard.')
      throw new Error('Erreur inattendue lors de la vérification de la clé.')
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    apiKey.value = ''
    isLoading.value = false
    sessionStorage.removeItem(STORAGE_KEY)
  }

  /** Réhydrate la session depuis le sessionStorage (appelé au boot + guard). */
  function restoreFromStorage(): void {
    if (!apiKey.value) {
      apiKey.value = sessionStorage.getItem(STORAGE_KEY) ?? ''
    }
  }

  return { apiKey, isLoading, isAuthenticated, login, logout, restoreFromStorage }
})