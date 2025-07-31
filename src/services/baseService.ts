/**
 * Base Service Class
 * Provides common functionality for all API services with strong typing
 */

import { httpClient, apiKeyManager } from '@/utils/api'
import type { AxiosRequestConfig } from 'axios'

// Base API Response interface
export interface BaseApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Error types
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

// Request configuration
export interface RequestConfig extends AxiosRequestConfig {
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

// Base service class
export abstract class BaseService {
  protected readonly httpClient = httpClient
  protected readonly apiKeyManager = apiKeyManager

  /**
   * Get current API key
   */
  protected getApiKey(): string {
    const apiKey = this.apiKeyManager.getCurrent()
    if (!apiKey) {
      throw new Error('API key not found')
    }
    return apiKey
  }

  /**
   * Make a GET request with proper error handling
   */
  protected async get<T>(
    url: string, 
    config?: RequestConfig
  ): Promise<BaseApiResponse<T>> {
    try {
      const apiKey = this.getApiKey()
      const params = { ...config?.params, apikey: apiKey }
      
      const response = await this.httpClient.get<T>(url, {
        ...config,
        params
      })
      
      return {
        success: true,
        message: 'Request successful',
        data: response
      }
    } catch (error) {
      return this.handleError<T>(error)
    }
  }

  /**
   * Make a POST request
   */
  protected async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<BaseApiResponse<T>> {
    try {
      const apiKey = this.getApiKey()
      let requestData: Record<string, unknown>
      
      if (data && typeof data === 'object' && data !== null) {
        requestData = Object.assign({}, data as Record<string, unknown>, { apikey: apiKey })
      } else {
        requestData = { apikey: apiKey }
      }
      
      const response = await this.httpClient.post<T>(url, requestData, config)
      return { success: true, message: 'Success', data: response }
    } catch (error) {
      return this.handleError<T>(error)
    }
  }

  /**
   * Make a PUT request with proper error handling
   */
  protected async put<T>(
    url: string, 
    data?: unknown, 
    config?: RequestConfig
  ): Promise<BaseApiResponse<T>> {
    try {
      const apiKey = this.getApiKey()
      let payload: Record<string, unknown>
      
      if (data && typeof data === 'object' && data !== null) {
        payload = Object.assign({}, data as Record<string, unknown>, { apikey: apiKey })
      } else {
        payload = { apikey: apiKey }
      }
      
      const response = await this.httpClient.put<T>(url, payload, config)
      
      return {
        success: true,
        message: 'Request successful',
        data: response
      }
    } catch (error) {
      return this.handleError<T>(error)
    }
  }

  /**
   * Make a DELETE request with proper error handling
   */
  protected async delete<T>(
    url: string, 
    config?: RequestConfig
  ): Promise<BaseApiResponse<T>> {
    try {
      const apiKey = this.getApiKey()
      const params = config?.params ? Object.assign({}, config.params, { apikey: apiKey }) : { apikey: apiKey }
      
      const response = await this.httpClient.delete<T>(url, {
        ...config,
        params
      })
      
      return {
        success: true,
        message: 'Request successful',
        data: response
      }
    } catch (error) {
      return this.handleError<T>(error)
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError<T>(error: unknown): BaseApiResponse<T> {
    console.error('API Error:', error)
    
    let message = 'An unexpected error occurred'
    let status: number | undefined
    
    if (error && typeof error === 'object') {
      if ('response' in error && error.response) {
        const response = error.response as { data?: { message?: string }, status?: number }
        message = response.data?.message || `HTTP ${response.status} error`
        status = response.status
      } else if ('message' in error && typeof error.message === 'string') {
        message = error.message
      }
    }
    
    return {
      success: false,
      message,
      error: message,
      data: undefined
    }
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, unknown>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    
    return filteredParams ? `?${filteredParams}` : ''
  }

  /**
   * Create FormData with API key
   */
  protected createFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData()
    const apiKey = this.getApiKey()
    
    formData.append('apikey', apiKey)
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    return formData
  }
} 