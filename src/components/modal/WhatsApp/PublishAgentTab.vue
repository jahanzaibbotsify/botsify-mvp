<script setup lang="ts">
import { ref } from "vue";
import { Button, Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Store
const publishStore = usePublishStore();

// Emits
const emit = defineEmits<{
  'test-bot': [];
  'save-meta-settings': [settings: any];
  'save-dialog360-settings': [settings: any];
}>();

// Reactive data
const selectedProvider = ref<'meta' | 'dialog360' | null>(null);

// Meta Cloud fields
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
  whatsappNumber: '',
  apiKey: '',
  phoneNumberId: '',
  whatsappBusinessAccountId: ''
});

// Methods
const selectProvider = (provider: 'meta' | 'dialog360') => {
  selectedProvider.value = provider;
};

const testBot = () => {
  emit('test-bot');
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
    }
  } catch (error) {
    console.error('Failed to save Meta Cloud settings:', error);
  }
};

const saveDialog360Settings = async () => {
  if (!dialog360Fields.value.whatsappNumber || !dialog360Fields.value.apiKey || 
      !dialog360Fields.value.phoneNumberId || !dialog360Fields.value.whatsappBusinessAccountId) {
    window.$toast?.error('All Dialog360 fields are required');
    return;
  }
  
  try {
    const result = await publishStore.saveDialog360Settings({
      whatsappNumber: dialog360Fields.value.whatsappNumber,
      apiKey: dialog360Fields.value.apiKey,
      phoneNumberId: dialog360Fields.value.phoneNumberId,
      whatsappBusinessAccountId: dialog360Fields.value.whatsappBusinessAccountId
    });
    
    if (result.success) {
      emit('save-dialog360-settings', dialog360Fields.value);
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
    <h3>Publish Your Agent</h3>
    <p class="subtitle">Choose your WhatsApp provider and configure settings</p>
    
    <!-- Provider Selection -->
    <div class="provider-selection">
      <button 
        class="provider-button"
        :class="{ active: selectedProvider === 'meta' }"
        @click="selectProvider('meta')"
      >
        Official Meta Cloud
      </button>
      <button 
        class="provider-button"
        :class="{ active: selectedProvider === 'dialog360' }"
        @click="selectProvider('dialog360')"
      >
        Dialog360
      </button>
    </div>

    <!-- Meta Cloud Form -->
    <div v-if="selectedProvider === 'meta'" class="provider-form">
      <h4>Meta Cloud Configuration</h4>
      <div class="form-group">
        <label for="meta-token">Temporary Access Token</label>
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
        <label for="meta-client-secret">Client Secret</label>
        <Input 
          id="meta-client-secret"
          v-model="metaFields.clientSecret"
          type="password"
          placeholder="Enter your client secret"
          size="medium"
        />
      </div>
      <div class="form-group">
        <label for="meta-phone">Phone Number</label>
        <Input 
          id="meta-phone"
          v-model="metaFields.phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          size="medium"
        />
      </div>
      <div class="form-group">
        <label for="meta-phone-id">Phone Number ID</label>
        <Input 
          id="meta-phone-id"
          v-model="metaFields.phoneNumberId"
          type="text"
          placeholder="Enter your phone number ID"
          size="medium"
        />
      </div>
      <div class="form-group">
        <label for="meta-business-id">WhatsApp Business Account ID</label>
        <Input 
          id="meta-business-id"
          v-model="metaFields.whatsappBusinessAccountId"
          type="text"
          placeholder="Enter your WhatsApp business account ID"
          size="medium"
        />
      </div>
    </div>

    <!-- Dialog360 Form -->
    <div v-if="selectedProvider === 'dialog360'" class="provider-form">
      <h4>Dialog360 Configuration</h4>
      <div class="form-group">
        <label for="dialog-whatsapp">WhatsApp Number</label>
        <Input 
          id="dialog-whatsapp"
          v-model="dialog360Fields.whatsappNumber"
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
        <label for="dialog-phone-id">Phone Number ID</label>
        <Input 
          id="dialog-phone-id"
          v-model="dialog360Fields.phoneNumberId"
          type="text"
          placeholder="Enter your phone number ID"
          size="medium"
        />
      </div>
      <div class="form-group">
        <label for="dialog-business-id">WhatsApp Business Account ID</label>
        <Input 
          id="dialog-business-id"
          v-model="dialog360Fields.whatsappBusinessAccountId"
          type="text"
          placeholder="Enter your WhatsApp business account ID"
          size="medium"
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

@media (max-width: 640px) {
  .provider-selection {
    flex-direction: column;
  }
  
  .provider-button {
    width: 100%;
  }
}
</style> 