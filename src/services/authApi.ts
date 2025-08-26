import { axiosInstance } from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types'

export interface UpdateAccountPayload {
  first_name?: string
  last_name?: string
  email?: string
  name?: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  password: string
  confirmPassword: string
}

export interface VerifyEmailPayload {
  token: string
}

export interface SendVerificationEmailPayload {
  email: string
}

export interface StripeCheckoutPayload {
  priceId: string
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

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post('forgot-password', payload)
      return {
        success: true,
        message: 'Password reset instructions sent successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to send reset instructions',
        data: error?.response?.data
      }
    }
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post('reset-password', payload)
      return {
        success: true,
        message: 'Password reset successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to reset password',
        data: error?.response?.data
      }
    }
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(`/verify-email/${payload.token}`)
      return {
        success: true,
        message: 'Email verified successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to verify email',
        data: error?.response?.data
      }
    }
  }

  async sendVerificationEmail(payload: SendVerificationEmailPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post('/send-verification-email', payload)
      return {
        success: true,
        message: 'Verification email sent successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to send verification email',
        data: error?.response?.data
      }
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

  async getStripeCheckoutSession(payload: StripeCheckoutPayload): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(`v1/stripe/checkout-session/${payload.priceId}`)
      return {
        success: true,
        message: 'Checkout session created successfully',
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || 'Failed to create checkout session',
        data: error?.response?.data
      }
    }
  }
}

export const authApi = AuthApiService.getInstance()


