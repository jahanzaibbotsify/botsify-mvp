<script setup lang="ts">
import { ref } from 'vue';
import { useOpenAIStore } from '@/stores/openaiStore';

const openAIStore = useOpenAIStore();
const isLoading = ref(false);
const testResult = ref<{success: boolean; message: string} | null>(null);

async function testApiKey() {
  if (!openAIStore.apiKey) {
    testResult.value = {
      success: false,
      message: 'No API key provided. Please enter an API key first.'
    };
    return;
  }
  
  isLoading.value = true;
  testResult.value = null;
  
  try {
    // Test the API connection by sending a simple message
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, this is a test message. Please respond with "API connection successful".' }
    ];
    
    const stream = await openAIStore.streamChat(messages);
    let response = '';
    
    for await (const chunk of stream) {
      // Handle Responses API streaming format
      if (chunk.type === 'response.output_text.delta') {
        const content = chunk.delta || '';
        response += content;
      }
    }
    
    console.log('API test response:', response);
    
    testResult.value = {
      success: true,
      message: 'API connection successful! Your API key is working correctly.'
    };
  } catch (error: any) {
    console.error('API test error:', error);
    testResult.value = {
      success: false,
      message: `API connection failed: ${error.message || 'Unknown error'}`
    };
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="api-key-tester">
    <button 
      @click="testApiKey" 
      class="test-button"
      :disabled="isLoading || !openAIStore.apiKey"
    >
      <span v-if="isLoading">Testing...</span>
      <span v-else>Test API Connection</span>
    </button>
    
    <div v-if="testResult" class="test-result" :class="{ success: testResult.success, error: !testResult.success }">
      {{ testResult.message }}
    </div>
  </div>
</template>

<style scoped>
.api-key-tester {
  margin-top: var(--space-4);
}

.test-button {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.test-button:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-result {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.test-result.success {
  background-color: rgba(0, 200, 83, 0.1);
  border: 1px solid rgba(0, 200, 83, 0.3);
  color: rgb(0, 150, 60);
}

.test-result.error {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: rgb(200, 0, 0);
}
</style> 