/**
 * API Types
 * Centralized types for all API-related interfaces
 */

// Base API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

// Base API Response with error handling
export interface BaseApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Pagination types
export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: 20 | 50 | 100
}

export interface ApiPagination {
  current_page: number
  data: unknown[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

// Sorting and filtering types
export type SortOrder = 'asc' | 'desc'

// Common API parameters
export interface BaseApiParams {
  apikey: string
}

export interface PaginationParams {
  page?: number
  per_page?: number
}

export interface SortingParams {
  sortby?: string
  sortorder?: SortOrder
}

export interface FilteringParams {
  segment_id?: number
  date?: string
  search?: string
  status?: string
}

// Error types
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

// Request configuration
export interface RequestConfig {
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  headers?: Record<string, string>
  params?: Record<string, unknown>
}

// File upload types
export interface FileUploadResponse {
  success: boolean
  message: string
  file_url?: string
  file_id?: string
}

export interface ImportResponse {
  success: boolean
  message: string
  imported_count?: number
  errors?: string[]
}

// Common payload types
export interface IdPayload {
  id: string | number
}

export interface IdsPayload {
  ids: (string | number)[]
}

export interface MessagePayload {
  message: string
}

export interface StatusPayload {
  status: number | string
}

// Generic response types
export interface SuccessResponse {
  success: boolean
  message: string
}

export interface StatusResponse {
  status: string
  message: string
} 