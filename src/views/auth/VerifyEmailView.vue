<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Get email from route params or query
const email = computed(() => route.query.email as string || '')

// Form state
const form = reactive({
  otp: ['', '', '', '', '', ''] as string[]
})

const isLoading = ref(false)
const validationError = ref<string | null>(null)
const isResending = ref(false)
const resendCooldown = ref(0)
const otpInputs = ref<HTMLInputElement[]>([])

// Computed properties
const isFormValid = computed(() => {
  return form.otp.every(digit => digit.length === 1 && /^\d$/.test(digit))
})

const otpValue = computed(() => {
  return form.otp.join('')
})

// Countdown timer for resend cooldown
const startResendCooldown = () => {
  resendCooldown.value = 30
  const timer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// Event handlers
const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    target.value = ''
    return
  }
  
  form.otp[index] = value
  validationError.value = null
  
  // Auto-focus next input
  if (value && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1]?.focus()
    })
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !form.otp[index] && index > 0) {
    // Focus previous input on backspace if current is empty
    nextTick(() => {
      otpInputs.value[index - 1]?.focus()
    })
  } else if (event.key === 'ArrowLeft' && index > 0) {
    nextTick(() => {
      otpInputs.value[index - 1]?.focus()
    })
  } else if (event.key === 'ArrowRight' && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1]?.focus()
    })
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, 6)
  
  if (digits.length > 0) {
    for (let i = 0; i < 6; i++) {
      form.otp[i] = digits[i] || ''
    }
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = form.otp.findIndex(digit => !digit)
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5)
    
    nextTick(() => {
      otpInputs.value[focusIndex]?.focus()
    })
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    validationError.value = 'Please enter all 6 digits'
    return
  }

  isLoading.value = true
  validationError.value = null

  try {
    const success = await authStore.verifyEmail(email.value, otpValue.value)
    
    if (success) {
      window.$toast?.success('Email verified successfully!')
      
      // Redirect based on verification context
      const redirectTo = route.query.redirect as string
      if (redirectTo) {
        router.push(redirectTo)
      } else if (authStore.onboardingStep === 'completed') {
        router.push('/auth/agentic-home')
      } else {
        router.push('/pricing')
      }
    } else {
      validationError.value = 'Invalid verification code. Please try again.'
      // Clear the OTP inputs
      form.otp.fill('')
      nextTick(() => {
        otpInputs.value[0]?.focus()
      })
    }
  } catch (error) {
    validationError.value = 'Verification failed. Please try again.'
    window.$toast?.error('Verification failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  if (resendCooldown.value > 0) return
  
  isResending.value = true
  
  try {
    const success = await authStore.resendVerificationCode(email.value)
    
    if (success) {
      window.$toast?.success('Verification code sent!')
      startResendCooldown()
      // Clear current OTP
      form.otp.fill('')
      nextTick(() => {
        otpInputs.value[0]?.focus()
      })
    } else {
      window.$toast?.error('Failed to resend code. Please try again.')
    }
  } catch (error) {
    window.$toast?.error('Failed to resend code. Please try again.')
  } finally {
    isResending.value = false
  }
}

const goBack = () => {
  router.push('/auth/signup')
}

// Auto-focus first input on mount
onMounted(() => {
  nextTick(() => {
    otpInputs.value[0]?.focus()
  })
  
  // Start initial cooldown
  startResendCooldown()
})
</script>

<template>
  <div class="verify-email-view">
    <div class="verify-header">
      <div class="header-icon">
        <i class="pi pi-envelope"></i>
      </div>
      <h2 class="header-title">Verify Your Email</h2>
      <p class="header-subtitle">
        We've sent a 6-digit verification code to
        <br>
        <strong>{{ email }}</strong>
      </p>
    </div>

    <!-- Error Display -->
    <div v-if="validationError" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ validationError }}</span>
      </div>
    </div>

    <!-- OTP Form -->
    <form @submit.prevent="handleSubmit" class="verify-form">
      <div class="otp-container">
        <label class="otp-label">Enter verification code</label>
        <div class="otp-inputs">
          <input
            v-for="(digit, index) in form.otp"
            :key="index"
            :ref="el => otpInputs[index] = el as HTMLInputElement"
            v-model="form.otp[index]"
            @input="handleOtpInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste"
            type="text"
            class="otp-input"
            maxlength="1"
            autocomplete="one-time-code"
            :disabled="isLoading"
          />
        </div>
      </div>

      <button
        type="submit"
        class="verify-button"
        :disabled="!isFormValid || isLoading"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        <span>{{ isLoading ? 'Verifying...' : 'Verify Email' }}</span>
      </button>
    </form>

    <!-- Resend Section -->
    <div class="resend-section">
      <p class="resend-text">
        Didn't receive the code?
      </p>
      <button
        @click="handleResendCode"
        type="button"
        class="resend-button"
        :disabled="resendCooldown > 0 || isResending"
      >
        <span v-if="isResending" class="loading-spinner"></span>
        <span v-if="resendCooldown > 0">
          Resend in {{ resendCooldown }}s
        </span>
        <span v-else-if="isResending">
          Sending...
        </span>
        <span v-else>
          Resend Code
        </span>
      </button>
    </div>

    <!-- Back Link -->
    <div class="verify-footer">
      <button @click="goBack" type="button" class="back-link">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Sign Up</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.verify-email-view {
  padding: var(--space-6);
  max-width: 100%;
  text-align: center;
}

.verify-header {
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
  color: #000;
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

.verify-form {
  margin-bottom: var(--space-6);
}

.otp-container {
  margin-bottom: var(--space-6);
}

.otp-label {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  font-size: 0.875rem;
}

.otp-inputs {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-bottom: var(--space-2);
}

.otp-input {
  width: 48px;
  height: 56px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  transition: all var(--transition-normal);
}

.otp-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(46, 102, 244, 0.1);
  background: white;
}

.otp-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-button {
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
}

.verify-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.verify-button:disabled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
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

.verify-footer {
  margin-top: var(--space-8);
}

.back-link {
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

.back-link:hover {
  color: var(--color-text-primary);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .verify-email-view {
    padding: var(--space-4);
  }

  .header-icon {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.8rem;
  }

  .otp-inputs {
    gap: var(--space-2);
  }

  .otp-input {
    width: 40px;
    height: 48px;
    font-size: 1.125rem;
  }
}

/* Dark Theme Support */
[data-theme="dark"] .otp-input {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .otp-input:focus {
  background: var(--color-bg-tertiary);
}
</style> 