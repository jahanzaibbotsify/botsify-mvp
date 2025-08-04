<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { ref } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-media-block': [block: any];
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Dummy tabs for PublishModalLayout (not used in this simple form modal)
const tabs = [
  { id: 'create', label: 'Create Media Block' }
];

// Create form data
const createForm = ref({
  name: '',
  category: 'greeting',
  language: 'en',
  type: 'text',
  body: '',
  status: 'active'
});

// Options for dropdowns
const categories = [
  { value: 'greeting', label: 'Greeting' },
  { value: 'product', label: 'Product' },
  { value: 'support', label: 'Support' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'notification', label: 'Notification' }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' }
];

const types = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
  { value: 'catalog', label: 'Catalog' }
];

const openModal = () => {
  modalRef.value?.openModal();
  // Reset form when opening
  createForm.value = {
    name: '',
    category: 'greeting',
    language: 'en',
    type: 'text',
    body: '',
    status: 'active'
  };
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const createMediaBlock = () => {
  if (!createForm.value.name || !createForm.value.body) {
    console.error('Name and body are required');
    return;
  }

  const newBlock = {
    id: Date.now(),
    ...createForm.value,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Emit event
  emit('create-media-block', newBlock);
  
  // Close modal
  closeModal();
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Create Media Block"
    :tabs="tabs"
    max-width="650px"
    default-tab="create"
  >
    <template #default="{ activeTab }">
      <div v-if="activeTab === 'create'" class="create-media-content">
        <div class="form-group">
          <label for="media-name">Name</label>
          <input 
            id="media-name"
            v-model="createForm.name"
            type="text"
            placeholder="Enter media block name"
            class="form-input"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="media-category">Category</label>
            <select id="media-category" v-model="createForm.category" class="form-input">
              <option v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="media-language">Language</label>
            <select id="media-language" v-model="createForm.language" class="form-input">
              <option v-for="language in languages" :key="language.value" :value="language.value">
                {{ language.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="media-type">Type</label>
            <select id="media-type" v-model="createForm.type" class="form-input">
              <option v-for="type in types" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="media-status">Status</label>
            <select id="media-status" v-model="createForm.status" class="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="media-body">Body</label>
          <textarea 
            id="media-body"
            v-model="createForm.body"
            placeholder="Enter media block content"
            class="form-input"
            rows="4"
          ></textarea>
        </div>
      </div>
    </template>

    <template #actions>
      <button 
        class="action-button"
        @click="closeModal"
        :disabled="isLoading"
      >
        Cancel
      </button>
      
      <button 
        class="action-button primary" 
        @click="createMediaBlock"
        :disabled="isLoading || !createForm.name || !createForm.body"
      >
        {{ isLoading ? 'Creating...' : 'Create Media Block' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.create-media-content {
  padding: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.create-media-content .form-group {
  margin-bottom: 20px;
}

.create-media-content .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.create-media-content .form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.create-media-content .form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.create-media-content textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.action-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-family: inherit;
}

.action-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 