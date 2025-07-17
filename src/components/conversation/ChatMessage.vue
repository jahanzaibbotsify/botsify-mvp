<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import type { Message } from '@/types';
import { marked } from 'marked';

// Interface for parsed message content
interface ParsedMessage {
  text?: string | { text: string };
  attachment?: {
    type: string;
    payload: any;
  };
  metadata?: string;
  event?: string;
  from?: string;
  from_user_id?: number;
  avatar?: string;
  deactive?: boolean;
}

const props = defineProps<{
  message: Message;
}>();

// Parse message content (JSON or plain text)
const parseMessageContent = (content: string): ParsedMessage | null => {
  try {
    // Handle null or empty content
    if (!content || content === 'null' || content.trim() === '') {
      return { text: 'Empty message' };
    }
    
    // Try to parse as JSON first
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return JSON.parse(content);
    }
    // If not JSON, return as plain text
    return { text: content };
  } catch (error) {
    console.error('Error parsing message content:', error);
    return { text: content || 'Error parsing message' };
  }
};

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
    
    // Parse the message content
    const parsed = parseMessageContent(props.message.content);
    
    if (!parsed) {
      return `<p class="error-text">Error parsing message</p>`;
    }
    
    // Handle different message types
    if (parsed.text) {
      return marked(typeof parsed.text === 'string' ? parsed.text : parsed.text.text);
    }
    
    if (parsed.event) {
      return `<p class="event-message"><em>${parsed.event}</em></p>`;
    }
    
    if (parsed.attachment) {
      return renderAttachment(parsed.attachment);
    }
    
    return `<p class="error-text">Unknown message format</p>`;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p class="error-text">Error rendering message: ${props.message.content}</p>`;
  }
});

// Render attachment content
const renderAttachment = (attachment: any): string => {
  const { type, payload } = attachment;
  
  switch (type) {
    case 'template':
      return renderTemplate(payload);
    case 'image':
      return `<div class="attachment-image"><img src="${payload.url}" alt="Image" /></div>`;
    default:
      return `<p class="attachment-unknown">Attachment type: ${type}</p>`;
  }
};

// Render template content
const renderTemplate = (payload: any): string => {
  const { template_type, text, elements, buttons } = payload;
  
  switch (template_type) {
    case 'generic':
      return renderGenericTemplate(elements);
    case 'button':
      return renderButtonTemplate(text, buttons);
    default:
      return `<p class="template-unknown">Template type: ${template_type}</p>`;
  }
};

// Render generic template
const renderGenericTemplate = (elements: any[]): string => {
  if (!elements || elements.length === 0) return '';
  
  let html = '<div class="generic-template">';
  elements.forEach(element => {
    html += `
      <div class="template-element">
        ${element.image_url ? `<img src="${element.image_url}" alt="${element.title}" class="template-image" />` : ''}
        <div class="template-content">
          <h4>${element.title || ''}</h4>
          ${element.subtitle ? `<p>${element.subtitle}</p>` : ''}
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
};

// Render button template
const renderButtonTemplate = (text: string, buttons: any[]): string => {
  let html = '<div class="button-template">';
  if (text) {
    html += `<p class="button-text">${text}</p>`;
  }
  if (buttons && buttons.length > 0) {
    html += '<div class="button-list">';
    buttons.forEach(button => {
      html += `<button class="template-button" disabled>${button.title}</button>`;
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
};

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
      <div v-if="props.message.content" class="content" v-html="parsedContent"></div>
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
  margin-bottom: var(--space-2);
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
  border-radius: 12px;
  padding: var(--space-2) var(--space-3);
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  min-width: 60px;
}

.user-message .message {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.15);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.9), var(--color-primary));
  border-radius: 12px;
}

.ai-message .message {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

[data-theme="dark"] .ai-message .message {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.ai-message .message:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .ai-message .message:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.content {
  margin-bottom: 0;
  line-height: 1.4;
}

/* Reduce spacing for consecutive messages from same sender */
.message-container + .message-container {
  margin-top: var(--space-1);
}

/* Add subtle spacing between different senders */
.message-container:not(.user-message) + .message-container.user-message,
.message-container.user-message + .message-container:not(.user-message) {
  margin-top: var(--space-3);
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

.content :deep(.event-message) {
  color: var(--color-text-tertiary);
  font-style: italic;
  font-size: 0.875rem;
  padding: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}

/* Template Styles */
.content :deep(.generic-template) {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: var(--space-2) 0;
}

.content :deep(.template-element) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.content :deep(.template-image) {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.content :deep(.template-content) {
  padding: var(--space-3);
}

.content :deep(.template-content h4) {
  margin: 0 0 var(--space-1) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.content :deep(.template-content p) {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Button Template Styles */
.content :deep(.button-template) {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: var(--space-2) 0;
}

.content :deep(.button-text) {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.content :deep(.button-list) {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.content :deep(.template-button) {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
}

.content :deep(.template-button:hover:not(:disabled)) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.content :deep(.template-button:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Attachment Styles */
.content :deep(.attachment-image) {
  margin: var(--space-2) 0;
}

.content :deep(.attachment-image img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.content :deep(.attachment-unknown),
.content :deep(.template-unknown) {
  color: var(--color-text-tertiary);
  font-style: italic;
  font-size: 0.875rem;
  padding: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
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
  color: var(--color-text-tertiary);
}

/* Mobile styles */
@media (max-width: 767px) {
  .message-container {
    max-width: 90%;
    margin-bottom: var(--space-1);
  }
  
  .message {
    padding: var(--space-2) var(--space-3);
    border-radius: 10px;
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