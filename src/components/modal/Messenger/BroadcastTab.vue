<script setup lang="ts">
import { ref } from "vue";
import VueSelect from "vue3-select-component";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'send-broadcast': [data: any];
  'no-test-user': [];
  'send-message': [message: any];
}>();

// Reactive data
const formData = ref({
  userSegment: '',
  messageTag: '',
  message: ''
});

// User segments options
const userSegments = [
  { value: '', label: 'Select user segment' },
  { value: 'male', label: 'Male' },
  { value: 'store-online', label: 'Store Online' },
  { value: 'only-subscribe-user', label: 'Only Subscribe User' }
];

// Message tag options
const messageTags = [
  { value: '', label: 'Select message tag' },
  { value: 'CONFIRMED_EVENT_UPDATE', label: 'CONFIRMED_EVENT_UPDATE' },
  { value: 'POST_PURCHASE_UPDATE', label: 'POST_PURCHASE_UPDATE' },
  { value: 'ACCOUNT_UPDATE', label: 'ACCOUNT_UPDATE' },
  { value: 'NON_PROMOTIONAL_SUBSCRIPTION', label: 'NON_PROMOTIONAL_SUBSCRIPTION' },
  { value: 'HUMAN_AGENT', label: 'HUMAN_AGENT' },
  { value: 'NO_TAG', label: 'NO_TAG' }
];

// Handle VueSelect values
const handleSelectChange = (key: keyof typeof formData.value, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  formData.value[key] = singleValue
};

const noTestUser = () => {
  emit('no-test-user');
};

const sendMessage = () => {
  if (!formData.value.userSegment || !formData.value.messageTag || !formData.value.message) {
    console.error('All fields are required');
    return;
  }
  emit('send-message', formData.value);
};

const sendBroadcast = () => {
  emit('send-broadcast', formData.value);
};

// Expose methods for parent component
defineExpose({
  sendBroadcast,
  noTestUser,
  sendMessage
});
</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast</h3>
    <p class="subtitle">Send broadcast messages to your Messenger audience</p>

    <div class="form-section">
      <div class="form-group">
        <label for="user-segment">User Segments</label>
        <VueSelect
          :model-value="formData.userSegment"
          @update:model-value="(value: string | string[]) => handleSelectChange('userSegment', value)"
          :options="userSegments"
          placeholder="Select user segment"
          :multiple="false"
        />
      </div>

      <div class="form-group">
        <label for="message-tag">Select Message Tag</label>
        <VueSelect
          :model-value="formData.messageTag"
          @update:model-value="(value: string | string[]) => handleSelectChange('messageTag', value)"
          :options="messageTags"
          placeholder="Select message tag"
          :multiple="false"
        />
      </div>

      <div class="form-group">
        <label for="message">Message</label>
        <input 
          id="message"
          v-model="formData.message"
          type="text"
          placeholder="Enter your message"
          class="form-input"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

/* VueSelect Styling */
.form-group :deep(.vue3-select-component) {
  font-size: 14px;
  height: 44px;
}

.form-group :deep(.vue3-select-component input) {
  height: 44px;
  padding: 12px 16px;
  font-size: 14px;
}

@media (max-width: 640px) {
  .form-group {
    margin-bottom: 16px;
  }
}
</style>
