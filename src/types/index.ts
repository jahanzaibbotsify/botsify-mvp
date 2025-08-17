export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  subs?: {
    id: string;
    status: string;
    stripe_plan: string;
  }
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'assistant';
  status?: 'sending' | 'sent' | 'error';
  attachments?: Attachment[];
}

export interface PromptVersion {
  id: string;
  version_id: number;
  name: string;
  content: string;
  updatedAt: Date;
  version: number;
  isActive: boolean;
}

export interface Story {
  content: string;
  updatedAt: Date;
  versions: PromptVersion[];
  activeVersionId?: string;
}

export interface GlobalPromptTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: string;
  messages: Message[];
  unread?: boolean;
  story?: Story;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  preview?: string;
  uploadedUrl?: string;
  fileId?: string;
  uploadedAt?: string;
  isUploaded?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

// Extended Chat interface for the chat interface
export interface ExtendedChat extends Chat {
  email?: string
  status?: string
  source?: string
  lastConverse?: string
  phone?: string
  country?: string
  active_for_bot?: number;
  csr?: string | null;
  os?: string
  lastPage?: string
  fbid?: string
  assignedTo?: string
  satisfaction?: number
  profilePic?: string
}


export interface BillingData {
  charges: {
    object: string
    data: any[]
    has_more: boolean
    url: string
  }
  stripe_subscription: {
    id: number
    user_id: number
    name: string
    stripe_id: string
    stripe_plan: string
    quantity: number
    status: string
    trial_ends_at: string | null
    ends_at: string | null
    next_charge_date: string | null
    created_at: string
    updated_at: string
    paddle_cancel_url: string | null
    paddle_update_url: string | null
    paddle_checkout_id: string | null
    subscription_plan_id: string | null
    whitelabel_client: number
  }
}

// Export conversation types
export * from './conversation'

// Export auth types
export * from './auth'

// Export publish types
export * from './publish'