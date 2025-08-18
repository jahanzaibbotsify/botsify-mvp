<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { FormValidation } from '@/types/auth'
import {axiosInstance} from "@/utils/axiosInstance.ts";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const validationErrors = ref<FormValidation[]>([])
const resetToken = ref<string>('');
const error = ref<string | null>(null)

// Computed properties
const isFormValid = computed(() => {
  return form.password.trim() !== '' && 
         form.confirmPassword.trim() !== '' &&
         validationErrors.value.length === 0
})

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  score = Object.values(checks).filter(Boolean).length
  
  if (score <= 1) return { score, label: 'Very Weak', color: '#ef4444' }
  if (score === 2) return { score, label: 'Weak', color: '#f97316' }
  if (score === 3) return { score, label: 'Fair', color: '#eab308' }
  if (score === 4) return { score, label: 'Good', color: '#22c55e' }
  return { score, label: 'Strong', color: '#16a34a' }
})

const hasFieldError = (field: string) => {
  return validationErrors.value.some(error => error.field === field)
}

// Validation functions
const validatePassword = (password: string): string | null => {
  if (!password.trim()) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  
  return null
}

const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword.trim()) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  
  return null
}

const validateForm = (): boolean => {
  const errors: FormValidation[] = []
  
  const passwordError = validatePassword(form.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError, type: 'error' })
  }
  
  const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword)
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError, type: 'error' })
  }
  
  validationErrors.value = errors
  return errors.length === 0
}

// Event handlers
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true;

  await axiosInstance.post('reset-password', {
    email: route.query.email,
    token: route.query.token,
    ...form
  }).then(res => {
    if (res.data.status == 'error'){
      error.value = res.data.message;
      window.$toast?.error(error.value)
    } else {
      window.$toast?.success('Password reset successfully!');
      router.push('/auth/login')
    }
  }).catch(error => {
    console.log(error)
    window.$toast?.error('Failed to reset password. Please try again.')

  }).finally(() => {
    isLoading.value = false;
  })
}

const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const clearFieldError = (field: string) => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== field)
}

const goToLogin = () => {
  router.push('/auth/login')
}

// Check for reset token on mount
onMounted(() => {
  const token = route.query.token as string;
  const email = route.query.email as string;
  if (!token && !email) {
    window.$toast?.error('Invalid reset link. Please try again.')
    router.push('/auth/forgot-password')
    return
  }
  resetToken.value = token;
})
</script>

<template>
  <div class="reset-password-view">
    <div class="reset-header">
      <div class="header-icon">
        <i class="pi pi-lock"></i>
      </div>
      <h2 class="header-title">Reset Your Password</h2>
      <p class="header-subtitle">
        Enter your new password below. Make sure it's strong and secure.
      </p>
    </div>

    <div v-if="!isSuccess" class="reset-form">
      <!-- Error Display -->
      <div v-if="authStore.error" class="error-alert">
        <div class="error-content">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ authStore.error }}</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">
            New Password
            <span class="required">*</span>
          </label>
          <div class="input-wrapper" :class="{ error: hasFieldError('password') }">
            <div class="input-icon">
              <i class="pi pi-lock"></i>
            </div>
            <input
              id="password"
              v-model="form.password"
              @input="clearFieldError('password')"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Enter your new password"
              autocomplete="new-password"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="togglePasswordVisibility('password')"
              class="password-toggle"
              :disabled="isLoading"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          
          <!-- Password Strength Indicator -->
          <div v-if="form.password" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :style="{ 
                  width: (passwordStrength.score / 5) * 100 + '%',
                  backgroundColor: passwordStrength.color 
                }"
              ></div>
            </div>
            <span class="strength-label" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.label }}
            </span>
          </div>
          
          <div v-if="hasFieldError('password')" class="field-error">
            {{ validationErrors.find(e => e.field === 'password')?.message }}
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">
            Confirm New Password
            <span class="required">*</span>
          </label>
          <div class="input-wrapper" :class="{ error: hasFieldError('confirmPassword') }">
            <div class="input-icon">
              <i class="pi pi-lock"></i>
            </div>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              @input="clearFieldError('confirmPassword')"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Confirm your new password"
              autocomplete="new-password"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="togglePasswordVisibility('confirmPassword')"
              class="password-toggle"
              :disabled="isLoading"
            >
              <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          <div v-if="hasFieldError('confirmPassword')" class="field-error">
            {{ validationErrors.find(e => e.field === 'confirmPassword')?.message }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button primary"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <i v-else class="pi pi-check"></i>
          <span>{{ isLoading ? 'Resetting Password...' : 'Reset Password' }}</span>
        </button>
      </form>
    </div>

    <!-- Success State -->
    <div v-else class="success-state">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      <h3 class="success-title">Password Reset Successfully!</h3>
      <p class="success-message">
        Your password has been updated. You can now log in with your new password.
      </p>
      <button @click="goToLogin" class="login-button primary">
        <i class="pi pi-sign-in"></i>
        <span>Go to Login</span>
      </button>
    </div>

    <!-- Back to Login -->
    <div v-if="!isSuccess" class="reset-footer">
      <button @click="goToLogin" class="back-button">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Login</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.reset-password-view {
  padding: var(--space-6);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.reset-header {
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

.reset-form {
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
  margin-bottom: var(--space-4);
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
  padding: var(--space-3) calc(var(--space-8) + var(--space-1)) var(--space-3) calc(var(--space-6) + var(--space-1));
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

.password-toggle {
  position: absolute;
  right: var(--space-3);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--transition-normal);
  z-index: 1;
}

.password-toggle:hover {
  color: var(--color-text-secondary);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}

.field-error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.submit-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 44px;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(68, 115, 246, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.login-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.login-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(68, 115, 246, 0.3);
}

/* Footer */
.reset-footer {
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
  .reset-password-view {
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

  .form-input {
    padding-right: calc(var(--space-8) + var(--space-1));
  }
}

/* Dark theme support */
[data-theme="dark"] .error-alert {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}
</style> 