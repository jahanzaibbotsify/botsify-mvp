<script setup lang="ts">
import {Button, Input, PublishModalLayout} from "@/components/ui";
import { ref, onMounted } from "vue";
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
  loadTelegramSettings();
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

// Load existing Telegram settings
const loadTelegramSettings = async () => {
  try {
    const result = await publishStore.getBotDetails();
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
  }
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
    title="Telegram integration"
    :tabs="tabs"
    icon="/bots/telegram.png"
    max-width="1200px"
    default-tab="publish"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Tab -->
      <div v-if="activeTab === 'publish'" class="tab-panel">
        <h3>Telegram agent configuration</h3>
        <p class="subtitle">Configure your Telegram bot settings</p>
        
        <div class="form-section">
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
    </template>
    
    <template #actions>
      <!-- Save Button for Publish Tab -->
      <Button 
        v-if="currentActiveTab === 'publish'" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="saveTelegramSettings"
      >
        {{ isLoading ? 'Saving...' : 'Save' }}
      </Button>
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
}
</style> 