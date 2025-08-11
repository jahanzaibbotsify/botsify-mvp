<script setup lang="ts">
import {Button, PublishModalLayout} from "@/components/ui";
import { ref } from "vue";

// Define tabs
const tabs = [
  { id: 'publish', label: 'Publish' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish');

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);
const portableAgentForm = ref({
  name: '',
  description: '',
  jsonConfig: ''
});

const openModal = () => {
  modalRef.value?.openModal();
  loadPortableAgentSettings();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  currentActiveTab.value = tabId;
};

// Load existing Portable Agent settings
const loadPortableAgentSettings = async () => {
  try {
    // For now, we'll just reset the form
    // In the future, you can load existing settings from the store
    portableAgentForm.value = {
      name: '',
      description: '',
      jsonConfig: ''
    };
  } catch (error) {
    console.error('Failed to load Portable Agent settings:', error);
  }
};

// Methods
const savePortableAgentSettings = async () => {
  if (!portableAgentForm.value.name || !portableAgentForm.value.jsonConfig) {
    console.error('Name and JSON Config are required');
    return;
  }

  // Validate JSON
  try {
    JSON.parse(portableAgentForm.value.jsonConfig);
  } catch (error) {
    console.error('Invalid JSON format');
    return;
  }

  isLoading.value = true;
  try {
    // For now, just console log the data
    console.log('Portable Agent settings to save:', {
      name: portableAgentForm.value.name,
      description: portableAgentForm.value.description,
      jsonConfig: JSON.parse(portableAgentForm.value.jsonConfig)
    });
    
    // TODO: Implement actual save functionality
    // const result = await publishStore.savePortableAgentSettings(portableAgentForm.value);
    
    console.log('Portable Agent settings saved successfully');
    // You can add a toast notification here
  } catch (error) {
    console.error('Failed to save Portable Agent settings:', error);
  } finally {
    isLoading.value = false;
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Portable Agent"
    :tabs="tabs"
    icon="/bots/portable-agent-icon.svg"
    max-width="1200px"
    default-tab="publish"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Tab -->
      <div v-if="activeTab === 'publish'" class="tab-panel">
        <h3>Portable Agent Configuration</h3>
        <p class="subtitle">Configure your portable agent with JSON configuration</p>
        
        <div class="form-section">          
          <div class="form-group">
            <label for="json-config">JSON Configuration <span class="required">*</span></label>
            <textarea
              id="json-config"
              v-model="portableAgentForm.jsonConfig"
              placeholder="Enter your JSON configuration here..."
              class="json-textarea"
              rows="5"
            ></textarea>
            <small class="help-text">
              Enter valid JSON configuration for your portable agent
            </small>
          </div>
        </div>
      </div>
      <div class="agent-action-buttons">
        <!-- Save Button for Publish Tab -->
        <Button 
          v-if="currentActiveTab === 'publish'" 
          variant="primary"
          size="medium"
          :loading="isLoading"
          @click="savePortableAgentSettings"
        >
          {{ isLoading ? 'Saving...' : 'Save' }}
        </Button>
      </div>
    </template>
    
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.form-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error);
}

.json-textarea {
  width: 100%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 150px;
}

.json-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

@media (max-width: 640px) {
  .form-group {
    margin-bottom: 16px;
  }
  
  .json-textarea {
    min-height: 200px;
  }
}
</style>
