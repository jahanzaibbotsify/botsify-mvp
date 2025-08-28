<template>
  <ModalLayout 
    ref="modalRef"
    title="Edit Profile"
    max-width="720px"
  >
    <div class="edit-profile-form">
      <div class="form-group">
        <Input
          v-model="formData.first_name"
          label="First Name"
          placeholder="Enter your first name"
          :error="errors.first_name"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.last_name"
          label="Last Name"
          placeholder="Enter your last name"
          :error="errors.last_name"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="Enter your email address"
          :error="errors.email"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.old_password"
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          :error="errors.old_password"
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.password"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          :error="errors.password"
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.password_confirmation"
          type="password"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          :error="errors.password_confirmation"
        />
      </div>

      <div class="agent-action-buttons">
        <Button variant="secondary" @click="closeModal">
          Cancel
        </Button>
        <Button @click="handleSubmit" :loading="isLoading" :disabled="isLoading">
          Save Changes
        </Button>
      </div>
    </div>
  </ModalLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import { Button, Input } from '@/components/ui'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const authStore = useAuthStore()
const isLoading = ref(false)

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  old_password: '',
  password: '',
  password_confirmation: ''
})

const errors = ref({
  first_name: '',
  last_name: '',
  email: '',
  old_password: '',
  password: '',
  password_confirmation: ''
})

// Watch for modal visibility and populate form data
const openModal = () => {
  if (authStore.user) {
    // Handle different user data structures
    const userName = authStore.user.name || '';
    const nameParts = userName.split(' ');
  
    formData.value = {
      ...formData.value,
      first_name: authStore.user.first_name || authStore.user.firstName || nameParts[0] || '',
      last_name: authStore.user.last_name || authStore.user.lastName || nameParts.slice(1).join(' ') || '',
      email: authStore.user.email || ''
    }
    errors.value = { first_name: '', last_name: '', email: '', old_password: '', password: '', password_confirmation: '' }
  }
  modalRef.value?.openModal()
}

const closeModal = () => {
  modalRef.value?.closeModal()
}

const handleSubmit = async () => {
  if (!authStore.user) return

  // reset errors
  errors.value = { first_name: '', last_name: '', email: '', old_password: '', password: '', password_confirmation: '' }

  if (!formData.value.first_name.trim()) {
    errors.value.first_name = 'First name is required.'
  }
  if (!formData.value.last_name.trim()) {
    errors.value.last_name = 'Last name is required.'
  }
  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.value.email && !emailRegex.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address.'
  }

  // Optional password change validation (no request made here)
  const wantsPasswordChange = !!(
    formData.value.old_password ||
    formData.value.password ||
    formData.value.password_confirmation
  )
  if (wantsPasswordChange) {
    if (!formData.value.old_password) {
      errors.value.old_password = 'Current password is required.'
    }
    if (!formData.value.password) {
      errors.value.password = 'New password is required.'
    }
    if (!formData.value.password_confirmation) {
      errors.value.password_confirmation = 'Please confirm your new password.'
    }
    if (!errors.value.password && !errors.value.password_confirmation && formData.value.password !== formData.value.password_confirmation) {
      errors.value.password_confirmation = 'New password and confirmation do not match.'
    }
  }

  // if any errors, stop submit
  if (Object.values(errors.value).some(Boolean)) {
    return
  }

  isLoading.value = true

  try {
    const res = await authStore.updateAccount({
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      email: formData.value.email,
      old_password: formData.value.old_password,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation
    })

    if (res?.success) {
      window.$toast?.success('Profile updated successfully!')
      // Clear password fields after successful profile update
      formData.value.old_password = ''
      formData.value.password = ''
      formData.value.password_confirmation = ''
      closeModal()
    } else {
      // Show generic error inline (assign to email if nothing else)
      if (!Object.values(errors.value).some(Boolean)) {
        errors.value.email = res?.message || 'Failed to update profile. Please try again.'
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    if (!Object.values(errors.value).some(Boolean)) {
      errors.value.email = 'Failed to update profile. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Expose the open method to parent
defineExpose({ openModal })
</script>

<style scoped>
.edit-profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.agent-action-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@media (max-width: 767px) {
  .edit-profile-form {
    grid-template-columns: 1fr;
  }
}
</style>
