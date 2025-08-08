<script setup lang="ts">
import { ref } from "vue";
import VueSelect from "vue3-select-component";
import { usePublishStore } from "@/stores/publishStore";
import { publishApi } from "@/services/publishApi";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'send-broadcast': [data: any];
  'no-test-user': [];
  'send-message': [message: any];
  'loading-change': [loading: boolean];
}>();

// Store
const publishStore = usePublishStore();

// Reactive data
const formData = ref({
  messageTag: '',
  message: ''
});

const isLoading = ref(false);

// Emit loading state to parent
const emitLoadingState = (loading: boolean) => {
  emit('loading-change', loading);
};

// Message tag options with descriptions
const messageTags = [
  { value: '', label: 'Select message tag' },
  { 
    value: 'CONFIRMED_EVENT_UPDATE', 
    label: 'CONFIRMED_EVENT_UPDATE',
    description: "The CONFIRMED_EVENT_UPDATE tag may only be used to send the user reminders or updates for an event they have registered for (e.g., RSVP'ed, purchased tickets). This tag may be used for upcoming events and events in progress."
  },
  { 
    value: 'POST_PURCHASE_UPDATE', 
    label: 'POST_PURCHASE_UPDATE',
    description: "The POST_PURCHASE_UPDATE tag may only be used to notify the user of an update on a recent purchase. For example Confirmation of transaction, such as invoices or receipts Notifications of shipment status, such as product in-transit, shipped, delivered, or delayed Changes related to an order that the user placed, such credit card has declined, backorder items, or other order updates that require user action"
  },
  { 
    value: 'ACCOUNT_UPDATE', 
    label: 'ACCOUNT_UPDATE',
    description: "The ACCOUNT_UPDATE tag may only be used to confirm updates to a user's account setting. For example, when there is a change in account settings and preferences of a user profile, notification of a password change, or membership expiration. This tag cannot be used for use cases beyond those listed above or for promotional content (ex: promotion for signups, new account creations, or deals to extend subscriptions)."
  },
  { 
    value: 'NON_PROMOTIONAL_SUBSCRIPTION', 
    label: 'NON_PROMOTIONAL_SUBSCRIPTION',
    description: 'The NON_PROMOTIONAL_SUBSCRIPTION tag allows send news update from the NPI registered pages. There is no window restriction on this as of now.'
  },
  { 
    value: 'HUMAN_AGENT', 
    label: 'HUMAN_AGENT',
    description: "The HUMAN_AGENT to respond to the person's message. Messages can be sent within 7 days of the person's message."
  },
  { 
    value: 'NO_TAG', 
    label: 'NO_TAG',
    description: "Use this tag for content that does not specify any specific tag above. Remember! Messages with NO_TAG will only be send with in 24 hours window. If user's last interaction is beyond 24 hours, please select the relavant tag."
  }
];

// Handle VueSelect values
const handleSelectChange = (key: keyof typeof formData.value, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  formData.value[key] = singleValue
};

const noTestUser = () => {
  emit('no-test-user');
};

const sendMessage = async () => {
  if (!formData.value.messageTag || !formData.value.message) {
    console.error('All fields are required');
    return;
  }

  console.log('Publish store:', publishStore);
  console.log('createBroadcastTask method:', publishStore.createBroadcastTask);

  isLoading.value = true;
  emitLoadingState(true);
  
  try {
    // Find the selected tag to get its description
    const selectedTag = messageTags.find(tag => tag.value === formData.value.messageTag);
    
    const payload = {
      description: selectedTag?.description || '',
      fall_back: false,
      response: formData.value.message,
      tag: formData.value.messageTag,
      type: 1,
      user_segment: "-1"
    };

    console.log('Sending payload:', payload);

    // Try to access the store method
    if (typeof publishStore.createBroadcastTask === 'function') {
      const result = await publishStore.createBroadcastTask(payload);
      
      if (result.success) {
        if (window.$toast) {
          window.$toast.success('Broadcast message sent successfully!');
        }
        // Reset form
        formData.value = {
          messageTag: '',
          message: ''
        };
      } else {
        console.error('Failed to send broadcast:', result.error);
        if (window.$toast) {
          window.$toast.error(result.error || 'Failed to send broadcast');
        }
      }
    } else {
      console.error('createBroadcastTask method not found on store');
      // Fallback to direct API call
      const result = await publishApi.createBroadcastTask(payload);
      
      if (result.success) {
        if (window.$toast) {
          window.$toast.success('Broadcast message sent successfully!');
        }
        // Reset form
        formData.value = {
          messageTag: '',
          message: ''
        };
      } else {
        console.error('Failed to send broadcast:', result.message);
        if (window.$toast) {
          window.$toast.error(result.message || 'Failed to send broadcast');
        }
      }
    }
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    if (window.$toast) {
      window.$toast.error('Failed to send broadcast');
    }
  } finally {
    isLoading.value = false;
    emitLoadingState(false);
  }
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

    <div class="form-section" :class="{ loading: isLoading }">
      <div class="form-group">
        <label for="message-tag">Select Message Tag</label>
        <VueSelect
          :model-value="formData.messageTag"
          @update:model-value="(value: string | string[]) => handleSelectChange('messageTag', value)"
          :options="messageTags"
          placeholder="Select message tag"
          :multiple="false"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="message">Message</label>
        <textarea 
          id="message"
          v-model="formData.message"
          placeholder="Enter your message"
          class="form-input"
          rows="4"
          :disabled="isLoading"
        ></textarea>
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

/* Disabled state styling */
.form-group :deep(.vue3-select-component.disabled),
.form-group :deep(.vue3-select-component[disabled]) {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-bg-hover, #f3f4f6);
}

/* Loading overlay */
.form-section {
  position: relative;
}

.form-section.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
  pointer-events: none;
}

@media (max-width: 640px) {
  .form-group {
    margin-bottom: 16px;
  }
}
</style>
