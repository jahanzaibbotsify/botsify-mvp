import { BOTSIFY_BASE_URL } from '../utils/config';
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
        .join('&');
      
      return filteredParams ? `?${filteredParams}` : '';
    }
  
    async getUsers(params: GetUsersParams): Promise<ApiResponse<ApiUsersResponse>> {
      try {
        const API_KEY = useApiKeyStore().apiKey
        const queryParams = {
          ...params,
          apikey: API_KEY
        };
  
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${BOTSIFY_BASE_URL}/v1/get-users${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } catch (error: any) {
        console.error('Error fetching users:', error);
        return {
          success: false,
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
          },
          message: error.message || 'Failed to fetch users'
        };
      }
    }
  
    async changeUserStatus(status: number, userIds: number[]): Promise<ApiResponse<any>> {
      try {
        const API_KEY = useApiKeyStore().apiKey
        const payload: UserActionPayload = {
          user_ids: userIds,
          apikey: API_KEY
        };
  
        const response = await fetch(`${BOTSIFY_BASE_URL}/v1/user/change-status/${status}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } catch (error: any) {
        console.error('Error changing user status:', error);
        return {
          success: false,
          data: null,
          message: error.message || 'Failed to change user status'
        };
      }
    }

    async importUsers(
      file: File, 
      onProgress?: (progress: number) => void
    ): Promise<ApiResponse<ImportResponse>> {
      try {
        const API_KEY = useApiKeyStore().apiKey
        
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('apikey', API_KEY)
        formData.append('file', file)
        
        // Create XMLHttpRequest for progress tracking
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest()
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
              const progress = Math.round((event.loaded / event.total) * 100)
              onProgress(progress)
            }
          })
          
          // Handle response
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                resolve({
                  success: true,
                  data: data
                })
              } catch (error) {
                resolve({
                  success: false,
                  data: {
                    success: false,
                    message: 'Invalid response format'
                  },
                  message: 'Invalid response format'
                })
              }
            } else {
              resolve({
                success: false,
                data: {
                  success: false,
                  message: `HTTP error! status: ${xhr.status}`
                },
                message: `HTTP error! status: ${xhr.status}`
              })
            }
          })
          
          // Handle errors
          xhr.addEventListener('error', () => {
            resolve({
              success: false,
              data: {
                success: false,
                message: 'Network error occurred'
              },
              message: 'Network error occurred'
            })
          })
          
          xhr.addEventListener('abort', () => {
            resolve({
              success: false,
              data: {
                success: false,
                message: 'Upload was cancelled'
              },
              message: 'Upload was cancelled'
            })
          })
          
          // Open and send request
          xhr.open('POST', `${BOTSIFY_BASE_URL}/v1/bot/import-users`)
          xhr.send(formData)
        })
        
      } catch (error: any) {
        console.error('Error importing users:', error)
        return {
          success: false,
          data: {
            success: false,
            message: error.message || 'Failed to import users'
          },
          message: error.message || 'Failed to import users'
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
        };

        const response = await fetch(`${BOTSIFY_BASE_URL}/v1/update-user-attributes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } catch (error: any) {
        console.error('Error updating user attributes:', error);
        return {
          success: false,
          data: {
            success: false,
            message: error.message || 'Failed to update user attributes'
          },
          message: error.message || 'Failed to update user attributes'
        };
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
        };

        const response = await fetch(`${BOTSIFY_BASE_URL}/v1/delete-user-attributes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } catch (error: any) {
        console.error('Error deleting user attribute:', error);
        return {
          success: false,
          data: {
            success: false,
            message: error.message || 'Failed to delete user attribute'
          },
          message: error.message || 'Failed to delete user attribute'
        };
      }
    }
  }
  

export const userApi = new UserApiService();