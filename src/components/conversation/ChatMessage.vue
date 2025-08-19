<script setup lang="ts">
import { computed, onMounted, watch, ref, nextTick } from 'vue';
import type { Message } from '@/types';
import { marked } from 'marked';
import { formatTime } from '@/utils';

// Interface for parsed message content
interface ParsedMessage {
  text?: string | { text: string, attachment: any };
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
  showAvatar?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  'image-click': [url: string];
  'attachment-download': [attachment: any];
}>();

const messageRef = ref<HTMLDivElement>();

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

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

// Parse markdown content with enhanced formatting
const parsedContent = computed(() => {
  try {
    if (!props.message.content) {
      return '<p class="empty-message"><em>No message content</em></p>';
    }
    
    // Check if it's an error message
    if (props.message.content.startsWith('Error:') || 
        props.message.content.includes('Internal Server Error, Please Contact team@botsify.com') ||
        props.message.content.includes('Internal Server Error')) {
      return `<div class="message-error">
        <div class="error-icon-inline">⚠️</div>
        <span>${props.message.content}</span>
      </div>`;
    }
    
    // Parse the message content
    const parsed = parseMessageContent(props.message.content);
    
    if (!parsed) {
      return `<div class="message-error">Error parsing message</div>`;
    }
    
    // Handle different message types
    if (parsed.text) {
      // If parsed.text is an object and has an attachment
      if (typeof parsed.text === 'object' && parsed.text.attachment) {
        return renderAttachment(parsed.text.attachment);
      }
      const textContent = typeof parsed.text === 'string' ? parsed.text : parsed.text.text;
      return marked(textContent);
    }
    
    if (parsed.event) {
      return `<div class="event-message">
        <div class="event-icon">ℹ️</div>
        <span>${parsed.event}</span>
      </div>`;
    }
    
    if (parsed.attachment) {
      return renderAttachment(parsed.attachment);
    }
    
    return `<div class="message-error">Unknown message format</div>`;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<div class="message-error">Error rendering message: ${props.message.content}</div>`;
  }
});

// Render attachment content
const renderAttachment = (attachment: any): string => {
  const { type } = attachment;
  // Normalize payload
  const payload = attachment.payload || attachment;
  
  switch (type) {
    case 'datepicker':
      return `<div class="attachment-datepicker">
        <span>${payload.text}</span>
      </div>`;
    case 'template':
      return renderTemplate(payload);
    case 'image':
      return `<div class="attachment-image">
        <img src="${payload.url}" alt="Image" onclick="$emit('image-click', '${payload.url}')" />
      </div>`;
    default:
      return `<div class="attachment-unknown">
        <span>Download &nbsp;<a href="${payload.url}" target="_blank"><i class="pi pi-download"></i></a></span>
      </div>`;

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
      return `<div class="template-unknown">
        <div class="template-icon">🔧</div>
        <span>Template type: ${template_type}</span>
      </div>`;
  }
};

// Render generic template
const renderGenericTemplate = (elements: any[]): string => {
  if (!elements || elements.length === 0) return '';
  
  // If only one element, render normally
  if (elements.length === 1) {
    const element = elements[0];
    return `
      <div class="generic-template single-element">
        <div class="template-element">
          ${element.image_url ? `<div class="template-image-container">
            <img src="${element.image_url}" alt="${element.title}" class="template-image" />
          </div>` : ''}
          <div class="template-content">
            <h4 class="template-title">${element.title || ''}</h4>
            ${element.subtitle ? `<p class="template-subtitle">${element.subtitle}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  // If multiple elements, render as slider
  let html = '<div class="generic-template slider-container">';
  html += '<div class="template-slider">';
  elements.forEach((element, index) => {
    html += `
      <div class="template-element slide" data-slide="${index}">
        ${element.image_url ? `<div class="template-image-container">
          <img src="${element.image_url}" alt="${element.title}" class="template-image" />
        </div>` : ''}
        <div class="template-content">
          <h4 class="template-title">${element.title || ''}</h4>
          ${element.subtitle ? `<p class="template-subtitle">${element.subtitle}</p>` : ''}
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  // Add navigation dots if more than 1 element
  if (elements.length > 1) {
    html += '<div class="slider-dots">';
    elements.forEach((_, index) => {
      html += `<button class="slider-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>`;
    });
    html += '</div>';
  }
  
  html += '</div>';
  return html;
};

// Render button template
const renderButtonTemplate = (text: string, buttons: any[]): string => {
  let html = '<div class="button-template">';
  if (text) {
    html += `<div class="button-text">${text}</div>`;
  }
  if (buttons && buttons.length > 0) {
    html += '<div class="button-list">';
    buttons.forEach(button => {
      html += `<button class="template-button" disabled>
        <span>${button.title}</span>
        <div class="button-arrow">→</div>
      </button>`;
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
};

// Get message status icon
const getStatusIcon = computed(() => {
  if (props.message.sender === 'user') {
    // Mock status for demo - in real app this would come from message data  
    return 'pi pi-check-circle'; // Could be 'pi pi-clock' for pending, 'pi pi-check' for sent, 'pi pi-check-circle' for delivered
  }
  return null;
});

// Get file type icon
const getFileIcon = (fileName: string, mimeType?: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return 'pi pi-image';
  }
  if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
    return 'pi pi-video';
  }
  if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
    return 'pi pi-volume-up';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
    return 'pi pi-file';
  }
  
  return 'pi pi-paperclip';
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const handleAttachmentClick = (attachment: any) => {
  emit('attachment-download', attachment);
};

const handleImageClick = (url: string) => {
  emit('image-click', url);
};

// Slider functionality
const initializeSlider = () => {
  const sliders = messageRef.value?.querySelectorAll('.slider-container');
  sliders?.forEach(slider => {
    const sliderTrack = slider.querySelector('.template-slider') as HTMLElement;
    const dots = slider.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    
    const goToSlide = (index: number) => {
      if (sliderTrack && index >= 0 && index < dots.length) {
        currentSlide = index;
        sliderTrack.style.transform = `translateX(-${index * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
    };
    
    // Remove existing click handlers to prevent duplicates
    dots.forEach((dot) => {
      const newDot = dot.cloneNode(true);
      dot.parentNode?.replaceChild(newDot, dot);
    });
    
    // Add click handlers to dots
    slider.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Add touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentSlide < dots.length - 1) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      }
    };
    
    sliderTrack?.addEventListener('touchstart', handleTouchStart);
    sliderTrack?.addEventListener('touchend', handleTouchEnd);
  });
};

// Watch for content changes
watch(() => props.message.content, (newContent, oldContent) => {
  if (newContent !== oldContent) {
    // Re-initialize slider after content update
    nextTick(() => {
      initializeSlider();
    });
  }
});

onMounted(() => {
  // Initialize slider after mount
  nextTick(() => {
    initializeSlider();
  });
});
</script>

<template>
  <div 
    ref="messageRef"
    class="message-wrapper" 
    :class="{ 
      'user-message': message.sender === 'user', 
      'assistant-message': message.sender === 'assistant',
      'compact': compact,
      'with-avatar': showAvatar
    }"
  >
    <!-- Avatar for assistant messages -->
    <!--
    <div v-if="showAvatar && message.sender === 'assistant'" class="message-avatar">
      <div class="avatar-container">
        <i class="pi pi-desktop avatar-icon"></i>
      </div>
    </div>
 -->
    <!-- Message bubble -->
    <div class="message-bubble">
      <!-- Message header (for assistant messages with timestamp) -->
      <!-- <div v-if="message.sender === 'assistant' && showTimestamp" class="message-header">
        <span class="sender-name">Assistant</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div> -->

      <!-- Message content -->
      <div class="message-content">
        <div v-if="message.content" class="content-text" v-html="parsedContent"></div>
      
      <!-- Attachments -->
        <div v-if="message.attachments?.length" class="attachments-grid">
          <div 
            v-for="file in message.attachments" 
            :key="file.id" 
            class="attachment-item"
            @click="handleAttachmentClick(file)"
          >
            <!-- Image preview -->
            <div v-if="file.preview" class="attachment-preview" @click.stop="handleImageClick(file.url)">
              <img :src="file.preview" :alt="file.name" class="preview-image" />
              <div class="image-overlay">
                <i class="pi pi-image overlay-icon"></i>
              </div>
            </div>
            
            <!-- File icon -->
            <div v-else class="attachment-file">
              <div class="file-icon-container">
                <i :class="getFileIcon(file.name, file.type)" class="file-icon"></i>
              </div>
              <div class="file-details">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <div class="download-indicator">
                <i class="pi pi-download"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message footer -->
      <div  class="message-footer">
        <span class="timestamp">
          {{ formatTime(message.timestamp) }}
        </span>
        <i 
          v-if="getStatusIcon" 
          :class="getStatusIcon" 
          class="status-icon"
        ></i>
      </div>
    </div>

    <!-- Avatar for user messages -->
    <!--
    <div v-if="showAvatar && message.sender === 'user'" class="message-avatar">
      <div class="avatar-container user-avatar">
        <i class="pi pi-user avatar-icon"></i>
      </div>
    </div>
     -->
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  margin-bottom: 1rem;
  max-width: 85%;
  gap: 0.75rem;
  align-items: flex-end;
}

.message-wrapper.compact {
  margin-bottom: 0.5rem;
}

.user-message {
  justify-content: flex-end;
  margin-left: auto;
  flex-direction: row-reverse;
}

.assistant-message {
  justify-content: flex-start;
  margin-right: auto;
}

.message-avatar {
  flex-shrink: 0;
  margin-bottom: 0.25rem;
}

.avatar-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, vat(--color-bg-tertiary), var(--color-bg-active));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
}

.avatar-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

.user-avatar .avatar-icon {
  color: white;
}

.attachment-unknown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-transform: capitalize;
}

.message-bubble {
  position: relative;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  word-break: break-word;
  overflow-wrap: break-word;
  transition: all 0.2s ease;
  min-width: 60px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-message .message-bubble {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.assistant-message .message-bubble {
  background: white;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.assistant-message .message-bubble:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .assistant-message .message-bubble {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

[data-theme="dark"] .assistant-message .message-bubble:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.message-content {
  line-height: 1.5;
}

.content-text {
  margin-bottom: 0;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.25rem;
}

.timestamp {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
}

.assistant-message .timestamp {
  color: var(--color-text-secondary);
}

.status-icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Content Styling */
.content-text :deep(p) {
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.content-text :deep(p:last-child) {
  margin-bottom: 0;
}

.content-text :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.content-text :deep(strong) {
  font-weight: 600;
}

.content-text :deep(em) {
  font-style: italic;
}

.content-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.user-message .content-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.content-text :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75rem 0;
  border-left: 3px solid var(--color-primary);
}

.user-message .content-text :deep(pre) {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.content-text :deep(pre code) {
  background: none;
  padding: 0;
}

.content-text :deep(ul), 
.content-text :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.content-text :deep(li) {
  margin-bottom: 0.25rem;
}

.content-text :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  margin: 0.75rem 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.user-message .content-text :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

/* Special Message Types */
.content-text :deep(.empty-message) {
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.875rem;
}

.content-text :deep(.message-error) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-error);
  font-weight: 500;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.content-text :deep(.error-icon-inline) {
  font-size: 1rem;
}

.content-text :deep(.event-message) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.875rem;
  background: rgba(100, 116, 139, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.content-text :deep(.event-icon) {
  font-size: 1rem;
}

/* Template Styles */
.content-text :deep(.generic-template) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.content-text :deep(.generic-template.single-element) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.content-text :deep(.generic-template.slider-container) {
  position: relative;
  width: 100%;
  max-width: 400px; /* Adjust as needed */
  margin: 0 auto;
  overflow: hidden;
}

.content-text :deep(.template-slider) {
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.content-text :deep(.template-element) {
  flex: 0 0 100%; /* Ensure each slide takes full width */
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.content-text :deep(.template-element:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.content-text :deep(.template-element.slide) {
  min-width: 100%; /* Ensure slides take full width */
}

.content-text :deep(.template-image-container) {
  position: relative;
  overflow: hidden;
}

.content-text :deep(.template-image) {
  width: 100%;
  height: 160px; /* Adjust as needed */
  object-fit: cover;
}

.content-text :deep(.template-content) {
  padding: 1rem;
}

.content-text :deep(.template-title) {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.content-text :deep(.template-subtitle) {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.content-text :deep(.button-template) {
  margin: 0.75rem 0;
}

.content-text :deep(.button-text) {
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: inherit;
}

.content-text :deep(.button-list) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-text :deep(.template-button) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.content-text :deep(.template-button:hover:not(:disabled)) {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.content-text :deep(.template-button:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

.content-text :deep(.button-arrow) {
  color: var(--color-text-secondary);
  font-weight: 400;
}

.content-text :deep(.slider-dots) {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 0.5rem;
}

.content-text :deep(.slider-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e2e8f0;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0 2px;
}

.content-text :deep(.slider-dot:hover) {
  background-color: #cbd5e1;
  transform: scale(1.2);
}

.content-text :deep(.slider-dot.active) {
  background-color: var(--color-primary);
  transform: scale(1.1);
}

/* Attachments */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

/* Attachment image styles */
.content-text :deep(.attachment-image) {
  position: relative;
  overflow: hidden;
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  margin: 0.5rem 0;
}

.content-text :deep(.attachment-image img) {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.content-text :deep(.attachment-image img:hover) {
  transform: scale(1.05);
}

.attachment-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-item:hover {
  transform: translateY(-2px);
}

.attachment-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

.preview-image {
  width: 100%;
  height: 120px; /* Adjust as needed */
  object-fit: cover;
  transition: transform 0.2s ease;
}

.attachment-preview:hover .preview-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.attachment-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.assistant-message .attachment-file {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

.attachment-file:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.assistant-message .attachment-file:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary);
}

.file-icon-container {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 0.125rem;
}

.assistant-message .file-size {
  color: var(--color-text-tertiary);
}

.download-indicator {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}

.assistant-message .download-indicator {
  color: #d8e8fe;
}

/* Responsive Design */
@media (max-width: 768px) {
  .message-wrapper {
    max-width: 95%;
    gap: 0.5rem;
  }
  
  .message-bubble {
    padding: 0.625rem 0.875rem;
    border-radius: 12px;
  }
  
  .avatar-container {
    width: 28px;
    height: 28px;
  }
  
  .avatar-icon {
    width: 16px;
    height: 16px;
  }
  
  .attachments-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .content-text :deep(pre) {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
  
  /* Mobile slider adjustments */
  .content-text :deep(.generic-template.slider-container) {
    max-width: 100%;
  }
  
  .content-text :deep(.attachment-image) {
    max-width: 250px;
    max-height: 150px;
  }
  
  .content-text :deep(.attachment-image img) {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .message-wrapper {
    max-width: 98%;
  }
  
  .message-bubble {
    padding: 0.5rem 0.75rem;
  }
}
</style>
