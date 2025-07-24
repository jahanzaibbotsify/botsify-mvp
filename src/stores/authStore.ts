import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AuthUser, 
  LoginCredentials, 
  SignupCredentials, 
  PricingPlan, 
  Agent, 
  AgentCategory,
  AuthResponse,
  SocialAuthProvider
} from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedPlan = ref<PricingPlan | null>(null)
  const selectedAgent = ref<Agent | null>(null)
  const onboardingStep = ref<'signup' | 'pricing' | 'agent-selection' | 'completed'>('signup')

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const fullName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}` : '')

  // Mock data for development
  const pricingPlans = ref<PricingPlan[]>([
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with AI agents',
      price: 0,
      currency: 'USD',
      billing: 'monthly',
      features: [
        '1 AI Agent',
        '100 conversations/month',
        'Basic templates',
        'Email support',
        'Community access'
      ],
      limits: {
        conversations: 100,
        agents: 1,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        advancedAnalytics: false
      },
      trialDays: 14
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing businesses and power users',
      price: 29,
      currency: 'USD',
      billing: 'monthly',
      features: [
        '5 AI Agents',
        '1,000 conversations/month',
        'Premium templates',
        'Priority support',
        'Custom branding',
        'API access',
        'Advanced analytics'
      ],
      limits: {
        conversations: 1000,
        agents: 5,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        advancedAnalytics: true
      },
      isPopular: true,
      discount: {
        percentage: 20,
        originalPrice: 36
      },
      trialDays: 14
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: 99,
      currency: 'USD',
      billing: 'monthly',
      features: [
        'Unlimited AI Agents',
        'Unlimited conversations',
        'Custom templates',
        'Dedicated support',
        'White-label solution',
        'Full API access',
        'Advanced analytics & reporting',
        'SSO integration',
        'Custom integrations'
      ],
      limits: {
        conversations: 'unlimited',
        agents: 'unlimited',
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        advancedAnalytics: true
      },
      trialDays: 30
    }
  ])

  const agentCategories = ref<AgentCategory[]>([
    {
      id: 'customer-service',
      name: 'Customer Service',
      description: 'Agents for customer support and service',
      icon: 'pi-headphones',
      agentCount: 12
    },
    {
      id: 'sales',
      name: 'Sales & Lead Generation',
      description: 'Boost your sales with AI-powered agents',
      icon: 'pi-chart-line',
      agentCount: 8
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Shopping assistants and product recommendations',
      icon: 'pi-shopping-cart',
      agentCount: 15
    },
    {
      id: 'education',
      name: 'Education & Training',
      description: 'Learning assistants and educational tools',
      icon: 'pi-book',
      agentCount: 10
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical assistants and health guidance',
      icon: 'pi-heart',
      agentCount: 6
    },
    {
      id: 'finance',
      name: 'Finance & Banking',
      description: 'Financial advisors and banking assistants',
      icon: 'pi-dollar',
      agentCount: 9
    }
  ])

  const agents = ref<Agent[]>([
    {
      id: 'customer-support-pro',
      name: 'Customer Support Pro',
      description: 'Advanced customer service agent with multi-language support and sentiment analysis',
      category: 'customer-service',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-support&backgroundColor=3b82f6',
      capabilities: ['Multi-language support', 'Sentiment analysis', 'Ticket routing', 'FAQ automation'],
      tags: ['popular', 'support', 'multilingual'],
      isPopular: true,
      isPremium: false,
      rating: 4.8,
      reviewCount: 234,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-15'),
      template: {
        welcomeMessage: 'Hi! I\'m here to help you with any questions or issues you might have.',
        prompt: 'You are a helpful customer support agent...',
        features: ['Ticket creation', 'Status tracking', 'Escalation handling']
      }
    },
    {
      id: 'sales-assistant',
      name: 'Sales Assistant',
      description: 'AI-powered sales agent that qualifies leads and schedules meetings',
      category: 'sales',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sales-assistant&backgroundColor=10b981',
      capabilities: ['Lead qualification', 'Meeting scheduling', 'Product recommendations', 'CRM integration'],
      tags: ['sales', 'leads', 'scheduling'],
      isPopular: true,
      isPremium: false,
      rating: 4.7,
      reviewCount: 156,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-10'),
      template: {
        welcomeMessage: 'Hello! I\'m here to help you find the perfect solution for your needs.',
        prompt: 'You are a professional sales assistant...',
        features: ['Lead scoring', 'Calendar integration', 'Follow-up automation']
      }
    },
    {
      id: 'ecommerce-shopper',
      name: 'Shopping Assistant',
      description: 'Personal shopping agent with product recommendations and order tracking',
      category: 'ecommerce',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shopping-assistant&backgroundColor=f59e0b',
      capabilities: ['Product search', 'Price comparison', 'Order tracking', 'Wishlist management'],
      tags: ['shopping', 'ecommerce', 'recommendations'],
      isPopular: false,
      isPremium: true,
      rating: 4.6,
      reviewCount: 89,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-08'),
      template: {
        welcomeMessage: 'Welcome to your personal shopping assistant! How can I help you find what you\'re looking for?',
        prompt: 'You are a knowledgeable shopping assistant...',
        features: ['Smart search', 'Price alerts', 'Comparison tools']
      }
    },
    {
      id: 'education-tutor',
      name: 'Learning Tutor',
      description: 'Adaptive learning agent that provides personalized education and training',
      category: 'education',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=education-tutor&backgroundColor=8b5cf6',
      capabilities: ['Personalized learning', 'Progress tracking', 'Quiz generation', 'Study planning'],
      tags: ['education', 'learning', 'adaptive'],
      isPopular: false,
      isPremium: false,
      rating: 4.9,
      reviewCount: 167,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-12'),
      template: {
        welcomeMessage: 'Hi there! I\'m your personal tutor. What would you like to learn today?',
        prompt: 'You are an expert educational tutor...',
        features: ['Adaptive learning paths', 'Performance analytics', 'Study reminders']
      }
    },
    {
      id: 'health-advisor',
      name: 'Health Advisor',
      description: 'Medical information agent with symptom checking and health guidance',
      category: 'healthcare',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=health-advisor&backgroundColor=ef4444',
      capabilities: ['Symptom checking', 'Health guidance', 'Appointment booking', 'Medication reminders'],
      tags: ['health', 'medical', 'wellness'],
      isPopular: false,
      isPremium: true,
      rating: 4.5,
      reviewCount: 92,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-05'),
      template: {
        welcomeMessage: 'Hello! I\'m here to provide health information and guidance. How can I assist you today?',
        prompt: 'You are a helpful health advisor...',
        features: ['Symptom analysis', 'Health tips', 'Emergency protocols']
      }
    },
    {
      id: 'finance-advisor',
      name: 'Finance Advisor',
      description: 'Financial planning agent with budgeting tools and investment guidance',
      category: 'finance',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=finance-advisor&backgroundColor=059669',
      capabilities: ['Budget planning', 'Investment advice', 'Expense tracking', 'Financial goals'],
      tags: ['finance', 'planning', 'investment'],
      isPopular: true,
      isPremium: false,
      rating: 4.4,
      reviewCount: 178,
      createdBy: 'botsify',
      lastUpdated: new Date('2024-01-14'),
      template: {
        welcomeMessage: 'Welcome! I\'m your personal finance advisor. Let\'s work on your financial goals together.',
        prompt: 'You are a knowledgeable financial advisor...',
        features: ['Budget analysis', 'Goal tracking', 'Market insights']
      }
    }
  ])

  const socialProviders = ref<SocialAuthProvider[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'pi-facebook',
      color: '#1877F2'
    }
  ])

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true)
    clearError()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock validation
      if (credentials.email === 'demo@botsify.com' && credentials.password === 'password') {
        const mockUser: AuthUser = {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          avatar: '/avatars/demo-user.png',
          plan: 'pro',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isEmailVerified: true,
          subscription: {
            id: 'sub_1',
            planId: 'pro',
            planName: 'Pro',
            status: 'active',
            startDate: new Date(),
            isTrialActive: false
          }
        }

        user.value = mockUser
        onboardingStep.value = 'completed'

        if (credentials.rememberMe) {
          localStorage.setItem('auth_remember', 'true')
        }

        return {
          success: true,
          message: 'Login successful',
          user: mockUser,
          token: 'mock_token_123'
        }
      } else {
        throw new Error('Invalid email or password')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
    setLoading(true)
    clearError()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockUser: AuthUser = {
        id: Date.now().toString(),
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        fullName: `${credentials.firstName} ${credentials.lastName}`,
        plan: 'free',
        createdAt: new Date(),
        isEmailVerified: false
      }

      user.value = mockUser
      onboardingStep.value = 'pricing'

      return {
        success: true,
        message: 'Account created successfully',
        user: mockUser,
        token: 'mock_token_' + Date.now()
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const selectPlan = async (plan: PricingPlan): Promise<boolean> => {
    setLoading(true)
    clearError()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      selectedPlan.value = plan
      
      if (user.value) {
        user.value.plan = plan.id as 'free' | 'pro' | 'enterprise'
        user.value.subscription = {
          id: 'sub_' + Date.now(),
          planId: plan.id,
          planName: plan.name,
          status: 'active',
          startDate: new Date(),
          isTrialActive: !!plan.trialDays
        }
      }

      onboardingStep.value = 'agent-selection'
      return true
    } catch (err: any) {
      setError(err.message || 'Plan selection failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const selectAgent = async (agent: Agent): Promise<boolean> => {
    setLoading(true)
    clearError()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      selectedAgent.value = agent
      onboardingStep.value = 'completed'
      return true
    } catch (err: any) {
      setError(err.message || 'Agent selection failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const socialLogin = async (provider: SocialAuthProvider): Promise<AuthResponse> => {
    setLoading(true)
    clearError()

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockUser: AuthUser = {
        id: Date.now().toString(),
        email: `user@${provider.id}.com`,
        firstName: 'Social',
        lastName: 'User',
        fullName: 'Social User',
        plan: 'free',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isEmailVerified: true
      }

      user.value = mockUser
      onboardingStep.value = 'pricing'

      return {
        success: true,
        message: `Logged in with ${provider.name}`,
        user: mockUser,
        token: 'social_token_' + Date.now()
      }
    } catch (err: any) {
      const errorMessage = err.message || `${provider.name} login failed`
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      user.value = null
      selectedPlan.value = null
      selectedAgent.value = null
      onboardingStep.value = 'signup'
      localStorage.removeItem('auth_remember')
      clearError()
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true)
    clearError()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    } catch (err: any) {
      setError(err.message || 'Password reset failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateOnboardingStep = (step: 'signup' | 'pricing' | 'agent-selection' | 'completed') => {
    onboardingStep.value = step
  }

  // Getters for filtered data
  const getAgentsByCategory = (categoryId: string) => {
    return agents.value.filter(agent => agent.category === categoryId)
  }

  const getPopularAgents = () => {
    return agents.value.filter(agent => agent.isPopular)
  }

  const getPremiumAgents = () => {
    return agents.value.filter(agent => agent.isPremium)
  }

  return {
    // State
    user,
    isLoading,
    error,
    selectedPlan,
    selectedAgent,
    onboardingStep,
    pricingPlans,
    agentCategories,
    agents,
    socialProviders,

    // Computed
    isAuthenticated,
    fullName,

    // Actions
    setError,
    clearError,
    setLoading,
    login,
    signup,
    selectPlan,
    selectAgent,
    socialLogin,
    logout,
    resetPassword,
    updateOnboardingStep,
    getAgentsByCategory,
    getPopularAgents,
    getPremiumAgents
  }
}) 