<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { SignupCredentials, FormValidation, SocialAuthProvider } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive<SignupCredentials>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const validationErrors = ref<FormValidation[]>([])

// Computed properties
const isFormValid = computed(() => {
  return form.firstName.trim() !== '' && 
         form.lastName.trim() !== '' &&
         form.email.trim() !== '' && 
         form.password.trim() !== '' &&
         form.confirmPassword.trim() !== '' &&
         form.acceptTerms &&
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
const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return `${fieldName} can only contain letters and spaces`
  
  return null
}

const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  
  return null
}

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

const validateTerms = (accepted: boolean): string | null => {
  if (!accepted) return 'You must accept the Terms of Service and Privacy Policy'
  
  return null
}

const validateForm = (): boolean => {
  const errors: FormValidation[] = []
  
  const firstNameError = validateName(form.firstName, 'First name')
  if (firstNameError) {
    errors.push({ field: 'firstName', message: firstNameError, type: 'error' })
  }
  
  const lastNameError = validateName(form.lastName, 'Last name')
  if (lastNameError) {
    errors.push({ field: 'lastName', message: lastNameError, type: 'error' })
  }
  
  const emailError = validateEmail(form.email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError, type: 'error' })
  }
  
  const passwordError = validatePassword(form.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError, type: 'error' })
  }
  
  const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword)
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError, type: 'error' })
  }
  
  const termsError = validateTerms(form.acceptTerms)
  if (termsError) {
    errors.push({ field: 'acceptTerms', message: termsError, type: 'error' })
  }
  
  validationErrors.value = errors
  return errors.length === 0
}

// Event handlers
const handleSubmit = async () => {
  if (!validateForm()) return
  
  authStore.clearError()
  
  const response = await authStore.signup(form)
  
  if (response.success) {
    window.$toast?.success('Account created successfully! Please choose your plan.')
    router.push('/pricing')
  } else {
    window.$toast?.error(response.message)
  }
}

const handleSocialSignup = async (provider: SocialAuthProvider) => {
  authStore.clearError()
  
  const response = await authStore.socialLogin(provider)
  
  if (response.success) {
    window.$toast?.success(`Welcome! Account created with ${provider.name}.`)
    router.push('/pricing')
  } else {
    window.$toast?.error(response.message)
  }
}

const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

// Clear specific field errors when user starts typing
const clearFieldError = (field: string) => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== field)
  authStore.clearError()
}
</script>

<template>
  <div class="signup-view">
    <div class="auth-header">
      <h2 class="auth-title">Create Your Account</h2>
      <p class="auth-subtitle">Join thousands of users building amazing AI experiences</p>
    </div>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ authStore.error }}</span>
      </div>
    </div>

    <!-- Signup Form -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <!-- Name Fields -->
      <div class="name-fields">
        <div class="form-group">
          <label for="firstName" class="form-label">
            First Name
            <span class="required">*</span>
          </label>
          <div class="input-wrapper" :class="{ error: hasFieldError('firstName') }">
            <div class="input-icon">
              <i class="pi pi-user"></i>
            </div>
            <input
              id="firstName"
              v-model="form.firstName"
              @input="clearFieldError('firstName')"
              type="text"
              class="form-input"
              placeholder="First name"
              autocomplete="given-name"
              :disabled="authStore.isLoading"
            />
          </div>
          <div v-if="hasFieldError('firstName')" class="field-error">
            {{ validationErrors.find(e => e.field === 'firstName')?.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="lastName" class="form-label">
            Last Name
            <span class="required">*</span>
          </label>
          <div class="input-wrapper" :class="{ error: hasFieldError('lastName') }">
            <div class="input-icon">
              <i class="pi pi-user"></i>
            </div>
            <input
              id="lastName"
              v-model="form.lastName"
              @input="clearFieldError('lastName')"
              type="text"
              class="form-input"
              placeholder="Last name"
              autocomplete="family-name"
              :disabled="authStore.isLoading"
            />
          </div>
          <div v-if="hasFieldError('lastName')" class="field-error">
            {{ validationErrors.find(e => e.field === 'lastName')?.message }}
          </div>
        </div>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">
          Email Address
          <span class="required">*</span>
        </label>
        <div class="input-wrapper" :class="{ error: hasFieldError('email') }">
          <div class="input-icon">
            <i class="pi pi-envelope"></i>
          </div>
          <input
            id="email"
            v-model="form.email"
            @input="clearFieldError('email')"
            type="email"
            class="form-input"
            placeholder="Enter your email address"
            autocomplete="email"
            :disabled="authStore.isLoading"
          />
        </div>
        <div v-if="hasFieldError('email')" class="field-error">
          {{ validationErrors.find(e => e.field === 'email')?.message }}
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">
          Password
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
            placeholder="Create a strong password"
            autocomplete="new-password"
            :disabled="authStore.isLoading"
          />
          <button
            type="button"
            @click="togglePasswordVisibility('password')"
            class="password-toggle"
            :disabled="authStore.isLoading"
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
          Confirm Password
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
            placeholder="Confirm your password"
            autocomplete="new-password"
            :disabled="authStore.isLoading"
          />
          <button
            type="button"
            @click="togglePasswordVisibility('confirmPassword')"
            class="password-toggle"
            :disabled="authStore.isLoading"
          >
            <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
        <div v-if="hasFieldError('confirmPassword')" class="field-error">
          {{ validationErrors.find(e => e.field === 'confirmPassword')?.message }}
        </div>
      </div>

      <!-- Terms & Newsletter -->
      <div class="form-options">
        <label class="checkbox-wrapper" :class="{ error: hasFieldError('acceptTerms') }">
          <input
            v-model="form.acceptTerms"
            @change="clearFieldError('acceptTerms')"
            type="checkbox"
            class="checkbox-input"
            :disabled="authStore.isLoading"
          />
          <span class="checkbox-custom"></span>
          <span class="checkbox-label">
            I agree to the 
            <a href="/terms" target="_blank" class="terms-link">Terms of Service</a>
            and 
            <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
            <span class="required">*</span>
          </span>
        </label>
        
        <div v-if="hasFieldError('acceptTerms')" class="field-error">
          {{ validationErrors.find(e => e.field === 'acceptTerms')?.message }}
        </div>


      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="submit-button primary"
        :disabled="!isFormValid || authStore.isLoading"
      >
        <span v-if="authStore.isLoading" class="loading-spinner"></span>
        <i v-else class="pi pi-user-plus"></i>
        <span>{{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}</span>
      </button>
    </form>

    <!-- Divider -->
    <div class="auth-divider">
      <div class="divider-line"></div>
      <span class="divider-text">Or sign up with Facebook</span>
      <div class="divider-line"></div>
    </div>

    <!-- Social Signup -->
    <div class="social-login">
      <button
        v-for="provider in authStore.socialProviders"
        :key="provider.id"
        @click="handleSocialSignup(provider)"
        class="social-button facebook-button"
        :disabled="authStore.isLoading"
      >
        <!-- <img src="/icons/facebook.svg" alt="Facebook" class="social-icon" /> -->
        <span>Sign up with {{ provider.name }}</span>
      </button>
    </div>

    <!-- Login Link -->
    <div class="auth-footer">
      <p class="footer-text">
        Already have an account?
        <router-link to="/auth/login" class="auth-link">
          Sign in here
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.signup-view {
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
  color: var(--color-text-primary);
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

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: 0;
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
  padding: var(--space-3) var(--space-3) var(--space-3) calc(var(--space-7) + var(--space-1));
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

.form-options {
  margin-bottom: var(--space-6);
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
  font-size: 0.875rem;
  margin-bottom: var(--space-3);
}



.checkbox-wrapper.error .checkbox-label {
  color: var(--color-error);
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
  margin-top: 2px;
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
  line-height: 1.4;
}

.terms-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
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

.facebook-button {
  background-color: #1877F2;
  color: white;
  border-color: #1877F2;
}

.facebook-button:hover:not(:disabled) {
  background-color: #166FE5;
  border-color: #166FE5;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
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
@media (max-width: 640px) {
  .name-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .signup-view {
    padding: var(--space-4);
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .social-login {
    gap: var(--space-2);
  }

  .checkbox-wrapper {
    align-items: flex-start;
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

[data-theme="dark"] .checkbox-wrapper.error .checkbox-custom {
  border-color: var(--color-error);
}
</style> 