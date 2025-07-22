<template>
  <div class="chat-header">
    <h2>{{ title }}</h2>
    <div class="chat-actions">
      <!-- Deploy/Test AI Buttons -->
      <button 
        class="action-button deploy-button"
        @click="deployAI"
        :disabled="isDeployingAI || !hasPromptContent"
        :title="!hasPromptContent ? 'Generate prompt content first' : 'Deploy your AI agent'"
      >
        <div class="button-content">
          <i v-if="!isDeployingAI"  class="pi pi-play"></i>
          <div v-else class="loading-spinner"></div>
          <span>{{ isDeployingAI ? 'Deploying...' : 'Deploy Agent' }}</span>
        </div>
      </button>
      <button 
        class="action-button test-button"
        @click="testAI"
        :disabled="!hasPromptContent"
        :title="!hasPromptContent ? 'Generate prompt content first' : 'Test your AI agent'"
      >
        <div class="button-content">
          <i class="pi pi-wrench"></i>
          <span>Test Agent</span>
        </div>
      </button>

      <!-- Dropdown Menu Trigger -->
      <div class="dropdown" @mouseleave="showDropdown = false">
        <button class="icon-button" @click="toggleDropdown" title="More actions">
          <i class="pi pi-ellipsis-v" style="font-size: 22px;"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-content">
          <button class="dropdown-item" @click="toggleTheme">
            <i :class="themeStore.theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" style="font-size: 18px;"></i>
            <span>{{ themeStore.theme === 'light' ? 'Night Theme' : 'Light Theme' }}</span>
          </button>
          <button class="dropdown-item" @click="handleAIPrompt">
            <i class="pi pi-bolt" style="font-size: 18px;"></i>
            <span>AI Prompt</span>
          </button>
          <button class="dropdown-item" @click="handleDelete">
            <i class="pi pi-replay" style="font-size: 18px;"></i>
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { botsifyApi } from '@/services/botsifyApi';
import { BOTSIFY_WEB_URL } from '@/utils/config';
import { useChatStore } from '@/stores/chatStore';

interface Props {
  title: string;
  hasPromptContent: boolean;
  latestPromptContent: string;
  chatId: string;
}

const props = defineProps<Props>();
const chatStore = useChatStore();
const themeStore = useThemeStore();
const showDropdown = ref(false);

const emit = defineEmits<{
  toggleStorySidebar: [];
}>();

const isDeployingAI = ref(false);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function toggleTheme() {
  themeStore.setTheme(themeStore.theme === 'light' ? 'dark' : 'light');
  showDropdown.value = false;
}

function handleAIPrompt() {
  emit('toggleStorySidebar');
  showDropdown.value = false;
}

async function testAI() {
  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const apiKey = (await import('@/stores/apiKeyStore')).useApiKeyStore().apiKey;
  const url = `${BOTSIFY_WEB_URL}/web-bot/agent/${apiKey}`;
  window.open(url, '_blank');
}

function deployAI() {
  if (!props.hasPromptContent) {
    window.$toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  window.$confirm({
    text: "Do you really want to deploy your AI agent? This will make it available for use.",
    confirmButtonColor: "#00A3FF",
    confirmButtonText: "Yes, Deploy it!",
    cancelButtonText: "No, Cancel",
    animation: false,
  }, async () => {
    await deploying(props.latestPromptContent);
  });
}

async function deploying(content: string){
  isDeployingAI.value = true;
  try {
    const result = await botsifyApi.deployAiAgent(content);
    if (result.success) {
      window.$toast.success(`🚀 ${result.message}`);
    } else {
      window.$toast.error(`❌ Deployment failed: ${result.message}`);
    }
  } catch (error) {
    window.$toast.error('❌ An unexpected error occurred during deployment.');
  } finally {
    isDeployingAI.value = false;
  }
}

function handleDelete() {
  showDropdown.value = false;
  window.$confirm({
    text: "This action will delete your current chat flow and start a new chatbot. This action is irreversible."
  }, async() => {
    chatStore.clearChatMessages(props.chatId)
  });
}
</script>

<style scoped>
.chat-header {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  border-bottom: none;
  z-index: var(--z-sticky);
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 var(--space-4);
  margin-top: var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 4px 15px rgba(0, 163, 255, 0.08);
  border: 1px solid rgba(0, 163, 255, 0.1);
  border-bottom: none;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
  height: 50px;
  min-height: 40px;
  max-height: 40px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.test-button {
  background-color: var(--color-warning);
  color: white;
}

.test-button:hover:not(:disabled) {
  background-color: var(--color-warning-hover, #e6a700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.deploy-button {
  background-color: var(--color-success);
  color: white;
}

.deploy-button:hover:not(:disabled) {
  background-color: var(--color-success-hover, #16a34a);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 110%;
  background-color: var(--color-bg-primary);
  background-image: radial-gradient(circle at right top, rgba(0, 163, 255, 0.08), transparent 70%);
  min-width: 200px;
  box-shadow: var(--shadow-md), 0 4px 15px rgba(0, 163, 255, 0.08);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 163, 255, 0.1);
  z-index: var(--z-dropdown);
  overflow: hidden;
  padding: var(--space-2) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: rgba(0, 163, 255, 0.05);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.08), transparent 80%);
}

.dropdown-item.danger {
  color: var(--color-error);
}

.dropdown-item.danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
</style> 