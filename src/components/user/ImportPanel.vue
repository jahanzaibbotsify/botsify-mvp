<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import FileUpload from './FileUpload.vue'
import { User } from '@/types/user'
import { useToast } from 'vue-toast-notification'

const $toast = useToast({ position: 'top-right' })

const emit = defineEmits<{
  close: []
  import: [users: User[]]
}>()

const isImporting = ref<boolean>(false)
const importFile = ref<File | null>(null)

const handleFileSelect = (file: File | null) => {
  importFile.value = file
}

const handleImport = async () => {
  if (!importFile.value) return
  
  isImporting.value = true
  
  try {
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Parse CSV and create new users (simplified example)
    const newUsers: User[] = []
    
    emit('import', newUsers)
    
    // Reset state
    importFile.value = null
    
    $toast.success('Users imported successfully!')
  } catch (error) {
    console.error('Import error:', error)
    $toast.error('Failed to import users. Please try again.')
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
</script>

<template>
  <div class="import-panel">
    <div class="import-header">
      <h3>Import User</h3>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    
    <div class="import-content">
      <div class="upload-section">
        <label class="upload-label">Upload File (CSV)</label>
        <FileUpload 
          :selected-file="importFile"
          @file-select="handleFileSelect"
        />
      </div>

      <div class="import-info">
        <p class="info-text">
          <strong>Note:</strong> Supported formats: .csv<br>
          <strong>Sample Files:</strong> 
          <button class="sample-link" @click="downloadSampleCSV">CSV</button>
        </p>
      </div>

      <div class="import-actions">
        <button 
          class="import-btn"
          :disabled="!importFile || isImporting"
          @click="handleImport"
        >
          <span v-if="isImporting" class="loading-spinner"></span>
          {{ isImporting ? 'Importing...' : 'Import' }}
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

.import-info {
  background-color: hwb(46 80% 0%);
  border: 1px solid var(--color-warning);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-text {
  margin: 0;
  font-size: 13px;
  color: #856404;
  line-height: 1.4;
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
  color: var(--color-primary);
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