<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { botsifyApi, type BotsifyResponse } from '@/services/botsifyApi';
import { BOTSIFY_WEB_URL } from '@/utils/config';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import Swal from 'sweetalert2'; 
import { useToast } from 'vue-toast-notification';

const $toast = useToast({ position: 'top-right' });

const chatStore = useChatStore();
const isDeployingAgent = ref(false);
const lastDeployResult = ref<BotsifyResponse | null>(null);

// Get the latest prompt content from the current active chat
const latestPromptContent = computed(() => {
  const currentChat = chatStore.chats.find(chat => chat.id === chatStore.activeChat);
  return currentChat?.story?.content || '';
});

// Check if there's prompt content available
const hasPromptContent = computed(() => {
  return latestPromptContent.value.trim().length > 0;
});

const testAiAgent = async () => {
  if (!hasPromptContent.value) {
    $toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const BOTSIFY_APIKEY = useApiKeyStore().apiKey;
  const url = `${BOTSIFY_WEB_URL}/web-bot/agent/${BOTSIFY_APIKEY}`;
  window.open(url, '_blank');
}

const deployAiAgent = async () => {
  if (!hasPromptContent.value) {
    $toast.error('No prompt content available to deploy. Please generate some content first.');
    return;
  }
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Are you sure you want to deploy the AI Agent? This will make it live.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
  });

  // Confirm deployment
  if (!result.isConfirmed) return;

  isDeployingAgent.value = true;
  lastDeployResult.value = null;

  try {
    console.log('Starting AI Agent deployment...');
    const result = await botsifyApi.deployAiAgent(latestPromptContent.value);
    lastDeployResult.value = result;
    
    if (result.success) {
      $toast.success(`🚀 ${result.message}`);
    } else {
      $toast.error(`❌ Deployment failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Unexpected error during deployment:', error);
    $toast.error('❌ An unexpected error occurred during deployment.');
  } finally {
    isDeployingAgent.value = false;
  }
};
</script>

<template>
  <div class="ai-agent-actions">
    <div class="section-header">
      <h4>🤖 AI Agent</h4>
      <p class="section-description">Test and deploy your AI prompt</p>
    </div>
    
    <div class="action-buttons">
      <!-- Test AI Agent Button -->
      <button 
        class="action-button test-button"
        @click="testAiAgent"
        :disabled="!hasPromptContent"
        :title="!hasPromptContent ? 'No prompt content available' : 'Test your AI agent'"
      >
        <div class="button-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span>Test AI Agent</span>
        </div>
      </button>

      <!-- Deploy AI Agent Button -->
      <button 
        class="action-button deploy-button"
        @click="deployAiAgent"
        :disabled="isDeployingAgent || !hasPromptContent"
        :title="!hasPromptContent ? 'No prompt content available' : 'Deploy your AI agent'"
      >
        <div class="button-content">
          <svg v-if="!isDeployingAgent" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10,8 16,12 10,16 10,8"></polygon>
          </svg>
          <div v-else class="loading-spinner"></div>
          <span>{{ isDeployingAgent ? 'Deploying...' : 'Deploy AI Agent' }}</span>
        </div>
      </button>
    </div>

    <!-- Status Information -->
    <div v-if="!hasPromptContent" class="status-info warning">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span>Generate prompt content first</span>
    </div>

    <div v-else class="status-info success">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span>Prompt content ready ({{ Math.round(latestPromptContent.length / 100) / 10 }}k chars)</span>
    </div>
  </div>
</template>

<style scoped>
.ai-agent-actions {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.section-header {
  margin-bottom: var(--space-3);
}

.section-header h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-description {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
  width: 100%;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
  width: 16px;
  height: 16px;
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

.status-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.status-info.warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-info.success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-info svg {
  flex-shrink: 0;
}

/* Mobile styles */
@media (max-width: 767px) {
  .ai-agent-actions {
    padding: var(--space-3);
  }
  
  .action-button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }
  
  .section-header h4 {
    font-size: 0.9rem;
  }
}
</style> 