<script setup lang="ts">
import { ref } from 'vue';
import { useOpenAIStore } from '../../stores/openaiStore';

const openAIStore = useOpenAIStore();
const apiKey = ref(openAIStore.apiKey || '');
const showKey = ref(false);

const saveApiKey = () => {
  if (apiKey.value.trim()) {
    openAIStore.setApiKey(apiKey.value.trim());
  }
};

const toggleShowKey = () => {
  showKey.value = !showKey.value;
};
</script>

<template>
  <div class="api-key-input">
    <div class="input-group">
      <input
        :type="showKey ? 'text' : 'password'"
        v-model="apiKey"
        placeholder="Enter your OpenAI API key"
        class="api-key-field"
        @keyup.enter="saveApiKey"
      />
      <button class="toggle-visibility" @click="toggleShowKey">
        <span v-if="showKey">Hide</span>
        <span v-else>Show</span>
      </button>
    </div>
    <button class="save-button primary" @click="saveApiKey" :disabled="!apiKey.trim()">
      Save API Key
    </button>
    
    <div v-if="openAIStore.error" class="error-message">
      {{ openAIStore.error }}
    </div>
  </div>
</template>

<style scoped>
.api-key-input {
  padding: var(--space-4);
}

.input-group {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.api-key-field {
  flex: 1;
}

.toggle-visibility {
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
}

.save-button {
  width: 100%;
}

.error-message {
  margin-top: var(--space-3);
  color: var(--color-error);
  font-size: 0.875rem;
}
</style>