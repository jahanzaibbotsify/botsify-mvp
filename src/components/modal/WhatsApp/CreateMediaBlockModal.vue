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

// Step management
const currentStep = ref(1);
const totalSteps = 2;

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
  // Reset form and step when opening
  createForm.value = {
    name: '',
    category: 'greeting',
    language: 'en',
    type: 'text',
    body: '',
    status: 'active'
  };
  currentStep.value = 1;
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
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
        <!-- Step Indicator -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <span class="step-number">1</span>
            <span class="step-label">Form</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <span class="step-number">2</span>
            <span class="step-label">Preview</span>
          </div>
        </div>

        <!-- Step 1: Form -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="form-group">
            <label for="media-category">Category</label>
            <select id="media-category" v-model="createForm.category" class="form-input">
              <option v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="media-language">Language</label>
              <select id="media-language" v-model="createForm.language" class="form-input">
                <option v-for="language in languages" :key="language.value" :value="language.value">
                  {{ language.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="media-type">Type</label>
              <select id="media-type" v-model="createForm.type" class="form-input">
                <option v-for="type in types" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="media-status">Status</label>
            <select id="media-status" v-model="createForm.status" class="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

        <!-- Step 2: Preview -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-group">
            <label for="media-name">Media Block Name</label>
            <input 
              id="media-name"
              v-model="createForm.name"
              type="text"
              placeholder="Enter media block name"
              class="form-input"
            />
          </div>
          
          <div class="preview-section">
            <h4>Preview</h4>
            <div class="preview-container">
              <div class="preview-item">
                <strong>Category:</strong> {{ categories.find(c => c.value === createForm.category)?.label }}
              </div>
              <div class="preview-item">
                <strong>Language:</strong> {{ languages.find(l => l.value === createForm.language)?.label }}
              </div>
              <div class="preview-item">
                <strong>Type:</strong> {{ types.find(t => t.value === createForm.type)?.label }}
              </div>
              <div class="preview-item">
                <strong>Status:</strong> {{ createForm.status === 'active' ? 'Active' : 'Inactive' }}
              </div>
              <div class="preview-item">
                <strong>Body:</strong>
                <div class="preview-body">{{ createForm.body || 'No content' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <button 
        v-if="currentStep > 1"
        class="action-button"
        @click="prevStep"
        :disabled="isLoading"
      >
        Back
      </button>
      
      <button 
        v-if="currentStep === 1"
        class="action-button"
        @click="closeModal"
        :disabled="isLoading"
      >
        Cancel
      </button>
      
      <button 
        v-if="currentStep === 1"
        class="action-button primary" 
        @click="nextStep"
        :disabled="isLoading || !createForm.body"
      >
        Next
      </button>
      
      <button 
        v-if="currentStep === 2"
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

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  gap: 12px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid var(--color-border, #e5e7eb);
}

.step.active .step-number {
  background: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}

.step.completed .step-number {
  background: var(--color-secondary, #10b981);
  color: white;
  border-color: var(--color-secondary, #10b981);
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.step.active .step-label {
  color: var(--color-text-primary, #111827);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--color-border, #e5e7eb);
  margin: 0 8px;
}

.step-content {
  margin-top: 20px;
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

/* Preview Section */
.preview-section {
  margin-top: 20px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.preview-container {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
}

.preview-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.preview-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.preview-item strong {
  color: var(--color-text-primary, #111827);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.preview-body {
  margin-top: 8px;
  padding: 12px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: var(--radius-sm, 4px);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #111827);
  white-space: pre-wrap;
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
  
  .step-indicator {
    gap: 8px;
  }
  
  .step-line {
    width: 20px;
  }
}
</style> 