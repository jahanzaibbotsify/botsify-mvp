<script setup lang="ts">
import {Input, Button} from "@/components/ui";
import { ref, watch } from "vue";
import { usePublishStore } from "@/stores/publishStore";
// Props
interface Props {
  isCheckingConfiguration?: boolean;
}

withDefaults(defineProps<Props>(), {
  isCheckingConfiguration: false
});

// Emits
const emit = defineEmits<{
  'save-settings': [settings: any];
}>();


// Twilio fields
const smsFields = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
});

const publishStore = usePublishStore();

// Loading state
const isLoading = ref(false);

// Load existing Twilio settings from store cache
const loadTwilioSettings = () => {
  if (publishStore.cache.thirdPartyConfig?.twilioConf) {
    const twilioConfig = publishStore.cache.thirdPartyConfig.twilioConf;
    smsFields.value = {
      twilioAccountSid: twilioConfig.sid || '',
      twilioAuthToken: twilioConfig.auth_token || '',
      twilioSmsNumber: twilioConfig.number || '',
    };
  }
};

// Watch for when configuration checking is complete and store is loaded
watch(() => publishStore.loadingStates.thirdPartyConfig, (newValue, oldValue) => {
  // When loading is complete (false), load the settings
  if (oldValue === true && newValue === false) {
    loadTwilioSettings();
  }
}, { immediate: true });

// Also watch the store cache directly
watch(() => publishStore.cache.thirdPartyConfig, () => {
  loadTwilioSettings();
}, { immediate: true });

const testBot = () => {
  isLoading.value = true;
  try {
    console.log('Testing bot...');
    // Add actual test bot logic here
    if (window.$toast) {
      window.$toast.info('Bot test functionality coming soon');
    }
  } catch (error) {
    console.error('Failed to test bot:', error);
    if (window.$toast) {
      window.$toast.error('Failed to test bot');
    }
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = () => {
  if (!smsFields.value.twilioAccountSid || !smsFields.value.twilioAuthToken || 
      !smsFields.value.twilioSmsNumber) {
    console.error('All Twilio fields are required');
    return;
  }
  emit('save-settings', smsFields.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
  testBot,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Publish your agent</h3>
    <p class="subtitle">Choose your SMS provider and configure settings</p>

    <!-- Loading State -->
    <div v-if="isCheckingConfiguration" class="loading-state">
      <div class="loader-spinner"></div>
      <span>Loading SMS settings...</span>
    </div>

    <!-- Form Content -->
    <div v-else class="form-section">
      <div class="form-group">
        <label for="twilio-account-sid">Twilio account SID</label>
        <Input 
          id="twilio-account-sid"
          v-model="smsFields.twilioAccountSid"
          type="text"
          placeholder="Enter your Twilio account SID"
          size="medium"
        />
        <small class="help-text">
          Find this in your Twilio Console dashboard
        </small>
      </div>
      
      <div class="form-group">
        <label for="twilio-auth-token">Twilio auth token</label>
        <Input 
          id="twilio-auth-token"
          v-model="smsFields.twilioAuthToken"
          type="password"
          placeholder="Enter your Twilio auth token"
          size="medium"
        />
        <small class="help-text">
          Keep this secure - it's your authentication token
        </small>
      </div>
      
      <div class="form-group">
        <label for="twilio-sms-number">Twilio SMS number</label>
        <Input 
          id="twilio-sms-number"
          v-model="smsFields.twilioSmsNumber"
          type="tel"
          placeholder="Enter your Twilio phone number"
          size="medium"
        />
        <small class="help-text">
          The phone number you purchased from Twilio
        </small>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="agent-action-buttons">
      <!-- <Button 
        variant="secondary"
        size="medium"
        :loading="isLoading"
        @click="testBot"
      >
        {{ isLoading ? 'Testing...' : 'Test Agent' }}
      </Button>
       -->
      <Button 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="saveSettings"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.form-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.provider-selection {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.provider-button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
}

.provider-button:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-bg-tertiary, #f3f4f6);
}

.provider-button.active {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary, #3b82f6);
  color: white;
}

.provider-form {
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .provider-selection {
    flex-direction: column;
  }
  
  .provider-button {
    width: 100%;
  }
}
</style> 