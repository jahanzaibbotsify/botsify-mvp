/**
 * User Types
 * All user-related interfaces and types
 */

import type { ApiPagination, SortOrder } from './api'

// User role and permission types
export type UserRole = 'admin' | 'editor' | 'live_chat_agent'

export type Permission = 
  | 'send_messages'
  | 'delete_user_chats'
  | 'download_chats'
  | 'change_notifications'
  | 'change_user_status'
  | 'view_user_attributes'
  | 'view_editor_billing'
  | 'view_chats_page'
  | 'manage_bot_settings'
  | 'manage_mcp_connections'
  | 'manage_team_members'
  | 'view_analytics'
  | 'manage_billing'
  | 'edit_user_attributes'
  | 'delete_users'
  | 'access_agent_page'

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

// Filter and segment types
export type FilterType = 'all' | 'active' | 'inactive'
export type SegmentType = 'all' | 'sms' | 'whatsapp' | 'facebook' | 'website' | 'instagram' | 'telegram'
export type SegmentId = -2 | -3 | -4 | -5 | -6 | -7 | null

// Bot user types
export interface BotUser {
  id: number
  name: string
  email: string
  status: number
  trial_started: string
  bot_role: number // 0 = editor, 2 = live chat agent, else = admin
  is_whitelabel_client: boolean
  subs?: {
    status: string
    [key: string]: unknown
  }
  appsumoUser?: unknown[]
  botAdmin?: unknown[]
  whitelabel?: {
    company_name: string
    primary_color: string
    secondary_color: string
    logo: string
    favicon: string | null
    domain: string
    mask_url: string
  }
}

export interface BotData {
  id: number
  description: string
  application_key: string
  application_secret: string
  access_token: string
  secret_key: string
  token: string
  status: number
  name: string
  user_id: number
  bot_flow: unknown
  chat_flow: unknown
  created_at: string
  updated_at: string
  type: string
  page_id: string
  page_name: string
  auto_optin: number
  deleteOnDefault: number
  deleteOnTime: number
  apikey: string
  d360apikey: string | null
  limit: number
  limitDate: string
  active: number
  connection_type: string
  platform: number
  demo_token: string | null
  code_embeded: number
  website: string
  language: string | null
  disable_reason: string | null
  cloning: number
  first_time_use: number
  embed_last_used: string | null
  instagram_id: string | null
  instagram_username: string | null
  exporting: number
  instagram_access_token: string | null
  deleted_at: string | null
}

export interface BotApiResponse {
  status: string
  data: {
    bot: BotData
    user: BotUser
  }
}

// User attribute types
export interface UserAttribute {
  id: number
  key: string
  value: string
  entity_id?: number
  new_key?: string
  new_value?: string
}

// API user types
export interface ApiUser {
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
  that_file: string | null
  attributes: UserAttribute[]
}

// User interface for UI
export interface User extends Omit<ApiUser, 'status'> {
  status: 'Active' | 'Inactive'
  hasConversation: boolean
  selected: boolean
}

// User API response types
export interface ApiUsersResponse {
  key_attributes: Record<string, Record<string, string>>
  users: ApiPagination
  bot_key: string
}

// User API parameter types
export interface GetUsersParams {
  segment_id?: number
  date?: string
  sortby?: string
  sortorder?: string
  per_page?: number
  page?: number
  search?: string
  status?: string
}

// User action payload types
export interface UserActionPayload {
  user_ids: number[]
  apikey: string
}

// User attribute payload types
export interface AttributeUpdatePayload {
  apikey: string
  user_ids: number[]
  user_attributes: UserAttribute[]
}

export interface AttributeDeletePayload {
  apikey: string
  messenger_user_id: string
  id: number
}

export interface AttributeResponse {
  success?: boolean
  status?: string
  message: string
  updated_count?: number
  deleted_count?: number
}

// User sorting types
export type SortBy = 'id' | 'name' | 'type' | 'active_for_bot' | 'created_at' | 'country'
export type PerPage = 20 | 50 | 100

export interface SortingData {
  sortBy: SortBy
  sortOrder: SortOrder
}

// User response types
export interface UsersResponse {
  users: unknown[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    per_page: number
  }
}

// Action type for user operations
export type ActionType = '' | 'activate' | 'deactivate' | 'delete' | 'test' | 'export' | 'delete_conversation'
