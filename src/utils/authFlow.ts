import { useAuthStore } from '@/stores/authStore'
import { getCurrentApiKey } from './apiKeyUtils'

export interface AuthFlowResult {
  shouldRedirect: boolean
  redirectPath?: string
  reason?: string
}

/**
 * Checks the authentication flow and determines where the user should be redirected
 * @returns AuthFlowResult with redirect information
 */
export function checkAuthFlow(): AuthFlowResult {
  const authStore = useAuthStore()
  
  // If user is not authenticated, redirect to login
  if (!authStore.isAuthenticated || !authStore.user) {
    return {
      shouldRedirect: true,
      redirectPath: '/auth/login',
      reason: 'User not authenticated'
    }
  }

  const user = authStore.user as any

  // Check if email is verified
  if (!user.email_verified && !user.subs) {
    return {
      shouldRedirect: true,
      redirectPath: `/auth/verify-email?email=${encodeURIComponent(user.email || '')}`,
      reason: 'Email not verified'
    }
  }

  // Only check subscription if email is verified
  if (user.email_verified) {
    const hasSubscription = checkUserSubscription(user)
    if (!hasSubscription) {
      return {
        shouldRedirect: true,
        redirectPath: '/choose-plan',
        reason: 'No active subscription'
      }
    }
  }

  return {
    shouldRedirect: false
  }
}

/**
 * Checks if user has an active subscription
 * @param user The user object
 * @returns boolean indicating if user has subscription
 */
function checkUserSubscription(user: any): boolean {
  // Check various subscription indicators
  if (user.subs && user.subs.status === 'active') {
    return true
  }
  
  if (user.subscription && user.subscription === 1) {
    return true
  }
  
  if (user.plan && user.plan !== 'free') {
    return true
  }

  // if (user.trial_started) {
  //   const trialDate = new Date(user.trial_started)
  //   const now = new Date()
  //   const trialEndDate = new Date(trialDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days trial
  //
  //   if (now < trialEndDate) {
  //     return true
  //   }
  // }
  
  return false
}

/**
 * Handles post-login/signup redirect logic
 * @returns string - the path to redirect to
 */
export function handlePostAuthRedirect(): string {
  const authStore = useAuthStore();
  const user = authStore.user as any
  
  if (!authStore.isAuthenticated || !user) {
    return '/auth/login'
  }

  if (user.is_appsumo || user.is_bot_admin || user.subs) {
    return '/select-agent';
  }

  if (!user.email_verified && !user.subs && !user.is_appsumo && !user.is_bot_admin) {
    return `/auth/verify-email?email=${encodeURIComponent(user.email || '')}`
  }

  const hasSubscription = checkUserSubscription(user)
  if (!hasSubscription && !user.is_bot_admin && !user.is_appsumo) {
    return '/choose-plan'
  }

  const botApiKey = getCurrentApiKey()
  if (botApiKey) {
    return `/agent/${botApiKey}`
  }

  return '/select-agent'
} 