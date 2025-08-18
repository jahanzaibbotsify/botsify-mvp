<script setup lang="ts">
import { ref, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { Button, Input } from "@/components/ui";
import { useTabManagement } from "@/composables/useTabManagement";
import { publishApi } from "@/services/publishApi";

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
const isLoading = ref(false);

// Local state
const telegramConfig = computed(() => publishStore.thirdPartyConfig.data?.data?.telegramConf);
const telegramForm = ref({
  accessToken: '',
  botName: '',
  telegramNumber: '',
  telegramChatbotUrl:  ''
});

// Validation state
const errors = ref({
  accessToken: '',
  botName: '',
  telegramNumber: '',
  telegramChatbotUrl: ''
});

const { computedTabs, handleTabChange } = useTabManagement(tabs, 'publish');

// Computed property to check if all required fields are filled
const isFormValid = computed(() => {
  return telegramForm.value.accessToken.trim() !== '' &&
         telegramForm.value.botName.trim() !== '' &&
         telegramForm.value.telegramNumber.trim() !== '' &&
         telegramForm.value.telegramChatbotUrl.trim() !== '';
});

const openModal = async () => {
  modalRef.value?.openModal();
  await publishStore.thirdPartyConfig.load();
  telegramForm.value = {
    accessToken: telegramConfig.value?.access_token || '',
    botName: telegramConfig.value?.bot_name || '',
    telegramNumber: telegramConfig.value?.telegram_number || '',
    telegramChatbotUrl: telegramConfig.value?.telegram_url || ''
  }
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  currentActiveTab.value = tabId;
  handleTabChange(tabId);
};

// Validation methods
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Validate access token
  if (!telegramForm.value.accessToken.trim()) {
    errors.value.accessToken = 'Access token is required';
    isValid = false;
  } else if (telegramForm.value.accessToken.length < 10) {
    errors.value.accessToken = 'Access token must be at least 10 characters';
    isValid = false;
  }

  // Validate bot name
  if (!telegramForm.value.botName.trim()) {
    errors.value.botName = 'Agent name is required';
    isValid = false;
  } else if (telegramForm.value.botName.length < 2) {
    errors.value.botName = 'Agent name must be at least 2 characters';
    isValid = false;
  }

  // Validate telegram number (required)
  if (!telegramForm.value.telegramNumber.trim()) {
    errors.value.telegramNumber = 'Telegram number is required';
    isValid = false;
  }

  // Validate chatbot URL (required)
  if (!telegramForm.value.telegramChatbotUrl.trim()) {
    errors.value.telegramChatbotUrl = 'Telegram agent URL is required';
    isValid = false;
  } else {
    try {
      const url = new URL(telegramForm.value.telegramChatbotUrl.trim());
      if (!url.protocol.startsWith('http')) {
        errors.value.telegramChatbotUrl = 'URL must start with http:// or https://';
        isValid = false;
      } else if (!url.hostname.includes('t.me')) {
        errors.value.telegramChatbotUrl = 'URL must be a valid Telegram URL (e.g., https://t.me/username)';
        isValid = false;
      } else if (!url.pathname || url.pathname === '/') {
        errors.value.telegramChatbotUrl = 'URL must include a username (e.g., https://t.me/username)';
        isValid = false;
      }
    } catch {
      errors.value.telegramChatbotUrl = 'Please enter a valid URL';
      isValid = false;
    }
  }

  return isValid;
};

const clearErrors = () => {
  errors.value = {
    accessToken: '',
    botName: '',
    telegramNumber: '',
    telegramChatbotUrl: ''
  };
};

// Methods
const handleSaveTelegramSettings = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishApi.saveTelegramSettings(telegramForm.value);
    
    if (result.success) {
      telegramConfig.value.access_token = telegramForm.value.accessToken;
      telegramConfig.value.bot_name = telegramForm.value.botName;
      telegramConfig.value.telegram_number = telegramForm.value.telegramNumber;
      telegramConfig.value.telegram_url = telegramForm.value.telegramChatbotUrl;

      publishStore.publishStatus.invalidate();
      // You can add a toast notification here
      window.$toast.success('Telegram settings saved successfully!');
    } else {
      window.$toast.error(result.message || 'Failed to save Telegram settings');
    }
  } catch (error) {
    window.$toast.error('Failed to save Telegram settings');
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
        <p class="subtitle">Configure your Telegram settings</p>
        
        <!-- Loading State -->
        <div v-if="publishStore.thirdPartyConfig.loading" class="loading-content">
          <div class="loading-spinner"></div>
          <span>Loading...</span>
        </div>
        
        <!-- Form Content -->
        <div v-else class="form-section">
          <div class="form-group">
            <Input 
              label="Access token"
              id="access-token"
              v-model="telegramForm.accessToken"
              type="text"
              placeholder="Enter your Telegram bot access token"
              size="medium"
              :error="errors.accessToken"
            />
            <small class="help-text">
              Get this from @BotFather on Telegram. <a href="https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/Telegram-Chatbot-Botsify_120323_1709726199.pdf" target="_blank">Here is how to get it.</a>
            </small>
          </div>
          
          <div class="form-group">
            <Input 
              label="Agent name"
              id="bot-name"
              v-model="telegramForm.botName"
              type="text"
              placeholder="Enter your agent name"
              size="medium"
              :error="errors.botName"
            />
          </div>
          
          <div class="form-group">
            <Input
              label="Telegram number" 
              id="telegram-number"
              v-model="telegramForm.telegramNumber"
              type="tel"
              placeholder="Enter your Telegram phone number"
              size="medium"
              :error="errors.telegramNumber"
            />
            <small class="help-text">
              Include country code (e.g., +1234567890)
            </small>
          </div>
          
          <div class="form-group">
            <Input 
              label="Telegram agent URL"
              id="chatbot-url"
              v-model="telegramForm.telegramChatbotUrl"
              type="url"
              placeholder="https://t.me/your_agent_username"
              size="medium"
              :error="errors.telegramChatbotUrl"
            />
            <small class="help-text">
              The URL where users can access your agent
            </small>
          </div>
        </div>
        <div class="agent-action-buttons">
          <!-- Save Button for Publish Tab -->
          <Button 
            v-if="currentActiveTab === 'publish'" 
            variant="primary"
            size="medium"
            :loading="isLoading"
            :disabled="!isFormValid"
            @click="handleSaveTelegramSettings"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </template>
    
  </PublishModalLayout>
</template>