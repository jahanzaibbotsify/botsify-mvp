<script setup lang="ts">
import { ref } from 'vue';
import type { Attachment } from '@/types';

const props = defineProps<{
  onUpload: (files: Attachment[]) => void;
}>();

const dragActive = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  
  if (!e.dataTransfer?.files.length) return;
  handleFiles(Array.from(e.dataTransfer.files));
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  handleFiles(Array.from(input.files));
  input.value = ''; // Reset input
};

const handleFiles = async (files: File[]) => {
  const attachments: Attachment[] = [];
  
  // Define supported types for AI prompts (images and videos)
  const supportedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'
  ];
  
  for (const file of files) {
    // Validate file type
    if (!supportedTypes.includes(file.type)) {
      alert(`File ${file.name} is not supported. Please upload images (JPEG, PNG, GIF, WebP, SVG) or videos (MP4, MPEG, MOV, AVI, WebM).`);
      continue;
    }

    // // Validate file size (50MB limit for videos, 20MB for images)
    // const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    // const maxSizeMB = maxSize / (1024 * 1024);
    
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 20MB.`);
      continue;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    attachments.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      preview,
      isUploaded: false
    });
  }

  if (attachments.length > 0) {
    props.onUpload(attachments);
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = () => {
  dragActive.value = false;
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};
</script>

<template>
  <div 
    class="file-upload"
    :class="{ active: dragActive }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="openFileDialog"
  >
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*,video/*"
      class="file-input"
      @change="handleFileSelect"
    />
    
    <div class="upload-content">
      <div class="upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <div class="upload-text">
        <span class="primary-text">Choose images/videos or drag here</span>
        <span class="secondary-text">For AI prompt analysis • Max 20MB images, 50MB videos</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  width: 100%;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: all var(--transition-normal);
  background-color: var(--color-bg-secondary);
}

.file-upload.active {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tertiary);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.upload-icon {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.primary-text {
  color: var(--color-primary);
  font-weight: 500;
}

.secondary-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
</style>