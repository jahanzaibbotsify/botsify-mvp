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
  emit('create-template', newBlock);
  
  // Close modal
  closeModal();
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Create Template"
    :tabs="tabs"
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
          <label>Buttons (Max 3)</label>
          
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

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm, 4px);
  background: var(--color-error, #ef4444);
  color: white;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
  margin-left: 12px;
}

.remove-button:hover {
  background: var(--color-error-hover, #dc2626);
}

.add-button-form {
  margin-top: 12px;
}

.button-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: end;
}

.button-input {
  margin-bottom: 0;
}

.add-button-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
  white-space: nowrap;
}

.add-button-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.add-button-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-button-btn i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .button-input-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .button-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .remove-button {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style> 