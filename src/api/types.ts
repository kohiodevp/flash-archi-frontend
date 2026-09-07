// =============================================================
// Modèles & statuts métier (alignés sur src/schemas.js du backend)
// =============================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface JobSummary {
  id: string
  status: JobStatus
  error?: string
  createdAt: number
  updatedAt: number
}

export interface FlashSpec {
  surface?: number
  rooms?: number
  style?: string
  roof?: string
  facadeColor?: string
  storeys?: number
  heightPerStorey?: number
  [k: string]: unknown
}

export interface Plan2D {
  svg: string
  scale?: number
  legend?: string
  [k: string]: unknown
}

export interface Facades {
  north?: string
  south?: string
  east?: string
  west?: string
}

export interface BimMetrics {
  footprintArea?: number
  grossVolume?: number
  openingCount?: number
  roofArea?: number
  totalVolume?: number
  [k: string]: unknown
}

export interface JobResult {
  spec?: FlashSpec
  plan2d?: Plan2D
  facades?: Facades
  ifcModel?: string
  bimMetrics?: BimMetrics
  [k: string]: unknown
}

export interface Job extends JobSummary {
  result?: JobResult
  prompt?: string
}

export interface SseEvent {
  jobId: string
  type: string
  status?: JobStatus
  result?: JobResult
  error?: string
}

// ---- Paiement Orange Money (P3-03) ----
export type PaymentStatus = 'pending' | 'accepted' | 'refused' | 'cancelled' | 'failed'

export interface PaymentRecord {
  id: number
  order_id: string
  user_id: string
  amount: number
  currency: string
  plan: string
  status: PaymentStatus
  payment_method: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentResult {
  paymentUrl: string
  orderId: string
}

export interface QuotaInfo {
  plan: 'free' | 'pro' | 'enterprise'
  quotaTotal: number
  quotaRemaining: number
  quotaResetAt: string | null
  subscriptionStatus: string
  lastPaymentId: number | null
}

export interface AccountInfo {
  user: { id: string }
  quota: QuotaInfo
  payments: PaymentRecord[]
}