import { axiosInstance } from '@/utils/axiosInstance'

export interface StartImpersonationResponse {
  status: boolean
  message: string
  impersonated_user_id: number
}

export interface StopImpersonationResponse {
  status: boolean
  message: string
}

export const impersonationApi = {
  async start(userId: number): Promise<StartImpersonationResponse> {
    const res = await axiosInstance.post(`/v1/admin-panel/users/${userId}/impersonate`)
    return res.data as StartImpersonationResponse
  },

  async stop(): Promise<StopImpersonationResponse> {
    const res = await axiosInstance.post('/v1/admin-panel/users/stop-impersonate')
    return res.data as StopImpersonationResponse
  }
}


