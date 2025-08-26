import { axiosInstance } from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types'

export interface UpdateAccountPayload {
  first_name?: string
  last_name?: string
  email?: string
  name?: string
}

export class AuthApiService {
  private static instance: AuthApiService

  private constructor() {}

  public static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService()
    }
    return AuthApiService.instance
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance.post('v1/login', {
        ...credentials,
        'agentic-login': 1
      })
      return response
    } catch (error: any) {
      throw error
    }
  }

  async signup(payload: any): Promise<any> {
    try {
      const response = await axiosInstance.post('v1/register', payload)
      return response
    } catch (error: any) {
      throw error
    }
  }

  async logout(): Promise<any> {
    try {
      return await axiosInstance.post('v1/logout')
    } catch (error: any) {
      throw error
    }
  }

  async updateAccount(payload: UpdateAccountPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post('/v1/account/update', payload, {
        timeout: 30000
      })

      return {
        success: true,
        message: 'Account updated successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to update account',
        data: error?.response?.data
      }
    }
  }
}

export const authApi = AuthApiService.getInstance()


