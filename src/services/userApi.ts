import { BaseService, BaseApiResponse } from './baseService'
import type { 
  GetUsersParams, 
  ApiUsersResponse,
  AttributeResponse,
  UserAttribute
} from '@/types/user'
import type { ImportResponse } from '@/types/api'

// Strongly typed response interfaces
export interface UsersApiResponse extends BaseApiResponse<ApiUsersResponse> {}
export interface UserStatusApiResponse extends BaseApiResponse<{ message: string }> {}
export interface ImportApiResponse extends BaseApiResponse<ImportResponse> {}
export interface AttributeApiResponse extends BaseApiResponse<AttributeResponse> {}
export interface UserAttributesApiResponse extends BaseApiResponse<UserAttribute[]> {}

// Updated payload types without apikey (added automatically by base service)
interface UserActionPayloadWithoutApiKey {
  user_ids: number[]
}

interface AttributeUpdatePayloadWithoutApiKey {
  user_ids: number[]
  user_attributes: UserAttribute[]
}

interface AttributeDeletePayloadWithoutApiKey {
  messenger_user_id: string
  id: number
}

class UserApiService extends BaseService {
  /**
   * Get users with pagination and filtering
   */
  async getUsers(params: GetUsersParams): Promise<UsersApiResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>)
    return this.get<ApiUsersResponse>(`v1/get-users${queryString}`)
  }

  /**
   * Change user status (activate/deactivate)
   */
  async changeUserStatus(status: number, userIds: number[]): Promise<UserStatusApiResponse> {
    const payload: UserActionPayloadWithoutApiKey = { user_ids: userIds }
    return this.post<{ message: string }>(`v1/user/change-status/${status}`, payload)
  }

  /**
   * Import users from file
   */
  async importUsers(file: File): Promise<ImportApiResponse> {
    const formData = this.createFormData({ file })
    return this.post<ImportResponse>('/v1/bot/import-users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Update user attributes
   */
  async updateUserAttributes(
    userIds: number[],
    attributes: UserAttribute[]
  ): Promise<AttributeApiResponse> {
    const payload: AttributeUpdatePayloadWithoutApiKey = {
      user_ids: userIds,
      user_attributes: attributes
    }
    return this.post<AttributeResponse>('v1/update-user-attributes', payload)
  }

  /**
   * Delete user attribute
   */
  async deleteUserAttribute(
    messengerUserId: string,
    attributeId: number
  ): Promise<AttributeApiResponse> {
    const payload: AttributeDeletePayloadWithoutApiKey = {
      messenger_user_id: messengerUserId,
      id: attributeId
    }
    return this.post<AttributeResponse>('v1/delete-user-attributes', payload)
  }

  /**
   * Get user attributes
   */
  async getUserAttributes(fbId: string): Promise<UserAttributesApiResponse> {
    return this.get<UserAttribute[]>(`v1/get-user-attribute-data/${fbId}`)
  }

  /**
   * Execute user action (activate, deactivate, delete, delete_conversation)
   */
  async executeUserAction(
    action: 'activate' | 'deactivate' | 'delete' | 'delete_conversation',
    userIds: number[]
  ): Promise<UserStatusApiResponse> {
    const payload: UserActionPayloadWithoutApiKey = { user_ids: userIds }
    return this.post<{ message: string }>(`v1/user/${action}`, payload)
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<BaseApiResponse<{ token: string; user: unknown }>> {
    const payload = { email, password }
    return this.post<{ token: string; user: unknown }>('v1/auth/login', payload)
  }
}

export const userApi = new UserApiService()