<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useMCPStore } from '@/stores/mcpStore';
import type { Attachment } from '@/types';
import FileUpload from '@/components/ui/FileUpload.vue';
import MCPConnectionModal from './MCPConnectionModal.vue';
import { botsifyApi } from '@/services/botsifyApi';

const props = defineProps<{
  chatId: string;
  message?: string;
  loading?: boolean;
  centered?: boolean;
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


const loadingData = ref(false);
const loadingFor =  ref('');


// New refs for File Search
const showFileSearchModal = ref(false);
const showWebSearchModal = ref(false);
const fileSearchResults = reactive<any[]>([]);
const fileSearchLoading = ref(false);
const fileSearchDeleteLoading = ref(false);
const fileSearchAllDeleteLoading = ref(false);
const fileSearchSelectedId = ref('0');

// for web search
const webSearchUrl = ref('');
const webSearchResults = reactive<any[]>([]);
const webSearchLoading = ref(false);
const webSearchDeleteLoading = ref(false);
const webSearchDeleteAllLoading = ref(false);
const webSearchSelectedUrlId = ref('0');

// New refs for file upload in File Search
const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const isUploading = ref(false);

// New refs for Web Search configuration
const showWebSearchConfig = ref(false);
const webSearchConfig = ref({
  location: {
    country: '',
    region: '',
    city: '',
    timezone: ''
  },
  searchContextSize: 'medium'
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
            'Attached files:\n';

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

// Load existing Web Search data for this bot assistant
const loadMCPsData = async () => {
  try {
    console.log('Loading already connected MCP servers:', props.chatId);
    const response = await mcpStore.getConnectedMCPs();
    
    if (response.success) {
      console.log('Fetched MCP data result:', response);
      
    } else {
      console.log('No existing Web Search data found or failed to load:', response.message);
    }
  } catch (error: any) {
    console.error('Error loading Web Search data:', error);
  }
};

// New methods for dropdown actions
const openMCPServers = async() => {
  if(mcpStore.connectedServers.length === 0) {
    loadingData.value = true;
    await loadMCPsData();
    loadingData.value = false;
  }
  showMCPModal.value = true;
  closeMCPDropdown();
};

const openFileSearch = async () => {
  showFileSearchModal.value = true;
  if(fileSearchResults.length === 0){
    loadingData.value = true;
    await loadFileSearchData();
    loadingData.value = false;
  }
  closeMCPDropdown();
};

const openWebSearch = async () => {
  showWebSearchModal.value = true;
  if(webSearchResults.length === 0){
    loadingData.value = true;
    await loadWebSearchData();
    loadingData.value = false;
  }
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

const closeFileSearchModal = () => {
  showFileSearchModal.value = false;
  // fileSearchResults.value = [];
  selectedFile.value = null;
  uploadProgress.value = 0;
  isUploading.value = false;
};

const closeWebSearchModal = () => {
  showWebSearchModal.value = false;
  webSearchUrl.value = '';
  showWebSearchConfig.value = false;
};

// File Search functionality with upload
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  uploadProgress.value = 0;
};

const connectFileSearch = async () => {
  if (!selectedFile.value) {
    window.$toast.error('Please select a file to upload first');
    return;
  }

  try {
    fileSearchLoading.value = true;
    console.log('Uploading file and creating File Search for bot assistant:', props.chatId);
    console.log('Selected file:', selectedFile.value.name);
    isUploading.value = true;
    
    // First upload the file using the new upload endpoint
    // let uploadResult = await botsifyApi.uploadFileNew(selectedFile.value);
    
    // if (!uploadResult.success) {
    //   throw new Error(uploadResult.message || 'File upload failed');
    // }
    
    uploadProgress.value = 50;
    isUploading.value = false;

    // File data which need to display
    
    
    // Then create file search with the uploaded file data
    // const fileData = {
    //   fileUrl: uploadResult.data.url,
    //   fileName: uploadResult.data.fileName,
    //   fileType: uploadResult.data.fileType,
    //   fileId: uploadResult.data.fileId
    // };

    
    
    const response = await botsifyApi.createFileSearch(selectedFile.value);

    uploadProgress.value = 50;
    isUploading.value = false;
    uploadProgress.value = 100;

    if (response.success) {
      // fileSearchResults.value = response.data?.files || [];
      // console.log('File Search created successfully:', response.data);
      // const fileData = {
      //   id: response.data.data.id,
      //   file_name: selectedFile.value.name,
      //   url: response.data.data.url
      // }
      response.data.filename = selectedFile.value.name;
      fileSearchResults.push(response.data.data);

      // Add success message to chat
      const successMessage = `✅ File "${selectedFile.value.name}" uploaded and File Search connected successfully!`;
      await chatStore.addMessage(props.chatId, successMessage, 'assistant');

      closeFileSearchModal();
    } else {
      console.error('Failed to create File Search:', response.message);
      window.$toast.error('Failed to create File Search: ' + response.message);
    }
  } catch (error: any) {
    console.error('Error creating File Search:', error);
    window.$toast.error('Error creating File Search: ' + error.message);
  } finally {
    fileSearchLoading.value = false;
    isUploading.value = false;
  }
};

const connectWebSearch = async () => {
  if (!webSearchUrl.value.trim()) {
    window.$toast.error('Please enter a website URL');
    return;
  }

  try {
    webSearchLoading.value = true;
    console.log('Creating Web Search for bot assistant:', props.chatId);
    console.log('Web Search URL:', webSearchUrl.value);
    console.log('Web Search configuration:', webSearchConfig.value);
    
    const response = await botsifyApi.createWebSearch(webSearchUrl.value.trim(), JSON.stringify(webSearchConfig.value));
    
    if (response.success) {
      console.log('Web Search created successfully:', response.data);
      
      webSearchResults.push({
        id: response.data.id,
        url: webSearchUrl.value
      });

      // Add success message to chat
      const successMessage = `✅ Web Search connected successfully for: ${webSearchUrl.value}`;
      await chatStore.addMessage(props.chatId, successMessage, 'assistant');

      closeWebSearchModal();
    } else {
      console.error('Failed to create Web Search:', response.message);
      window.$toast.error('Failed to create Web Search: ' + response.message);
    }
  } catch (error: any) {
    console.error('Error creating Web Search:', error);
    window.$toast.error('Error creating Web Search: ' + error.message);
  } finally {
    webSearchLoading.value = false;
  }
};

// const toggleWebSearchConfig = () => {
//   showWebSearchConfig.value = !showWebSearchConfig.value;
// };

const handleMCPConnection = (serverId: string) => {
  // Update the system prompt with MCP capabilities
  const combinedPrompt = mcpStore.getCombinedSystemPrompt();
  if (combinedPrompt) {
    // Log the system prompt for debugging
    console.log('MCP System Prompt Updated:', combinedPrompt);
    
    // Show a success message to the user
    const connectedServer = mcpStore.connectedServers.find(config => config.id === serverId);
    if (connectedServer) {
      // You could add a toast notification here or update the UI
      console.log(`Successfully connected to ${connectedServer.name}`);
    }
  }
  closeMCPModal();
};

// Load existing File Search data for this bot assistant
const loadFileSearchData = async () => {
  try {
    console.log('Loading existing File Search data for bot assistant:', props.chatId);
    // const response = await botsifyApi.getFileSearch(props.chatId);
    const response = await botsifyApi.getFileSearch();
    
    if (response.success) {
      // fileSearchResults.value = response.data?.files || [];
      // console.log('File Search data loaded:', fileSearchResults.value);
      console.log('file search result:', response.data);
      fileSearchResults.push(...response.data);
    } else {
      console.log('No existing File Search data found or failed to load:', response.message);
    }
  } catch (error: any) {
    console.error('Error loading File Search data:', error);
  }
};

// Load existing Web Search data for this bot assistant
const loadWebSearchData = async () => {
  try {
    console.log('Loading existing Web Search data for bot assistant:', props.chatId);
    const response = await botsifyApi.getWebSearch();
    
    if (response.success) {
      // webSearchResults.value = response.data;
      // console.log('Web Search data loaded:', webSearchResults.value);
      console.log('web search result:', response.data);
      
      webSearchResults.push(...response.data);
    } else {
      console.log('No existing Web Search data found or failed to load:', response.message);
    }
  } catch (error: any) {
    console.error('Error loading Web Search data:', error);
  }
};

// Delete File Search entry
const deleteFileSearchEntry = (fileSearchId: string, fileSearchName: string) => {
  window.$confirm({}, async() => {
    try {
      fileSearchDeleteLoading.value = true;
      fileSearchSelectedId.value = fileSearchId;
      console.log('Deleting File Search entry:', fileSearchId);
      const response = await botsifyApi.deleteAllFileSearch([fileSearchId]);
      
      if (response.success) {
        // Remove from local results
        // fileSearchResults.value = fileSearchResults.value.filter(result => result.id !== fileSearchId);
        console.log('File Search entry deleted successfully');
  
        const index = fileSearchResults.findIndex(file => file.id === fileSearchId);
  
        if (index !== -1) {
          fileSearchResults.splice(index, 1);
        }
        
        // Add success message to chat
        const successMessage = `✅ File Search ${fileSearchName} removed successfully`;
        await chatStore.addMessage(props.chatId, successMessage, 'assistant');
  
        closeFileSearchModal();
      } else {
        console.error('Failed to delete File Search entry:', response.message);
        window.$toast.error('Failed to delete File Search entry: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error deleting File Search entry:', error);
      window.$toast.error('Error deleting File Search entry: ' + error.message);
    }finally{
      fileSearchDeleteLoading.value = false;
    }
  });
};

// Delete File Search entry
const deleteAllFileSearchEntry = () => {
  window.$confirm({}, async() => {
    try {
      fileSearchAllDeleteLoading.value = true;
      const ids = fileSearchResults.map(file=>file.id);
      const response = await botsifyApi.deleteAllFileSearch(ids);
      
      if (response.success) {
        console.log('All File Search entry deleted successfully');
        fileSearchResults.splice(0, fileSearchResults.length);
        // Add success message to chat
        const successMessage = `✅ All File Search removed successfully`;
        await chatStore.addMessage(props.chatId, successMessage, 'assistant');
  
        closeFileSearchModal();
      } else {
        console.error('Failed to delete File Search entry:', response.message);
        window.$toast.error('Failed to delete File Search entry: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error deleting File Search entry:', error);
      window.$toast.error('Error deleting File Search entry: ' + error.message);
    }finally{
      fileSearchAllDeleteLoading.value = false;
    }
  });
};

// Delete Web Search entry
const deleteWebSearchEntry = (webSearchId: string, webSearchUrl: string) => {
  window.$confirm({}, async() => {
    try {
      webSearchDeleteLoading.value = true;
      webSearchSelectedUrlId.value = webSearchId;
      console.log('Deleting Web Search entry:', webSearchId, '-', webSearchUrl);
      // const response = await botsifyApi.deleteWebSearch(apikey, webSearchId, webSearchUrl);
      
      const response = await botsifyApi.deleteAllWebSearch([webSearchId]);
      if (response.success) {
        // Clear web search results if this was the active one
        // if (webSearchResults.value && webSearchResults.value.id === webSearchId) {
        //   webSearchResults.value = null;
        // }
        console.log('Web Search entry deleted successfully');
        const index = webSearchResults.findIndex(item => item.id === webSearchId);
        if (index !== -1) {
          webSearchResults.splice(index, 1);
        }
        // Add success message to chat
        const successMessage = `✅ Web Search for ${webSearchUrl} removed successfully`;
        await chatStore.addMessage(props.chatId, successMessage, 'assistant');
  
        closeWebSearchModal();
      } else {
        console.error('Failed to delete Web Search entry:', response.message);
        window.$toast.error('Failed to delete Web Search entry: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error deleting Web Search entry:', error);
      window.$toast.error('Error deleting Web Search entry: ' + error.message);
    }finally{
      webSearchDeleteLoading.value = false;
    }
  });
};

// Delete Web Search entry
const deleteWebSearchAllEntry = () => {
  window.$confirm({}, async() => {
    const ids = webSearchResults.map(item=>item.id);
    try {
      webSearchDeleteAllLoading.value = true;
      const response = await botsifyApi.deleteAllWebSearch(ids);
      
      if (response.success) {
        console.log('Web Search entry deleted successfully');
        webSearchResults.splice(0, webSearchResults.length);
        // Add success message to chat
        const successMessage = `✅ All Web Search removed successfully`;
        await chatStore.addMessage(props.chatId, successMessage, 'assistant');

        closeWebSearchModal();
      } else {
        console.error('Failed to delete Web Search entry:', response.message);
        window.$toast.error('Failed to delete Web Search entry: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error deleting Web Search entry:', error);
      window.$toast.error('Error deleting Web Search entry: ' + error.message);
    }finally{
      webSearchDeleteAllLoading.value = false;
    }
  });
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
          <span v-else-if="file.type.startsWith('image/') || file.type.startsWith('video/')" class="attachment-status pending"></span>
          <span v-else class="attachment-status unsupported">⚠️ Not supported</span>
        </div>
        <button class="remove-attachment" @click.stop="removeAttachment(file.id)">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>

    <!-- file loading from pin button -->
    <div v-if="loadingFor === 'fileUploadingFromPin'" class="text-muted px-3 loading-spinner-of-pin-file-container">
      <small >Uploading FIles</small>
      <span class="loading-spinner "></span>
    </div>
    <!-- input area -->
    <div class="input-area" :class="chatStore.doInputDisable ?'disabled': ''" >
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
          
          <!-- Chain Icon with New Dropdown -->
          <div class="mcp-dropdown-container" @click.stop>
            <button 
              class="icon-button mcp-icon-button" 
              @click="toggleMCPDropdown" 
              title="Connect to external services"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>

            <!-- New Dropdown Menu with 3 Options -->
            <div v-if="showMCPDropdown" class="mcp-dropdown" @click.stop>
              <div class="dropdown-header">
                <h3>Tools</h3>
                <button class="dropdown-close" @click="closeMCPDropdown">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <!-- Three Service Options -->
              <div class="service-options">
                <!-- File Search Option -->
                <div class="service-option" @click="openFileSearch">
                  <div class="service-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="14 2 14 9 21 9"></polyline>
                      <circle cx="9" cy="12" r="1"></circle>
                      <path d="M8.5 13.5L10.5 15.5"></path>
                    </svg>
                  </div>
                  <div class="service-info">
                    <div class="service-name">File Search</div>
                    <div class="service-description">Search and access your files</div>
                  </div>
                  <div class="service-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>

                <!-- Web Search Option -->
                <div class="service-option" @click="openWebSearch">
                  <div class="service-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div class="service-info">
                    <div class="service-name">Web Search</div>
                    <div class="service-description">Connect to websites and web content</div>
                  </div>
                  <div class="service-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <button class="icon-button mcp-icon-button" @click="openMCPServers" title="MCP Servers">           
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
          :disabled="!messageText.trim() && attachments.length === 0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- MCP Connection Modal -->
    <MCPConnectionModal 
      :isOpen="showMCPModal" 
      :showCustomServer="showCustomServerOnOpen"
      @close="closeMCPModal"
      @connected="handleMCPConnection"
    />

    <!-- File Search Modal -->
    <div v-if="showFileSearchModal" class="modal-overlay" @click="closeFileSearchModal">
      <span v-if="loadingData" class="loading-spinner loading-spinner-large"></span>
      <div v-else class="modal-content file-search-modal" @click.stop>
        <div class="modal-header">
          <h2>File Search</h2>
          <button class="modal-close" @click="closeFileSearchModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="file-search-content">
            <div class="search-description">
              <p>Upload a file and connect to the File Search API to access and search through your files.</p>
            </div>
            
            <!-- File Upload Section -->
            <div class="file-upload-section">
              <h3>Upload File <span class="required">(Required)</span></h3>
              <div class="file-upload-area" :class="{ 'has-file': selectedFile }">
                <input 
                  type="file" 
                  id="file-search-upload" 
                  @change="handleFileSelect"
                  class="file-input"
                  accept="*/*"
                />
                
                <div v-if="!selectedFile" class="upload-placeholder">
                  <label for="file-search-upload" class="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Choose a file to upload</span>
                    <small>File selection is required to connect</small>
                  </label>
                </div>
                
                <div v-if="selectedFile" class="selected-file">
                  <div class="file-preview">
                    <div class="file-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="14 2 14 9 21 9"></polyline>
                      </svg>
                    </div>
                    <div class="file-details">
                      <div class="file-name">{{ selectedFile.name }}</div>
                      <div class="file-size">{{ (selectedFile.size / 1024).toFixed(1) }}KB</div>
                    </div>
                    <button class="remove-file" @click="removeSelectedFile" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Upload Progress -->
                  <div v-if="isUploading" class="upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <div class="progress-text">{{ uploadProgress }}% uploaded</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="search-actions">
              <button 
                class="connect-button primary" 
                @click="connectFileSearch"
                :disabled="fileSearchLoading || isUploading || !selectedFile"
              >
                <span v-if="fileSearchLoading || isUploading" class="loading-spinner"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                {{ 
                  isUploading ? 'Uploading...' : 
                  fileSearchLoading ? 'Connecting...' : 
                  !selectedFile ? 'Select a file to connect' : 'Upload & Connect' 
                }}
              </button>
            </div>

            <!-- File Search Results -->
            <div v-if="fileSearchResults.length > 0" class="search-results">
              <div class="file-connected-header">
                <h3>Connected Files</h3>
                <button 
                  class="delete-button" 
                  @click="deleteAllFileSearchEntry()"
                  title="Delete this file search entry"
                >
                  <span v-if="fileSearchAllDeleteLoading" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div class="file-list">
                <div v-for="file in fileSearchResults" :key="file.id" class="file-item">
                  <div class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="14 2 14 9 21 9"></polyline>
                    </svg>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.file_name || file.filename || 'Unknown File' }}</div>
                    <!-- <div class="file-meta">{{ file.size || file.type || 'File' }}</div> -->
                    <div class="file-download">
                      <a v-if="file.url" target="_blank" :href="file.url" download>Download</a>
                    </div>
                  </div>
                  <button 
                    v-if="file.id"
                    class="delete-button" 
                    @click="deleteFileSearchEntry(file.id, file.file_name)"
                    title="Delete this file search entry"
                  >
                    <span v-if="fileSearchDeleteLoading && fileSearchSelectedId ==  file.id" class="loading-spinner"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Web Search Modal -->
    <div v-if="showWebSearchModal" class="modal-overlay" @click="closeWebSearchModal">
      <span v-if="loadingData" class="loading-spinner loading-spinner-large"></span>
      <div v-else class="modal-content web-search-modal" @click.stop>
        <div class="modal-header">
          <h2>Web Search</h2>
          <button class="modal-close" @click="closeWebSearchModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="web-search-content">
            <div class="search-description">
              <p>Enter a website URL to connect and search web content.</p>
            </div>
            
            <div class="url-input-section">
              <label for="website-url">Website URL</label>
              <div class="input-group">
                <input 
                  id="website-url"
                  v-model="webSearchUrl" 
                  type="url" 
                  placeholder="https://example.com"
                  class="url-input"
                  @keydown.enter="connectWebSearch"
                />
                <button 
                  class="connect-button primary" 
                  @click="connectWebSearch"
                  :disabled="webSearchLoading || !webSearchUrl.trim()"
                >
                  <span v-if="webSearchLoading" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  {{ webSearchLoading ? 'Connecting...' : 'Connect' }}
                </button>
              </div>
            </div>

            <!-- Web Search Results -->
            <div v-if="webSearchResults.length" class="search-results">
              <div class="websites-connected-header">
                <h3>Websites Connected</h3>
                <button 
                  class="delete-button" 
                  @click="deleteWebSearchAllEntry()"
                  title="Delete all web search entries"
                >
                  <span v-if="webSearchDeleteAllLoading" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <template v-for="webSearchResult of webSearchResults">
                <div class="website-info">
                  <div class="website-item">
                    <div class="website-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <div class="website-details">
                      <div class="website-url">{{ webSearchResult.url }}</div>
                      <div class="website-title">{{ 'Website' }}</div>
                      <div class="website-status">{{'Connected' }}</div>
                    </div>
                    <button 
                      class="delete-button" 
                      @click="deleteWebSearchEntry(webSearchResult.id, webSearchResult.url)"
                      title="Delete this web search entry"
                    >
                      <span v-if="webSearchDeleteLoading && webSearchSelectedUrlId ==  webSearchResult.id" class="loading-spinner"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
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
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
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
  font-size: 1rem;
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

.loading-spinner-of-pin-file-container {
  margin-left: 12px;
  color: gray;
}

.loading-spinner-of-pin-file-container .loading-spinner {
  display: inline-block;
  color: #00a3ff;
  margin-left: 3px;
  width: 12px;
  height: 12px;
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