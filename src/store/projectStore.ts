// src/store/projectStore.ts
'use client'
import { create } from 'zustand'
import type { Project, ProjectProgress } from '@/types/api'

interface ProjectState {
  activeProject: Project | null
  progress: ProjectProgress | null
  setActiveProject: (project: Project | null) => void
  setProgress: (progress: ProjectProgress | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  progress: null,
  setActiveProject: (activeProject) => set({ activeProject }),
  setProgress: (progress) => set({ progress }),
}))
