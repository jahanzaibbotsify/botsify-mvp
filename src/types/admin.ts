export interface AdminUsersFilters {
  registration_start_date?: string
  registration_end_date?: string
  identification?: string
  type?: 'all' | 'botsify' | 'appsumo'
  page?: number
  per_page?: number
}

export interface AdminUserItem {
  id: number
  name: string
  email: string
  phone_number?: string | null
  bots_count?: number
  is_whitelabel?: number | boolean
  created_at: string
  source?: 'AppSumo' | 'Botsify' | string
  subs?: { stripe_plan?: string | null; stripe_id?: string | null } | null
}

export interface AdminUsersResponse {
  users: {
    data: AdminUserItem[]
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  totals?: {
    customers?: number
    fb_logins?: number
  }
}


