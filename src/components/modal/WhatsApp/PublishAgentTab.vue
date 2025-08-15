<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
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
const botDetails = ref<any>(null);
const isLoadingBotDetails = ref(false);
const showProviderSelection = ref(true);
const isDialog360Connected = ref(false);
const isMetaConnected = ref(false);
const saving = ref(false);

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

// Update local state based on bot details
const updateLocalState = (details: any) => {
  botDetails.value = details;
  
  // Check if Dialog360 is configured
  if (details.dialog360) {
    selectedProvider.value = 'dialog360';
    showProviderSelection.value = false;
    isDialog360Connected.value = true;
    isMetaConnected.value = false;
    
    // Pre-fill Dialog360 fields
    dialog360Fields.value = {
      whatsapp: details.dialog360.whatsapp || '',
      apiKey: details.dialog360.api_key || '',
      interactiveButton: details.dialog360.interactive_button || false
    };
  }
  // Check if WhatsApp Cloud is configured
  else if (details.whatsapp_cloud) {
    selectedProvider.value = 'meta';
    showProviderSelection.value = false;
    isDialog360Connected.value = false;
    isMetaConnected.value = true;
    
    // Pre-fill Meta Cloud fields
    metaFields.value = {
      temporaryToken: details.whatsapp_cloud.temporary_token || '',
      phoneNumber: details.whatsapp_cloud.whatsapp || '',
      phoneNumberId: details.whatsapp_cloud.whatsapp_phone_id || '',
      whatsappBusinessAccountId: details.whatsapp_cloud.whatsapp_account_id || '',
      clientId: details.whatsapp_cloud.client_id || '',
      clientSecret: details.whatsapp_cloud.client_secret || ''
    };
  }
  // No provider configured, show selection
  else {
    showProviderSelection.value = true;
    selectedProvider.value = null;
    isDialog360Connected.value = false;
    isMetaConnected.value = false;
  }
};

// Watch for changes in bot details cache to update local state
watch(() => publishStore.cache.botDetails, (newBotDetails) => {
  if (newBotDetails) {
    updateLocalState(newBotDetails);
  }
}, { immediate: true });

// Load bot details only if not already cached
const loadBotDetails = async () => {
  
  try {
    showProviderSelection.value = false;
    isLoadingBotDetails.value = true;
  // If we already have valid cached data, use it
  if (publishStore.cacheValid.botDetails && publishStore.cache.botDetails) {
    updateLocalState(publishStore.cache.botDetails);
    return;
  }
  
  // Only fetch if not already loading
  if (publishStore.loadingStates.botDetails) {
    return;
  }
    const result = await publishStore.getBotDetails();
    if (result.success && result.data) {
      updateLocalState(result.data);
    }
  } catch (error) {
    console.error('Failed to load bot details:', error);
  } finally {
    isLoadingBotDetails.value = false;
  }
};

// Load bot details on component mount only if needed
onMounted(async () => {
  // Only load if we don't have valid cached data
  if (!publishStore.cacheValid.botDetails || !publishStore.cache.botDetails) {
    await loadBotDetails();
  }
});

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

const handleMetaIntegrationComplete = async () => {
  showMetaIntegration.value = false;
  isMetaConnected.value = true;
  // Reload bot details to update the UI
  await loadBotDetails();
};

const handleSaveSettings = async () => {
  // Validate fields based on selected provider
  if (selectedProvider.value === 'meta') {
    if (!metaFields.value.temporaryToken || !metaFields.value.phoneNumber || 
        !metaFields.value.phoneNumberId || !metaFields.value.whatsappBusinessAccountId ||
        !metaFields.value.clientId || !metaFields.value.clientSecret) {
      window.$toast?.error('All Meta Cloud fields are required');
      return;
    }
  } else if (selectedProvider.value === 'dialog360') {
    if (!dialog360Fields.value.whatsapp || !dialog360Fields.value.apiKey) {
      window.$toast?.error('WhatsApp number and API Key are required');
      return;
    }
  }
  
  saving.value = true; // Set loading state
  
  try {
    let payload: any;
    
    if (selectedProvider.value === 'meta') {
      payload = {
        api_key: botStore.apiKey,
        bot_id: botStore.botId,
        client_id: metaFields.value.clientId,
        client_secret: metaFields.value.clientSecret,
        temporary_token: metaFields.value.temporaryToken,
        type: 'meta' as const,
        whatsapp: metaFields.value.phoneNumber,
        whatsapp_phone_id: metaFields.value.phoneNumberId,
        whatsapp_account_id: metaFields.value.whatsappBusinessAccountId
      };
    } else if (selectedProvider.value === 'dialog360') {
      payload = {
        api_key: dialog360Fields.value.apiKey,
        bot_id: botStore.botId,
        interactive_buttons: dialog360Fields.value.interactiveButton,
        type: '360_dialog' as const,
        webhook: botDetails.value?.dialog360?.webhook || '',
        whatsapp: dialog360Fields.value.whatsapp
      };
    }
    
    if (payload) {
      // Use unified method
      const result = await publishStore.saveWhatsAppSettings(payload);
      if (result.success) {
        const providerName = selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360';
        window.$toast?.success(`${providerName} settings saved successfully!`);
        
        // Clear bot details cache to force refresh
        publishStore.cache.botDetails = null;
        publishStore.cacheValid.botDetails = false;
        
        // Reload bot details to update the UI
        await loadBotDetails();
      } else {
        window.$toast?.error(result.error || `Failed to save ${selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360'} settings`);
      }
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    const providerName = selectedProvider.value === 'meta' ? 'Meta Cloud' : 'Dialog360';
    window.$toast?.error(`Failed to save ${providerName} settings`);
  } finally {
    saving.value = false; // Reset loading state
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
        <img src="/images/whatsapp-icon.png" alt="Meta Cloud" class="provider-icon" />
          Official Meta cloud
        </button>
        <button 
          class="provider-button"
          :class="{ active: selectedProvider === 'dialog360' }"
          @click="selectProvider('dialog360')"
        >
        <img src="/images/360dialog-logo.png" alt="Dialog360" class="provider-icon" />
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
        <!-- Action Buttons -->
        <div class="agent-action-buttons">        
          <Button
            variant="primary"
            size="medium"
            :loading="saving"
            :disabled="saving"
            @click="handleSaveSettings"
          >
            {{ saving ? 'Saving...' : 'Save Settings' }}
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
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
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

.provider-icon {
  /* width: 30px; */
  height: 40px;
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