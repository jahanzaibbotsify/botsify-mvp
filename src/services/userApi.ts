import { axiosInstance, uploadInstance } from '@/utils/axiosInstance'
import { useApiKeyStore } from '@/stores/apiKeyStore';
import type { 
  GetUsersParams, 
  UserActionPayload, 
  ImportResponse, 
  ApiResponse, 
  ApiUsersResponse,
  AttributeUpdatePayload,
  AttributeDeletePayload,
  AttributeResponse,
  UserAttribute
} from '@/types/user'

class UserApiService {
  private buildQueryString(params: Record<string, any>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return filteredParams ? `?${filteredParams}` : ''
  }

  async getUsers(params: GetUsersParams): Promise<ApiResponse<ApiUsersResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const queryString = this.buildQueryString({ ...params, apikey: API_KEY })
      const response = await axiosInstance.get(`v1/get-users${queryString}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch users',
        data: {
          key_attributes: {},
          users: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: 20,
            prev_page_url: null,
            to: 0,
            total: 0
          },
          bot_key: ''
        }
      }
    }
  }

  async changeUserStatus(status: number, userIds: number[]): Promise<ApiResponse<any>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: UserActionPayload = { user_ids: userIds, apikey: API_KEY }
      const response = await axiosInstance.post(`v1/user/change-status/${status}`, payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error changing user status:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to change user status',
        data: null
      }
    }
  }

  async importUsers(
    file: File,
  ): Promise<ApiResponse<ImportResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const formData = new FormData()
      formData.append('apikey', API_KEY)
      formData.append('file', file)

      const response = await uploadInstance.post(`/v1/bot/import-users`, formData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error importing users:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to import users',
        data: { success: false, message: error?.message || 'Upload failed' }
      }
    }
  }

  async updateUserAttributes(
    userIds: number[],
    attributes: UserAttribute[]
  ): Promise<ApiResponse<AttributeResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: AttributeUpdatePayload = {
        apikey: API_KEY,
        user_ids: userIds,
        user_attributes: attributes
      }

      const response = await axiosInstance.post('v1/update-user-attributes', payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error updating user attributes:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update user attributes',
        data: { success: false, message: error.message }
      }
    }
  }

  async deleteUserAttribute(
    messengerUserId: string,
    attributeId: number
  ): Promise<ApiResponse<AttributeResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: AttributeDeletePayload = {
        apikey: API_KEY,
        messenger_user_id: messengerUserId,
        id: attributeId
      }

      const response = await axiosInstance.post('v1/delete-user-attributes', payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting user attribute:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete user attribute',
        data: { success: false, message: error.message }
      }
    }
  }

  async getUserAttributes(fbId: string): Promise<ApiResponse<UserAttribute[]>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.get(`v1/get-user-attribute-data/${fbId}?apikey=${API_KEY}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching user attributes:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch user attributes',
        data: []
      }
    }
  }
}

  

export const userApi = new UserApiService();