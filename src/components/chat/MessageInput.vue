<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import type { Attachment } from '../../types';
import FileUpload from './FileUpload.vue';

const props = defineProps<{
  chatId: string;
}>();

const chatStore = useChatStore();
const messageText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showFileUpload = ref(false);
const attachments = ref<Attachment[]>([]);

const resizeTextarea = () => {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
};

const sendMessage = () => {
  if (!messageText.value.trim() && attachments.value.length === 0) return;
  
  chatStore.addMessage(props.chatId, messageText.value.trim(), 'user', attachments.value);
  messageText.value = '';
  attachments.value = [];
  showFileUpload.value = false;
  
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
};

const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value;
};

const handleFileUpload = (files: Attachment[]) => {
  attachments.value = [...attachments.value, ...files];
  showFileUpload.value = false;
};

const removeAttachment = (id: string) => {
  const attachment = attachments.value.find(a => a.id === id);
  if (attachment) {
    URL.revokeObjectURL(attachment.url);
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
  }
  attachments.value = attachments.value.filter(a => a.id !== id);
};
</script>

<template>
  <div class="message-input-container">
    <!-- File upload area -->
    <div v-if="showFileUpload" class="file-upload-container">
      <FileUpload :onUpload="handleFileUpload" />
    </div>

    <!-- Attachments preview -->
    <div v-if="attachments.length > 0" class="attachments-preview">
      <div v-for="file in attachments" :key="file.id" class="attachment-item">
        <img v-if="file.preview" :src="file.preview" class="attachment-preview" :alt="file.name" />
        <div v-else class="attachment-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>
        <div class="attachment-info">
          <span class="attachment-name">{{ file.name }}</span>
          <span class="attachment-size">{{ (file.size / 1024).toFixed(1) }}KB</span>
        </div>
        <button class="remove-attachment" @click.stop="removeAttachment(file.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="input-area">
      <button class="icon-button attachment-button" @click.stop="toggleFileUpload" :class="{ active: showFileUpload }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </button>
      
      <textarea
        ref="textareaRef"
        v-model="messageText"
        @input="resizeTextarea"
        @keydown="handleKeydown"
        placeholder="Type a message..."
        rows="1"
        class="message-textarea"
      ></textarea>
      
      <button 
        class="icon-button send-button" 
        @click="sendMessage"
        :disabled="!messageText.trim() && attachments.length === 0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
    
    <div class="keyboard-hint">
      Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send
    </div>
  </div>
</template>

<style scoped>
.message-input-container {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.input-area {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-2);
  transition: border-color var(--transition-normal);
}

.input-area:focus-within {
  border-color: var(--color-primary);
}

.message-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: var(--space-2);
  max-height: 150px;
  min-height: 24px;
  line-height: 1.5;
}

.message-textarea:focus {
  outline: none;
}

.attachment-button, .send-button {
  color: var(--color-text-secondary);
  transition: color var(--transition-normal);
}

.attachment-button:hover, .send-button:hover {
  color: var(--color-text-primary);
}

.attachment-button.active {
  color: var(--color-primary);
}

.send-button {
  color: var(--color-primary);
}

.send-button:disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.keyboard-hint {
  margin-top: var(--space-2);
  font-size: 0.75rem;
  text-align: center;
  color: var(--color-text-tertiary);
}

kbd {
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 1px rgba(0,0,0,.2);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}

.file-upload-container {
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  max-width: 300px;
  flex: 1;
  min-width: 200px;
}

.attachment-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.attachment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  display: block;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-size {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.remove-attachment {
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  transition: color var(--transition-normal);
}

.remove-attachment:hover {
  color: var(--color-error);
}

/* Mobile styles */
@media (max-width: 767px) {
  .message-input-container {
    padding: var(--space-2);
  }
  
  .input-area {
    padding: var(--space-1) var(--space-2);
  }
  
  .message-textarea {
    padding: var(--space-1);
    font-size: 1rem;
  }
  
  .attachments-preview {
    gap: var(--space-1);
    margin-bottom: var(--space-2);
  }
  
  .attachment-item {
    min-width: 100%;
  }
  
  .keyboard-hint {
    display: none;
  }
}
</style>