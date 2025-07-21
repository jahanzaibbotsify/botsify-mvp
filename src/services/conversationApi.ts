import { axiosInstance } from '@/utils/axiosInstance'
import { useApiKeyStore } from '@/stores/apiKeyStore'
import type { 
  GetConversationsParams,
  GetUserConversationParams,
  SendMessagePayload,
  ApiResponse,
  ConversationsResponse,
  UserConversationResponse,
  SendMessageResponse
} from '@/types/conversation'

class ConversationApiService {
  async getConversations(queryParams?: Record<string, string>): Promise<ApiResponse<ConversationsResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: GetConversationsParams = { apikey: API_KEY }
      
      // Merge query parameters with the base payload
      const params = { ...payload, ...queryParams }
      
      const response = await axiosInstance.get('v1/live-chat/get-conversations', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching conversations:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch conversations',
        data: {
          conversations: {}
        }
      }
    }
  }

  async getUserConversation(messengerUserId: string, markAsRead: boolean = false): Promise<ApiResponse<UserConversationResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: GetUserConversationParams = { 
        apikey: API_KEY, 
        fbId: messengerUserId,
        load_more: true
      }
      
      // Add unread parameter to mark messages as read
      if (markAsRead) {
        payload.unread = 1
      }
      
      const response = await axiosInstance.get('v1/live-chat/get-user-conversations', { params: payload })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching user conversation:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch user conversation',
        data: {
          conversations: [],
          user: {} as any,
          last_msg_key: 0,
          agent_assigned: '',
          conv_status: ''
        }
      }
    }
  }

  async sendMessage(
    to: string,
    message: string | { attachment: { type: string; payload: { url: string } } },
    type: 'text' | 'image' | 'whatsapp' = 'text',
    format?: 'json'
  ): Promise<ApiResponse<SendMessageResponse>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const payload: SendMessagePayload = {
        apikey: API_KEY,
        to,
        type,
        message,
        ...(format && { format })
      }
      
      const response = await axiosInstance.post('v1/send-message-to-user', payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error sending message:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to send message',
        data: {
          status: 'error',
          messages: []
        }
      }
    }
  }

  // Helper method for sending text messages
  async sendTextMessage(to: string, text: string): Promise<ApiResponse<SendMessageResponse>> {
    return this.sendMessage(to, text, 'text')
  }

  // Helper method for sending image messages
  async sendImageMessage(to: string, imageUrl: string): Promise<ApiResponse<SendMessageResponse>> {
    const message = {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl
        }
      }
    }
    return this.sendMessage(to, message, 'image', 'json')
  }

  // Helper method for sending WhatsApp messages
  async sendWhatsAppMessage(to: string, text: string): Promise<ApiResponse<SendMessageResponse>> {
    return this.sendMessage(to, text, 'whatsapp')
  }

  // Export chat conversation
  async exportChat(fbId: string, extension: 'csv' | 'txt'): Promise<ApiResponse<{ file: string }>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.get(`v1/live-chat/export-chat/${fbId}/${extension}`, {
        params: { apikey: API_KEY },
        responseType: 'blob'
      })
      
      // Create download link for the blob
      const blob = new Blob([response.data], { 
        type: extension === 'csv' ? 'text/csv' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-export-${fbId}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return { success: true, data: { file: 'Downloaded successfully' } }
    } catch (error: any) {
      console.error('Error exporting chat:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to export chat',
        data: { file: '' }
      }
    }
  }

  // Delete conversation
  async deleteConversation(fbId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.post('v1/live-chat/delete-conversation', {
        apikey: API_KEY,
        fbId: fbId
      })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting conversation:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete conversation',
        data: { message: '' }
      }
    }
  }

  // Change bot activation status
  async changeBotActivation(userId: string, status: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.post('v1/live-chat/change-status', {
        apikey: API_KEY,
        status: status,
        user_id: userId
      })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error changing bot activation:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to change bot activation',
        data: { message: '' }
      }
    }
  }

  // Save push subscription
  async saveSubscription(subscription: PushSubscription, userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.post(`v1/save-subscription/${userId}`, {
        apikey: API_KEY,
        subscription: subscription.toJSON()
      })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error saving subscription:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to save subscription',
        data: { message: '' }
      }
    }
  }

  // Delete push subscription
  async deleteSubscription(subscription: PushSubscription, userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const API_KEY = useApiKeyStore().apiKey
      const response = await axiosInstance.post(`v1/delete-subscription/${userId}`, {
        apikey: API_KEY,
        subscription: subscription.toJSON()
      })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting subscription:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete subscription',
        data: { message: '' }
      }
    }
  }
}

export const conversationApi = new ConversationApiService() 