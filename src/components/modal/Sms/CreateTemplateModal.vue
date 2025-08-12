<script setup lang="ts">
import { ref, onMounted } from "vue";
import { PublishModalLayout } from "@/components/ui";
import { Button, Textarea, Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { eventBus } from "@/utils/eventBus";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-template': [template: any];
  'update-template': [template: any];
  'modal-closed': [];
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const publishStore = usePublishStore();

// Form state
const form = ref({
  name: '',
  text: '',
  buttons: [] as Array<{
    api: number;
    error: boolean;
    payload: string;
    response: string;
    signature_hash: string;
    title: string;
    type: string;
    url: string;
    isEditing?: boolean;
  }>,
  image_url: '',
  attachment_link: ''
});

const errors = ref<{
  name?: string;
  text?: string;
  buttons: Record<number, string>;
  image_url?: string;
  attachment_link?: string;
}>({ buttons: {} });
const isSaving = ref(false);

// Dummy tabs for PublishModalLayout
const tabs = [
  { id: 'create', label: 'Create Template' }
];

// Track if we're in edit mode
const isEditMode = ref(false);
const editingTemplateId = ref<number | null>(null);

// Form validation
const validateForm = () => {
  errors.value = { buttons: {} };
  
  if (!form.value.name?.trim()) {
    errors.value.name = 'Template name is required';
  }
  
  if (!form.value.text?.trim()) {
    errors.value.text = 'Template text is required';
  }
  
  return Object.keys(errors.value).length === 1; // Only buttons object should remain
};

// Form reset
const resetForm = () => {
  form.value = {
    name: '',
    text: '',
    buttons: [],
    image_url: '',
    attachment_link: ''
  };
  errors.value = { buttons: {} };
};

// Button management
const addButton = (type: string) => {
  const newButton = {
    api: 0,
    error: false,
    payload: '',
    response: '',
    signature_hash: '',
    title: '',
    type: type,
    url: '',
    isEditing: true // Start in editing mode for new buttons
  };
  form.value.buttons.push(newButton);
};

const removeButton = (index: number) => {
  form.value.buttons.splice(index, 1);
};

// const updateButton = (index: number, field: string, value: any) => {
//   if (form.value.buttons[index]) {
//     (form.value.buttons[index] as any)[field] = value;
//   }
// };

const editButton = (index: number) => {
  form.value.buttons[index].isEditing = true;
};

const saveButtonEdit = (index: number) => {
  const button = form.value.buttons[index];
  if (!button.title?.trim()) {
    errors.value.buttons[index] = 'Button title is required';
    return;
  }

  if (button.type === 'url' && !button.url?.trim()) {
    errors.value.buttons[index] = 'URL is required for URL buttons';
    return;
  }

  // Validate URL format for URL buttons
  if (button.type === 'url' && button.url?.trim()) {
    try {
      new URL(button.url.trim());
    } catch {
      errors.value.buttons[index] = 'Please enter a valid URL (e.g., https://example.com)';
      return;
    }
  }

  if (button.type === 'phone_number' && !button.payload?.trim()) {
    errors.value.buttons[index] = 'Phone number is required for Phone Number buttons';
    return;
  }

  if (button.type === 'postback' && !button.response?.trim()) {
    errors.value.buttons[index] = 'Response text is required for Postback buttons';
    return;
  }

  // Clear any previous errors
  if (errors.value.buttons[index]) {
    delete errors.value.buttons[index];
  }

  // Save the button edit
  button.isEditing = false;
};

const cancelButtonEdit = (index: number) => {
  form.value.buttons[index].isEditing = false;
  // Clear errors for the button
  if (errors.value.buttons[index]) {
    delete errors.value.buttons[index];
  }
};

// Template operations
const createTemplate = async (templateData: any) => {
  try {
    const result = await publishStore.createSmsTemplate(templateData);
    return result;
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error };
  }
};

const updateTemplate = async (id: number, templateData: any) => {
  try {
    const result = await publishStore.createSmsTemplate({
      id,
      ...templateData
    });
    return result;
  } catch (error) {
    console.error('Failed to update template:', error);
    return { success: false, error };
  }
};

const openModal = () => {
  modalRef.value?.openModal();
  resetForm();
  isEditMode.value = false;
  editingTemplateId.value = null;
};

const openModalWithData = (templateData: any) => {
  modalRef.value?.openModal();
  
  // Set edit mode
  isEditMode.value = true;
  editingTemplateId.value = templateData.id;
  
  // Transform template data to match form structure
  const transformedData = {
    name: templateData.name || templateData.title || '',
    text: templateData.text || '',
    buttons: templateData.template_buttons?.map((tb: any) => ({
      api: tb.button?.api || 0,
      error: false,
      payload: tb.button?.payload || '',
      response: tb.button?.response || '',
      signature_hash: tb.button?.btn_slug || '',
      title: tb.button?.title || '',
      type: tb.button?.type || 'postback',
      url: tb.button?.url || '',
      isEditing: false
    })) || templateData.buttons || [],
    image_url: templateData.image_url || templateData.attachment_link || '',
    attachment_link: templateData.attachment_link || templateData.image_url || ''
  };
  
  // Prefill form with transformed data
  form.value = transformedData;
  
  // Reset errors
  errors.value = { buttons: {} };
  
  console.log('Opening with data for edit:', templateData);
  console.log('Form data after transformation:', form.value);
};

const closeModal = () => {
  modalRef.value?.closeModal();
  emit('modal-closed');
};

const handleModalClose = () => {
  emit('modal-closed');
};

const handleSave = async () => {
  console.log('SMS CreateTemplateModal - Form data before save:', form.value);
  
  if (!validateForm()) {
    return;
  }
  
  isSaving.value = true;
  
  try {
    if (isEditMode.value && editingTemplateId.value) {
      // Update existing template
      console.log('Updating template with ID:', editingTemplateId.value);
      const result = await updateTemplate(editingTemplateId.value, form.value);
      if (result?.success) {
        window.$toast?.success('Template updated successfully!');
        emit('update-template', { ...form.value, id: editingTemplateId.value });
        closeModal();
      } else {
        window.$toast?.error(result?.error || 'Failed to update template');
      }
    } else {
      // Create new template
      console.log('Creating new template');
      const result = await createTemplate(form.value);
      if (result?.success && 'data' in result && result.data) {
        window.$toast?.success('Template created successfully!');
        emit('create-template', result.data);
        closeModal();
      } else {
        window.$toast?.error(result?.error || 'Failed to create template');
      }
    }
  } catch (error) {
    console.error('Failed to save template:', error);
    window.$toast?.error('An error occurred while saving the template');
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  closeModal();
};

// Button type options
const buttonTypes = [
  { label: 'Text', value: 'postback' as const },
  { label: 'URL', value: 'url' as const },
  { label: 'Phone Number', value: 'phone_number' as const }
];

// Event listeners
onMounted(() => {
  // Listen for template creation events
  eventBus.on('template:created', (data) => {
    console.log('Template created:', data);
    // Refresh templates in parent
    eventBus.emit('sms:template:refresh');
  });
});

defineExpose({ openModal, closeModal, openModalWithData });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    :title="isEditMode ? 'Edit sms template' : 'SMS template'"
    icon="/bots/sms.png"
    :tabs="tabs"
    max-width="1000px"
    default-tab="create"
    @back="closeModal"
    @close="handleModalClose"
  >
    <template #default="{ activeTab }">
      <div v-if="activeTab === 'create'" class="template-editor">
        <div class="form-layout">
          <!-- Left Side: Name and Message -->
          <div class="left-section">
            <div class="form-section">
              <!-- Template Name -->
              <div class="form-group">
                <label for="template-name">Template name</label>
                <Input
                  id="template-name"
                  v-model="form.name"
                  placeholder="Enter template name"
                  :error="errors.name"
                />
              </div>

              <!-- Template Text -->
              <div class="form-group">
                <label for="template-text">Message text</label>
                <Textarea
                  id="template-text"
                  v-model="form.text"
                  placeholder="Enter your message content here..."
                  :rows="6"
                  :error="errors.text"
                />
              </div>
            </div>
          </div>

          <!-- Right Side: Button Management -->
          <div class="right-section">
            <div class="form-section">
              <div class="buttons-header">
                <label>Buttons (max 3)</label>
                <div class="button-actions">
                  <Button
                    v-for="type in buttonTypes"
                    :key="type.value"
                    variant="primary"
                    size="small"
                    @click="addButton(type.value)"
                    :disabled="form.buttons.length >= 3"
                  >
                    <i class="pi pi-plus"></i>
                    {{ type.label }}
                  </Button>
                </div>
              </div>

              <!-- Buttons List -->
              <div v-if="form.buttons.length > 0" class="buttons-list">
                <div
                  v-for="(button, index) in form.buttons"
                  :key="index"
                  class="button-item"
                >
                  <div class="button-header">
                    <div class="button-info">
                      <span class="button-type-badge">{{ button.type.replace('_', ' ').toUpperCase() }}</span>
                      <span class="button-title">{{ button.title || 'Untitled Button' }}</span>
                    </div>
                    <div class="button-controls">
                      <Button
                        variant="secondary"
                        size="small"
                        icon="pi pi-pencil"
                        iconOnly
                        @click="editButton(index)"
                        title="Edit button"
                        class="edit-btn"
                      />
                      <Button
                        variant="error-outline"
                        size="small"
                        icon="pi pi-trash"
                        iconOnly
                        @click="removeButton(index)"
                        title="Remove button"
                        class="delete-btn"
                      />
                    </div>
                  </div>

                  <!-- Button Fields (shown when editing) -->
                  <div v-if="button.isEditing" class="button-fields">
                    <!-- Button Title -->
                    <div class="field-group">
                      <label>Button title</label>
                      <Input
                        v-model="button.title"
                        placeholder="Enter button title"
                        :error="errors.buttons[index]"
                      />
                    </div>

                    <!-- Button Type Specific Fields -->
                    <div v-if="button.type === 'url'" class="field-group">
                      <label>URL</label>
                      <Input
                        v-model="button.url"
                        type="url"
                        placeholder="https://example.com"
                        :error="errors.buttons[index]"
                      />
                    </div>

                    <div v-if="button.type === 'phone_number'" class="field-group">
                      <label>Phone number</label>
                      <Input
                        v-model="button.payload"
                        type="tel"
                        placeholder="+1234567890"
                        :error="errors.buttons[index]"
                      />
                    </div>

                    <div v-if="button.type === 'postback' && !isEditMode" class="field-group">
                      <label>Response text</label>
                      <Textarea
                        v-model="button.response"
                        placeholder="Enter response text"
                        :rows="2"
                        :error="errors.buttons[index]"
                      />
                    </div>

                    <div class="button-actions-footer">
                      <Button
                        variant="primary"
                        size="small"
                        @click="saveButtonEdit(index)"
                      >
                        Save
                      </Button>
                      <Button
                        variant="error-outline"
                        size="small"
                        @click="cancelButtonEdit(index)"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Buttons Message -->
              <div v-else class="no-buttons">
                <div class="no-buttons-content">
                  <i class="pi pi-plus-circle"></i>
                  <p>No buttons added yet</p>
                  <p class="hint">Click the buttons above to add interactive elements to your template</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-action-buttons">
        <Button 
          variant="secondary"
          size="medium"
          @click="handleCancel"
          :disabled="props.isLoading"
        >
          Cancel
        </Button>
        
        <Button 
          variant="primary"
          size="medium"
          @click="handleSave"
          :loading="isSaving"
          :disabled="isSaving"
        >
          {{ isSaving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update template' : 'Create template') }}
        </Button>
      </div>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.template-editor {
  padding: var(--space-4);
}

.form-layout {
  display: flex;
  gap: var(--space-4);
}

.left-section, .right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.form-input {
  font-family: inherit;
  font-size: 0.875rem;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.error {
  border-color: var(--color-error);
}


/* Buttons Section */
.buttons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.button-actions {
  display: flex;
  gap: var(--space-2);
}

.buttons-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.button-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
}

.button-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.button-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.button-type-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.button-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px; /* Adjust as needed */
}

.button-controls {
  display: flex;
  gap: var(--space-1);
}

.edit-btn, .delete-btn {
  padding: var(--space-1);
}

.button-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.button-actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.no-buttons {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-secondary);
  font-style: italic;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}

.no-buttons-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.no-buttons-content i {
  font-size: 2rem;
  color: var(--color-primary);
}

.no-buttons-content p {
  margin: 0;
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-layout {
    flex-direction: column;
  }

  .left-section, .right-section {
    width: 100%;
  }

  .buttons-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .button-actions {
    flex-wrap: wrap;
  }
}
</style> 