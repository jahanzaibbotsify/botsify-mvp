<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { Button, Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import MetaCloudIntegration from "./Cloud/MetaCloudIntegration.vue";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Reactive data
const selectedProvider = ref<'meta' | 'dialog360' | null>(null);
const showProviderSelection = ref(true);
const isConnected = ref(false);
const saving = ref(false);

// Unified form fields for both providers
const formFields = ref({
  // Common fields
  whatsapp: '',
  api_key: '',
  
  // Meta Cloud specific fields
  temporary_token: '',
  whatsapp_phone_id: '',
  whatsapp_account_id: '',
  client_id: '',
  client_secret: '',
  
  // Dialog360 specific fields
  interactive_buttons: false,
  webhook: ''
});

// Window features for Dialog360 modal
const windowFeatures = ref('width=800,height=600,scrollbars=yes,resizable=yes');

// Computed properties
const whatsappData = computed(() => {
  return publishStore.whatsappConfig.data?.data?.whatsapp;
});

// Removed unused computed property

const providerType = computed(() => {
  if (!whatsappData.value) return null;
  return whatsappData.value.type === 'cloud_whatsapp' ? 'meta' : 'dialog360';
});

// Update local state based on whatsapp config
const updateLocalState = () => {
  const whatsapp = whatsappData.value;
  if (whatsapp) {
    selectedProvider.value = providerType.value;
    showProviderSelection.value = false;
    isConnected.value = true;

    // Pre-fill Dialog360 fields
    formFields.value = {
      whatsapp: whatsapp.whatsapp || '',
      api_key: whatsapp.api_key || '',
      
      // Dialog360 fields remain default
      interactive_buttons: whatsapp.interactive_activation,
      webhook: whatsapp.webhook || '',

      // Meta fields remain empty
      temporary_token: whatsapp.temporary_token || '',
      whatsapp_phone_id: whatsapp.whatsapp_phone_id || '',
      whatsapp_account_id: whatsapp.whatsapp_account_id || '',
      client_id: whatsapp.client_id || '',
      client_secret: whatsapp.client_secret || '',
    };
  }
};

// Watch for changes in whatsapp config to update local state
watch(() => publishStore.whatsappConfig.data, () => {
  updateLocalState();
}, { immediate: true });

// Load whatsapp config on component mount
onMounted(async () => {
  await publishStore.whatsappConfig.load();
});

// Methods
const selectProvider = (provider: 'meta' | 'dialog360') => {
  selectedProvider.value = provider;
};

const openDialog360Modal = () => {
  const url = `https://hub.360dialog.com/dashboard/app/6FtguzPA/permissions?state=${botStore.botId}`;
  window.open(url, "integratedOnboardingWindow", windowFeatures.value);
};

const handleMetaIntegrationComplete = async () => {
  isConnected.value = true;
  // Reload whatsapp config to update the UI
  await publishStore.whatsappConfig.load();
};

const handleBackToPublishAgent = () => {
  selectedProvider.value = null;
  showProviderSelection.value = true;
};

const handleSaveSettings = async () => {
  // Validate fields based on selected provider
  if (selectedProvider.value === 'meta') {
    if (!formFields.value.temporary_token || !formFields.value.whatsapp || 
        !formFields.value.whatsapp_phone_id || !formFields.value.whatsapp_account_id ||
        !formFields.value.client_id || !formFields.value.client_secret) {
      window.$toast?.error('All Meta Cloud fields are required');
      return;
    }
  } else if (selectedProvider.value === 'dialog360') {
    if (!formFields.value.whatsapp || !formFields.value.api_key) {
      window.$toast?.error('WhatsApp number and API Key are required');
      return;
    }
  }
  
  saving.value = true;
  
  try {
    const payload = {
      api_key: selectedProvider.value === 'meta' ? botStore.apiKey : formFields.value.api_key,
      bot_id: botStore.botId,
      type: (selectedProvider.value === 'meta' ? 'meta' : '360_dialog') as 'meta' | '360_dialog',
      whatsapp: formFields.value.whatsapp,
      // Meta Cloud specific fields
      client_id: formFields.value.client_id || null,
      client_secret: formFields.value.client_secret || null,
      temporary_token: formFields.value.temporary_token || null,
      whatsapp_phone_id: formFields.value.whatsapp_phone_id || null,
      whatsapp_account_id: formFields.value.whatsapp_account_id || null,
      // Dialog360 specific fields
      interactive_buttons: formFields.value.interactive_buttons || false,
      webhook: formFields.value.webhook || ''
    };
    
    const result = await publishStore.saveWhatsAppSettings(payload);
    if (result.success) {
      const providerName = selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360';
      window.$toast?.success(`${providerName} settings saved successfully!`);
      
      // Reload whatsapp config to update the UI
      await publishStore.whatsappConfig.load();
    } else {
      window.$toast?.error(result.error || `Failed to save ${selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360'} settings`);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    const providerName = selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360';
    window.$toast?.error(`Failed to save ${providerName} settings`);
  } finally {
    saving.value = false;
  }
};

// Expose only necessary methods for parent component
defineExpose({
  selectedProvider: () => selectedProvider.value
});
</script>

<template>
  <div class="tab-panel">
    <!-- Meta Cloud Integration Steps (when not connected) -->
    <div v-if="!isConnected && selectedProvider === 'meta'" class="meta-integration">
      <MetaCloudIntegration 
        :on-complete="handleMetaIntegrationComplete"
        :on-back="handleBackToPublishAgent"
      />
    </div>

    <!-- Main Publish Agent Content (when not showing integration) -->
    <div v-else>
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading WhatsApp configuration...</p>
        </div>
      </div>
      
      <!-- Provider Selection (only shown when no provider is configured) -->
      <div v-else-if="showProviderSelection" class="provider-selection">
        <button 
          class="provider-button"
          :class="{ active: selectedProvider === 'meta' }"
          @click="selectProvider('meta')"
        >
        Official Meta Cloud WhatsApp API
          <img src="/images/whatsapp-icon.png" alt="Meta Cloud" class="provider-icon" />
        </button>
        <button 
          class="provider-button"
          :class="{ active: selectedProvider === 'dialog360' }"
          @click="selectProvider('dialog360')"
        >
        Dialog360
          <img src="/images/360dialog-logo.png" alt="Dialog360" class="provider-icon" />
        </button>
      </div>

      <!-- Dialog360 Registration Modal (when not connected) -->
      <div v-if="selectedProvider === 'dialog360' && !isConnected" class="dialog360-registration">
        <h4>Request WhatsApp Business Account</h4>
        <div class="registration-content">
          <div class="registration-steps">
            <ul class="registration-list">
              <li>In order to use our service for WhatsApp, you need to fill in your form below.</li>
              <li>After approval of your request, you will be granted connection to use your bot with WhatsApp.</li>
            </ul>
          </div>
          <div class="registration-description">
            <p>Please go to this link and fill out the form to complete WhatsApp chatbot registration. After filling out the registration form, just close that page.</p>
            <div class="registration-button-container">
              <Button 
                @click="openDialog360Modal"
                class="registration-button"
                size="medium"
              >
                Register with Dialog360
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unified Form (when provider is selected or connected) -->
      <div v-if="selectedProvider && isConnected" class="provider-form">
        <h4>{{ selectedProvider === 'meta' ? 'Meta Cloud' : 'Dialog360' }} configuration</h4>
        
        <!-- Common Fields -->
        <div class="form-group">
          <Input 
            label="WhatsApp number"
            id="whatsapp-number"
            v-model="formFields.whatsapp"
            type="tel"
            placeholder="Enter your WhatsApp number"
            size="medium"
          />
        </div>

        <!-- Dialog360 Specific Fields -->
        <div v-if="selectedProvider === 'dialog360'" class="form-group">
          <Input 
            label="API Key"
            id="dialog-api-key"
            v-model="formFields.api_key"
            type="password"
            placeholder="Enter your API key"
            size="medium"
          />
        </div>

        <div v-if="selectedProvider === 'dialog360'" class="form-group">
          <label for="dialog-interactive-button" class="checkbox-label">
            <input 
              id="dialog-interactive-button"
              type="checkbox"
              v-model="formFields.interactive_buttons"
              class="form-checkbox"
            />
            <span>Interactive Button</span>
          </label>
        </div>

        <!-- Meta Cloud Specific Fields -->
        <div v-if="selectedProvider === 'meta'" class="form-group">
          <Input 
            label="Temporary access token"
            id="meta-token"
            v-model="formFields.temporary_token"
            type="text"
            placeholder="Enter your temporary access token"
            size="medium"
          />
        </div>

        <div v-if="selectedProvider === 'meta'" class="form-group">
          <Input 
            label="Client ID"
            id="meta-client-id"
            v-model="formFields.client_id"
            type="text"
            placeholder="Enter your client ID"
            size="medium"
          />
        </div>

        <div v-if="selectedProvider === 'meta'" class="form-group">
          <Input 
            label="Client secret"
            id="meta-client-secret"
            v-model="formFields.client_secret"
            type="password"
            placeholder="Enter your client secret"
            size="medium"
          />
        </div>

        <div v-if="selectedProvider === 'meta'" class="form-group">
          <Input 
            label="Phone number ID"
            id="meta-phone-id"
            v-model="formFields.whatsapp_phone_id"
            type="text"
            placeholder="Enter your phone number ID"
            size="medium"
          />
        </div>

        <div v-if="selectedProvider === 'meta'" class="form-group">
          <Input 
            label="WhatsApp business account ID"
            id="meta-business-id"
            v-model="formFields.whatsapp_account_id"
            type="text"
            placeholder="Enter your WhatsApp business account ID"
            size="medium"
          />
        </div>

        <!-- Action Buttons -->
        <div class="agent-action-buttons">        
          <Button
            variant="primary"
            size="medium"
            :loading="saving"
            :disabled="saving"
            @click="handleSaveSettings"
          >
            Save Settings
          </Button>
        </div>
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

.tab-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.provider-selection {
  display: flex;
  gap: 26px;
  margin: 24px auto;
  width: 50%;
}

.provider-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 18px;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
  padding: 25px 16px;
}

.provider-button:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-bg-secondary, #f3f4f6);
}

.provider-button.active {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-bg-tertiary);
  /* color: white; */
}

.provider-icon {
  /* width: 30px; */
  height: 50px;
  margin-right: 8px;
}

.provider-form {
  margin-bottom: 24px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary, #3b82f6);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.checkbox-label span {
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-provider-message {
  text-align: center;
  padding: 20px;
  background-color: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
  font-weight: 500;
}

/* Dialog360 Registration Styles */
.dialog360-registration {
  margin-bottom: 24px;
}

.registration-content {
  background-color: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  border: 1px solid var(--color-border, #e5e7eb);
}

.registration-steps {
  margin-bottom: 20px;
}

.registration-list {
  list-style-type: disc;
  margin-left: 20px;
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
  line-height: 1.6;
}

.registration-list li {
  margin-bottom: 8px;
}

.registration-description {
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
  line-height: 1.6;
}

.registration-description p {
  margin-bottom: 16px;
}

.registration-button-container {
  text-align: center;
}

.registration-button {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
  width: 100%;
  max-width: 300px;
}

.registration-button:hover {
  background-color: var(--color-primary-hover, #2563eb);
}

/* Meta Integration Styles */
.meta-integration {
  padding: 0;
}


@media (max-width: 640px) {
  .provider-selection {
    flex-direction: column;
  }
  
  .provider-button {
    width: 100%;
  }
  
  .registration-content {
    padding: 16px;
  }
}
</style> 