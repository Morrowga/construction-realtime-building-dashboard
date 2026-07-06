// src/types/api.ts

// ---- Users ----
export type UserRole = 'admin' | 'manager' | 'engineer' | 'client'

export interface User {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: UserRole
  is_active?: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string | null
  token_type: string
}

// ---- Organizations & team members ----
export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  is_active: boolean
  created_at: string
}

export interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface TeamMemberCreate {
  email: string
  full_name?: string
  role: UserRole
}

export interface TeamMemberUpdate {
  role?: UserRole
  is_active?: boolean
}

// ---- Colour signals ----
export type ColourSignal = 'green' | 'amber' | 'grey'

// ---- Projects ----
export interface Project {
  id: string
  name: string
  address: string | null
  status: string
  report_format?: 'standard' | 'nikken'
  planned_end_date: string | null
  overall_pct?: number
  geo_lat: number | null
  geo_lng: number | null
  geo_radius_m?: number
  client_id?: string | null
  admin_id?: string | null
  created_at?: string
}

export interface ProjectMember {
  id: string
  user_id: string
  role: string
  joined_at?: string
  user: User
}

// ---- Progress tree (GET /projects/{id}/progress) ----
export interface TaskProgress {
  zone_task_id: string
  task_name: string
  task_category: string
  pct: number
  layer_order: number
  colour_signal: ColourSignal
  active_layer_name?: string | null
  active_layer_pct?: number
}

export interface ZoneProgress {
  zone_id: string
  name: string
  mesh_id: string | null
  pct: number
  colour_signal: ColourSignal
  active_layer_name: string | null
  active_layer_category: string | null
  active_layer_pct: number
  finish_data: Record<string, any> | null
  tasks: TaskProgress[]
}

export interface FloorProgress {
  floor_id: string
  name: string
  pct: number
  zones: ZoneProgress[]
}

export interface ProjectProgress {
  overall_pct: number
  floors: FloorProgress[]
}

// ---- Floors & Zones ----
export interface Floor {
  id: string
  name: string
  level_number: number
  display_order: number
  zone_count?: number
}

export interface Zone {
  id: string
  floor_id?: string
  name: string
  zone_type: string | null
  model_mesh_id: string | null
  finish_data: Record<string, any> | null
  tasks?: ZoneTask[]
}

// ---- Tasks ----
export interface TaskTemplate {
  id: string
  name: string
  category: string
}

export interface ZoneTask {
  id: string
  zone_id: string
  task_template_id: string
  progress_pct: number
  layer_order: number
  colour_signal: ColourSignal
  active_layer_name: string | null
  active_layer_pct?: number
  last_updated_at?: string | null
  template: TaskTemplate
}

// ---- Reports ----
export type ReportStatus = 'pending' | 'approved' | 'rejected'

export interface ReportPhoto {
  id: string
  s3_url: string
  s3_key: string
  ai_tags: any
  order_index: number
}

export interface Approval {
  id: string
  report_id?: string
  manager_id?: string
  action: 'approved' | 'rejected'
  comment: string | null
  final_pct: number | null
  approved_at: string | null
  is_rolled_back: boolean
  rolled_back_at?: string | null
  rollback_reason: string | null
}

export interface Report {
  id: string
  zone_task_id: string
  engineer_id: string
  engineer_name?: string
  zone_name?: string
  floor_name?: string
  note: string | null
  status: ReportStatus
  engineer_progress_pct: number | null
  ai_progress_pct: number | null
  ai_confidence: number | null
  ai_analysis: {
    progress_pct?: number
    confidence?: number
    photo_analysis?: any[]
    note_match?: boolean
    mismatch_reason?: string | null
    flags?: string[]
    summary?: string
  } | null
  final_progress_pct: number | null
  submitted_at: string
  photos: ReportPhoto[]
  approval: Approval | null
}

export interface RollbackResult {
  message: string
  report_id: string
  previous_pct: number
  reverted_to_pct: number
  colour_signal: ColourSignal
  rolled_back_by: string
  reason: string
}

// ---- Model files ----
export interface ModelFile {
  id: string
  project_id: string
  source_type: string | null
  parse_status: 'pending' | 'processing' | 'done' | 'failed' | string
  original_s3_key?: string | null
  gltf_s3_key: string | null
  gltf_url: string | null
  zone_map: Record<string, string> | null
}

// ---- WebSocket events ----
export interface WSProgressUpdate {
  type: 'progress_update'
  zone_task_id: string
  zone_id: string
  floor_id: string
  mesh_id: string
  new_pct: number
  colour_signal: ColourSignal
  active_layer_name: string
  active_layer_category: string
  active_layer_pct: number
  layer_order?: number
}

export interface WSProgressRollback {
  type: 'progress_rollback'
  zone_task_id?: string
  zone_id?: string
  floor_id?: string
  mesh_id: string
  previous_pct: number
  reverted_to_pct: number
  colour_signal: ColourSignal
  active_layer_name?: string
  active_layer_pct?: number
  rolled_back_by: string
  reason: string
}

export interface WSAIComplete {
  type: 'ai_analysis_complete'
  report_id: string
}

export type WSEvent =
  | WSProgressUpdate
  | WSProgressRollback
  | WSAIComplete
  | { type: string; [key: string]: any }