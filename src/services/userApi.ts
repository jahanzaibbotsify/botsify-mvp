import { BOTSIFY_BASE_URL } from '../utils/config';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import type { GetUsersParams, UserActionPayload, ApiResponse, ApiUsersResponse } from '@/types/user'


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
  }
  

export const userApi = new UserApiService();