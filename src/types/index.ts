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

export interface Story {
  content: string;
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