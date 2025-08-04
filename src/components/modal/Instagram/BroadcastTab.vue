<script setup lang="ts">
import { ref } from "vue";

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
    <p class="subtitle">Send broadcast messages to your Instagram audience</p>

    <div class="form-section">
      <div class="form-group">
        <label for="user-segment">User Segments</label>
        <select 
          id="user-segment"
          v-model="formData.userSegment"
          class="form-input"
        >
          <option v-for="segment in userSegments" :key="segment.value" :value="segment.value">
            {{ segment.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="message-tag">Select Message Tag</label>
        <select 
          id="message-tag"
          v-model="formData.messageTag"
          class="form-input"
        >
          <option v-for="tag in messageTags" :key="tag.value" :value="tag.value">
            {{ tag.label }}
          </option>
        </select>
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
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.form-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-tertiary, #9ca3af);
}

select.form-input {
  cursor: pointer;
}

@media (max-width: 640px) {
  .form-group {
    margin-bottom: 16px;
  }
}
</style> 