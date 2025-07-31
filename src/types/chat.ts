/**
 * Chat Types
 * All chat-related interfaces and types
 */

// Message types
export interface Message {
  id: string
  content: string
  timestamp: string
  sender: 'user' | 'assistant'
  status?: 'sending' | 'sent' | 'error'
  attachments?: Attachment[]
}

// Attachment types
export interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
  preview?: string
  uploadedUrl?: string
  fileId?: string
  uploadedAt?: string
  isUploaded?: boolean
}

// Chat types
export interface Chat {
  id: string
  title: string
  lastMessage?: string
  timestamp: string
  messages: Message[]
  unread?: boolean
  story?: Story
}

// Extended Chat interface for the chat interface
export interface ExtendedChat extends Chat {
  email?: string
  status?: string
  source?: string
  lastConverse?: string
  phone?: string
  country?: string
  active_for_bot?: number
  csr?: string | null
  os?: string
  lastPage?: string
  fbid?: string
  assignedTo?: string
  satisfaction?: number
  profilePic?: string
}

// Story and prompt types
export interface PromptVersion {
  id: string
  version_id: number
  name: string
  content: string
  updatedAt: Date
  version: number
  isActive: boolean
}

export interface Story {
  content: string
  updatedAt: Date
  versions: PromptVersion[]
  activeVersionId?: string
}

export interface GlobalPromptTemplate {
  id: string
  name: string
  content: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Chat message types for conversation
export interface ConversationMessage {
  id: number
  message: string | {
    text?: string
    attachment?: {
      type: 'image' | 'video' | 'audio' | 'file'
      url: string
      payload?: {
        name?: string
        size?: number
      }
    }
  }
  created_at: string
  messenger_user_id: string
  direction: string
  from: string
}

// Send message types
export interface SendMessagePayload {
  apikey: string
  to: string
  type: 'text' | 'link'
  message: string | {
    attachment: {
      type: string
      payload: {
        url: string
      }
    }
  }
  format?: 'json'
}

export interface SendMessageResponse {
  status: string
  messages: Array<{
    bot_id: string
    user_id: string
    message: {
      text: string
    }
    direction: string
    user_name: string
    created_at: string
    deleted: number
    from: string
    from_user_id: number
  }>
}

// Chat conversation types
export interface ConversationData {
  user: ConversationUser
  conversation: unknown[]
  unread: number
  last_msg: string
}

export interface ConversationsResponse {
  conversations: Record<string, ConversationData>
  limit_reached?: boolean
}

export interface UserConversationResponse {
  conversations: ConversationMessage[]
  user: ConversationUser
  last_msg_key: number
  agent_assigned: string
  conv_status: string
}

// Conversation user types
export interface ConversationUser {
  id: number
  name: string
  fbId: string
  bot_id: number
  created_at: string
  updated_at: string
  status: number
  opt_out: number
  optin_send: number
  active_for_bot: number
  timezone: string
  first_name: string
  last_name: string
  profile_pic: string
  locale: string
  gender: string
  context: string
  email: string
  type: string
  last_user_msg: string
  last_converse: string
  schedule_type: number
  delivery_time: string
  subscription: number
  test_user: number
  real_info: number
  last_ip_address: string
  connected: number
  auto_off: number
  default_message_count: number
  country: string
  unread_count: number
  inactive_by: string | null
  last_page: string | null
  os: string | null
  state: string | null
  city: string | null
  initiated_from: string | null
  phone_number: string | null
  csr: string | null
  browser: string | null
  that_file?: string | null
  attributes?: ConversationUserAttribute[]
}

export interface ConversationUserAttribute {
  id: number
  value: string
  key: string
  messenger_user_id: string
  entity_id: number
  created_at: string
  updated_at: string
  form_field_id: number | null
  bot_id: number | null
}

// Conversation API parameter types
export interface GetConversationsParams {
  apikey: string
}

export interface GetUserConversationParams {
  apikey: string
  fbId: string
  load_more: boolean
  unread?: number
} 