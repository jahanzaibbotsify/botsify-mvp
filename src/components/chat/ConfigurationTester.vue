<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';

const chatStore = useChatStore();
const isLoading = ref(false);

const testConfigurations = [
  {
    name: 'Change Language to Arabic',
    message: 'I want to change the language of the agent to Arabic'
  },
  {
    name: 'Change Logo',
    message: 'Please change the agent logo to https://example.com/new-logo.png'
  },
  {
    name: 'Update Color Scheme',
    message: 'Change the agent color scheme to blue'
  },
  {
    name: 'Turn Off Agent',
    message: 'Please turn off the agent'
  },
  {
    name: 'Multiple Changes',
    message: 'Change the agent language to French and also update the welcome message to "Bonjour! Comment puis-je vous aider?"'
  }
];

async function testConfiguration(config: { name: string; message: string }) {
  if (!chatStore.currentChat) {
    window.$toast.error('No active chat found. Please create a new chat first.');
    return;
  }

  isLoading.value = true;
  
  try {
    await chatStore.addMessage(
      chatStore.currentChat.id,
      config.message,
      'user'
    );
    console.log(`Testing configuration: ${config.name}`);
  } catch (error: any) {
    console.error('Error testing configuration:', error);
    window.$toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="configuration-tester">
    <h3>Configuration Tool Tester</h3>
    <p class="description">
      Test the configure_agent tool with predefined examples. These will trigger the AI to use the configuration tool.
    </p>
    
    <div class="test-buttons">
      <button 
        v-for="config in testConfigurations" 
        :key="config.name"
        @click="testConfiguration(config)"
        :disabled="isLoading"
        class="test-button"
      >
        {{ config.name }}
      </button>
    </div>
    
    <div v-if="isLoading" class="loading">
      Processing configuration request...
    </div>
  </div>
</template>

<style scoped>
.configuration-tester {
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.configuration-tester h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--space-4);
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.test-button {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: background-color 0.2s;
}

.test-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.test-button:disabled {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.loading {
  margin-top: var(--space-3);
  padding: var(--space-2);
  background-color: rgba(0, 163, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: 0.9rem;
  text-align: center;
}
</style>