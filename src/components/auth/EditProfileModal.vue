<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Edit Profile</h2>
        <button class="close-button" @click="closeModal">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="edit-profile-form">
        <div class="form-group">
          <label for="firstName" class="form-label">First Name</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-input"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div class="form-group">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-input"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="save-button" :disabled="isLoading">
            <span v-if="isLoading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  isVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: [user: object]
}>()

const authStore = useAuthStore()
const isLoading = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: ''
})

// Watch for modal visibility and populate form data
watch(() => props.isVisible, (newVal) => {
  if (newVal && authStore.user) {
    formData.value = {
      firstName: authStore.user.firstName || '',
      lastName: authStore.user.lastName || '',
      email: authStore.user.email || ''
    }
  }
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!authStore.user) return

  isLoading.value = true
  
  try {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update user in auth store
    const updatedUser = {
      ...authStore.user,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      fullName: `${formData.value.firstName} ${formData.value.lastName}`
    }

    // Update the user in the store
    authStore.user = updatedUser
    
    // Emit updated event
    emit('updated', updatedUser)
    
    // Show success message
    window.$toast?.success('Profile updated successfully!')
    
    closeModal()
  } catch (error) {
    console.error('Error updating profile:', error)
    window.$toast?.error('Failed to update profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1000);
  padding: var(--space-4);
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.edit-profile-form {
  padding: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  font-size: 0.875rem;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 163, 255, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-5);
}

.cancel-button {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.cancel-button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
}

.save-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-content {
    max-width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .save-button {
    width: 100%;
    justify-content: center;
  }
}
</style> 