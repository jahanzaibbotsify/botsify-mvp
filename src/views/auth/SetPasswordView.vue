<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Get email and token from route params or query
const email = computed(() => route.query.email as string || '')
const token = computed(() => route.query.token as string || '')

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const validationErrors = ref<Array<{ field: string; message: string }>>([])

// Password strength
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
  
  if (score <= 1) return { score, label: 'Very Weak', color: '#dc2626' }
  if (score === 2) return { score, label: 'Weak', color: '#ea580c' }
  if (score === 3) return { score, label: 'Fair', color: '#ca8a04' }
  if (score === 4) return { score, label: 'Good', color: '#16a34a' }
  return { score, label: 'Strong', color: '#15803d' }
})

// Computed properties
const isFormValid = computed(() => {
  return form.password.trim() !== '' && 
         form.confirmPassword.trim() !== '' && 
         validationErrors.value.length === 0
})

const hasPasswordError = computed(() => {
  return validationErrors.value.some(error => error.field === 'password')
})

const hasConfirmPasswordError = computed(() => {
  return validationErrors.value.some(error => error.field === 'confirmPassword')
})

// Validation functions
const validatePassword = (password: string): string | null => {
  if (!password.trim()) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  
  const checks = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password)
  }
  
  const passedChecks = Object.values(checks).filter(Boolean).length
  if (passedChecks < 2) {
    return 'Password must contain at least 2 of: lowercase, uppercase, number'
  }
  
  return null
}

const validateConfirmPassword = (confirmPassword: string): string | null => {
  if (!confirmPassword.trim()) return 'Please confirm your password'
  if (confirmPassword !== form.password) return 'Passwords do not match'
  
  return null
}

const validateForm = (): boolean => {
  const errors: Array<{ field: string; message: string }> = []
  
  const passwordError = validatePassword(form.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError })
  }
  
  const confirmPasswordError = validateConfirmPassword(form.confirmPassword)
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError })
  }
  
  validationErrors.value = errors
  return errors.length === 0
}

// Event handlers
const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const success = await authStore.setPassword({
      email: email.value,
      token: token.value,
      password: form.password
    })
    
    if (success) {
      window.$toast?.success('Password set successfully!')
      
      // Redirect to login or dashboard based on context
      const redirectTo = route.query.redirect as string
      if (redirectTo) {
        router.push(redirectTo)
      } else if (authStore.user) {
        router.push('/auth/agentic-home')
      } else {
        router.push('/auth/login')
      }
    } else {
      window.$toast?.error('Failed to set password. Please try again.')
    }
  } catch (error) {
    window.$toast?.error('An error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Clear error when user starts typing
const handlePasswordInput = () => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== 'password')
}

const handleConfirmPasswordInput = () => {
  validationErrors.value = validationErrors.value.filter(error => error.field !== 'confirmPassword')
}

const goBack = () => {
  if (email.value) {
    router.push(`/auth/verify-email?email=${encodeURIComponent(email.value)}`)
  } else {
    router.push('/auth/forgot-password')
  }
}
</script>

<template>
  <div class="set-password-view">
    <div class="password-header">
      <div class="header-icon">
        <i class="pi pi-lock"></i>
      </div>
      <h2 class="header-title">Set Your Password</h2>
      <p class="header-subtitle">
        Create a secure password for your account
        <br v-if="email">
        <strong v-if="email">{{ email }}</strong>
      </p>
    </div>

    <!-- Password Setup Form -->
    <form @submit.prevent="handleSubmit" class="password-form">
      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">
          New Password
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
            placeholder="Enter your new password"
            autocomplete="new-password"
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="password-toggle"
            :disabled="isLoading"
          >
            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
        <div v-if="hasPasswordError" class="field-error">
          {{ validationErrors.find(e => e.field === 'password')?.message }}
        </div>
        
        <!-- Password Strength Indicator -->
        <div v-if="form.password" class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :style="{ 
                width: `${(passwordStrength.score / 5) * 100}%`,
                backgroundColor: passwordStrength.color
              }"
            ></div>
          </div>
          <div class="strength-info">
            <span 
              class="strength-label"
              :style="{ color: passwordStrength.color }"
            >
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>
        
        <!-- Password Requirements -->
        <div class="password-requirements">
          <p class="requirements-title">Password must contain:</p>
          <ul class="requirements-list">
            <li :class="{ met: form.password.length >= 8 }">
              <i :class="form.password.length >= 8 ? 'pi pi-check' : 'pi pi-circle'"></i>
              At least 8 characters
            </li>
            <li :class="{ met: /[a-z]/.test(form.password) }">
              <i :class="/[a-z]/.test(form.password) ? 'pi pi-check' : 'pi pi-circle'"></i>
              One lowercase letter
            </li>
            <li :class="{ met: /[A-Z]/.test(form.password) }">
              <i :class="/[A-Z]/.test(form.password) ? 'pi pi-check' : 'pi pi-circle'"></i>
              One uppercase letter
            </li>
            <li :class="{ met: /\d/.test(form.password) }">
              <i :class="/\d/.test(form.password) ? 'pi pi-check' : 'pi pi-circle'"></i>
              One number
            </li>
          </ul>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label for="confirmPassword" class="form-label">
          Confirm Password
          <span class="required">*</span>
        </label>
        <div class="input-wrapper" :class="{ error: hasConfirmPasswordError }">
          <div class="input-icon">
            <i class="pi pi-lock"></i>
          </div>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            @input="handleConfirmPasswordInput"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Confirm your new password"
            autocomplete="new-password"
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="toggleConfirmPasswordVisibility"
            class="password-toggle"
            :disabled="isLoading"
          >
            <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
        <div v-if="hasConfirmPasswordError" class="field-error">
          {{ validationErrors.find(e => e.field === 'confirmPassword')?.message }}
        </div>
      </div>

      <button
        type="submit"
        class="password-button"
        :disabled="!isFormValid || isLoading"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        <span>{{ isLoading ? 'Setting Password...' : 'Set Password' }}</span>
      </button>
    </form>

    <!-- Back Link -->
    <div class="password-footer">
      <button @click="goBack" type="button" class="back-link">
        <i class="pi pi-arrow-left"></i>
        <span>Go Back</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.set-password-view {
  padding: var(--space-6);
  max-width: 100%;
}

.password-header {
  text-align: center;
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

.password-form {
  margin-bottom: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-5);
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
  padding: var(--space-3) var(--space-5) var(--space-3) calc(var(--space-3) + 1.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(46, 102, 244, 0.1);
  background: white;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.password-toggle:hover:not(:disabled) {
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

.password-strength {
  margin-top: var(--space-3);
}

.strength-bar {
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.strength-fill {
  height: 100%;
  transition: all var(--transition-normal);
}

.strength-info {
  display: flex;
  justify-content: flex-end;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.password-requirements {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.requirements-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
  transition: color var(--transition-normal);
}

.requirements-list li:last-child {
  margin-bottom: 0;
}

.requirements-list li.met {
  color: #16a34a;
}

.requirements-list li i {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
}

.requirements-list li.met i {
  color: #16a34a;
}

.password-button {
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

.password-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.password-button:disabled {
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

.password-footer {
  text-align: center;
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
  .set-password-view {
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

  .form-input {
    font-size: 1rem;
  }
}

/* Dark Theme Support */
[data-theme="dark"] .form-input {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .form-input:focus {
  background: var(--color-bg-tertiary);
}

[data-theme="dark"] .password-requirements {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}
</style> 