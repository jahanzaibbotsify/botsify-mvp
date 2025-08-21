<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FileUpload from '../ui/FileUpload.vue'
import { userApi } from '@/services/userApi'
import Button from '../ui/Button.vue'
import ModalLayout from '../ui/ModalLayout.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  importSuccess: []
}>()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const isImporting = ref<boolean>(false)
const importFile = ref<File | null>(null)
const importStatus = ref<string>('')

// Watch for isOpen changes to control modal
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    // Wait for the next tick to ensure modalRef is available
    await nextTick()
    if (modalRef.value) {
      modalRef.value.openModal()
      // Reset import status when modal opens
      importStatus.value = ''
      importFile.value = null
      isImporting.value = false
    }
  }
})

const handleImport = async () => {
  if (!importFile.value) return
  
  isImporting.value = true
  
  try {
    const response = await userApi.importUsers(importFile.value)
    if (response.success && response.data) {
        importStatus.value = `Successfully imported!`
        
        // Show success message with details
        window.$toast.success(response.data.message)
        
        // Reset state
        importFile.value = null
        
        // Emit success event to parent - let parent handle modal closing
        emit('importSuccess')
    } else {
      throw new Error(response.message || 'Import failed')
    }
  } catch (error) {
    console.error('Import error:', error)
    importStatus.value = 'Import failed'
    window.$toast.error(`Failed to import users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isImporting.value = false
  }
}

const downloadSampleCSV = () => {
  const url = 'https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/messager_user_template.csv';
  const a = document.createElement('a');
  a.href = url;
  a.download = 'messager_user_template.csv'; // Optional: override filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleClose = () => {
  // Just emit close event - let parent handle modal closing
  emit('close')
}
</script>

<template>
  <ModalLayout 
    v-if="isOpen"
    ref="modalRef"
    title="Import users"
    max-width="600px"
    @close="handleClose"
  >
    <div class="import-content">
      <div class="upload-section">
        <label class="upload-label">Upload File (CSV or TXT)</label>
        <FileUpload
          v-model="importFile"
          accept=".csv,.txt,text/csv,text/plain"
          :multiple="false"
          :emitRawFile="true"
          text="Upload File (CSV or TXT)"
        />
        <div v-if="importFile" class="selected-file">
          <span class="file-name">📄 {{ importFile.name }}</span>
        </div>
      </div>

      <!-- Progress Section -->
      <div v-if="isImporting" class="progress-section">
        <p class="progress-text">{{ importStatus }}</p>
      </div>

      <div class="import-info">
        <p class="info-text">
          <strong>Note:</strong> Supported formats: .csv<br>
          <strong>Sample Files:</strong>&nbsp;
          <button class="sample-link" @click="downloadSampleCSV">CSV</button>
        </p>
        <p class="info-text">
          <strong>Format:</strong> name,phone
        </p>
      </div>

      <div class="agent-action-buttons">
        <Button 
          :loading="isImporting"
          :disabled="!importFile || isImporting"
          @click="handleImport"
        >
          Import users
        </Button>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped>
.import-content {
  padding: 0;
}

.upload-section {
  margin-bottom: var(--space-4);
}

.selected-file {
  margin-top: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  display: inline-block;
}

.upload-label {
  display: block;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
}

.progress-section {
  margin-bottom: var(--space-4);
}

.progress-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.import-info {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  background: var(--color-bg-tertiary);
}

.info-text {
  margin: 0 0 var(--space-2) 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
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
  font-size: 0.875rem;
  padding: 0;
}

.sample-link:hover {
  color: var(--color-primary-hover);
}

.agent-action-buttons {
  display: flex;
  gap: var(--space-3);
}

</style>
