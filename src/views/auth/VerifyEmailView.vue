<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { axiosInstance } from '@/utils/axiosInstance'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

/**
 * Get email from route params or query
 * Used for displaying email and sending verification emails
 */
const email = computed(() => route.query.email as string || '')

/**
 * Verification state management
 * Controls loading states, errors, and success feedback
 */
const isVerifying = ref(false)
const isResending = ref(false)
const verificationError = ref<string | null>(null)
const verificationSuccess = ref(false)
const resendCooldown = ref(0)

/**
 * Get the verification token from route params or query
 * Used for automatic verification when user clicks email link
 */
const verificationToken = computed(() => {
  return (route.params.token as string) || (route.query.token as string) || ''
})

/**
 * Start countdown timer for resend cooldown
 * Prevents spam clicking of resend button
 */
const startResendCooldown = () => {
  resendCooldown.value = 60
  const timer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

/**
 * Verify email with token from URL
 * Called when user clicks verification link in email
 * Updates user verification status and redirects if authenticated
 */
const verifyEmailWithToken = async (token: string) => {
  if (isVerifying.value) return;
  isVerifying.value = true
  verificationError.value = null

  try {
    const response = await axiosInstance.get(`/verify-email/${token}`)

    if (response.data && response.data.status === 'success') {
      verificationSuccess.value = true
      localStorage.removeItem(`emailVerificationVisited:${email.value}`);
      
      // Update user verification status in store and localStorage
      if (authStore.user) {
        authStore.user = {
          ...authStore.user,
          email_verified: 1
        };
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }

      // Redirect authenticated users to next route, prevent infinite loops
      if (authStore.isAuthenticated) {
        const { handlePostAuthRedirect } = await import('@/utils/authFlow')
        const redirectPath = handlePostAuthRedirect()
        const currentPath = router.currentRoute.value.path
        // Only redirect if next route is different from current route and not a verify-email route
        if (
          redirectPath !== currentPath &&
          !redirectPath.includes('verify-email')
        ) {
          router.replace(redirectPath)
        }
      }
    } else {
      verificationError.value = response.data?.message || 'Invalid or expired verification link. Please request a new one.'
      window.$toast?.error('Verification failed. Please try again.')
    }
  } catch (error: any) {
    verificationError.value = error?.response?.data?.message || 'Verification failed. Please try again.'
    window.$toast?.error('Verification failed. Please try again.')
  } finally {
    isVerifying.value = false
  }
}

/**
 * Send verification email to user
 * Called on page load and when user clicks resend button
 * Handles success/error states and starts cooldown timer
 */
const sendVerificationEmail = async () => {
  if (!email.value) {
    verificationError.value = 'Email address is required for verification.'
    return
  }

  isResending.value = true
  verificationError.value = null

  try {
    const response = await axiosInstance.post('/send-verification-email', {
      email: email.value
    })

    if (response.data?.status === 'success') {
      startResendCooldown()
      localStorage.setItem(`emailVerificationVisited:${email.value}`, 'true')
    } else {
      const errorMessage = response.data?.message || 'Failed to send verification email. Please try again.'
      verificationError.value = errorMessage
      window.$toast?.error(errorMessage)
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to send verification email. Please try again.'
    verificationError.value = errorMessage
    window.$toast?.error(errorMessage)
  } finally {
    isResending.value = false
  }
}

/**
 * Handle resend verification email button click
 * Prevents spam clicking during cooldown period
 */
const handleResendEmail = async () => {
  if (resendCooldown.value > 0) return
  await sendVerificationEmail()
}

/**
 * Navigate back to signup page
 * Used when user wants to start over
 */
const goBack = () => {
  router.push('/auth/signup')
}

/**
 * Navigate to login page
 * Used when user is not authenticated after verification
 */
const goToLogin = () => {
  router.push('/auth/login')
}

/**
 * Check if user is already verified and handle redirect
 * Called on page load to check verification status
 * Prevents infinite redirects by checking current route
 */
const checkIfUserVerified = async () => {
  // Check auth store user first
  if (authStore.user && (authStore.user as any).email_verified === 1) {
    verificationSuccess.value = true
    
    // Redirect authenticated users, prevent infinite loops
    if (authStore.isAuthenticated) {
      const { handlePostAuthRedirect } = await import('@/utils/authFlow')
      const redirectPath = handlePostAuthRedirect()
      const currentPath = router.currentRoute.value.path
      // Only redirect if next route is different from current route and not a verify-email route
      if (
        redirectPath !== currentPath &&
        !redirectPath.includes('verify-email')
      ) {
        router.replace(redirectPath)
      }
    }
    return true
  }
  
  // Check localStorage for immediate verification
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    if (user.email_verified === 1) {
      // Update store with verification status
      if (authStore.user) {
        authStore.user = {
          ...authStore.user,
          email_verified: 1
        } as any
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }
      
      verificationSuccess.value = true
      
      // Redirect authenticated users, prevent infinite loops
      if (authStore.isAuthenticated) {
        const { handlePostAuthRedirect } = await import('@/utils/authFlow')
        const redirectPath = handlePostAuthRedirect()
        const currentPath = router.currentRoute.value.path
        // Only redirect if next route is different from current route and not a verify-email route
        if (
          redirectPath !== currentPath &&
          !redirectPath.includes('verify-email')
        ) {
          router.replace(redirectPath)
        }
      }
      return true
    }
  }
  
  return false
}

/**
 * Watch for token changes and verify if present
 * Automatically verifies email when token is detected in URL
 */
watch(verificationToken, (newToken) => {
  if (newToken && !isVerifying.value) {
    verifyEmailWithToken(newToken)
  }
}, { immediate: true })

/**
 * Component lifecycle - initialize verification flow
 * Checks for existing verification status and sends email if needed
 */
onMounted(async () => {
  // If token is present, verify immediately
  if (verificationToken.value) {
    await verifyEmailWithToken(verificationToken.value)
    return
  }

  // Check if user is already verified
  if (await checkIfUserVerified()) {
    return
  }
})
</script>

<template>
  <div class="verify-email-view">
    <!-- Success State - shown after successful verification -->
    <div v-if="verificationSuccess" class="verification-success">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      <h2 class="success-title">Email verified successfully!</h2>
      <p class="success-subtitle">
        Your email has been verified.
        <span v-if="authStore.isAuthenticated">Redirecting you to your dashboard...</span>
        <span v-else>You can now access your account.</span>
      </p>
      <!-- Show login button only for non-authenticated users -->
      <div v-if="!authStore.isAuthenticated" class="success-actions">
        <button @click="goToLogin" class="btn primary-btn">
          <i class="pi pi-sign-in"></i>
          <span>Go to Login</span>
        </button>
      </div>
    </div>

    <!-- Verification in Progress - shown during token verification -->
    <div v-else-if="isVerifying" class="verification-loading">
      <div class="loading-icon">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <h2 class="loading-title">Verifying your email</h2>
      <p class="loading-subtitle">
        Please wait while we verify your email address...
      </p>
    </div>

    <!-- Main Verification View - shown when waiting for verification -->
    <div v-else class="verification-main">
      <div class="verification-header">
        <div class="header-icon">
          <i class="pi pi-envelope"></i>
        </div>
        <h2 class="header-title">Verify your email</h2>
        <p class="header-subtitle">
          We've sent a verification link to
          <br>
          <strong>{{ email }}</strong>
        </p>
      </div>

      <!-- Error Display - shown when verification fails -->
      <div v-if="verificationError" class="error-alert">
        <div class="error-content">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ verificationError }}</span>
        </div>
      </div>

      <!-- Instructions - guide user through verification process -->
      <div class="verification-instructions">
        <div class="instruction-item">
          <i class="pi pi-check-circle"></i>
          <span>Check your email inbox (and spam folder)</span>
        </div>
        <div class="instruction-item">
          <i class="pi pi-link"></i>
          <span>Click the verification link in the email</span>
        </div>
        <div class="instruction-item">
          <i class="pi pi-arrow-right"></i>
          <span>You'll be redirected automatically if logged in, or go to login if not</span>
        </div>
      </div>



      <!-- Resend Section -->
      <div class="resend-section">
        <p class="resend-text">
          Didn't receive the verification email?
        </p>
        <button
          @click="handleResendEmail"
          type="button"
          class="resend-button"
          :disabled="resendCooldown > 0 || isResending"
        >
          <span v-if="isResending" class="vloading-spinner"></span>
          <span v-if="resendCooldown > 0">
            Resend in {{ resendCooldown }}s
          </span>
          <span v-else-if="isResending">
            Sending...
          </span>
          <span v-else>
            Resend verification email
          </span>
        </button>
      </div>

      <!-- Footer Actions -->
      <div class="verification-footer">
        <button @click="goBack" type="button" class="back-link">
          <i class="pi pi-arrow-left"></i>
          <span>Back to Sign up</span>
        </button>
        <button @click="goToLogin" type="button" class="login-link">
          <i class="pi pi-sign-in"></i>
          <span>Go to Login</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-email-view {
  padding: var(--space-6);
  max-width: 100%;
  text-align: center;
}

/* Success State */
.verification-success {
  max-width: 480px;
  margin: 0 auto;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-5);
  border-radius: 50%;
  background: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.success-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.success-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-6);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

/* Loading State */
.verification-loading {
  max-width: 480px;
  margin: 0 auto;
}

.loading-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-5);
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.loading-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.loading-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Main Verification View */
.verification-main {
  max-width: 480px;
  margin: 0 auto;
}

.verification-header {
  margin-bottom: var(--space-6);
}

.header-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  position: relative;
  overflow: hidden;
}

.header-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 180deg,
    #ff0080,
    #7928ca,
    #2afadf,
    #7928ca,
    #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.header-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

.header-icon > * {
  position: relative;
  z-index: 2;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.header-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.header-subtitle strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Error Alert */
.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-error);
  font-size: 0.875rem;
}

/* Instructions */
.verification-instructions {
  margin-bottom: var(--space-6);
  text-align: left;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.instruction-item i {
  color: var(--color-primary);
  font-size: 1rem;
  min-width: 16px;
}

/* Resend Section */
.resend-section {
  margin-bottom: var(--space-6);
}

.resend-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3) 0;
}

.resend-button {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.resend-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.verification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-8);
}

.back-link,
.login-link {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.back-link:hover,
.login-link:hover {
  color: var(--color-text-primary);
}

/* Buttons */
.btn {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  text-decoration: none;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* Loading Spinner */
.vloading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}



/* Mobile Responsive */
@media (max-width: 768px) {
  .verify-email-view {
    padding: var(--space-4);
  }

  .header-icon,
  .success-icon,
  .loading-icon {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .success-icon,
  .loading-icon {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }

  .header-title,
  .success-title,
  .loading-title {
    font-size: 1.5rem;
  }

  .header-subtitle,
  .success-subtitle,
  .loading-subtitle {
    font-size: 0.8rem;
  }

  .verification-footer {
    flex-direction: column;
    gap: var(--space-3);
  }
}

/* Dark Theme Support */
[data-theme="dark"] .verification-instructions {
  color: var(--color-text-secondary);
}
</style> 