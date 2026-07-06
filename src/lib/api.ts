// src/lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import type {
  AuthTokens, User, Project, ProjectMember, ProjectProgress,
  Floor, Zone, TaskTemplate, ZoneTask,
  Report, Approval, RollbackResult, ModelFile,
  Organization, TeamMember, TeamMemberCreate, TeamMemberUpdate,
} from '@/types/api'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const V1 = '/api/v1'

export const api = axios.create({ baseURL: API_BASE })

// ---- JWT injection ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ---- 401 → refresh once → retry → logout on second failure ----
let refreshPromise: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  try {
    // plain axios: skip interceptors to avoid recursion
    const { data } = await axios.post<AuthTokens>(`${API_BASE}${V1}/auth/refresh`, {
      refresh_token: refresh,
    })
    storeTokens({ ...data, refresh_token: data.refresh_token ?? refresh })
    return data.access_token
  } catch {
    return null
  }
}

function forceLogoutAndRedirect() {
  useAuthStore.getState().logout()
  clearTokens()
  if (typeof window !== 'undefined') window.location.href = '/login'
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true
      refreshPromise = refreshPromise ?? tryRefresh()
      const newToken = await refreshPromise
      refreshPromise = null
      if (newToken) {
        useAuthStore.getState().setToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api.request(original)
      }
      forceLogoutAndRedirect()
    }
    return Promise.reject(error)
  },
)

// ================================ Auth ================================
export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>(`${V1}/auth/login`, { email, password })
  return data
}

export async function refreshToken(refresh_token: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>(`${V1}/auth/refresh`, { refresh_token })
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>(`${V1}/auth/me`)
  return data
}

export interface OrganizationRegisterPayload {
  organization_name: string
  email: string
  password: string
  full_name?: string
}

export async function registerOrganization(payload: OrganizationRegisterPayload): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>(`${V1}/auth/register`, payload)
  return data
}

// ============================ Organizations ============================
export async function getMyOrganization(): Promise<Organization> {
  const { data } = await api.get<Organization>(`${V1}/organizations/me`)
  return data
}

export async function listOrgMembers(): Promise<TeamMember[]> {
  const { data } = await api.get<TeamMember[]>(`${V1}/organizations/members`)
  return data
}

export async function createOrgMember(payload: TeamMemberCreate): Promise<TeamMember> {
  const { data } = await api.post<TeamMember>(`${V1}/organizations/members`, payload)
  return data
}

export async function updateOrgMember(
  userId: string, payload: TeamMemberUpdate,
): Promise<TeamMember> {
  const { data } = await api.patch<TeamMember>(`${V1}/organizations/members/${userId}`, payload)
  return data
}

// ============================== Contact ================================
export interface ContactPayload {
  email: string
  description: string
}

export async function submitContact(payload: ContactPayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`${V1}/contact`, payload)
  return data
}

// ============================== Projects ==============================
export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>(`${V1}/projects`)
  return data
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`${V1}/projects/${id}`)
  return data
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  const { data } = await api.post<Project>(`${V1}/projects`, payload)
  return data
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const { data } = await api.patch<Project>(`${V1}/projects/${id}`, payload)
  return data
}

export async function getProjectProgress(id: string): Promise<ProjectProgress> {
  const { data } = await api.get<ProjectProgress>(`${V1}/projects/${id}/progress`)
  return data
}

export async function getProjectMembers(id: string): Promise<ProjectMember[]> {
  const { data } = await api.get<ProjectMember[]>(`${V1}/projects/${id}/members`)
  return data
}

export async function inviteMember(id: string, email: string, role: string): Promise<ProjectMember> {
  const { data } = await api.post<ProjectMember>(`${V1}/projects/${id}/members`, { email, role })
  return data
}

// =============================== Floors ===============================
export async function getFloors(projectId: string): Promise<Floor[]> {
  const { data } = await api.get<Floor[]>(`${V1}/projects/${projectId}/floors`)
  return data
}

export async function createFloor(projectId: string, payload: Partial<Floor>): Promise<Floor> {
  const { data } = await api.post<Floor>(`${V1}/projects/${projectId}/floors`, payload)
  return data
}

// =============================== Zones ================================
export async function getZones(floorId: string): Promise<Zone[]> {
  const { data } = await api.get<Zone[]>(`${V1}/floors/${floorId}/zones`)
  return data
}

export async function createZone(floorId: string, payload: Partial<Zone>): Promise<Zone> {
  const { data } = await api.post<Zone>(`${V1}/floors/${floorId}/zones`, payload)
  return data
}

export async function updateZone(
  floorId: string, zoneId: string, payload: Partial<Zone>,
): Promise<Zone> {
  const { data } = await api.patch<Zone>(`${V1}/floors/${floorId}/zones/${zoneId}`, payload)
  return data
}

export async function getZoneProgress(floorId: string, zoneId: string): Promise<ZoneTask[]> {
  const { data } = await api.get<ZoneTask[]>(`${V1}/floors/${floorId}/zones/${zoneId}/progress`)
  return data
}

// =============================== Tasks ================================
export async function getTaskTemplates(category?: string): Promise<TaskTemplate[]> {
  const { data } = await api.get<TaskTemplate[]>(`${V1}/task-templates`, {
    params: category ? { category } : undefined,
  })
  return data
}

export async function createTaskTemplate(payload: {
  name: string; category: string
}): Promise<TaskTemplate> {
  const { data } = await api.post<TaskTemplate>(`${V1}/task-templates`, payload)
  return data
}

export async function assignTask(
  zoneId: string,
  payload: { task_template_id: string; layer_order: number },
): Promise<ZoneTask> {
  const { data } = await api.post<ZoneTask>(`${V1}/zones/${zoneId}/tasks`, payload)
  return data
}

// ============================== Reports ===============================
export interface ReportFilters {
  project_id?: string
  zone_task_id?: string
  status?: string
  limit?: number
}

export async function getReports(params?: ReportFilters): Promise<Report[]> {
  const { data } = await api.get<Report[]>(`${V1}/reports`, { params })
  return data
}

export async function getReport(id: string): Promise<Report> {
  const { data } = await api.get<Report>(`${V1}/reports/${id}`)
  return data
}

export async function approveReport(
  id: string,
  payload: { action: 'approved' | 'rejected'; comment?: string; final_pct?: number },
): Promise<Approval> {
  const { data } = await api.post<Approval>(`${V1}/reports/${id}/approval`, payload)
  return data
}

export async function rollbackReport(id: string, reason: string): Promise<RollbackResult> {
  const { data } = await api.post<RollbackResult>(
    `${V1}/reports/${id}/approval/rollback`, { reason },
  )
  return data
}

// ============================ Model files =============================
export type ModelFileType = 'skeleton' | 'envelope' | 'interior'

export async function uploadModel(
  projectId: string, file: File, fileType: ModelFileType = 'skeleton',
): Promise<ModelFile> {
  const form = new FormData()
  form.append('file', file)
  form.append('file_type', fileType)
  const { data } = await api.post<ModelFile>(
    `${V1}/projects/${projectId}/model/upload`, form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function getModelFile(projectId: string): Promise<ModelFile> {
  const { data } = await api.get<ModelFile>(`${V1}/projects/${projectId}/model`)
  return data
}

export async function saveZoneMap(
  projectId: string, zone_map: Record<string, string>,
): Promise<ModelFile> {
  const { data } = await api.post<ModelFile>(`${V1}/projects/${projectId}/model/manual`, { zone_map })
  return data
}

/** Local-storage mode: gltf_url may be null — construct from the key (BACKEND_CHANGES §9). */
export function resolveGltfUrl(model: ModelFile | null | undefined): string | null {
  if (!model) return null
  return model.gltf_url ?? (model.gltf_s3_key ? `${API_BASE}/files/${model.gltf_s3_key}` : null)
}