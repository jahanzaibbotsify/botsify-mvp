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
  'save-settings': [settings: any];
}>();


// Meta Cloud fields
const smsFields = ref({
  temporaryAccessToken: '',
  phoneNumber: '',
  phoneNumberId: '',
  whatsappBusinessAccountId: ''
});

const saveSettings = () => {
  if (!smsFields.value.temporaryAccessToken || !smsFields.value.phoneNumber || 
      !smsFields.value.phoneNumberId || !smsFields.value.whatsappBusinessAccountId) {
    console.error('All Meta Cloud fields are required');
    return;
  }
  emit('save-settings', smsFields.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Publish Your Bot</h3>
    <p class="subtitle">Choose your WhatsApp provider and configure settings</p>

      <div class="form-group">
        <label for="meta-token">Temporary Access Token</label>
        <input 
          id="meta-token"
          v-model="smsFields.temporaryAccessToken"
          type="text"
          placeholder="Enter your temporary access token"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="meta-phone">Phone Number</label>
        <input 
          id="meta-phone"
          v-model="smsFields.phoneNumber"
          type="text"
          placeholder="Enter your phone number"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="meta-phone-id">Phone Number ID</label>
        <input 
          id="meta-phone-id"
          v-model="smsFields.phoneNumberId"
          type="text"
          placeholder="Enter your phone number ID"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="meta-business-id">WhatsApp Business Account ID</label>
        <input 
          id="meta-business-id"
          v-model="smsFields.whatsappBusinessAccountId"
          type="text"
          placeholder="Enter your WhatsApp business account ID"
          class="form-input"
        />
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

@media (max-width: 640px) {
  .provider-selection {
    flex-direction: column;
  }
  
  .provider-button {
    width: 100%;
  }
}
</style> 