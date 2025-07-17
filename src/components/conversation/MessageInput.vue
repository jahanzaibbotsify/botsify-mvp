<script setup lang="ts">
import { ref } from 'vue';
import type { Attachment } from '@/types';
import FileUpload from '@/components/ui/FileUpload.vue';

const props = defineProps<{
  chatId: string;
  message?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:message': [value: string];
  'send': [];
}>();

const messageText = ref(props.message || '');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showFileUpload = ref(false);
const attachments = ref<Attachment[]>([]);


const resizeTextarea = () => {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
};

const sendMessage = async () => {
  if (!messageText.value.trim() && attachments.value.length === 0) return;
  
  emit('update:message', messageText.value);
  emit('send');
  
  // Clear the input after sending
  messageText.value = '';
  attachments.value = [];
  showFileUpload.value = false;
  
  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
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
    <!-- Backdrop to close dropdown -->

    <!-- File upload area -->
    <div v-if="showFileUpload" class="file-upload-container">
      <FileUpload
        :accept="'image/*,video/*,audio/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation'"
        :multiple="true"
        :maxSizeMB="20"
        :enablePreview="true"
        :emitRawFile="false"
        @upload="handleFileUpload"
        text="For AI prompt analysis • Max 20MB images, 50MB videos"
      />
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
          <span v-if="file.isUploaded" class="attachment-status uploaded">✅ Ready for AI</span>
          <span v-else-if="file.type.startsWith('image/') || file.type.startsWith('video/')" class="attachment-status pending">📤 Will upload</span>
          <span v-else class="attachment-status unsupported">⚠️ Not supported</span>
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
      <textarea
        ref="textareaRef"
        v-model="messageText"
        @input="resizeTextarea"
        @keydown="handleKeydown"
        placeholder="Type a message..."
        rows="1"
        class="message-textarea"
      ></textarea>
      
      <div class="input-actions">
        <div class="left-actions">
          <button class="icon-button attachment-button" @click.stop="toggleFileUpload" :class="{ active: showFileUpload }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          
        </div>
        
        <button 
          class="icon-button send-button" 
          @click="sendMessage"
          :disabled="(!messageText.trim() && attachments.length === 0) || loading"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>
    </div>
    
   
  </div>
</template>

<style scoped>
.message-input-container {
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.input-area {
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #d1d5db;
  padding: var(--space-3);
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .input-area {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.input-area:focus-within {
  border-color: #9ca3af;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .input-area:focus-within {
  border-color: var(--color-border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.message-textarea {
  border: none;
  background: transparent;
  resize: none;
  padding: 0 0 var(--space-2) 0;
  max-height: 200px;
  min-height: 24px;
  line-height: 1.5;
  font-size: 16px;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  width: 100%;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

[data-theme="dark"] .message-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.message-textarea:focus {
  outline: none;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-1);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}


.file-upload-container {
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 163, 255, 0.15);
  background-color: var(--color-bg-tertiary);
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.03);
  background-image: linear-gradient(to bottom, rgba(0, 163, 255, 0.05), transparent 70%);
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
  border: 1px solid rgba(0, 163, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 163, 255, 0.02);
  transition: all var(--transition-normal);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.03), transparent 70%);
}

.attachment-item:hover {
  border-color: rgba(0, 163, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.05);
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.06), transparent 70%);
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

.attachment-status {
  display: block;
  font-size: 0.7rem;
  margin-top: 2px;
  font-weight: 500;
}

.attachment-status.uploaded {
  color: var(--color-success);
}

.attachment-status.pending {
  color: var(--color-primary);
}

.attachment-status.unsupported {
  color: var(--color-warning);
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
  
  .mcp-dropdown {
    width: calc(100vw - 32px);
    left: calc(-100vw + 100% + 16px);
    max-width: 320px;
  }
  
  .input-area {
    padding: var(--space-2);
  }
  
  .message-textarea {
    padding: 0 0 var(--space-1) 0;
    font-size: 1rem;
  }
  
  .input-actions {
    margin-top: var(--space-1);
  }
  
  .attachments-preview {
    gap: var(--space-1);
    margin-bottom: var(--space-2);
  }
  
  .attachment-item {
    min-width: 100%;
  }

  .modal-content {
    width: 95%;
    max-width: none;
    margin: var(--space-2);
    max-height: calc(100vh - 32px);
  }

  .modal-header {
    padding: var(--space-3);
  }

  .modal-body {
    padding: var(--space-3);
  }

  .input-group {
    flex-direction: column;
    gap: var(--space-3);
  }

  .connect-button {
    min-width: 100%;
  }

  .service-option {
    padding: var(--space-3);
  }

  .service-name {
    font-size: 1rem;
  }

  .service-description {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  /* File Upload Mobile Styles */
  .file-upload-section h3 {
    font-size: 0.875rem;
  }

  .file-upload-area {
    padding: var(--space-3);
  }

  .upload-label span {
    font-size: 0.8rem;
  }

  .upload-label small {
    font-size: 0.7rem;
  }

  .file-preview {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .file-details .file-name {
    font-size: 0.8rem;
  }

  .progress-text {
    font-size: 0.7rem;
  }

  /* Web Search Configuration Mobile Styles */
  .config-header {
    padding: var(--space-2);
  }

  .config-header h3 {
    font-size: 0.875rem;
  }

  .config-content {
    padding: var(--space-2);
  }

  .location-fields {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .field-group label {
    font-size: 0.7rem;
  }

  .config-input,
  .config-select {
    padding: var(--space-2);
    font-size: 0.8rem;
  }

  .radio-option {
    padding: var(--space-2);
  }

  .radio-label strong {
    font-size: 0.8rem;
  }

  .radio-label small {
    font-size: 0.7rem;
  }
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
  color: #ffffff;
  background-color: #10a37f;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  transition: all var(--transition-normal);
}

.send-button:hover:not(:disabled) {
  background-color: #0d8b6b;
  transform: scale(1.05);
}

.send-button:disabled {
  color: #9ca3af;
  background-color: #f3f4f6;
  cursor: not-allowed;
  transform: none;
}

[data-theme="dark"] .send-button:disabled {
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-tertiary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-close {
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.modal-close:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
}

.modal-body {
  padding: var(--space-4);
}

/* File Search Modal Styles */
.file-search-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-description {
  text-align: center;
  color: var(--color-text-secondary);
}

.search-description p {
  margin: 0;
  line-height: 1.5;
}

.search-actions {
  display: flex;
  justify-content: center;
}

.connect-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 200px;
  justify-content: center;
}

.connect-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 163, 255, 0.3);
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-large{
  scale: 4;
  color: var(--color-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-results {
  margin-top: var(--space-4);
}

.search-results h3 {
  margin: 0 0 var(--space-3);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.file-item:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.05);
}

.file-item:hover .delete-button {
  opacity: 1;
}

.file-icon {
  color: var(--color-text-secondary);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.file-meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* File Upload Styles */
.file-upload-section {
  margin-bottom: var(--space-4);
}

.file-upload-section h3 {
  margin: 0 0 var(--space-3);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.file-upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: all var(--transition-normal);
  background: var(--color-bg-secondary);
}

.file-upload-area:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.02);
}

.file-upload-area.has-file {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.02);
}

.file-input {
  display: none;
}

.upload-placeholder {
  text-align: center;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.upload-label:hover {
  color: var(--color-text-primary);
}

.upload-label span {
  font-weight: 500;
  font-size: 0.875rem;
}

.upload-label small {
  font-size: 0.75rem;
  opacity: 0.7;
}

.selected-file {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details .file-name {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  word-break: break-all;
}

.file-details .file-size{
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.file-info .file-download{
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.remove-file {
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.remove-file:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.file-connected-header{
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

/* Web Search Modal Styles */
.web-search-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.url-input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.url-input-section label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.input-group {
  display: flex;
  gap: var(--space-2);
}

.url-input {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.url-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.url-input::placeholder {
  color: var(--color-text-tertiary);
}

.website-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: 5px;
}

.website-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.website-item:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.05);
}

.website-item:hover .delete-button {
  opacity: 1;
}

.website-icon {
  color: var(--color-text-secondary);
}

.website-details {
  flex: 1;
  min-width: 0;
}

.website-url {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  word-break: break-all;
}

.website-title {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.website-status {
  font-size: 0.75rem;
  color: var(--color-success);
  font-weight: 500;
}

.websites-connected-header{
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.search-results .loading-spinner{
  display: inline-block;
}
/* Configuration Section Styles */
.config-section {
  margin-top: var(--space-4);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
  cursor: pointer;
}

.config-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.config-toggle {
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.config-toggle:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
}

.config-toggle svg {
  transition: transform var(--transition-normal);
}

.config-toggle svg.rotated {
  transform: rotate(180deg);
}

.config-content {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
}

.config-group {
  margin-bottom: var(--space-4);
}

.config-group:last-child {
  margin-bottom: 0;
}

.config-group h4 {
  margin: 0 0 var(--space-3);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.optional {
  font-weight: 400;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.required {
  font-weight: 400;
  color: var(--color-error);
  font-size: 0.75rem;
}

.location-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.config-input,
.config-select {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.config-input:focus,
.config-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.config-input::placeholder {
  color: var(--color-text-tertiary);
}

.context-size-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.radio-option:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.05);
}

.radio-option input[type="radio"] {
  margin: 0;
  margin-top: 2px;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.radio-label strong {
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.radio-label small {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.radio-option input[type="radio"]:checked + .radio-label {
  color: var(--color-primary);
}

.radio-label strong {
  color: var(--color-text-primary);
}

.radio-label small {
  color: var(--color-text-secondary);
}

/* Delete button styles */
.delete-button {
  background: transparent;
  border: none;
  padding: var(--space-2);
  color: var(--color-text-danger);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  opacity: 0.7;
}

.delete-button:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
  opacity: 1;
}

.delete-button:active {
  transform: scale(0.95);
}

.delete-button:focus {
  outline: none;
  box-shadow: none;
}
</style>