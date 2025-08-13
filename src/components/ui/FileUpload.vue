<script setup lang="ts">
import { Attachment } from '@/types';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toast-notification'

const $toast = useToast({ position: 'top-right' })

const props = defineProps<{
  modelValue?: File | File[] | null;
  accept: string; // comma-separated types
  multiple?: boolean;
  maxSizeMB?: number;
  enablePreview?: boolean;
  emitRawFile?: boolean; // emit File or Attachment[]
  text: string;
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void;
  (e: 'upload', value: Attachment[]): void;
}>();

const dragActive = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const maxSizeBytes = computed(() => (props.maxSizeMB || 20) * 1024 * 1024);

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = () => {
  dragActive.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  if (!e.dataTransfer?.files.length) return;
  handleFiles(Array.from(e.dataTransfer.files));
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  handleFiles(Array.from(target.files));
  target.value = '';
};

const handleFiles = async (files: File[]) => {
  const validFiles: File[] = [];

  for (const file of files) {
    const isAccepted = props.accept
      .split(',')
      .some(type => {
        const t = type.trim()
        return t.endsWith('/*')
          ? file?.type?.startsWith(t.slice(0, -1)) // e.g. image/ from image/*
          : file.type === t || file.name.endsWith(t)
      })
    if (!isAccepted) {
      $toast.error(`File "${file.name}" is not supported.`);
      continue;
    }

    if (file.size > maxSizeBytes.value) {
      $toast.error(`File "${file.name}" exceeds the maximum size of ${props.maxSizeMB || 20}MB.`);
      continue;
    }

    validFiles.push(file);
  }

  if (validFiles.length === 0) {
    emit('update:modelValue', null);
    return;
  }

  if (props.emitRawFile) {
    emit('update:modelValue', props.multiple ? validFiles : validFiles[0]);
    return;
  }

  const attachments: Attachment[] = validFiles.map(file => {
    const preview = props.enablePreview && file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : undefined;

    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      preview,
      isUploaded: false,
    };
  });

  emit('update:modelValue', props.multiple ? validFiles : validFiles[0]);
  emit('upload', attachments);
};
</script>

<template>
  <div
    class="file-upload"
    :class="{ 
      active: dragActive,
      'file-upload--error': props.error 
    }"
    @click="openFileDialog"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="fileInputRef"
      type="file"
      class="file-input"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
    />

    <div class="upload-content">
      <div class="upload-icon" data-v-760f4705=""><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-760f4705=""><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-760f4705=""></path><polyline points="17 8 12 3 7 8" data-v-760f4705=""></polyline><line x1="12" y1="3" x2="12" y2="15" data-v-760f4705=""></line></svg></div>
      <div class="upload-text">
        <span class="primary-text">Click or drag files to upload</span>
        <span class="secondary-text">
          {{ text }}
        </span>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="props.error" class="file-upload-error">
      {{ props.error }}
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

.file-upload--error {
  border-color: var(--color-error);
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

.file-upload-error {
  margin-top: var(--space-2);
  font-size: 0.75rem;
  color: var(--color-error);
  line-height: 1.4;
}
</style>