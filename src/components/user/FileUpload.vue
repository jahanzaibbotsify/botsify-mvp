<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  selectedFile: File | null
}>()
console.log('props', props)

const emit = defineEmits<{
  fileSelect: [file: File | null]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref<boolean>(false)

const handleFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && file.type === 'text/csv') {
    emit('fileSelect', file)
  } else {
    alert('Please select a valid CSV file')
    if (target) target.value = ''
    emit('fileSelect', null)
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const file = event.dataTransfer?.files[0]
  
  if (file && file.type === 'text/csv') {
    emit('fileSelect', file)
  } else {
    alert('Please select a valid CSV file')
    emit('fileSelect', null)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}
</script>

<template>
  <div class="file-upload-container">
    <div 
      class="file-drop-zone"
      :class="{ 
        'drag-over': isDragOver,
        'has-file': selectedFile 
      }"
      @click="handleFileSelect"
      @drop="handleFileDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div class="file-drop-content">
        <div class="file-icon">📁</div>
        <p class="file-text">
          {{ selectedFile ? selectedFile.name : 'Choose file' }}
        </p>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".csv"
      @change="handleFileChange"
      style="display: none;"
    />
  </div>
</template>

<style scoped>
.file-upload-container {
  display: flex;
  gap: 0;
  align-items: stretch;
}

.file-drop-zone {
  flex: 1;
  border: 2px dashed var(--color-border);
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-drop-zone:hover,
.file-drop-zone.drag-over {
  border-color: var(--color-primary);
  background-color: var(--color-bg-primary);
}

.file-drop-zone.has-file {
  border-color: var(--color-border);
  background-color: var(--color-bg-primary);
}

.file-drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 24px;
  color: var(--color-warning);
}

.file-text {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 14px;
  font-weight: 500;
}

.file-drop-zone.has-file .file-text {
  color: var(--color-success);
}

/* Responsive Design */
@media (max-width: 768px) {
  .file-upload-container {
    flex-direction: column;
  }
  
  .file-drop-zone {
    border-radius: 6px;
    min-height: 60px;
    padding: 15px;
  }
}
</style>