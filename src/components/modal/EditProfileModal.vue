<template>
  <ModalLayout 
    ref="modalRef"
    title="Edit Profile"
    max-width="500px"
  >
    <div class="edit-profile-form">
      <div class="form-group">
        <Input
          v-model="formData.firstName"
          label="First Name"
          placeholder="Enter your first name"
          required
        />
      </div>

      <div class="form-group">
        <Input
          v-model="formData.lastName"
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

      <div class="agent-action-buttons">
        <Button variant="secondary" @click="closeModal">
          Cancel
        </Button>
        <Button @click="handleSubmit" :loading="isLoading">
          Save Changes
        </Button>
      </div>
    </div>
  </ModalLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import { Button, Input } from '@/components/ui'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const authStore = useAuthStore()
const isLoading = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: ''
})

// Watch for modal visibility and populate form data
const openModal = () => {
  if (authStore.user) {
    // Handle different user data structures
    const userName = authStore.user.name || '';
    const nameParts = userName.split(' ');
    
    formData.value = {
      firstName: authStore.user.firstName || nameParts[0] || '',
      lastName: authStore.user.lastName || nameParts.slice(1).join(' ') || '',
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

  // Basic validation
  if (!formData.value.firstName.trim() || !formData.value.lastName.trim() || !formData.value.email.trim()) {
    window.$toast?.error('Please fill in all required fields.');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    window.$toast?.error('Please enter a valid email address.');
    return;
  }

  isLoading.value = true
  
  try {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create the full name from first and last name
    const fullName = `${formData.value.firstName} ${formData.value.lastName}`.trim();
    
    // Update user in auth store
    const updatedUser = {
      ...authStore.user,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      name: fullName
    }

    // Update the user in the store
    authStore.user = updatedUser
    
    // Update localStorage to persist the changes
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
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

// Expose the open method to parent
defineExpose({ openModal })
</script>
