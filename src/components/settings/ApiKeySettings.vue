<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOpenAIStore } from '@/stores/openaiStore';
import ApiKeyTester from './ApiKeyTester.vue';

const openAIStore = useOpenAIStore();
const apiKey = ref('');
const showApiKey = ref(false);
const saved = ref(false);
const errorMsg = ref('');
const hasEnvApiKey = ref(!!import.meta.env.VITE_OPENAI_API_KEY);

onMounted(() => {
  // If there's an API key stored, show asterisks as a placeholder
  if (openAIStore.apiKey) {
    apiKey.value = '••••••••••••••••••••••••••••••';
  }
});

const saveApiKey = () => {
  if (!apiKey.value || apiKey.value === '••••••••••••••••••••••••••••••') {
    return;
  }
  
  try {
    openAIStore.setApiKey(apiKey.value);
    saved.value = true;
    errorMsg.value = '';
    
    // Reset the saved message after 3 seconds
    setTimeout(() => {
      saved.value = false;
    }, 3000);
    
    // Replace with asterisks after saving
    setTimeout(() => {
      apiKey.value = '••••••••••••••••••••••••••••••';
      showApiKey.value = false;
    }, 1000);
  } catch (error: any) {
    errorMsg.value = error.message || 'Failed to save API key';
  }
};

const toggleShowApiKey = () => {
  if (showApiKey.value) {
    // If hiding, replace with asterisks if it's not empty
    if (apiKey.value && apiKey.value !== '••••••••••••••••••••••••••••••') {
      apiKey.value = '••••••••••••••••••••••••••••••';
    }
  } else {
    // If showing and it's asterisks, clear it for user to enter new key
    if (apiKey.value === '••••••••••••••••••••••••••••••') {
      apiKey.value = '';
    }
  }
  
  showApiKey.value = !showApiKey.value;
};

const clearApiKey = () => {
  apiKey.value = '';
  openAIStore.setApiKey('');
  errorMsg.value = '';
};
</script>

<template>
  <div class="api-key-settings">
    <h2>OpenAI API Key Settings</h2>
    
    <p class="description">
      To use the chat functionality, you need to provide your OpenAI API key.
      Your key is stored locally in your browser and never sent to our servers.
    </p>
    
    <div class="status-indicator" :class="{ connected: openAIStore.connected }">
      <span class="status-dot"></span>
      <span class="status-text">{{ openAIStore.connected ? 'Connected' : 'Not Connected' }}</span>
    </div>
    
    <div class="input-group">
      <label for="apiKey">OpenAI API Key</label>
      <div class="key-input-container">
        <input 
          id="apiKey"
          v-model="apiKey"
          :type="showApiKey ? 'text' : 'password'"
          placeholder="Enter your OpenAI API key"
          autocomplete="off"
        />
        <button class="icon-button toggle-visibility" @click="toggleShowApiKey">
          <svg v-if="!showApiKey" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="actions">
      <button class="primary save-button" @click="saveApiKey" :disabled="!apiKey">Save API Key</button>
      <button class="clear-button" @click="clearApiKey">Clear API Key</button>
    </div>
    
    <div v-if="saved" class="success-message">API key saved successfully!</div>
    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
    
    <!-- API Key Tester -->
    <div class="api-tester-section">
      <h3>Test API Connection</h3>
      <p class="tester-description">
        Test your API key to ensure it's working correctly. This will send a small test request to OpenAI.
      </p>
      <ApiKeyTester />
    </div>
    
    <div class="help-text">
      <p>You can get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI dashboard</a>.</p>
      <p>Note: Using the OpenAI API requires a paid account with OpenAI.</p>
    </div>
    
    <div class="env-key-info" v-if="hasEnvApiKey">
      <div class="info-badge">Environment Variable Detected</div>
      <p>An API key has been provided through environment variables.</p>
    </div>
  </div>
</template>

<style scoped>
.api-key-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-4);
}

h2 {
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
}

h3 {
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
}

.description, .tester-description {
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
}

.tester-description {
  font-size: 0.875rem;
}

.api-tester-section {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-error);
}

.status-indicator.connected {
  border-left-color: var(--color-success);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-error);
}

.status-indicator.connected .status-dot {
  background-color: var(--color-success);
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.input-group {
  margin-bottom: var(--space-4);
}

.input-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
}

.key-input-container {
  position: relative;
}

.key-input-container input {
  width: 100%;
  padding-right: 40px;
}

.toggle-visibility {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

.toggle-visibility:hover {
  color: var(--color-text-primary);
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.save-button {
  flex: 1;
}

.clear-button {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.success-message {
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-4);
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.error-message {
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-4);
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.help-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.help-text a {
  color: var(--color-primary);
  text-decoration: underline;
}

.env-key-info {
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-top: var(--space-4);
}

.info-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: var(--space-2);
}

@media (max-width: 767px) {
  .actions {
    flex-direction: column;
  }
  
  .save-button, .clear-button {
    width: 100%;
  }
}
</style> 