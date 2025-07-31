/**
 * Conversation Types
 * Conversation-specific types that extend chat types
 */

import type {
  ConversationUser,
  ConversationUserAttribute,
  ConversationMessage,
  SendMessagePayload,
  SendMessageResponse,
  ConversationData,
  ConversationsResponse,
  UserConversationResponse,
  GetConversationsParams,
  GetUserConversationParams
} from './chat'

// Re-export conversation types from chat.ts
export type {
  ConversationUser,
  ConversationUserAttribute,
  ConversationMessage,
  SendMessagePayload,
  SendMessageResponse,
  ConversationData,
  ConversationsResponse,
  UserConversationResponse,
  GetConversationsParams,
  GetUserConversationParams
}

// Conversation-specific types that are not in chat.ts
export interface ConversationFilters {
  status?: 'active' | 'inactive' | 'all'
  platform?: 'facebook' | 'whatsapp' | 'instagram' | 'telegram' | 'website' | 'all'
  dateRange?: {
    start: string
    end: string
  }
  assignedTo?: string
  unreadOnly?: boolean
}

export interface ConversationStats {
  total: number
  active: number
  inactive: number
  unread: number
  assigned: number
  unassigned: number
}

export interface ConversationExportOptions {
  format: 'csv' | 'json' | 'txt'
  includeMessages: boolean
  includeUserData: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface ConversationAssignment {
  conversationId: string
  userId: string
  assignedBy: string
  assignedAt: string
  notes?: string
}

export interface ConversationNote {
  id: string
  conversationId: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ConversationTag {
  id: string
  name: string
  color: string
  description?: string
}

export interface ConversationTagAssignment {
  conversationId: string
  tagId: string
  assignedBy: string
  assignedAt: string
} 