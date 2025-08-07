export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly' | 'custom';
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
    yearlyPrice?: number;
  };
  prices?: {
    monthly: string,
    annually: string
  }
  trialDays?: number;
  isContactSales?: boolean;
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentCount: number;
}

export interface FormValidation {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: object;
  token?: string;
  refreshToken?: string;
}