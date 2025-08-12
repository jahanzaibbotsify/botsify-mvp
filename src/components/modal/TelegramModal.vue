<script setup lang="ts">
import { ref, provide } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { Button, Input } from "@/components/ui";
import { useTabManagement } from "@/composables/useTabManagement";

// Define tabs
const tabs = [
  { id: 'publish', label: 'Publish' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish');

const emit = defineEmits<{
  back: [];
}>();

// Stores
const publishStore = usePublishStore();

// Local state
const isLoading = ref(false);
const telegramForm = ref({
  accessToken: '',
  botName: '',
  telegramNumber: '',
  telegramChatbotUrl: ''
});

const { currentTab, computedTabs, handleTabChange } = useTabManagement(tabs, 'publish');

// Load existing Telegram settings
const loadTelegramSettings = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.getThirdPartyConfig();
    if (result.success && result.data?.telegramConf?.setting) {
      const settings = result.data.telegramConf.setting;
      telegramForm.value = {
        accessToken: settings.access_token || '',
        botName: settings.bot_name || '',
        telegramNumber: settings.telegram_number || '',
        telegramChatbotUrl: settings.telegram_url || ''
      };
    }
  } catch (error) {
    console.error('Failed to load Telegram settings:', error);
  } finally {
    isLoading.value = false;
  }
};

const openModal = () => {
  modalRef.value?.openModal();
  loadTelegramSettings();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  console.log('TelegramModal - Tab changed to:', tabId);
  currentActiveTab.value = tabId;
  handleTabChange(tabId);
};

// Methods
const handleSaveTelegramSettings = async () => {
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
      if (window.$toast) {
        window.$toast.success('Telegram settings saved successfully!');
      }
    } else {
      console.error('Failed to save Telegram settings:', result.error);
      if (window.$toast) {
        window.$toast.error(result.error || 'Failed to save Telegram settings');
      }
    }
  } catch (error) {
    console.error('Failed to save Telegram settings:', error);
    if (window.$toast) {
      window.$toast.error('Failed to save Telegram settings');
    }
  } finally {
    isLoading.value = false;
  }
};

// Provide context for child components
provide('telegram-modal', {
  currentTab,
  botService: ref('telegram')
});

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Telegram integration"
    :tabs="computedTabs"
    icon="/bots/telegram.png"
    max-width="1200px"
    default-tab="publish"
    @back="handleBack"
    @tab-change="onTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Tab -->
      <div v-if="activeTab === 'publish'" class="tab-panel">
        <h3>Telegram agent configuration</h3>
        <p class="subtitle">Configure your Telegram bot settings</p>
        
        <!-- Loading State -->
        <div v-if="publishStore.loadingStates.thirdPartyConfig" class="loading-state">
          <div class="loader-spinner"></div>
          <span>Loading Telegram settings...</span>
        </div>
        
        <!-- Form Content -->
        <div v-else class="form-section">
          <div class="form-group">
            <label for="access-token">Access token</label>
            <Input 
              id="access-token"
              v-model="telegramForm.accessToken"
              type="text"
              placeholder="Enter your Telegram bot access token"
              size="medium"
            />
            <small class="help-text">
              Get this from @BotFather on Telegram
            </small>
          </div>
          
          <div class="form-group">
            <label for="bot-name">Agent name</label>
            <Input 
              id="bot-name"
              v-model="telegramForm.botName"
              type="text"
              placeholder="Enter your agent name"
              size="medium"
            />
          </div>
          
          <div class="form-group">
            <label for="telegram-number">Telegram number</label>
            <Input 
              id="telegram-number"
              v-model="telegramForm.telegramNumber"
              type="tel"
              placeholder="Enter your Telegram phone number"
              size="medium"
            />
            <small class="help-text">
              Include country code (e.g., +1234567890)
            </small>
          </div>
          
          <div class="form-group">
            <label for="chatbot-url">Telegram agent URL</label>
            <Input 
              id="chatbot-url"
              v-model="telegramForm.telegramChatbotUrl"
              type="url"
              placeholder="https://t.me/your_agent_username"
              size="medium"
            />
            <small class="help-text">
              The URL where users can access your agent
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
          :loading="isLoading || publishStore.loadingStates.thirdPartyConfig"
          @click="handleSaveTelegramSettings"
        >
          {{ (isLoading || publishStore.loadingStates.thirdPartyConfig) ? 'Saving...' : 'Save' }}
        </Button>
      </div>
    </template>
    
  </PublishModalLayout>
</template>

<style scoped>
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

@media (max-width: 640px) {
  .form-group {
    margin-bottom: 16px;
  }
}
</style> 