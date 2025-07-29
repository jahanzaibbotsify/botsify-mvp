<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import type { Message } from '@/types';
import { marked } from 'marked';

const props = defineProps<{
  message: Message;
}>();

// Parse markdown content
const parsedContent = computed(() => {
  try {
    if (!props.message.content) {
      console.warn('Empty message content');
      return '<p><em>No message content</em></p>';
    }
    
    // Handle different message content types
    let contentToRender = props.message.content;
    
    // If content is an object, try to extract the text
    if (typeof props.message.content === 'object') {
      console.log('Message content is an object:', props.message.content);
      
      // Handle nested text object structure
      const contentObj = props.message.content as any;
      if (contentObj.text) {
        if (typeof contentObj.text === 'object') {
          // Handle double-nested text object
          contentToRender = contentObj.text.text || JSON.stringify(contentObj.text);
        } else {
          contentToRender = contentObj.text;
        }
      } else {
        // Try to find any text property or stringify the object
        contentToRender = JSON.stringify(props.message.content);
      }
    }
    
    // Check if it's an error message
    if (typeof contentToRender === 'string' && (contentToRender.startsWith('Error:') || contentToRender.startsWith('Internal Server Error'))) {
      return `<p class="error-text">${contentToRender}</p>`;
    }
    
    // don't show file urls
    if (props.message.sender === 'user' && contentToRender.includes('Attached files:')) {
      contentToRender = contentToRender.split('Attached files:')[0] + 'Attached files:\n';
    }

    // Ensure we have a string to render
    if (typeof contentToRender !== 'string') {
      contentToRender = JSON.stringify(contentToRender);
    }
    
    return marked(contentToRender);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p class="error-text">Error rendering message: ${JSON.stringify(props.message.content)}</p>`;
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
    :class="{ 'user-message': props.message.sender === 'user', '': props.message.sender === 'assistant' }"
  >
    <div class="message">
      <div v-if="props.message.content" class="content" :class="props.message.sender == 'assistant' ? 'assistent-message' : ''" v-html="parsedContent"></div>
      <div v-else class="empty-content">
        <!-- <em>Empty message</em> -->
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
  border-radius: 16px;
  padding: var(--space-3) var(--space-3);
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.user-message .message {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.15);
  background-image: linear-gradient(to right, rgba(0, 100, 255, 0.9), var(--color-primary));
  border-radius: 16px;
}

.ai-message .message {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: var(--color-text-primary);
}

[data-theme="dark"] .ai-message .message {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.ai-message .message:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .ai-message .message:hover {
  border-color: var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.content {
  margin-bottom: 0;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 300;
}

.assistent-message {
  color: var(--color-message-text);
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
  border: 1px solid rgba(0, 163, 255, 0.1);
  transition: all var(--transition-normal);
}

.attachment:hover {
  border-color: rgba(0, 163, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.08);
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
  color: var(--color-text-secondary);
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