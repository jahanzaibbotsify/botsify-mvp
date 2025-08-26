<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button.vue'
import { authApi } from '@/services/authApi'

const router = useRouter()
const authStore = useAuthStore()

// Clear any existing errors when component mounts
onMounted(() => {
  authStore.clearError()
})

// Form state
const form = reactive({
  email: ''
})

const isLoading = ref(false)
const isSuccess = ref(false)
const validationError = ref<string | null>(null)

// Computed properties
const isFormValid = computed(() => {
  return form.email.trim() !== '' && !validationError.value
})

// Validation
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  
  return null
}

// Event handlers
const handleSubmit = async () => {
  const emailError = validateEmail(form.email)
  if (emailError) {
    validationError.value = emailError
    return
  }

  isLoading.value = true
  validationError.value = null
  
  try {
    const response = await authApi.forgotPassword({ email: form.email })
    if (response.success) {
      isSuccess.value = true
      window.$toast?.success('Password reset instructions sent to your email.')
    } else {
      validationError.value = response.message || 'An unexpected error occurred. Please try again.'
      window.$toast?.error(response.message)
    }
  } catch (error: any) {
    validationError.value = 'An unexpected error occurred. Please try again.'
    window.$toast?.error('An unexpected error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleEmailInput = () => {
  validationError.value = null
}

const goBack = () => {
  router.push('/auth/login')
}
</script>

<template>
  <div class="forgot-password-view">
    <div class="forgot-header">
      <h2 class="header-title">Forgot password?</h2>
      <p class="header-subtitle">
        No worries! Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <div v-if="!isSuccess" class="forgot-form">
      <!-- Error Display -->
      <div v-if="authStore.error" class="error-alert">
        <div class="error-content">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ authStore.error }}</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">
            Email address
            <span class="required">*</span>
          </label>
          <div class="input-wrapper" :class="{ error: validationError }">
            <div class="input-icon">
              <i class="pi pi-envelope"></i>
            </div>
            <input
              id="email"
              v-model="form.email"
              @input="handleEmailInput"
              type="email"
              class="form-input"
              placeholder="Enter your email address"
              autocomplete="email"
              :disabled="isLoading"
            />
          </div>
          <div v-if="validationError" class="field-error">
            {{ validationError }}
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full"
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
          icon="pi pi-send"
        >
          Send reset link
        </Button>
      </form>
    </div>

    <!-- Success State -->
    <div v-else class="success-state">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      <h3 class="success-title">Check your email</h3>
      <p class="success-message">
        We've sent password reset instructions to <strong>{{ form.email }}</strong>
      </p>
      <p class="success-note">
        Didn't receive the email? Check your spam folder or 
        <button @click="isSuccess = false" class="resend-link">try again</button>.
      </p>
    </div>

    <!-- Back to Login -->
    <div class="forgot-footer">
      <button @click="goBack" class="back-button">
        <i class="pi pi-arrow-left"></i>
        <span>Back to login</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-view {
  padding: var(--space-6);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.forgot-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.header-icon {
  width: 80px;
  height: 80px;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 16px rgba(255, 0, 128, 0.3);
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
  filter: blur(40px);
  opacity: 0.8;
  z-index: 0;
  border-radius: 50%;
}

.header-icon > * {
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #000;
  margin-bottom: var(--space-3);
}

.header-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.forgot-form {
  margin-bottom: var(--space-6);
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
  gap: var(--space-2);
  color: var(--color-error);
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
}

.required {
  color: var(--color-error);
  /* margin-left: 2px; */
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.error .form-input {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-tertiary);
  z-index: 1;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) calc(var(--space-6) + var(--space-1));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(68, 115, 246, 0.1);
  background-color: var(--color-bg-primary);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.field-error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Success State */
.success-state {
  text-align: center;
  margin-bottom: var(--space-6);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-success), #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.success-message {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.success-note {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.resend-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.resend-link:hover {
  color: var(--color-primary-hover);
}

/* Footer */
.forgot-footer {
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--transition-normal);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.back-button:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .forgot-password-view {
    padding: var(--space-4);
  }

  .header-title {
    font-size: 1.5rem;
  }

  .header-icon,
  .success-icon {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }

  .success-title {
    font-size: 1.25rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .error-alert {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}
</style> 