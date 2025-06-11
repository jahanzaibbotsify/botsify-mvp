<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import type { Message } from '../../types';
import { marked } from 'marked';
import { useChatStore } from '../../stores/chatStore';
import { useRoute } from 'vue-router';

const props = defineProps<{
  message: Message;
}>();

const chatStore = useChatStore();
const route = useRoute();
const chatId = computed(() => route.params.id as string);

// Format timestamp to display time (e.g. "14:30")
const formattedTime = computed(() => {
  return dayjs(props.message.timestamp).format('HH:mm');
});

// Parse markdown content
const parsedContent = computed(() => {
  try {
    if (!props.message.content) {
      console.warn('Empty message content');
      return '<p><em>No message content</em></p>';
    }
    
    // Check if it's an error message
    if (props.message.content.startsWith('Error:')) {
      return `<p class="error-text">${props.message.content}</p>`;
    }
    
    return marked(props.message.content);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p class="error-text">Error rendering message: ${props.message.content}</p>`;
  }
});

// Watch for content changes to debug reactivity issues
watch(() => props.message.content, (newContent, oldContent) => {
  console.log('Message content changed:', {
    id: props.message.id,
    oldLength: oldContent?.length || 0,
    newLength: newContent?.length || 0,
    changed: newContent !== oldContent
  });
});

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function addToStory() {
  if (!props.message.content) return;
  
  // Get current prompt content
  const chat = chatStore.chats.find(c => c.id === chatId.value);
  const currentPrompt = chat?.story?.content || '';
  
  // Add new content to prompt
  let newPromptContent = currentPrompt;
  if (currentPrompt) {
    newPromptContent += '\n\n---\n\n'; // Add a separator between entries
  }
  
  // Add timestamp and the new prompt content
  const timestamp = new Date().toLocaleTimeString();
  newPromptContent += `**[${timestamp}] Manual Addition**\n\n${props.message.content}`;
  
  // Update the prompt in the store
  chatStore.updateStory(chatId.value, newPromptContent);
}

onMounted(() => {
  console.log('ChatMessage mounted:', {
    id: props.message.id,
    sender: props.message.sender,
    contentLength: props.message.content?.length || 0,
    hasAttachments: !!props.message.attachments?.length
  });
});
</script>

<template>
  <div 
    class="message-container" 
    :class="{ 'user-message': props.message.sender === 'user', 'ai-message': props.message.sender === 'assistant' }"
  >
    <div class="message">
      <div v-if="props.message.content" class="content" v-html="parsedContent"></div>
      <div v-else class="empty-content">
        <em>Empty message</em>
      </div>
      
      <!-- Attachments -->
      <div v-if="props.message.attachments?.length" class="attachments">
        <div v-for="file in props.message.attachments" :key="file.id" class="attachment">
          <a :href="file.url" target="_blank" class="attachment-link">
            <img 
              v-if="file.preview" 
              :src="file.preview" 
              :alt="file.name"
              class="attachment-preview"
            />
            <div v-else class="attachment-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            </div>
            <div class="attachment-info">
              <span class="attachment-name">{{ file.name }}</span>
              <span class="attachment-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </a>
        </div>
      </div>
      
      <div class="message-meta">
        <div class="meta-left">
          <span class="sender">{{ props.message.sender === 'user' ? 'You' : 'AI' }}</span>
          <span class="time">{{ formattedTime }}</span>
        </div>
        <div v-if="props.message.sender === 'assistant'" class="meta-actions">
          <button @click="addToStory" class="add-to-story-btn" title="Add to Prompt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: var(--space-4);
  max-width: 85%;
}

.user-message {
  justify-content: flex-end;
  margin-left: auto;
}

.ai-message {
  justify-content: flex-start;
  margin-right: auto;
}

.message {
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  position: relative;
  box-shadow: var(--shadow-sm);
  word-break: break-word;
  overflow-wrap: break-word;
}

.user-message .message {
  background-color: var(--color-primary);
  color: white;
}

.ai-message .message {
  background-color: var(--color-bg-tertiary);
}

.content {
  margin-bottom: var(--space-2);
}

.empty-content {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.content :deep(p) {
  margin: 0 0 var(--space-2);
}

.content :deep(p:last-child) {
  margin-bottom: 0;
}

.content :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.content :deep(ul), .content :deep(ol) {
  margin: 0 0 var(--space-3);
  padding-left: var(--space-4);
}

.content :deep(li) {
  margin-bottom: var(--space-1);
}

.content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
}

.content :deep(code) {
  white-space: pre-wrap;
  word-break: break-word;
}

.content :deep(.error-text) {
  color: var(--color-error);
  font-weight: 500;
}

.message-meta {
  display: flex;
  font-size: 0.75rem;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-2);
  opacity: 0.8;
}

.meta-left {
  display: flex;
  gap: var(--space-2);
}

.meta-actions {
  display: flex;
  gap: var(--space-1);
}

.add-to-story-btn {
  background: transparent;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-to-story-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-primary);
}

.ai-message .message-meta {
  color: var(--color-text-secondary);
}

.attachments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.attachment {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  color: inherit;
  text-decoration: none;
}

.attachment-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.attachment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: var(--color-text-tertiary);
}

/* Mobile styles */
@media (max-width: 767px) {
  .message-container {
    max-width: 90%;
  }
  
  .message {
    padding: var(--space-2) var(--space-3);
  }
  
  .attachments {
    grid-template-columns: 1fr;
  }
  
  .content :deep(pre) {
    font-size: 0.75rem;
    padding: var(--space-2);
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .message-container {
    max-width: 95%;
  }
}
</style>