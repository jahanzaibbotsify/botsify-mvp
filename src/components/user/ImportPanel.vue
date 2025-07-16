<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import FileUpload from './FileUpload.vue'
import { User } from '@/types/user'
import { useToast } from 'vue-toast-notification'
import { userApi } from '@/services/userApi'

const $toast = useToast({ position: 'top-right' })

const emit = defineEmits<{
  close: []
  import: [users: User[]]
}>()

const isImporting = ref<boolean>(false)
const importFile = ref<File | null>(null)
const uploadProgress = ref<number>(0)
const importStatus = ref<string>('')

const handleFileSelect = (file: File | null) => {
  importFile.value = file
  uploadProgress.value = 0
  importStatus.value = ''
}

const handleImport = async () => {
  if (!importFile.value) return
  
  isImporting.value = true
  uploadProgress.value = 0
  importStatus.value = 'Preparing upload...'
  
  try {
    const response = await userApi.importUsers(
      importFile.value,
      (progress: number) => {
        uploadProgress.value = progress
        importStatus.value = `Uploading... ${progress}%`
      }
    )
    
    if (response.success && response.data) {
      const importData = response.data
      
      if (importData.success) {
        importStatus.value = `Successfully imported ${importData.imported_count || 0} users!`
        
        // Show success message with details
        const message = `Import completed successfully!\n\nImported: ${importData.imported_count || 0} users`
        
        if (importData.errors && importData.errors.length > 0) {
          $toast.error(`${message}\n\nErrors encountered:\n${importData.errors.join('\n')}`);
        } else {
          $toast.error(message);
        }
        
        // Reset state
        importFile.value = null
        uploadProgress.value = 0
        importStatus.value = ''
        
        // Emit import event to refresh user list
        emit('import', [])
      } else {
        throw new Error(importData.message || 'Import failed')
      }
    } else {
      throw new Error(response.message || 'Import failed')
    }
  } catch (error) {
    console.error('Import error:', error)
    importStatus.value = 'Import failed'
    $toast.error(`Failed to import users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isImporting.value = false
  }
}

const downloadSampleCSV = () => {
  const csvContent = `name,locale,source,country,os,phone,status
John Doe,en,facebook,United States,Windows,1234567890,Active
Jane Smith,en,instagram,Canada,iOS,0987654321,Inactive
Mike Johnson,en,twitter,United Kingdom,Android,1122334455,Active`
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_users.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const downloadSampleTXT = () => {
  const txtContent = `John Doe,en,facebook,United States,Windows,1234567890,Active
Jane Smith,en,instagram,Canada,iOS,0987654321,Inactive
Mike Johnson,en,twitter,United Kingdom,Android,1122334455,Active`
  
  const blob = new Blob([txtContent], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_users.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="import-panel">
    <div class="import-header">
      <h3>Import Users</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <div class="import-content">
      <div class="upload-section">
        <label class="upload-label">Upload File (CSV or TXT)</label>
        <FileUpload 
          :selected-file="importFile"
          @file-select="handleFileSelect"
        />
      </div>

      <!-- Progress Bar -->
      <div v-if="isImporting" class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <p class="progress-text">{{ importStatus }}</p>
      </div>

      <div class="import-info">
        <p class="info-text">
          <strong>Note:</strong> Supported formats: .csv, .txt<br>
          <strong>Sample Files:</strong> 
          <button class="sample-link" @click="downloadSampleCSV">CSV</button> | 
          <button class="sample-link" @click="downloadSampleTXT">TXT</button>
        </p>
        <p class="info-text">
          <strong>Format:</strong> name,locale,source,country,os,phone,status
        </p>
      </div>

      <div class="import-actions">
        <button 
          class="import-btn"
          :disabled="!importFile || isImporting"
          @click="handleImport"
        >
          <span v-if="isImporting" class="loading-spinner"></span>
          {{ isImporting ? 'Importing...' : 'Import Users' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-panel {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: white;
  border-radius: 8px 8px 0 0;
}

.import-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: var(--color-bg-secondary);
}

.import-content {
  padding: 20px;
}

.upload-section {
  margin-bottom: 16px;
}

.upload-label {
  display: block;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.import-info {
  background-color: hwb(46 80% 0%);
  border: 1px solid var(--color-warning);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-text {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #856404;
  line-height: 1.4;
}

.info-text:last-child {
  margin-bottom: 0;
}

.sample-link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.sample-link:hover {
  color: var(--color-primary-hover);
}

.import-actions {
  display: flex;
  gap: 12px;
}

.import-btn {
  background-color: var(--color-success);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-btn:hover:not(:disabled) {
  background-color: var(--color-success);
}

.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>