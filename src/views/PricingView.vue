<script setup lang="ts">
// Page Pricing — 3 offres (Gratuit / Pro / Enterprise) + FAQ accordéon.
import { ref } from 'vue'

type Plan = {
  name: string
  price: string
  period: string
  tagline: string
  features: { text: string; included: boolean }[]
  cta: { label: string; to: string }
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'Gratuit',
    price: '0XOF',
    period: '/mois',
    tagline: 'Pour découvrir Flash-Archi et valider votre idée.',
    features: [
      { text: '3 générations / mois', included: true },
      { text: 'Plans SVG', included: true },
      { text: 'Dashboard de base', included: true },
      { text: 'Façades PNG', included: false },
      { text: 'Export IFC', included: false },
      { text: 'Historique illimité', included: false },
    ],
    cta: { label: 'Commencer gratuitement', to: '/login' },
  },
  {
    name: 'Pro',
    price: '17,400 XOF',
    period: '/mois',
    tagline: "L'outil complet pour les architectes indépendants.",
    featured: true,
    features: [
      { text: '50 générations / mois', included: true },
      { text: 'Plans SVG + Façades PNG', included: true },
      { text: 'Export IFC', included: true },
      { text: 'Historique illimité', included: true },
      { text: 'Support email', included: true },
      { text: "Paiement via Orange Money (BF)", included: true },
    ],
    cta: { label: "S'abonner avec Orange Money", to: '/checkout?plan=pro' },
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    tagline: "Pour les cabinets et intégrations à grande échelle.",
    features: [
      { text: 'Générations illimitées', included: true },
      { text: 'Accès API', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Intégration sur mesure', included: true },
    ],
    cta: { label: 'Nous contacter', to: 'mailto:contact@flash-archi.com' },
  },
]

// ---- FAQ accordéon ----
type Faq = { q: string; a: string }
const faqs: Faq[] = [
  {
    q: 'Puis-je annuler à tout moment ?',
    a: "Oui, l'abonnement Pro est sans engagement. Vous pouvez résilier à tout moment depuis votre espace, la fin de la période reste accessible jusqu'à son terme.",
  },
  {
    q: 'Quels formats sont supportés ?',
    a: "Flash-Archi génère des plans en SVG (vectoriel), des façades en PNG haute résolution, et propose l'export IFC pour les outils BIM (Revit, ArchiCAD).",
  },
  {
    q: 'Comment fonctionne le quota ?',
    a: "Chaque plan dispose d'un nombre de générations utilisables par mois, qui se réinitialise au 1er du mois. Le compteur est visible dans votre tableau de bord.",
  },
]

const openIndex = ref<number | null>(null)
function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section class="bg-slate-50">
    <div class="mx-auto max-w-6xl px-6 py-14">
      <!-- En-tête -->
      <header class="text-center">
        <h1 class="font-display text-3xl font-bold text-brand-900">Flash-Archi Pricing</h1>
        <p class="mx-auto mt-3 max-w-2xl text-slate-500">
          Des offres simples et évolutives. Commencez gratuitement, passez en Pro quand vous êtes
          prêt à produire en série.
        </p>
      </header>

      <!-- Cartes de pricing -->
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.name"
          class="relative flex flex-col rounded-xl border bg-white p-6 shadow-sm transition"
          :class="plan.featured ? 'border-accent-600 shadow-lg ring-1 ring-accent-600' : 'border-slate-200'"
        >
          <div
            v-if="plan.featured"
            class="absolute -top-3 left-6 rounded-full bg-accent-600 px-3 py-0.5 text-xs font-semibold text-white"
          >
            Populaire
          </div>

          <h2 class="font-display text-lg font-semibold text-brand-900">{{ plan.name }}</h2>
          <p class="mt-1 min-h-10 text-sm text-slate-500">{{ plan.tagline }}</p>

          <div class="mt-4 flex items-baseline gap-1">
            <span class="font-display text-3xl font-bold text-brand-900">{{ plan.price }}</span>
            <span v-if="plan.period" class="text-sm text-slate-400">{{ plan.period }}</span>
          </div>

          <ul class="mt-6 flex-1 space-y-2.5 text-sm">
            <li
              v-for="f in plan.features"
              :key="f.text"
              class="flex items-center gap-2"
            >
              <svg
                v-if="f.included"
                class="size-4 shrink-0 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                class="size-4 shrink-0 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
              </svg>
              <span :class="f.included ? 'text-slate-700' : 'text-slate-400'">{{ f.text }}</span>
            </li>
          </ul>

          <div class="mt-7">
            <!-- CTA : lien (router) ou mailto -->
            <a
              v-if="plan.cta.to.startsWith('http') || plan.cta.to.startsWith('mailto:')"
              :href="plan.cta.to"
              class="block text-center"
            >
              <AppButton class="w-full" :variant="plan.featured ? 'primary' : 'secondary'">
                {{ plan.cta.label }}
              </AppButton>
            </a>
            <router-link v-else :to="plan.cta.to">
              <AppButton class="w-full" :variant="plan.featured ? 'primary' : 'secondary'">
                {{ plan.cta.label }}
              </AppButton>
            </router-link>
          </div>
        </article>
      </div>

      <!-- FAQ accordéon -->
      <div class="mx-auto mt-16 max-w-3xl">
        <h2 class="text-center font-display text-2xl font-bold text-brand-900">Questions fréquentes</h2>
        <div class="mt-8 space-y-3">
          <div v-for="(item, i) in faqs" :key="item.q" class="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-800 transition hover:text-brand-700"
              :aria-expanded="openIndex === i"
              @click="toggle(i)"
            >
              <span>{{ item.q }}</span>
              <svg
                class="size-5 shrink-0 text-slate-400 transition-transform"
                :class="openIndex === i ? 'rotate-180' : ''"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <p
              v-if="openIndex === i"
              class="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600"
            >
              {{ item.a }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>