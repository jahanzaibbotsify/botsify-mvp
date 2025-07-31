import { BaseService, BaseApiResponse } from './baseService'
import type { 
  SendMessagePayload, 
  ConversationsResponse, 
  UserConversationResponse, 
  SendMessageResponse 
} from '@/types/chat'

// Strongly typed response interfaces
export interface ConversationsApiResponse extends BaseApiResponse<ConversationsResponse> {}
export interface UserConversationApiResponse extends BaseApiResponse<UserConversationResponse> {}
export interface SendMessageApiResponse extends BaseApiResponse<SendMessageResponse> {}
export interface ExportChatApiResponse extends BaseApiResponse<{ file: string }> {}
export interface MessageApiResponse extends BaseApiResponse<{ message: string }> {}

// Updated payload types without apikey (added automatically by base service)
interface GetConversationsParamsWithoutApiKey {
  [key: string]: string | number | boolean
}

interface GetUserConversationParamsWithoutApiKey {
  fbId: string
  load_more?: boolean
  unread?: number
}

interface SendMessagePayloadWithoutApiKey {
  to: string
  type: 'text' | 'link'
  message: string
  format?: 'json'
}

class ConversationApiService extends BaseService {
  /**
   * Get conversations with optional query parameters
   */
  async getConversations(queryParams?: Record<string, string>): Promise<ConversationsApiResponse> {
    const params: GetConversationsParamsWithoutApiKey = { ...queryParams }
    return this.get<ConversationsResponse>('v1/live-chat/get-conversations', { params })
  }

  /**
   * Get user conversation
   */
  async getUserConversation(messengerUserId: string, markAsRead = false): Promise<UserConversationApiResponse> {
    const params: GetUserConversationParamsWithoutApiKey = { 
      fbId: messengerUserId,
      load_more: true,
      ...(markAsRead && { unread: 1 })
    }
    return this.get<UserConversationResponse>('v1/live-chat/get-user-conversations', { params })
  }

  /**
   * Send message to user
   */
  async sendMessage(
    to: string,
    message: string,
    type: 'text' | 'link' = 'text',
    format?: 'json'
  ): Promise<SendMessageApiResponse> {
    const payload: SendMessagePayloadWithoutApiKey = {
      to,
      type,
      message,
      ...(format && { format })
    }
    return this.post<SendMessageResponse>('v1/send-message-to-user-livechat', payload)
  }

  /**
   * Export chat conversation
   */
  async exportChat(fbId: string, extension: 'csv' | 'txt'): Promise<ExportChatApiResponse> {
    const response = await this.get<Blob>(`v1/live-chat/export-chat/${fbId}/${extension}`, {
      responseType: 'blob'
    })
    
    if (response.success && response.data) {
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
      
      return {
        success: true,
        message: 'Chat exported successfully',
        data: { file: 'Downloaded successfully' }
      }
    }
    
    return {
      success: false,
      message: 'Failed to export chat',
      data: { file: '' }
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(fbId: string): Promise<MessageApiResponse> {
    const payload = { fbId }
    return this.post<{ message: string }>('v1/live-chat/delete-conversation', payload)
  }

  /**
   * Change bot activation status
   */
  async changeBotActivation(userId: string, status: number): Promise<MessageApiResponse> {
    const payload = { status, user_id: userId }
    return this.post<{ message: string }>('v1/live-chat/change-status', payload)
  }

  /**
   * Save push subscription
   */
  async saveSubscription(subscription: PushSubscription, userId: string): Promise<MessageApiResponse> {
    const payload = { subscription: subscription.toJSON() }
    return this.post<{ message: string }>(`v1/save-subscription/${userId}`, payload)
  }

  /**
   * Delete push subscription
   */
  async deleteSubscription(subscription: PushSubscription, userId: string): Promise<MessageApiResponse> {
    const payload = { subscription: subscription.toJSON() }
    return this.post<{ message: string }>(`v1/delete-subscription/${userId}`, payload)
  }
}

export const conversationApi = new ConversationApiService() 