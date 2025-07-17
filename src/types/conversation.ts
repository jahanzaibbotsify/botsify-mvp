// Conversation Types
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
  attributes?: UserAttribute[]
}

export interface UserAttribute {
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

export interface ConversationData {
  user: ConversationUser
  conversation: any[]
  unread: number
  last_msg: string
}

export interface ConversationsResponse {
  conversations: Record<string, ConversationData>
  limit_reached?: boolean
}

// Message Types
export interface ConversationMessage {
  id: number
  message: string
  created_at: string
  messenger_user_id: string
  direction: string
  from: string
}

export interface UserConversationResponse {
  conversations: ConversationMessage[]
  user: ConversationUser
  last_msg_key: number
  agent_assigned: string
  conv_status: string
}

// Send Message Types
export interface SendMessagePayload {
  apikey: string
  to: string
  type: 'text' | 'image' | 'whatsapp'
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

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// Get conversations params
export interface GetConversationsParams {
  apikey: string
}

// Get user conversation params
export interface GetUserConversationParams {
  apikey: string
  fbId: string
  load_more: boolean
} 