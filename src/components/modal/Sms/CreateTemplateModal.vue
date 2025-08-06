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
  { id: 'create', label: 'Create Template' }
];

// Create form data
const createForm = ref({
  message: '',
  buttons: [] as Array<{ text: string; url: string }>
});

const openModal = () => {
  modalRef.value?.openModal();
  // Reset form when opening
  createForm.value = {
    message: '',
    buttons: []
  };
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

// Button management
const newButton = ref({ text: '', url: '' });

const addButton = () => {
  if (createForm.value.buttons.length >= 3) {
    console.error('Maximum 3 buttons allowed');
    return;
  }
  
  if (!newButton.value.text || !newButton.value.url) {
    console.error('Button text and URL are required');
    return;
  }
  
  createForm.value.buttons.push({
    text: newButton.value.text,
    url: newButton.value.url
  });
  
  // Reset new button form
  newButton.value = { text: '', url: '' };
};

const removeButton = (index: number) => {
  createForm.value.buttons.splice(index, 1);
};

const createTemplate = () => {
  if (!createForm.value.message) {
    console.error('Message is required');
    return;
  }

  const newBlock = {
    id: Date.now(),
    ...createForm.value,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Emit event
  // emit('create-template', newBlock);
  
  // Close modal
  closeModal();
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Create template"
    :tabs="tabs"
    icon="/bots/sms.png"
    max-width="650px"
    default-tab="create"
  >
         <template #default="{ activeTab }">
       <div v-if="activeTab === 'create'" class="create-media-content">
         <div class="form-group">
           <label for="media-message">Message</label>
           <textarea 
             id="media-message"
             v-model="createForm.message"
             placeholder="Enter message content"
             class="form-input"
             rows="4"
           ></textarea>
         </div>
        
        <!-- Button Management -->
        <div class="form-group">
          <label>Buttons (max 3)</label>
          
          <!-- Existing Buttons -->
          <div v-if="createForm.buttons.length > 0" class="existing-buttons">
            <div 
              v-for="(button, index) in createForm.buttons" 
              :key="index" 
              class="button-item"
            >
              <div class="button-info">
                <span class="button-text">{{ button.text }}</span>
                <span class="button-url">{{ button.url }}</span>
              </div>
              <button 
                type="button" 
                class="remove-button"
                @click="removeButton(index)"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
          
          <!-- Add New Button Form -->
          <div v-if="createForm.buttons.length < 3" class="add-button-form">
            <div class="button-input-row">
              <input 
                v-model="newButton.text"
                type="text"
                placeholder="Button text"
                class="form-input button-input"
              />
              <input 
                v-model="newButton.url"
                type="url"
                placeholder="Button URL"
                class="form-input button-input"
              />
              <button 
                type="button" 
                class="add-button-btn"
                @click="addButton"
                :disabled="!newButton.text || !newButton.url"
              >
                <i class="pi pi-plus"></i>
                Add
              </button>
            </div>
          </div>
          
          <small v-if="createForm.buttons.length >= 3" class="help-text">
            Maximum 3 buttons reached
          </small>
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
         @click="createTemplate"
         :disabled="isLoading || !createForm.message"
       >
         {{ isLoading ? 'Creating...' : 'Create Template' }}
       </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

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

/* Button Management Styles */
.existing-buttons {
  margin-bottom: 16px;
}

.button-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  margin-bottom: 8px;
}

.button-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.button-text {
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.button-url {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  word-break: break-all;
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