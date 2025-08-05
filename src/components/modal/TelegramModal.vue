<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { ref } from "vue";
import { usePublishStore } from "@/stores/publishStore";

// Define tabs
const tabs = [
  { id: 'publish', label: 'Publish' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const publishStore = usePublishStore();
const currentActiveTab = ref('publish');

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);
const telegramForm = ref({
  accessToken: '',
  botName: '',
  telegramNumber: '',
  telegramChatbotUrl: ''
});

const openModal = () => {
  modalRef.value?.openModal();
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

// Methods
const saveTelegramSettings = async () => {
  if (!telegramForm.value.accessToken || !telegramForm.value.botName) {
    console.error('Access Token and Bot Name are required');
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishStore.saveTelegramSettings(telegramForm.value);
    
    if (result.success) {
      console.log('Telegram settings saved successfully');
      // You can add a toast notification here
    } else {
      console.error('Failed to save Telegram settings:', result.error);
    }
  } catch (error) {
    console.error('Failed to save Telegram settings:', error);
  } finally {
    isLoading.value = false;
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Telegram Integration"
    :tabs="tabs"
    max-width="650px"
    default-tab="publish"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Tab -->
      <div v-if="activeTab === 'publish'" class="tab-panel">
        <h3>Telegram Agent Configuration</h3>
        <p class="subtitle">Configure your Telegram bot settings</p>
        
        <div class="form-section">
          <div class="form-group">
            <label for="access-token">Access Token</label>
            <input 
              id="access-token"
              v-model="telegramForm.accessToken"
              type="text"
              placeholder="Enter your Telegram bot access token"
              class="form-input"
            />
            <small class="help-text">
              Get this from @BotFather on Telegram
            </small>
          </div>
          
          <div class="form-group">
            <label for="bot-name">Agent Name</label>
            <input 
              id="bot-name"
              v-model="telegramForm.botName"
              type="text"
              placeholder="Enter your agent name"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="telegram-number">Telegram Number</label>
            <input 
              id="telegram-number"
              v-model="telegramForm.telegramNumber"
              type="tel"
              placeholder="Enter your Telegram phone number"
              class="form-input"
            />
            <small class="help-text">
              Include country code (e.g., +1234567890)
            </small>
          </div>
          
          <div class="form-group">
            <label for="chatbot-url">Telegram Agent URL</label>
            <input 
              id="chatbot-url"
              v-model="telegramForm.telegramChatbotUrl"
              type="url"
              placeholder="https://t.me/your_agent_username"
              class="form-input"
            />
            <small class="help-text">
              The URL where users can access your agent
            </small>
          </div>
        </div>
      </div>
    </template>
    
    <template #actions>
      <!-- Save Button for Publish Tab -->
      <button 
        v-if="currentActiveTab === 'publish'" 
        class="action-button primary" 
        @click="saveTelegramSettings"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save' }}
      </button>
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
  
  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style> 