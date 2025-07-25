export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  subscription?: UserSubscription;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  isTrialActive: boolean;
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly';
  features: string[];
  limits: {
    conversations: number | 'unlimited';
    agents: number | 'unlimited';
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
  isPopular?: boolean;
  discount?: {
    percentage: number;
    originalPrice: number;
  };
  trialDays?: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  capabilities: string[];
  tags: string[];
  isPopular?: boolean;
  isPremium?: boolean;
  rating: number;
  reviewCount: number;
  createdBy: 'botsify' | 'community';
  lastUpdated: Date;
  template?: {
    welcomeMessage: string;
    prompt: string;
    features: string[];
  };
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentCount: number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedPlan: PricingPlan | null;
  selectedAgent: Agent | null;
  onboardingStep: 'signup' | 'pricing' | 'agent-selection' | 'completed';
}

export interface FormValidation {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SocialAuthProvider {
  id: 'facebook';
  name: string;
  icon: string;
  color: string;
} 