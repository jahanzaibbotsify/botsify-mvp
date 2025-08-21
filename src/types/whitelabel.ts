export interface WhitelabelPackage {
  id: number
  name: string
  price: string
  type: 'monthly' | 'yearly'
  package_type: 'free' | 'paid' | 'trial'
  total_bots: string
  total_users: string
  active: number
  is_trial: number
  trial_days: string
  whitelabel_id: number
  currency: string
  collect_payment_info: number
  created_at: string
  updated_at: string
  stripe_product_id: string
  stripe_price_id: string
  paddle_plan_id: string
  subscribers_count: number
}

export interface WhitelabelPackagesResponse {
  status: string
  message: string
  packages: WhitelabelPackage[]
}

export interface WhitelabelConfig {
  company_name: string
  mask_url: string
  logo: string
  favicon: string
  primary_color: string
  secondary_color: string
  admin_email: string | null
  stripe_account_id: string
  facebook: string | null
  show_whitelabel_register: boolean
}
