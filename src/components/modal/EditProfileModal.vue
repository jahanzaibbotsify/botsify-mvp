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
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.last_name"
          label="Last Name"
          placeholder="Enter your last name"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="Enter your email address"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.old_password"
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.password"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.password_confirmation"
          type="password"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
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

// Watch for modal visibility and populate form data
const openModal = () => {
  if (authStore.user) {
    // Handle different user data structures
    const userName = authStore.user.name || '';
    const nameParts = userName.split(' ');
  
    formData.value = {
      ...formData.value,
      first_name: authStore.user.first_name || nameParts[0] || '',
      last_name: authStore.user.last_name || nameParts.slice(1).join(' ') || '',
      email: authStore.user.email || ''
    }
  }
  modalRef.value?.openModal()
}

const closeModal = () => {
  modalRef.value?.closeModal()
}

const handleSubmit = async () => {
  if (!authStore.user) return

  if (!formData.value.first_name.trim() || !formData.value.last_name.trim() || !formData.value.email.trim()) {
    window.$toast?.error('Please fill in all required fields.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    window.$toast?.error('Please enter a valid email address.');
    return;
  }

  // Optional password change validation (no request made here)
  const wantsPasswordChange = !!(
    formData.value.old_password ||
    formData.value.password ||
    formData.value.password_confirmation
  )
  if (wantsPasswordChange) {
    if (!formData.value.old_password || !formData.value.password || !formData.value.password_confirmation) {
      window.$toast?.error('To change password, fill all password fields.');
      return;
    }
    if (formData.value.password !== formData.value.password_confirmation) {
      window.$toast?.error('New password and confirmation do not match.');
      return;
    }
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
      window.$toast?.error(res?.message || 'Failed to update profile. Please try again.')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    window.$toast?.error('Failed to update profile. Please try again.')
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
