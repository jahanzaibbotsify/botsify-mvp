import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  LoginCredentials, 
  SignupCredentials, 
  PricingPlan,
  AgentCategory
} from '@/types/auth'
import { authApi, UpdateAccountPayload } from '@/services/authApi'
import { getCurrentApiKey } from '@/utils/apiKeyUtils'
import { useRoleStore } from './roleStore'
import { BotUser } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const localstorageUser = localStorage.getItem('user');
  const localstorageToken = localStorage.getItem('accessToken');
  const user = ref<any | null>(localstorageUser ? JSON.parse(localstorageUser) : null)
  const accessToken = ref<string | null>(localstorageToken ? JSON.parse(localstorageToken) : null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedPlan = ref<PricingPlan | null>(null)
  const selectedAgent = ref<any | null>(null)
  const onboardingStep = ref<'signup' | 'pricing' | 'agent-selection' | 'completed'>('signup');

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // Official Botsify pricing plans
  const pricingPlans = ref<PricingPlan[]>([
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'A basic plan for your personal use, startup websites, and your Facebook page',
      price: 19,
      currency: 'USD',
      billing: 'monthly',
      features: [
        '1 AI Agent',
        '1,000 Credits (1 credit = 1 message) 🔥',
        'Integrate Documents & Web Search',
        'Messenger, SMS, Website, Instagram, Telegram, WhatsApp 🔥',
        'Basic Support'
      ],
      excludedFeatures: [
        'Integrate MCP',
        '1-Agent development'
      ],
      limits: {
        conversations: 1000,
        agents: 1,
        customBranding: false,
        apiAccess: true,
        prioritySupport: false,
        advancedAnalytics: false
      },
      discount: {
        percentage: 17,
        originalPrice: 19,
        yearlyPrice: 190
      },
      prices: {
        monthly: 'Basic-Plan',
        annually: 'Basic-Plan-Annual'
      }
    },
    {
      id: 'diy',
      name: 'Do it yourself',
      description: 'A personal plan for your small business, startup websites, and your Facebook page',
      price: 49,
      currency: 'USD',
      billing: 'monthly',
      features: [
        '2 AI Agents',
        '3,000 Credits (1 credit = 1 message) 🔥',
        'Integrate Documents & Web Search',
        'Messenger, SMS, Website, Instagram, Telegram, WhatsApp 🔥',
        'Basic Support',
      ],
      excludedFeatures: [
        'Integrate MCP',
        '1-Agent development'
      ],
      limits: {
        conversations: 5000,
        agents: 2,
        customBranding: false,
        apiAccess: true,
        prioritySupport: false,
        advancedAnalytics: false
      },
      discount: {
        percentage: 17,
        originalPrice: 59,
        yearlyPrice: 490
      },
      prices: {
        monthly: 'Personal-Plan',
        annually: 'Personal-Plan-Annual'
      }
    },
    {
      id: 'dfy',
      name: 'Done for you',
      description: 'A professional service for scalable businesses that want us to build and manage their agents',
      price: 149,
      currency: 'USD',
      billing: 'monthly',
      features: [
        '5 AI Agents',
        '$25/month for an additional agent',
        '5,000 Credits (1 credit = 1 message) 🔥',
        'Integrate MCP 🔥',
        'Integrate Documents & Web Search',
        'FB, SMS, Website, WhatsApp, Instagram, Telegram 🔥',
        '1-Agent development free worth $100/Month 🔥',
        'Access to all Botsify Resources',
        'Whitelabel Dashboard & Reselling Rights 🔥',
        'Personal Onboarding Session',
        'Bi-Weekly Training of 1 Agent Free for 12 Months',
        'Priority Support',
        'All integrations',
      ],
      limits: {
        conversations: 'unlimited',
        agents: 5,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        advancedAnalytics: true
      },
      isPopular: true,
      discount: {
        percentage: 17,
        originalPrice: 179,
        yearlyPrice: 1490
      },
      prices: {
        monthly: 'Professional-Plan',
        annually: 'Professional-Plan-Annual'
      }
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

  const agents = ref<object[]>([
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

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    clearError()
    try {
      const res = await authApi.login(credentials)
      const authUser = res.data.user
      setAuthData(authUser.access_token, authUser)
      return res.data
    } catch (error: any) {
      setError(error?.response?.data?.error)
      return error.response
    } finally {
      setLoading(false)
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setLoading(true)
    clearError()
    try {
      const res = await authApi.signup(credentials)
      const responseData = res.data
      setAuthData(responseData.access_token, responseData.user)
      return responseData
    } catch (error: any) {
      setError(error?.response?.message)
      onboardingStep.value = 'pricing'
      return error.response
    } finally {
      setLoading(false)
    }
  }

  /**
   * Set auth data.
   * @param access_token
   * @param auth_user
   */
  const setAuthData = (access_token: string|null, auth_user: object) => {
    if (access_token) {
      localStorage.setItem('accessToken', JSON.stringify(access_token));
      accessToken.value = access_token;
    }
    if (auth_user) {
      localStorage.setItem('user', JSON.stringify(auth_user));
      user.value = auth_user
      const roleStore = useRoleStore();
      roleStore.setCurrentUser(auth_user as BotUser);
    }
  }

  /**
   * Remove auth data
   */
  const removeAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    accessToken.value = null;
    user.value = null;
  }

  /**
   * Logout.
   */
  const logout = async () => {
    setLoading(true)
    try {
      await authApi.logout()
      removeAuthData();
      selectedAgent.value = null
      localStorage.removeItem('auth_remember')
      localStorage.removeItem('bot_api_key')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('bot_api_key')
      clearError()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Compute post-auth redirect path (moved from utils/authFlow)
   */
  const getPostAuthRedirect = (): string => {
    const currentUser: any = user.value
    if (!isAuthenticated.value || !currentUser) {
      return '/auth/login'
    }
    if (currentUser.is_appsumo || currentUser.is_bot_admin || currentUser.subs || currentUser.source === 'botsify_landing') {
      return '/select-agent'
    }
    if (!currentUser.email_verified && !currentUser.subs && !currentUser.is_appsumo && !currentUser.is_bot_admin && currentUser.source !== 'botsify_landing') {
      return `/auth/verify-email?email=${encodeURIComponent(currentUser.email || '')}`
    }
    const botApiKey = getCurrentApiKey()
    if (botApiKey) {
      return `/agent/${botApiKey}`
    }
    return '/select-agent'
  }

  /**
   * Update account/profile details
   */
  const updateAccount = async (payload: UpdateAccountPayload) => {
    setLoading(true)
    clearError()
    try {
      const fullName = `${payload.first_name ?? ''} ${payload.last_name ?? ''}`.trim()
      const response = await authApi.updateAccount({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        name: fullName,
        old_password: payload.old_password,
        password: payload.password,
        password_confirmation: payload.password_confirmation
      })

      if (response.success) {
        const currentUser = user.value || {}
        const updatedUser = {
          ...currentUser,
          // camelCase
          firstName: payload.first_name ?? (currentUser as any).firstName,
          lastName: payload.last_name ?? (currentUser as any).lastName,
          email: payload.email ?? (currentUser as any).email,
          name: fullName || (currentUser as any).name,
          // snake_case for compatibility where expected
          first_name: payload.first_name ?? (currentUser as any).first_name,
          last_name: payload.last_name ?? (currentUser as any).last_name
        }
        setAuthData(null, updatedUser)
        return { success: true, data: response.data }
      }

      setError(response.message || 'Failed to update profile')
      return { success: false, message: response.message }
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile')
      return { success: false, message: e?.message }
    } finally {
      setLoading(false)
    }
  }



  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    selectedPlan,
    selectedAgent,
    onboardingStep,
    pricingPlans,
    agentCategories,
    agents,

    // Computed
    isAuthenticated,

    // Actions
    setError,
    clearError,
    setLoading,
    login,
    signup,
    logout,
    getPostAuthRedirect,
    updateAccount,
    setAuthData
  }
}) 
