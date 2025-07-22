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

      <!-- AI Prompt Toggle -->
      <button 
        class="icon-button ai-prompt-toggle" 
        @click="toggleStorySidebar"
        title="AI Prompt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12l2 2 4-4"></path>
          <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
          <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
          <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
          <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
        </svg>
      </button>

      <!-- Delete Button -->
      <button 
        class="icon-button delete-button" 
        @click="handleDelete"
        title="Delete"
      >
        <i class="pi pi-trash" style="font-size: 20px;"></i>
      </button>
      
      <ThemeToggle />
      <!-- <UserMenu /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
// import UserMenu from '@/components/auth/UserMenu.vue';
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

const emit = defineEmits<{
  toggleStorySidebar: [];
}>();

const isDeployingAI = ref(false);

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

function toggleStorySidebar() {
  emit('toggleStorySidebar');
}

function handleDelete() {
  window.$confirm({
    text: "This action will delete your current chat flow and start a new chatbot. This action is irreversible."
  }, async() => {
    // await deploying('');
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

.ai-prompt-toggle {
  color: var(--color-primary);
  position: relative;
}

.ai-prompt-toggle:hover {
  background-color: rgba(0, 163, 255, 0.1);
  color: var(--color-primary);
}

.ai-prompt-toggle::after {
  content: 'AI Prompt';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  margin-top: var(--space-1);
}

.ai-prompt-toggle:hover::after {
  opacity: 1;
  visibility: visible;
}

.delete-button {
  color: var(--color-error);
}

.delete-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
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

/* Mobile styles */
@media (max-width: 767px) {
  .chat-header {
    padding: var(--space-2) var(--space-3);
    margin: var(--space-2) var(--space-2) 0;
  }
  
  .chat-header h2 {
    font-size: 1rem;
    max-width: calc(100% - 140px);
  }
  
  .ai-prompt-toggle::after {
    display: none;
  }
}
</style> 