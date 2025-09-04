import { axiosInstance } from '@/utils/axiosInstance'
import type { AdminUsersFilters, AdminUsersResponse } from '@/types/admin'

export const adminApi = {
  async verifyAccess(): Promise<boolean> {
    try {
      const res = await axiosInstance.get('/v1/admin-panel')
      // Expecting { allowed: true } or HTTP 200 truthy
      return Boolean(res?.data?.allowed ?? true)
    } catch {
      return false
    }
  },

  async getUsers(filters: AdminUsersFilters): Promise<AdminUsersResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v))
    })
    const url = `/v1/admin-panel/users${params.toString() ? `?${params.toString()}` : ''}`
    const res = await axiosInstance.get(url)
    return res.data as AdminUsersResponse
  }
}


