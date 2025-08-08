<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button, Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import MetaCloudIntegration from "./Cloud/MetaCloudIntegration.vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Emits
const emit = defineEmits<{
  'test-bot': [];
  'save-meta-settings': [settings: any];
  'save-dialog360-settings': [settings: any];
}>();

// Reactive data
const selectedProvider = ref<'meta' | 'dialog360' | null>(null);
const botDetails = ref<any>(null);
const isLoadingBotDetails = ref(false);
const showProviderSelection = ref(true);
const isDialog360Connected = ref(false);
const isMetaConnected = ref(false);

// Meta Cloud integration state
const showMetaIntegration = ref(false);

// Meta Cloud fields (for when already connected)
const metaFields = ref({
  temporaryToken: '',
  phoneNumber: '',
  phoneNumberId: '',
  whatsappBusinessAccountId: '',
  clientId: '',
  clientSecret: ''
});

// Dialog360 fields
const dialog360Fields = ref({
  whatsapp: '',
  apiKey: '',
  interactiveButton: false
});

// Window features for Dialog360 modal
const windowFeatures = ref('width=800,height=600,scrollbars=yes,resizable=yes');

// Load bot details on component mount
onMounted(async () => {
  await loadBotDetails();
});

// Load bot details to determine configured provider
const loadBotDetails = async () => {
  isLoadingBotDetails.value = true;
  try {
    const result = await publishStore.getBotDetails();
    if (result.success) {
      botDetails.value = result.data;
      
      // Check if Dialog360 is configured
      if (result.data.dialog360) {
        selectedProvider.value = 'dialog360';
        showProviderSelection.value = false;
        isDialog360Connected.value = true;
        // Pre-fill Dialog360 fields
        dialog360Fields.value = {
          whatsapp: result.data.dialog360.whatsapp || '',
          apiKey: result.data.dialog360.api_key || '',
          interactiveButton: result.data.interactive_button || false
        };
      }
      // Check if WhatsApp Cloud is configured
      else if (result.data.whatsapp_cloud) {
        selectedProvider.value = 'meta';
        showProviderSelection.value = false;
        isMetaConnected.value = true;
        // Pre-fill Meta Cloud fields
        metaFields.value = {
          temporaryToken: result.data.whatsapp_cloud.temporary_token || '',
          phoneNumber: result.data.whatsapp_cloud.whatsapp || '',
          phoneNumberId: result.data.whatsapp_cloud.whatsapp_phone_id || '',
          whatsappBusinessAccountId: result.data.whatsapp_cloud.whatsapp_account_id || '',
          clientId: result.data.whatsapp_cloud.client_id || '',
          clientSecret: result.data.whatsapp_cloud.client_secret || ''
        };
      }
      // No provider configured, show selection
      else {
        showProviderSelection.value = true;
        selectedProvider.value = null;
        isDialog360Connected.value = false;
        isMetaConnected.value = false;
      }
    }
  } catch (error) {
    console.error('Failed to load bot details:', error);
  } finally {
    isLoadingBotDetails.value = false;
  }
};

// Methods
const selectProvider = (provider: 'meta' | 'dialog360') => {
  selectedProvider.value = provider;
  if (provider === 'meta' && !isMetaConnected.value) {
    // Show Meta Cloud integration steps
    showMetaIntegration.value = true;
  }
};

const openDialog360Modal = () => {
  const url = `https://hub.360dialog.com/dashboard/app/6FtguzPA/permissions?state=${botStore.botId}`;
  window.open(url, "integratedOnboardingWindow", windowFeatures.value);
};

const testBot = () => {
  emit('test-bot');
};

const handleMetaIntegrationComplete = async () => {
  showMetaIntegration.value = false;
  isMetaConnected.value = true;
  // Reload bot details to update the UI
  await loadBotDetails();
};

const saveMetaSettings = async () => {
  if (!metaFields.value.temporaryToken || !metaFields.value.phoneNumber || 
      !metaFields.value.phoneNumberId || !metaFields.value.whatsappBusinessAccountId ||
      !metaFields.value.clientId || !metaFields.value.clientSecret) {
    window.$toast?.error('All Meta Cloud fields are required');
    return;
  }
  
  try {
    const result = await publishStore.saveWhatsAppCloudSettings({
      temporaryToken: metaFields.value.temporaryToken,
      phoneNumber: metaFields.value.phoneNumber,
      phoneNumberId: metaFields.value.phoneNumberId,
      whatsappBusinessAccountId: metaFields.value.whatsappBusinessAccountId,
      clientId: metaFields.value.clientId,
      clientSecret: metaFields.value.clientSecret
    });
    
    if (result.success) {
      emit('save-meta-settings', metaFields.value);
      // Reload bot details to update the UI
      await loadBotDetails();
    }
  } catch (error) {
    console.error('Failed to save Meta Cloud settings:', error);
  }
};

const saveDialog360Settings = async () => {
  if (!dialog360Fields.value.whatsapp || !dialog360Fields.value.apiKey) {
    window.$toast?.error('WhatsApp number and API Key are required');
    return;
  }
  
  try {
    // Prepare the payload with all existing data plus updated fields
    const payload = {
      ...botDetails.value.dialog360, // Keep all existing data
      whatsapp: dialog360Fields.value.whatsapp,
      api_key: dialog360Fields.value.apiKey,
      interactive_button: dialog360Fields.value.interactiveButton
    };
    
    const result = await publishStore.saveDialog360Settings(payload);
    
    if (result.success) {
      emit('save-dialog360-settings', dialog360Fields.value);
      // Reload bot details to update the UI
      await loadBotDetails();
    }
  } catch (error) {
    console.error('Failed to save Dialog360 settings:', error);
  }
};

// Expose methods for parent component
defineExpose({
  testBot,
  saveMetaSettings,
  saveDialog360Settings,
  selectedProvider: () => selectedProvider.value
});
</script>

<template>
  <div class="tab-panel">
    <!-- Meta Cloud Integration Steps (when not connected) -->
    <div v-if="showMetaIntegration" class="meta-integration">
      <MetaCloudIntegration 
        :on-complete="handleMetaIntegrationComplete"
      />
    </div>

    <!-- Main Publish Agent Content (when not showing integration) -->
    <div v-else>
      <!-- <h3>Publish your agent</h3>
      <p class="subtitle">Choose your WhatsApp provider and configure settings</p> -->
      
      <!-- Loading State -->
      <div v-if="isLoadingBotDetails" class="loading-state">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading bot configuration...</p>
        </div>
      </div>
      
      <!-- Provider Selection (only shown when no provider is configured) -->
      <div v-else-if="showProviderSelection" class="provider-selection">
        <button 
          class="provider-button"
          :class="{ active: selectedProvider === 'meta' }"
          @click="selectProvider('meta')"
        >
          Official Meta cloud
        </button>
        <button 
          class="provider-button"
          :class="{ active: selectedProvider === 'dialog360' }"
          @click="selectProvider('dialog360')"
        >
          Dialog360
        </button>
      </div>

      <!-- Meta Cloud Form (when already connected) -->
      <div v-if="selectedProvider === 'meta' && isMetaConnected" class="provider-form">
        <h4>Meta cloud configuration</h4>
        <div class="form-group">
          <label for="meta-token">Temporary access token</label>
          <Input 
            id="meta-token"
            v-model="metaFields.temporaryToken"
            type="text"
            placeholder="Enter your temporary access token"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="meta-client-id">Client ID</label>
          <Input 
            id="meta-client-id"
            v-model="metaFields.clientId"
            type="text"
            placeholder="Enter your client ID"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="meta-client-secret">Client secret</label>
          <Input 
            id="meta-client-secret"
            v-model="metaFields.clientSecret"
            type="password"
            placeholder="Enter your client secret"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="meta-phone">Phone number</label>
          <Input 
            id="meta-phone"
            v-model="metaFields.phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="meta-phone-id">Phone number ID</label>
          <Input 
            id="meta-phone-id"
            v-model="metaFields.phoneNumberId"
            type="text"
            placeholder="Enter your phone number ID"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="meta-business-id">WhatsApp business account ID</label>
          <Input 
            id="meta-business-id"
            v-model="metaFields.whatsappBusinessAccountId"
            type="text"
            placeholder="Enter your WhatsApp business account ID"
            size="medium"
          />
        </div>
      </div>

      <!-- Dialog360 Registration Modal (when not connected) -->
      <div v-if="selectedProvider === 'dialog360' && !isDialog360Connected" class="dialog360-registration">
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

      <!-- Dialog360 Form (when already connected) -->
      <div v-if="selectedProvider === 'dialog360' && isDialog360Connected" class="provider-form">
        <h4>Dialog360 configuration</h4>
        <div class="form-group">
          <label for="dialog-whatsapp">WhatsApp number</label>
          <Input 
            id="dialog-whatsapp"
            v-model="dialog360Fields.whatsapp"
            type="tel"
            placeholder="Enter your WhatsApp number"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="dialog-api-key">API Key</label>
          <Input 
            id="dialog-api-key"
            v-model="dialog360Fields.apiKey"
            type="password"
            placeholder="Enter your API key"
            size="medium"
          />
        </div>
        <div class="form-group">
          <label for="dialog-interactive-button" class="checkbox-label">
            <input 
              id="dialog-interactive-button"
              type="checkbox"
              v-model="dialog360Fields.interactiveButton"
              class="form-checkbox"
            />
            <span>Interactive Button</span>
          </label>
        </div>
      </div>

      <!-- No Provider Selected Message -->
      <div v-if="!isLoadingBotDetails && !selectedProvider && showProviderSelection" class="no-provider-message">
        <p>Please select a WhatsApp provider to configure your bot.</p>
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.form-checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary, #3b82f6);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.checkbox-label span {
  margin-left: 8px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; /* Adjust as needed */
  background-color: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  border: 4px solid var(--color-border, #e5e7eb);
  border-top: 4px solid var(--color-primary, #3b82f6);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px auto;
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