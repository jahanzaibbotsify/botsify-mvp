<script setup lang="ts">
import { ref, computed } from "vue";
import { Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { publishApi } from "@/services/publishApi";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Stores
const publishStore = usePublishStore();

// Reactive data
const whatsappData = computed(() => {
  return publishStore.whatsappConfig.data?.data?.whatsapp;
});

const profileText = ref(whatsappData.value?.profile || '');
const profileImage = ref<File | null>(whatsappData.value?.profile_image || null);
const isUpdatingProfile = ref(false);

// Methods
const handleProfileImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    profileImage.value = target.files[0];
  }
};


// Add this method to the script section
const handleUpdateProfile = async () => {
  const data = {
    profile: profileText.value.trim() || null,
    image: profileImage.value
  };
  
  if (!data.profile && !data.image) {
    window.$toast?.error('Please provide either profile text or image');
    return;
  }
  
  isUpdatingProfile.value = true;
  try {
    const result = await publishApi.updateDialog360Profile(
      data.profile || '',
      data.image || undefined
    );
    
    if (result.success) {
      window.$toast?.success('Profile updated successfully!');
      profileImage.value = null; // Reset image after successful update
      return { success: true };
    } else {
      window.$toast?.error(result.message || 'Failed to update profile');
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    window.$toast?.error(error.message || 'Failed to update profile');
    return { success: false, error: error.message };
  } finally {
    isUpdatingProfile.value = false;
  }
};
</script>

<template>
  <div class="profile-tab">
    <h4>WhatsApp Profile Management</h4>
    <p class="profile-description">Update your WhatsApp profile information for Dialog360 integration.</p>
    
    <div class="profile-form">
      <div class="form-group">
        <label for="profile-text">Profile About</label>
        <Input 
          id="profile-text"
          v-model="profileText"
          type="text"
          placeholder="Enter profile description"
          size="medium"
        />
      </div>
      
      <div class="form-group">
        <label for="profile-image">Profile Image</label>
        <input 
          id="profile-image"
          type="file"
          accept="image/*"
          @change="handleProfileImageChange"
          class="file-input"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="agent-action-buttons">
      <Button
        variant="primary"
        size="medium"
        :loading="isUpdatingProfile"
        :disabled="isUpdatingProfile"
        @click="handleUpdateProfile"
      >
        {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Profile Tab Styles */
.profile-tab {
  padding: var(--space-4);
}

.profile-description {
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.file-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color var(--transition-normal);
}

.file-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .profile-tab {
    padding: var(--space-3);
  }
}
</style>
