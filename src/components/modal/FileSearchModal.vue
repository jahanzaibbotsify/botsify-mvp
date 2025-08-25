<script setup lang="ts">
import { ref, reactive } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import { botsifyApi } from '@/services/botsifyApi'
import { useChatStore } from '@/stores/chatStore'
import { createResource } from "@/utils/caching.ts"
import Button from '../ui/Button.vue'

interface Props {
  chatId: string
}

const props = defineProps<Props>()
const chatStore = useChatStore()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const loadingData = ref(false)
const fileSearchResults = reactive<any[]>([])
const fileSearchLoading = ref(false)
const fileSearchDeleteLoading = ref(false)
const fileSearchAllDeleteLoading = ref(false)
const fileSearchSelectedId = ref('0')

// File upload refs
const selectedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)

// Create cached resource for file search data
const fileSearchResource = createResource(async () => {
  const response = await botsifyApi.getFileSearch()
  return response
})

const openModal = async () => {
  modalRef.value?.openModal()
  if (fileSearchResults.length === 0) {
    loadingData.value = true
    await loadFileSearchData()
    loadingData.value = false
  }
}

// Load existing File Search data for this bot assistant
const loadFileSearchData = async () => {
  try {
    const response = await fileSearchResource.load()
    
    if (response.success) {
      fileSearchResults.push(...response.data)
    }
  } catch (error: any) {
    console.error('Error loading File Search data:', error)
  }
}

// File upload handlers
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const removeSelectedFile = () => {
  selectedFile.value = null
  uploadProgress.value = 0
}

const connectFileSearch = async () => {
  if (!selectedFile.value) {
    window.$toast.error('Please select a file to upload first')
    return
  }

  try {
    fileSearchLoading.value = true
    isUploading.value = true
    
    uploadProgress.value = 50
    isUploading.value = false
    
    const response = await botsifyApi.createFileSearch(selectedFile.value)

    uploadProgress.value = 50
    isUploading.value = false
    uploadProgress.value = 100

    if (response.success) {
      response.data.filename = selectedFile.value.name
      fileSearchResults.push(response.data.data)
      // Invalidate cache after adding new file
      fileSearchResource.invalidate()
      
      // Add success message to chat
      const successMessage = `✅ File "${selectedFile.value.name}" uploaded and File Search connected successfully!`
      await chatStore.addMessage(props.chatId, successMessage, 'assistant')
      removeSelectedFile()
    } else {
      console.error('Failed to create File Search:', response.message)
      window.$toast.error('Failed to create File Search: ' + response.message)
    }
  } catch (error: any) {
    console.error('Error creating File Search:', error)
    window.$toast.error('Error creating File Search: ' + error.message)
  } finally {
    fileSearchLoading.value = false
    isUploading.value = false
  }
}

// Delete File Search entry
const deleteFileSearchEntry = (fileSearchId: string, fileSearchName: string) => {
  window.$confirm({
    text: 'Are you sure you want to delete this File Search?',
  }, async() => {
    try {
      fileSearchDeleteLoading.value = true
      fileSearchSelectedId.value = fileSearchId
      const response = await botsifyApi.deleteAllFileSearch([fileSearchId])
      
      if (response.success) {
        const index = fileSearchResults.findIndex(file => file.id === fileSearchId)
  
        if (index !== -1) {
          fileSearchResults.splice(index, 1)
        }
        
        // Invalidate cache after deletion
        fileSearchResource.invalidate()
        
        // Add success message to chat
        const successMessage = `✅ File Search ${fileSearchName} removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')
      } else {
        console.error('Failed to delete File Search entry:', response.message)
        window.$toast.error('Failed to delete File Search entry: ' + response.message)
      }
    } catch (error: any) {
      console.error('Error deleting File Search entry:', error)
      window.$toast.error('Error deleting File Search entry: ' + error.message)
    } finally {
      fileSearchDeleteLoading.value = false
    }
  })
}

// Delete all File Search entries
const deleteAllFileSearchEntry = () => {
  window.$confirm({
    text: 'Are you sure you want to delete all File Search?',
  }, async() => {
    try {
      fileSearchAllDeleteLoading.value = true
      const ids = fileSearchResults.map(file=>file.id)
      const response = await botsifyApi.deleteAllFileSearch(ids)
      
      if (response.success) {
        console.log('All File Search entry deleted successfully')
        fileSearchResults.splice(0, fileSearchResults.length)
        
        // Invalidate cache after deletion
        fileSearchResource.invalidate()
        
        // Add success message to chat
        const successMessage = `✅ All File Search removed successfully`
        await chatStore.addMessage(props.chatId, successMessage, 'assistant')
      } else {
        console.error('Failed to delete File Search entry:', response.message)
        window.$toast.error('Failed to delete File Search entry: ' + response.message)
      }
    } catch (error: any) {
      console.error('Error deleting File Search entry:', error)
      window.$toast.error('Error deleting File Search entry: ' + error.message)
    } finally {
      fileSearchAllDeleteLoading.value = false
    }
  })
}

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="File Search"
    max-width="600px"
  >
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
              <i class="pi pi-upload"></i>
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
        <Button 
          variant="primary"
          size="large"
          icon="pi pi-paperclip"
          :loading="fileSearchLoading || isUploading"
          @click="connectFileSearch"
          :disabled="fileSearchLoading || isUploading || !selectedFile"
        >
          {{ 
            isUploading ? 'Uploading...' : 
            fileSearchLoading ? 'Connecting...' : 
            !selectedFile ? 'Select a file to connect' : 'Upload & Connect' 
          }}
        </Button>
      </div>

      <!-- File Search Results -->
      <div v-if="fileSearchResults.length > 0" class="search-results">
        <div class="file-connected-header">
          <h3>Connected Files</h3>
          <Button 
            @click="deleteAllFileSearchEntry()"
            title="Delete all file search entries"
            icon="pi pi-trash"
            variant="error-outline"
            size="small"
            :loading="fileSearchAllDeleteLoading"
            :disabled="fileSearchAllDeleteLoading"
          >
            Delete All
          </Button>
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
              <div class="file-download">
                <a v-if="file.url" target="_blank" :href="file.url" download>Download</a>
              </div>
            </div>
            <Button 
              v-if="file.id"
              iconOnly
              variant="error-outline"
              size="small"
              icon="pi pi-trash"
              @click="deleteFileSearchEntry(file.id, file.file_name)"
              title="Delete this file search entry"
              :loading="fileSearchDeleteLoading && fileSearchSelectedId == file.id"
              :disabled="fileSearchDeleteLoading && fileSearchSelectedId == file.id"
            />
          </div>
        </div>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped>
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

.file-download {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.file-download a {
  color: var(--color-primary);
  text-decoration: none;
}

.file-download a:hover {
  text-decoration: underline;
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

.file-details .file-size {
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

.file-connected-header {
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

.required {
  font-weight: 400;
  color: var(--color-error);
  font-size: 0.75rem;
}

/* Mobile styles */
@media (max-width: 767px) {
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
}
</style> 