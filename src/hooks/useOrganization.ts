// src/hooks/useOrganization.ts
'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyOrganization, listOrgMembers, createOrgMember, updateOrgMember,
} from '@/lib/api'
import type { TeamMemberCreate, TeamMemberUpdate } from '@/types/api'

const ORG_KEY = ['organization'] as const
const MEMBERS_KEY = ['organization', 'members'] as const

export function useOrganization() {
  return useQuery({
    queryKey: ORG_KEY,
    queryFn: getMyOrganization,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrgMembers() {
  return useQuery({
    queryKey: MEMBERS_KEY,
    queryFn: listOrgMembers,
    staleTime: 30 * 1000,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamMemberCreate) => createOrgMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: TeamMemberUpdate }) =>
      updateOrgMember(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY })
    },
  })
}