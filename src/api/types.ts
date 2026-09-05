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