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
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}