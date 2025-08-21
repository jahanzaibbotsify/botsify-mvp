<script setup lang="ts">
import { ref, computed } from "vue";
import { PublishModalLayout } from "@/components/ui";
import { Button, Textarea, Input } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import type { SmsTemplate } from "@/types/publish";
import { publishApi } from "@/services/publishApi";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-template': [template: SmsTemplate];
  'update-template': [template: SmsTemplate];
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
    isNew?: boolean;
  }>,
  image_url: '',
  attachment_link: ''
});

// Computed errors - reactive validation
const errors = computed(() => {
  const errs: {
    name?: string;
    text?: string;
    buttons: Record<number, {
      title?: string;
      url?: string;
      payload?: string;
      response?: string;
    }>;
  } = { buttons: {} };

  // // Validate name + text
  // if (!form.value.name.trim()) {
  //   errs.name = "Template name is required";
  // }
  // if (!form.value.text.trim()) {
  //   errs.text = "Message text is required";
  // }

  // Validate buttons
  form.value.buttons.forEach((button, index) => {
    const buttonErrors: {
      title?: string;
      url?: string;
      payload?: string;
      response?: string;
    } = {};

    if (!button.title?.trim()) {
      buttonErrors.title = "Button title is required";
    }
    if (button.type === "url") {
      if (!button.url?.trim()) {
        buttonErrors.url = "URL is required for URL buttons";
      } else {
        // console.log(button.url, "button.url")
        // try {
        //   new URL(button.url.trim());
        // } catch {
        //   buttonErrors.url = "Please enter a valid URL";
        // }

        const basicPattern = /^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i;
        if (!basicPattern.test(button.url.trim())) {
          buttonErrors.url = "Please enter a valid URL";
        }

        try {
          const url = new URL(button.url.trim());

          // Only allow http/https
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            buttonErrors.url = "Please enter a valid URL";
          }

          // return true;
        } catch {
          buttonErrors.url = "Please enter a valid URL";
        }
      }
    }
    if (button.type === "phone_number" && !button.payload?.trim()) {
      buttonErrors.payload = "Phone number is required for Phone Number buttons";
    }
    if (button.type === "postback" && !button.response?.trim()) {
      buttonErrors.response = "Response text is required for Postback buttons";
    }

    // Only add button errors if there are any
    if (Object.keys(buttonErrors).some(key => buttonErrors[key as keyof typeof buttonErrors])) {
      errs.buttons[index] = buttonErrors;
    }
  });

  return errs;
});

// Computed property for save button disabled state
const isSaveButtonDisabled = computed(() => {
  if (isSaving.value) return true;
  
  // Check if there are any button errors
  const hasButtonErrors = Object.values(errors.value.buttons).some(buttonErrors => 
    buttonErrors && Object.values(buttonErrors).some(error => error)
  );
  
  return !!(!form.value.name.trim() || !form.value.text.trim() || hasButtonErrors);
});

const isSaving = ref(false);

// Dummy tabs for PublishModalLayout
const tabs = [
  { id: 'create', label: 'Create Template' }
];

// Track if we're in edit mode
const isEditMode = ref(false);
const editingTemplateId = ref<number | null>(null);

// Form reset
const resetForm = () => {
  form.value = {
    name: '',
    text: '',
    buttons: [],
    image_url: '',
    attachment_link: ''
  };
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
    isEditing: true, // Start in editing mode for new buttons
    isNew: true // Mark as new button
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

const toggleButton = (index: number) => {
  const button = form.value.buttons[index];
  
  // Simply toggle editing state - validation is handled by computed errors
  button.isEditing = !button.isEditing;
};


// Template operations
const createTemplate = async (templateData: Partial<SmsTemplate>) => {
  try {
    // Check if there are any button validation errors
    const hasButtonErrors = Object.values(errors.value.buttons).some(buttonErrors => 
      buttonErrors && Object.values(buttonErrors).some(error => error)
    );
    
    if (hasButtonErrors) {
      return { success: false, error: 'Please fix the errors in the buttons' };
    }
    const result = await publishApi.createTemplate(templateData, 'sms');
    return result;
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error };
  }
};

const updateTemplate = async (id: number, templateData: Partial<SmsTemplate>) => {
  try {
    const payload = {id, ...templateData}
    const result = await publishApi.createTemplate(payload, 'sms');
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
      isEditing: false,
      isNew: false // Mark as existing button
    })) || templateData.buttons || [],
    image_url: templateData.image_url || templateData.attachment_link || '',
    attachment_link: templateData.attachment_link || templateData.image_url || ''
  };
  
  // Prefill form with transformed data
  form.value = transformedData;
};

const closeModal = () => {
  modalRef.value?.closeModal();
  emit('modal-closed');
};

const handleModalClose = () => {
  emit('modal-closed');
};

const handleSave = async () => {
  if(!form.value.text.trim()){
    return;
  }
  if(!form.value.name.trim()){
    return;
  }
  
  // Check if there are any button errors
  const hasButtonErrors = Object.values(errors.value.buttons).some(buttonErrors => 
    buttonErrors && Object.values(buttonErrors).some(error => error)
  );
  
  if (hasButtonErrors) {
    return;
  }
  
  isSaving.value = true;
  
  try {
    if (isEditMode.value && editingTemplateId.value) {
      // Update existing template
      const result = await updateTemplate(editingTemplateId.value, form.value as Partial<SmsTemplate>);
      if (result?.success) {
        publishStore.smsTemplates.invalidate();
        window.$toast?.success('Template updated successfully!');
        emit('update-template', { 
          ...form.value, 
          id: editingTemplateId.value,
          type: 'sms',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as SmsTemplate);
        closeModal();
      } else {
        window.$toast?.error('Failed to update template');
      }
    } else {
      // Create new template
      const result = await createTemplate(form.value as SmsTemplate);
      if (result?.success && 'data' in result && result.data) {
        publishStore.smsTemplates.invalidate();
        window.$toast?.success('Template created successfully!');
        emit('create-template', result.data as SmsTemplate);
        closeModal();
      } else {
        window.$toast?.error('Failed to create template');
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
  { label: 'Text', value: 'postback' },
  { label: 'URL', value: 'url' },
  { label: 'Phone Number', value: 'phone_number' }
];

defineExpose({ openModal, closeModal, openModalWithData });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    :title="isEditMode ? 'Edit SMS template' : 'SMS template'"
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
                <Input
                  label="Template name"
                  id="template-name"
                  v-model="form.name"
                  placeholder="Enter template name"
                  :error="errors.name"
                />
              </div>

              <!-- Template Text -->
              <div class="form-group">
                <Textarea
                  label="Message text"
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
                <div class="action-buttons">
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
                  :class="{ 'has-error': errors.buttons[index] && Object.values(errors.buttons[index]).some(error => error) && !button.isEditing }"
                  >
                  <div class="button-header">
                    <div class="button-info">
                      <span class="button-type-badge">{{ button.type.replace('_', ' ').toUpperCase() }}</span>
                      <span class="button-title">{{ button.title || 'Untitled Button' }}</span>
                    </div>
                    <div class="action-buttons">
                      <Button
                        variant="secondary"
                        size="small"
                        :icon="button.isEditing ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                        iconOnly
                        @click="toggleButton(index)"
                        title="Edit button"
                      />
                      <Button
                        variant="error-outline"
                        size="small"
                        icon="pi pi-trash"
                        iconOnly
                        @click="removeButton(index)"
                        title="Remove button"
                      />
                    </div>
                  </div>

                  <!-- Button Fields (shown when editing) -->
                  <div v-if="button.isEditing" class="button-fields">
                    <!-- Button Title -->
                    <div class="form-group">
                      <Input
                        label="Button title"
                        v-model="button.title"
                        placeholder="Enter button title"
                        />
                        <!-- :error="errors.buttons[index]?.title" -->
                    </div>

                    <!-- Button Type Specific Fields -->
                    <div v-if="button.type === 'url'" class="form-group">
                      <Input
                        label="URL"
                        v-model="button.url"
                        type="url"
                        placeholder="https://example.com"
                        :error="button.url.trim() != '' ? errors.buttons[index]?.url : ''"
                        />
                    </div>

                    <div v-if="button.type === 'phone_number'" class="form-group">
                      <Input
                        label="Phone number"
                        v-model="button.payload"
                        type="tel"
                        placeholder="+1234567890"
                        />
                        <!-- :error="errors.buttons[index]?.payload" -->
                    </div>

                    <div v-if="button.type === 'postback' && (!isEditMode || button.isNew)" class="form-group">
                      <Textarea
                        label="Response text"
                        v-model="button.response"
                        placeholder="Enter response text"
                        :rows="2"
                        />
                        <!-- :error="errors.buttons[index]?.response" -->
                    </div>

                    <div class="action-buttons">
                      <!-- <Button
                        variant="primary"
                        size="small"
                        @click="saveButtonEdit(index)"
                      >
                        Save
                      </Button> -->
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
          :disabled="isSaveButtonDisabled"
        >
          {{ isSaving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update template' : 'Create template') }}
        </Button>
      </div>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.template-editor {
  padding: var(--space-3);
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

/* Buttons Section */
.buttons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
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
  transition: border-color var(--transition-normal);
}

.button-item.has-error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
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



.button-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  

}
</style> 