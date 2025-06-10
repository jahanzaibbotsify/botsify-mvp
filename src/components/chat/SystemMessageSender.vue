<script setup lang="ts">
import { ref } from 'vue';
import { useOpenAIStore } from '../../stores/openaiStore';
import { useChatStore } from '../../stores/chatStore';

const openAIStore = useOpenAIStore();
const chatStore = useChatStore();
const systemMessage = ref('');
const isLoading = ref(false);
const result = ref<{ success: boolean; message: string } | null>(null);

async function sendSystemMessage() {
  if (!systemMessage.value.trim()) {
    result.value = {
      success: false,
      message: 'Please enter a system message'
    };
    return;
  }

  if (!openAIStore.connected) {
    result.value = {
      success: false,
      message: 'OpenAI API is not connected. Please check your API key in Settings.'
    };
    return;
  }

  isLoading.value = true;
  result.value = null;

  try {
    // Create messages array with system message and a simple user prompt
    const messages = [
      { role: 'system', content: systemMessage.value },
      { role: 'user', content: 'Hello, please respond according to the system instructions.' }
    ];

    console.log('Sending system message:', systemMessage.value);
    
    const stream = await openAIStore.streamChat(messages);
    let response = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      response += content;
    }
    
    console.log('Response with system message:', response);
    
    // Add the messages to the current chat
    const activeChat = chatStore.currentChat;
    if (activeChat) {
      // Add the system message as a special type
      await chatStore.addMessage(
        activeChat.id, 
        `System: ${systemMessage.value}`, 
        'user'
      );
      
      // Add the AI response
      await chatStore.addMessage(
        activeChat.id, 
        response, 
        'assistant'
      );
      
      result.value = {
        success: true,
        message: 'System message sent and response received'
      };
    } else {
      result.value = {
        success: false,
        message: 'No active chat found'
      };
    }
  } catch (error: any) {
    console.error('Error sending system message:', error);
    result.value = {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`
    };
  } finally {
    isLoading.value = false;
  }
}

function parsePayload(payload: string) {
  try {
    // Try to convert PHP-style array to JSON
    const jsonString = payload
      .replace(/=>/g, ':')
      .replace(/array:/g, '')
      .replace(/array\(/g, '{')
      .replace(/\)/g, '}')
      .replace(/\[\d+\]/g, '')
      .replace(/"([^"]+)"(?=:)/g, '"$1"')
      .replace(/(\w+)(?=:)/g, '"$1"');
    
    // Now try to parse it as JSON
    const parsed = JSON.parse(jsonString);
    systemMessage.value = JSON.stringify(parsed, null, 2);
    
    result.value = {
      success: true,
      message: 'Payload parsed successfully'
    };
  } catch (e) {
    console.error('Error parsing payload:', e);
    result.value = {
      success: false,
      message: 'Failed to parse payload. Please check the format.'
    };
  }
}
</script>

<template>
  <div class="system-message-sender">
    <h3>Send Custom System Message</h3>
    
    <p class="description">
      Enter a system message to control how the AI responds. This will be sent as the system prompt.
    </p>
    
    <div class="textarea-container">
      <textarea
        v-model="systemMessage"
        placeholder="Enter your system message here..."
        rows="10"
        class="system-textarea"
      ></textarea>
    </div>
    
    <div class="actions">
      <button 
        class="primary" 
        @click="sendSystemMessage" 
        :disabled="isLoading || !systemMessage.trim() || !openAIStore.connected"
      >
        <span v-if="isLoading">Sending...</span>
        <span v-else>Send System Message</span>
      </button>
      
      <button 
        class="secondary" 
        @click="parsePayload(systemMessage)" 
        :disabled="isLoading || !systemMessage.trim()"
      >
        Parse PHP Payload
      </button>
    </div>
    
    <div v-if="result" class="result" :class="{ success: result.success, error: !result.success }">
      {{ result.message }}
    </div>
    
    <div class="note">
      <p><strong>Note:</strong> This will add both your system message and the AI's response to the current chat.</p>
    </div>
  </div>
</template>

<style scoped>
.system-message-sender {
  padding: var(--space-4);
}

h3 {
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
}

.description {
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.textarea-container {
  margin-bottom: var(--space-4);
}

.system-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.system-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

button.primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

button.primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

button.secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

button.secondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  font-size: 0.875rem;
}

.result.success {
  background-color: rgba(0, 200, 83, 0.1);
  border: 1px solid rgba(0, 200, 83, 0.3);
  color: rgb(0, 150, 60);
}

.result.error {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: rgb(200, 0, 0);
}

.note {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}
</style> 