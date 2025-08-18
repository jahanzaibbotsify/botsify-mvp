<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { LoginCredentials, FormValidation } from '@/types/auth'
import {handlePostAuthRedirect} from "@/utils/authFlow.ts";
import Button from '@/components/ui/Button.vue';

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive<LoginCredentials>({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const validationErrors = ref<FormValidation[]>([])

// Computed properties
const isFormValid = computed(() => {
  return form.email.trim() !== '' && 
         form.password.trim() !== '' && 
         validationErrors.value.length === 0
})

const hasEmailError = computed(() => {
  return validationErrors.value.some(error => error.field === 'email')
})

const hasPasswordError = computed(() => {
  return validationErrors.value.some(error => error.field === 'password')
})

// Validation functions
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password.trim()) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  
  return null
}

const validateForm = (): boolean => {
  const errors: FormValidation[] = []
  
  const emailError = validateEmail(form.email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError, type: 'error' })
  }
  
  const passwordError = validatePassword(form.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError, type: 'error' })
  }
  
  validationErrors.value = errors
  return errors.length === 0
}

// Event handlers
const handleSubmit = async () => {
  if (!validateForm()) return
  
  authStore.clearError()
  
  const response = await authStore.login(form);

  if (response.user) {
    const redirectPath = handlePostAuthRedirect();
    router.push(redirectPath)
  } else {
    window.$toast?.error(response?.data.error)
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Clear error when user starts typing
const handleEmailInput = () => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== 'email')
  authStore.clearError()
}

const handlePasswordInput = () => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== 'password')
  authStore.clearError()
}
</script>

<template>
  <div class="login-view">
    <div class="auth-header">
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your account to continue</p>
    </div>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ authStore.error }}</span>
      </div>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">
          Email address
          <span class="required">*</span>
        </label>
        <div class="input-wrapper" :class="{ error: hasEmailError }">
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
            :disabled="authStore.isLoading"
          />
        </div>
        <div v-if="hasEmailError" class="field-error">
          {{ validationErrors.find(e => e.field === 'email')?.message }}
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">
          Password
          <span class="required">*</span>
        </label>
        <div class="input-wrapper" :class="{ error: hasPasswordError }">
          <div class="input-icon">
            <i class="pi pi-lock"></i>
          </div>
          <input
            id="password"
            v-model="form.password"
            @input="handlePasswordInput"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Enter your password"
            autocomplete="current-password"
            :disabled="authStore.isLoading"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="password-toggle"
            :disabled="authStore.isLoading"
          >
            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
        <div v-if="hasPasswordError" class="field-error">
          {{ validationErrors.find(e => e.field === 'password')?.message }}
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-options">
        <label class="checkbox-wrapper">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="checkbox-input"
            :disabled="authStore.isLoading"
          />
          <span class="checkbox-custom"></span>
          <span class="checkbox-label">Remember me</span>
        </label>

        <router-link
          to="/auth/forgot-password"
          class="forgot-password-link"
        >
          Forgot password?
        </router-link>
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        :disabled="!isFormValid || authStore.isLoading"
        variant="primary"
        :loading="authStore.isLoading"
        class="w-full"
      >
        Sign in
      </Button>
    </form>



    <!-- Sign Up Link -->
    <div class="auth-footer">
      <p class="footer-text">
        Don't have an account?
        <router-link to="/auth/signup" class="auth-link">
          Sign up for free
        </router-link>
      </p>
    </div>


  </div>
</template>

<style scoped>
.login-view {
  padding: var(--space-6);
  max-width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #000;
  margin-bottom: var(--space-2);
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
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

.auth-form {
  margin-bottom: var(--space-6);
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
  margin-left: 2px;
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
}

.password-toggle:hover {
  color: var(--color-text-secondary);
}

.field-error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-primary);
  transition: all var(--transition-normal);
  position: relative;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  color: var(--color-text-primary);
  user-select: none;
}

.forgot-password-link {
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color var(--transition-normal);
  display: inline-block;
  padding: var(--space-1) 0;
}

.forgot-password-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-6) 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.divider-text {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.social-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}



.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.social-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.footer-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.auth-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-normal);
}

.auth-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}



/* Mobile Responsive */
@media (max-width: 480px) {
  .login-view {
    padding: var(--space-4);
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .social-login {
    gap: var(--space-2);
  }


}

/* Dark theme support */
[data-theme="dark"] .error-alert {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}
</style> 