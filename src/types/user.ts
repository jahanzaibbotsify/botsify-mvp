export type FilterType = 'all' | 'active' | 'inactive'
export type ActionType = '' | 'activate' | 'deactivate' | 'delete' | 'test' | 'export' | 'delete_conversation'
export type SegmentType = 'all' | 'sms' | 'whatsapp' | 'facebook'
export type SegmentId = -2 | -3 | -4 | null
export type SortBy = 'id' | 'name' | 'type' | 'active_for_bot'
export type SortOrder = 'asc' | 'desc'
export type PerPage = 20 | 50 | 100

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: PerPage
}

export interface SortingData {
  sortBy: SortBy
  sortOrder: SortOrder
}

export interface User extends Omit<ApiUser, 'status'> {
  status: 'Active' | 'Inactive'
  hasConversation: boolean
  selected: boolean
}
export interface UserAttribute {
  id: number
  key: string
  value: string
}

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

export interface ApiPagination {
  current_page: number
  data: ApiUser[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface ApiUsersResponse {
  key_attributes: Record<string, Record<string, string>>
  users: ApiPagination
  bot_key: string
}


export interface GetUsersParams {
  segment_id?: number;
  date?: string;
  sortby?: string;
  sortorder?: string;
  per_page?: number;
  page?: number;
  search?: string;
  status?: string;
}

export interface UserActionPayload {
  user_ids: number[];
  apikey: string;
}

export interface UsersResponse {
  users: any[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}