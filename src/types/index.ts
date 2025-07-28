export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
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
  timestamp: Date;
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

// Export conversation types
export * from './conversation'