// =============================================================
// Utilitaires d'affichage
// =============================================================

/** Formate un timestamp epoch ms (ou ISO) en date locale lisible (fr-FR). */
export function formatDate(value: number | string | null | undefined): string {
  if (value == null) return '—'
  const n = typeof value === 'number' ? value : Date.parse(value as string)
  if (Number.isNaN(n)) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(n))
}

/** Tronque un identifiant long de job (job_<uuid> → job_abc1…ef09). */
export function shortId(id: string, head = 9, tail = 4): string {
  if (id.length <= head + tail + 3) return id
  return `${id.slice(0, head)}…${id.slice(-tail)}`
}

/** Déclenche un téléchargement côté navigateur à partir d'un Blob. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}