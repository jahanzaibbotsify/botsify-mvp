<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useMCPStore } from '@/stores/mcpStore';
import type { Attachment } from '@/types';
import FileUpload from '@/components/ui/FileUpload.vue';
import { botsifyApi } from '@/services/botsifyApi';
import McpConnectionModal from "@/components/chat/mcp/MCPConnectionModal.vue";
import CalendlyModal from "@/components/modal/CalendlyModal.vue";
import PublishBotModal from "@/components/modal/PublishBotModal.vue";
import FileSearchModal from "@/components/modal/FileSearchModal.vue";
import WebSearchModal from "@/components/modal/WebSearchModal.vue";

const props = defineProps<{
  chatId: string;
  message?: string;
  loading?: boolean;
  centered?: boolean;
  hasPromptContent: boolean;
}>();

const chatStore = useChatStore();
const mcpStore = useMCPStore();
const messageText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showFileUpload = ref(false);
const attachments = ref<Attachment[]>([]);
const showMCPModal = ref(false);
const showMCPDropdown = ref(false);
const showCustomServerOnOpen = ref(false);
const publishBotRef = ref<InstanceType<typeof PublishBotModal> | null>(null)
const fileSearchModalRef = ref<InstanceType<typeof FileSearchModal> | null>(null)
const webSearchModalRef = ref<InstanceType<typeof WebSearchModal> | null>(null)

const openPublishBotModal = () => {
  publishBotRef.value?.openModal()
}

const openFileSearchModal = () => {
  fileSearchModalRef.value?.openModal()
}

const openWebSearchModal = () => {
  webSearchModalRef.value?.openModal()
}

const loadingData = ref(false);
const loadingFor =  ref('');




onMounted(async () => {
  await mcpStore.setIntialize();
});

const resizeTextarea = () => {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
};

const sendMessage = async () => {
  if (!messageText.value.trim() && attachments.value.length === 0) return;
  
  let finalMessageText = messageText.value.trim();
  let processedAttachments = [...attachments.value];

  if (attachments.value.length > 0) {

    // If there are attachments (images/videos), upload them first
    try {
      console.log('Uploading media files for AI prompt...');
      showLoading('fileUploadingFromPin');

      // Show uploading status
      const originalText = finalMessageText;
      finalMessageText = finalMessageText + (finalMessageText ? '\n\n' : '');

      // Add temporary message to show upload progress
      // chatStore.addMessage(props.chatId, finalMessageText, 'user', processedAttachments);


      // Convert blob URLs to File objects for upload
      const filesToUpload: File[] = [];
      for (const attachment of attachments.value) {
        try {
          const response = await fetch(attachment.url);
          const blob = await response.blob();
          const file = new File([blob], attachment.name, { type: attachment.type });
          filesToUpload.push(file);
        } catch (error) {
          console.error('Error converting attachment to file:', error);
        }
      }

      if (filesToUpload.length > 0) {
        // Upload files to get URLs using new endpoint
        const uploadResult = await botsifyApi.uploadMultipleFilesNew(filesToUpload);
        // && uploadResult.data.uploadedFiles.length > 0
        if (uploadResult.success) {
          // Update attachments with uploaded URLs
          uploadResult.data.uploadedFiles.forEach((uploadedFile: any, index: number) => {
            if (!uploadedFile.url) throw new Error(`File ${index + 1} upload failed.`);
            if (attachments.value[index].type.startsWith('image/')) {
              attachments.value[index].preview = uploadedFile.url;
            }

            const attachmentIndex = processedAttachments.findIndex(att =>
              att.name === uploadedFile.fileName
            ); //att.type === uploadedFile.fileType

            if (attachmentIndex !== -1) {
              processedAttachments[attachmentIndex] = {
                ...processedAttachments[attachmentIndex],
                uploadedUrl: uploadedFile.url,
                fileId: uploadedFile.fileId,
                uploadedAt: uploadedFile.uploadedAt,
                isUploaded: true
              };
            }
          });

          // Append file URLs to the AI prompt
          const fileUrls = uploadResult.data.uploadedFiles.map((file: any, index: any) => {
            if (!file.url) throw new Error(`File ${index + 1} upload failed.`);
            const label = getLabelFromUrl(file.url);
            return `${label}: ${file.url}`;
          }).join('\n');

          finalMessageText = originalText + (originalText ? '\n\n' : '') +
            'Attached files:\n' + fileUrls;

          console.log('Files uploaded successfully, URLs added to prompt:', fileUrls);
        } else {
          console.error('File upload failed:', uploadResult.message);
          finalMessageText = originalText + (originalText ? '\n\n' : '') +
            '❌ File upload failed: ' + uploadResult.message;
        }
      }

      // Remove the temporary uploading message
      // chatStore.removeLastMessage(props.chatId);

    } catch (error: any) {
      console.error('Error uploading files:', error);
      finalMessageText = messageText.value.trim() + (messageText.value.trim() ? '\n\n' : '') +
        '❌ File upload error: ' + error.message;

      // Remove the temporary uploading message
      chatStore.removeLastMessage(props.chatId);
    }finally{
      hideLoading()
    }
  }
  
  // Send the final message with uploaded file URLs
  chatStore.addMessage(props.chatId, finalMessageText, 'user', processedAttachments);
  
  // Clear the input
  messageText.value = '';
  attachments.value = [];
  showFileUpload.value = false;
  
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
};

const getLabelFromUrl = (url: string) => {
  const ext = (url.split('.').pop() || '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'Video';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'Audio';
  if (['pdf', 'doc', 'docx', 'txt', 'csv', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'Document';
  if (['zip', 'rar'].includes(ext)) return 'Archive';

  return 'File';
}

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

const toggleMCPDropdown = () => {
  showMCPDropdown.value = !showMCPDropdown.value;
};

const closeMCPDropdown = () => {
  showMCPDropdown.value = false;
};

// New methods for dropdown actions
const openMCPServers = async() => {
  showMCPModal.value = true;
  closeMCPDropdown();
};

const openFileSearch = async () => {
  openFileSearchModal();
  closeMCPDropdown();
};

const openWebSearch = async () => {
  openWebSearchModal();
  closeMCPDropdown();
};

// const openCustomServerDialog = () => {
//   showCustomServerOnOpen.value = true;
//   showMCPModal.value = true;
//   closeMCPDropdown();
// };

const closeMCPModal = () => {
  showMCPModal.value = false;
  showCustomServerOnOpen.value = false;
};



const showLoading = (forWhat: string) => {
  loadingFor.value = forWhat;
}

const hideLoading = () => {
  loadingFor.value = '';
}

</script>

<template>
  <div class="message-input-container" :class="{ centered: props.centered }">
    <!-- Backdrop to close dropdown -->
    <div v-if="showMCPDropdown" class="dropdown-backdrop" @click="closeMCPDropdown"></div>

    <!-- File upload area -->
    <div v-if="showFileUpload" class="file-upload-container">
      <FileUpload
        :accept="'image/*,video/*,audio/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword'"
        :multiple="true"
        :maxSizeMB="20"
        :enablePreview="true"
        :emitRawFile="false"
        @upload="handleFileUpload"
        text="Max 20MB images/audios, 50MB videos"
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
          <span v-else-if="
            file.type.startsWith('image/') 
            || file.type.startsWith('video/') 
            || file.type.startsWith('audio/')
            || file.type.startsWith('application/')
            || file.type.startsWith('text/')" 
            class="attachment-status pending">
          </span>
          <span v-else class="attachment-status unsupported">⚠️ Not supported</span>
        </div>
        <button class="remove-attachment" @click.stop="removeAttachment(file.id)">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>

    <!-- file loading from pin button -->
    <div v-if="loadingFor === 'fileUploadingFromPin'" class="text-muted px-3 loading-spinner-of-pin-file-container">
      <small >Uploading Files</small>
      <span class="loading-spinner "></span>
    </div>
    <!-- input area -->
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
          <button 
            class="icon-button attachment-button" 
            @click.stop="toggleFileUpload" 
            :class="{ active: showFileUpload }"
            :disabled="loadingFor === 'fileUploadingFromPin' || chatStore.doInputDisable">
            <i class="pi pi-paperclip"></i>
          </button>

          <!-- Chain Icon with New Dropdown -->
          <div class="mcp-dropdown-container" @click.stop v-if="props.hasPromptContent">
            <button 
              class="icon-button mcp-icon-button" 
              @click="toggleMCPDropdown" 
              title="Connect to external services"
              :disabled="loadingFor === 'fileUploadingFromPin' || chatStore.doInputDisable"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            <button
              class="icon-button mcp-icon-button"
              @click="openPublishBotModal"
              title="Connect to external services"
              :disabled="loadingFor === 'fileUploadingFromPin' || chatStore.doInputDisable"
            >
              <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10.051 8.102-3.778.322-1.994 1.994a.94.94 0 0 0 .533 1.6l2.698.316m8.39 1.617-.322 3.78-1.994 1.994a.94.94 0 0 1-1.595-.533l-.4-2.652m8.166-11.174a1.366 1.366 0 0 0-1.12-1.12c-1.616-.279-4.906-.623-6.38.853-1.671 1.672-5.211 8.015-6.31 10.023a.932.932 0 0 0 .162 1.111l.828.835.833.832a.932.932 0 0 0 1.111.163c2.008-1.102 8.35-4.642 10.021-6.312 1.475-1.478 1.133-4.77.855-6.385Zm-2.961 3.722a1.88 1.88 0 1 1-3.76 0 1.88 1.88 0 0 1 3.76 0Z"/>
              </svg>
            </button>

            <!-- New Dropdown Menu with 3 Options -->
            <div v-if="showMCPDropdown" class="mcp-dropdown" @click.stop>
              <div class="dropdown-header">
                <h3>Tools</h3>
                <button class="dropdown-close" @click="closeMCPDropdown">
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <!-- Three Service Options -->
              <div class="service-options">
                <!-- File Search Option -->
                <div class="service-option" @click="openFileSearch">
                  <div class="service-icon">
                    <i class="pi pi-file"></i>
                  </div>
                  <div class="service-info">
                    <div class="service-name">File Search</div>
                    <div class="service-description">Search and access your files</div>
                  </div>
                  <div class="service-arrow">
                    <i class="pi pi-angle-right"></i>
                  </div>
                </div>

                <!-- Web Search Option -->
                <div class="service-option" @click="openWebSearch">
                  <div class="service-icon">
                    <i class="pi pi-globe"></i>
                  </div>
                  <div class="service-info">
                    <div class="service-name">Web Search</div>
                    <div class="service-description">Connect to websites and web content</div>
                  </div>
                  <div class="service-arrow">
                    <i class="pi pi-angle-right"></i>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <button 
          v-if="props.hasPromptContent"
            class="icon-button mcp-icon-button" 
            @click="openMCPServers" title="MCP Servers" 
            :disabled="loadingFor === 'fileUploadingFromPin' || chatStore.doInputDisable">           
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                  <path d="M3.49994 11.7501L11.6717 3.57855C12.7762 2.47398 14.5672 2.47398 15.6717 3.57855C16.7762 4.68312 16.7762 6.47398 15.6717 7.57855M15.6717 7.57855L9.49994 13.7501M15.6717 7.57855C16.7762 6.47398 18.5672 6.47398 19.6717 7.57855C20.7762 8.68312 20.7762 10.474 19.6717 11.5785L12.7072 18.543C12.3167 18.9335 12.3167 19.5667 12.7072 19.9572L13.9999 21.2499" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M17.4999 9.74921L11.3282 15.921C10.2237 17.0255 8.43272 17.0255 7.32823 15.921C6.22373 14.8164 6.22373 13.0255 7.32823 11.921L13.4999 5.74939" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              <!-- Connection indicator -->
              <span v-if="mcpStore.connectedServers.length > 0" class="connection-indicator">
                {{ mcpStore.connectedServers.length }}
              </span>
          </button>
        </div>
        <button 
          class="icon-button send-button" 
          @click="sendMessage"
          :disabled="(!messageText.trim() && attachments.length === 0) || loadingFor === 'fileUploadingFromPin' || chatStore.doInputDisable"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <McpConnectionModal
          :is-open="showMCPModal"
          @close="closeMCPModal"
      />
      <PublishBotModal ref="publishBotRef"/>
      <FileSearchModal ref="fileSearchModalRef" :chatId="props.chatId" />
      <WebSearchModal ref="webSearchModalRef" :chatId="props.chatId" />
    </Teleport>
  </div>
</template>

<style scoped>
.message-input-container {
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  position: sticky;
  bottom: 0;
  /* z-index: var(--z-sticky); */
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

.input-area.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
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

.mcp-dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-button:disabled{
  opacity: 0.5;
  cursor: not-allowed;
}

.mcp-icon-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
}

.mcp-icon-button:hover {
  color: var(--color-text-primary);
}

.mcp-icon-button.active {
  color: var(--color-primary);
}

.connection-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: var(--color-success);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bg-secondary);
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.mcp-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 320px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dropdown-close {
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.dropdown-close:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
}

.service-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2);
}

.service-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.service-option:hover {
  border-color: rgba(0, 163, 255, 0.3);
  background: rgba(0, 163, 255, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 163, 255, 0.1);
}

.service-icon {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-status {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.service-arrow {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
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
  color: var(--color-text-danger);
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


</style>