<script setup lang="ts">
import { ref } from 'vue';
import { useOpenAIStore } from '@/stores/openaiStore';
import { useChatStore } from '@/stores/chatStore';

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
    if (!stream.body) throw new Error('No response body for streaming');
    const reader = stream.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    // for await (const chunk of stream) {
    //   // Handle Responses API streaming format
    //   if (chunk.type === 'response.output_text.delta') {
    //     const content = chunk.delta || '';
    //     response += content;
    //   }
    // }
    while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          console.log('chunk--->', chunk); // or yield chunk, or process as needed
          response += chunk;
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
        :disabled="isLoading || !systemMessage.trim() "
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
  background-image: 
    radial-gradient(circle at left bottom, rgba(0, 163, 255, 0.05), transparent 70%),
    radial-gradient(circle at right top, rgba(0, 163, 255, 0.03), transparent 60%);
}

h3 {
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
  position: relative;
  display: inline-block;
}

h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, rgba(0, 163, 255, 0.6), transparent);
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
  border: 1px solid rgba(0, 163, 255, 0.1);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.03), transparent 80%);
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;
  transition: all var(--transition-normal);
}

.system-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 2px 10px rgba(0, 163, 255, 0.05);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent 80%);
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
  background-image: linear-gradient(to right, rgba(0, 163, 255, 1), var(--color-primary-hover));
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.2);
  transition: all var(--transition-normal);
}

button.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.3);
  transform: translateY(-1px);
}

button.secondary {
  background-color: var(--color-bg-tertiary);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent 80%);
  color: var(--color-text-primary);
  border: 1px solid rgba(0, 163, 255, 0.1);
  transition: all var(--transition-normal);
}

button.secondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: rgba(0, 163, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.05);
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
  border-top: 1px solid rgba(0, 163, 255, 0.05);
  padding-top: var(--space-3);
  background-image: linear-gradient(to bottom, rgba(0, 163, 255, 0.01), transparent 80%);
}
</style> 