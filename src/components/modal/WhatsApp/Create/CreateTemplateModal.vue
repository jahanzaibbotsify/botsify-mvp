<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import VueSelect from "vue3-select-component";
import { ref, computed, watch } from "vue";

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
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Dummy tabs for PublishModalLayout
const tabs = [
  { id: 'create', label: 'Create Template' }
];

// Interfaces
interface ButtonItem {
  text: string;
  type: string;
  value?: string;
  actionType?: string;
}

interface HeaderSection {
  enabled: boolean;
  type: string;
  text: string;
  file: any;
}

interface BodySection {
  enabled: boolean;
  text: string;
}

interface FooterSection {
  enabled: boolean;
  text: string;
}

interface ButtonsSection {
  enabled: boolean;
  type: string;
  items: ButtonItem[];
}

interface CarouselItem {
  id: number;
  header: {
    type: string;
    file: any;
  };
  body: {
    text: string;
  };
  buttons: {
    type: string;
    items: ButtonItem[];
  };
}

interface Variables {
  header: number[];
  body: number[];
  footer: number[];
  buttons: number[];
  carousel: number[];
}

interface TemplateForm {
  name: string;
  category: string;
  language: string;
  type: string;
  header: HeaderSection;
  body: BodySection;
  footer: FooterSection;
  buttons: ButtonsSection;
  carouselItems: CarouselItem[];
  variables: Variables;
}

// Template form data
const templateForm = ref<TemplateForm>({
  name: '',
  category: '',
  language: '',
  type: '',
  // Dynamic sections
  header: {
    enabled: false,
    type: 'text',
    text: '',
    file: null
  },
  body: {
    enabled: true, // Always enabled
    text: ''
  },
  footer: {
    enabled: false,
    text: ''
  },
  buttons: {
    enabled: false,
    type: 'postback',
    items: []
  },
  // Carousel specific
  carouselItems: [],
  // Variables for step 2
  variables: {
    header: [],
    body: [],
    footer: [],
    buttons: [],
    carousel: []
  }
});

// Options for dropdowns
const templateTypes = [
  { label: 'Standard (text only)', value: 'text' },
  { label: 'Media & Interactive', value: 'media' },
  { label: 'Media Carousel', value: 'generic' }
];

const categories = [
  { label: 'MARKETING', value: 'MARKETING' },
  { label: 'Utility', value: 'UTILITY' },
  { label: 'Authentication', value: 'AUTHENTICATION' }
];

const languages = [
  { label: "English (en)", value: "en" },
  { label: "Spanish (es)", value: "es" },
  { label: "French (fr)", value: "fr" },
  { label: "German (de)", value: "de" },
  { label: "Italian (it)", value: "it" },
  { label: "Portuguese (pt)", value: "pt" },
  { label: "Russian (ru)", value: "ru" },
  { label: "Chinese (zh)", value: "zh" },
  { label: "Japanese (ja)", value: "ja" },
  { label: "Korean (ko)", value: "ko" }
];

const headerTypes = [
  { label: 'Text', value: 'text' },
  { label: 'Video', value: 'video' },
  { label: 'Image', value: 'image' },
  { label: 'Document', value: 'document' }
];

const buttonTypes = [
  { label: 'Postback', value: 'postback' },
  { label: 'Action', value: 'action' }
];

const actionTypes = [
  { label: 'Phone Number', value: 'phone' },
  { label: 'Web URL', value: 'url' }
];

// Computed properties
const isStandardType = computed(() => templateForm.value.type === 'text');
const isCarouselType = computed(() => templateForm.value.type === 'generic');
const isAuthenticationCategory = computed(() => templateForm.value.category === 'AUTHENTICATION');
const isMediaType = computed(() => templateForm.value.type === 'media');

const maxButtons = computed(() => {
  if (templateForm.value.buttons.type === 'postback') return 1;
  return 3;
});

const showSectionCheckboxes = computed(() => {
  return !isStandardType.value && !isCarouselType.value;
});

const bodyCharCount = computed(() => templateForm.value.body.text.length);
const maxBodyChars = 1024;

// Watch for category changes to auto-fill authentication template
watch(() => templateForm.value.category, (newCategory) => {
  if (newCategory === 'AUTHENTICATION') {
    templateForm.value.body.text = '{{1}} is your verification code. For security do not share this code.';
    templateForm.value.footer.text = 'This code will expire in 1 minutes.';
    templateForm.value.buttons.type = 'otp';
    templateForm.value.buttons.items = [{ text: '', type: 'otp' }];
  }
});

// Watch for type changes
watch(() => templateForm.value.type, (newType) => {
  if (newType === 'text') {
    // Reset all sections for standard type
    templateForm.value.header.enabled = false;
    templateForm.value.footer.enabled = false;
    templateForm.value.buttons.enabled = false;
  } else if (newType === 'generic') {
    // Initialize carousel
    templateForm.value.carouselItems = [createCarouselItem()];
  }
});

// Methods
const createCarouselItem = (): CarouselItem => ({
  id: Date.now(),
  header: {
    type: 'image',
    file: null
  },
  body: {
    text: ''
  },
  buttons: {
    type: 'postback',
    items: []
  }
});

const addCarouselItem = () => {
  if (templateForm.value.carouselItems.length < 10) {
    templateForm.value.carouselItems.push(createCarouselItem());
  }
};

const removeCarouselItem = (index: number) => {
  templateForm.value.carouselItems.splice(index, 1);
};

const addButton = () => {
  if (templateForm.value.buttons.items.length < maxButtons.value) {
    templateForm.value.buttons.items.push({
      text: '',
      type: templateForm.value.buttons.type,
      value: '',
      actionType: 'phone'
    });
  }
};

const removeButton = (index: number) => {
  templateForm.value.buttons.items.splice(index, 1);
};

const addCarouselButton = (carouselIndex: number) => {
  const carousel = templateForm.value.carouselItems[carouselIndex];
  if (carousel.buttons.items.length < maxButtons.value) {
    carousel.buttons.items.push({
      text: '',
      type: carousel.buttons.type,
      value: '',
      actionType: 'phone'
    });
  }
};

const removeCarouselButton = (carouselIndex: number, buttonIndex: number) => {
  templateForm.value.carouselItems[carouselIndex].buttons.items.splice(buttonIndex, 1);
};

const extractVariables = (text: string): number[] => {
  const regex = /\{\{(\d+)\}\}/g;
  const variables: number[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    variables.push(parseInt(match[1]));
  }
  return [...new Set(variables)].sort((a, b) => a - b);
};

const addVariable = () => {
  const currentText = templateForm.value.body.text;
  const nextVarNum = extractVariables(currentText).length + 1;
  const cursorPos = (document.querySelector('.body-textarea') as HTMLTextAreaElement)?.selectionStart || currentText.length;
  
  const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
  templateForm.value.body.text = newText;
};

const openModal = () => {
  modalRef.value?.openModal();
  // Reset form when opening
  templateForm.value = {
    name: '',
    category: '',
    language: '',
    type: '',
    header: { enabled: false, type: 'text', text: '', file: null },
    body: { enabled: true, text: '' },
    footer: { enabled: false, text: '' },
    buttons: { enabled: false, type: 'postback', items: [] },
    carouselItems: [],
    variables: { header: [], body: [], footer: [], buttons: [], carousel: [] }
  };
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const createTemplate = () => {
  if (!templateForm.value.name || !templateForm.value.body.text) {
    console.error('Name and body are required');
    return;
  }

  const templateData = {
    name: templateForm.value.name,
    category: templateForm.value.category,
    language: templateForm.value.language,
    type: templateForm.value.type,
    header: templateForm.value.header.enabled ? templateForm.value.header : null,
    body: templateForm.value.body,
    footer: templateForm.value.footer.enabled ? templateForm.value.footer : null,
    buttons: templateForm.value.buttons.enabled ? templateForm.value.buttons : null,
    carouselItems: templateForm.value.carouselItems,
    variables: templateForm.value.variables
  };

  emit('create-template', templateData);
  closeModal();
};

// Handle VueSelect values
const handleSelectChange = (key: string, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value;
  if (key.includes('.')) {
    const [section, field] = key.split('.');
    (templateForm.value as any)[section][field] = singleValue;
  } else {
    (templateForm.value as any)[key] = singleValue;
  }
};

// Handle button action type changes
const handleButtonActionTypeChange = (button: ButtonItem, value: any): void => {
  const singleValue = Array.isArray(value) ? value[0] : value;
  button.actionType = singleValue;
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Template Editor"
    :tabs="tabs"
    max-width="800px"
    default-tab="create"
  >
    <template #default="{ activeTab }">
      <div v-if="activeTab === 'create'" class="template-editor">
        <!-- Template Configuration -->
        <div class="template-config">
          <div class="config-row">
            <div class="form-group">
              <label>Category</label>
              <VueSelect
                :model-value="templateForm.category"
                @update:model-value="(value: any) => handleSelectChange('category', value)"
                :options="categories"
                placeholder="Select category"
                :multiple="false"
              />
            </div>
            
            <div class="form-group">
              <label>Language</label>
              <VueSelect
                :model-value="templateForm.language"
                @update:model-value="(value: any) => handleSelectChange('language', value)"
                :options="languages"
                placeholder="Select language"
                :multiple="false"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Media Block Type</label>
            <VueSelect
              :model-value="templateForm.type"
              @update:model-value="(value: any) => handleSelectChange('type', value)"
              :options="templateTypes"
              placeholder="Select template type"
              :multiple="false"
            />
          </div>
        </div>

        <!-- Body Section -->
        <div class="body-section">
          <div class="section-header">
            <h3>BODY</h3>
            <button 
              type="button"
              class="add-variable-btn"
              @click="addVariable"
            >
              <i class="pi pi-plus"></i>
              Add Variable
            </button>
          </div>
          
          <div class="form-group">
            <textarea 
              v-model="templateForm.body.text"
              placeholder="Type message you want to send..."
              class="body-textarea"
              rows="6"
            ></textarea>
            
            <div class="textarea-footer">
              <div class="char-counter" :class="{ 'error': bodyCharCount > maxBodyChars }">
                {{ bodyCharCount }}/{{ maxBodyChars }} charact
              </div>
              <div class="translate-icon">
                <i class="pi pi-globe"></i>
              </div>
            </div>
            
            <div v-if="!templateForm.body.text" class="validation-error">
              The template body field is required
            </div>
          </div>
        </div>

        <!-- Media Template Section (for carousel) -->
        <div v-if="isCarouselType" class="media-template-section">
          <h3>MEDIA TEMPLATE</h3>
          
          <div class="carousel-items">
            <div 
              v-for="(item, index) in templateForm.carouselItems" 
              :key="item.id"
              class="carousel-item"
            >
              <div class="carousel-header">
                <span>Item {{ index + 1 }}</span>
                <button 
                  v-if="templateForm.carouselItems.length > 1"
                  type="button"
                  class="remove-btn"
                  @click="removeCarouselItem(index)"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
              
              <!-- Carousel Header -->
              <div class="form-group">
                <label>HEADER</label>
                <VueSelect
                  :model-value="item.header.type"
                  @update:model-value="(value: any) => item.header.type = Array.isArray(value) ? value[0] : value"
                  :options="headerTypes.filter(h => h.value !== 'text' && h.value !== 'document')"
                  placeholder="Select header type"
                  :multiple="false"
                />
                
                <!-- Media placeholder -->
                <div class="media-placeholder">
                  <i class="pi pi-image"></i>
                  <span>Upload image or video</span>
                </div>
              </div>
              
              <!-- Carousel Body -->
              <div class="form-group">
                <label>Body Text</label>
                <textarea 
                  v-model="item.body.text"
                  placeholder="Enter body text (use {{1}}, {{2}} for variables)"
                  class="form-input"
                  rows="3"
                ></textarea>
              </div>
              
              <!-- Carousel Buttons -->
              <div class="form-group">
                <label>Button Type</label>
                <VueSelect
                  :model-value="item.buttons.type"
                  @update:model-value="(value: any) => item.buttons.type = Array.isArray(value) ? value[0] : value"
                  :options="buttonTypes"
                  placeholder="Select button type"
                  :multiple="false"
                />
              </div>
              
              <div class="buttons-list">
                <div 
                  v-for="(button, buttonIndex) in item.buttons.items" 
                  :key="buttonIndex"
                  class="button-item"
                >
                  <div class="button-header">
                    <span>Button {{ buttonIndex + 1 }}</span>
                    <button 
                      type="button"
                      class="remove-btn"
                      @click="removeCarouselButton(index, buttonIndex)"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                  
                  <div class="form-group">
                    <label>Button Text</label>
                    <input 
                      v-model="button.text"
                      type="text"
                      placeholder="Enter button text"
                      class="form-input"
                    />
                  </div>
                  
                  <div v-if="item.buttons.type === 'action'" class="form-group">
                    <label>Action Type</label>
                    <VueSelect
                      :model-value="button.actionType"
                      @update:model-value="(value: any) => handleButtonActionTypeChange(button, value)"
                      :options="actionTypes"
                      placeholder="Select action type"
                      :multiple="false"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label>{{ item.buttons.type === 'postback' ? 'Response' : 'Value' }}</label>
                    <input 
                      v-model="button.value"
                      type="text"
                      :placeholder="item.buttons.type === 'postback' ? 'Enter response' : 'Enter value'"
                      class="form-input"
                    />
                  </div>
                </div>
                
                <button 
                  v-if="item.buttons.items.length < maxButtons"
                  type="button"
                  class="add-button-btn"
                  @click="addCarouselButton(index)"
                >
                  <i class="pi pi-plus"></i>
                  Add Button
                </button>
              </div>
            </div>
            
            <button 
              v-if="templateForm.carouselItems.length < 10"
              type="button"
              class="add-carousel-btn"
              @click="addCarouselItem"
            >
              <i class="pi pi-plus"></i>
              Add Carousel Item
            </button>
          </div>
        </div>

        <!-- Template Name -->
        <div class="template-name-section">
          <div class="form-group">
            <label>Template Name</label>
            <input 
              v-model="templateForm.name"
              type="text"
              placeholder="Enter template name"
              class="form-input"
            />
          </div>
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
        :disabled="isLoading || !templateForm.name || !templateForm.body.text || bodyCharCount > maxBodyChars"
      >
        {{ isLoading ? 'Creating...' : 'Create Template' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.template-editor {
  padding: var(--space-4);
}

/* Template Configuration */
.template-config {
  margin-bottom: var(--space-6);
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

/* Body Section */
.body-section {
  margin-bottom: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.add-variable-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.add-variable-btn:hover {
  background: var(--color-primary-hover);
}

.body-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
}

.body-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-2);
  padding: 0 var(--space-2);
}

.char-counter {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.char-counter.error {
  color: var(--color-error);
}

.translate-icon {
  color: var(--color-success);
  font-size: 16px;
}

.validation-error {
  margin-top: var(--space-2);
  color: var(--color-error);
  font-size: 12px;
}

/* Media Template Section */
.media-template-section {
  margin-bottom: var(--space-6);
}

.media-template-section h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.carousel-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.carousel-item {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.carousel-header span {
  font-weight: 600;
  color: var(--color-text-primary);
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg-tertiary);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
  color: var(--color-text-tertiary);
}

.media-placeholder i {
  font-size: 24px;
  margin-bottom: var(--space-2);
}

.media-placeholder span {
  font-size: 14px;
}

/* Buttons List */
.buttons-list {
  margin-top: var(--space-3);
}

.button-item {
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.button-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.button-header span {
  font-weight: 600;
  color: var(--color-text-primary);
}

.remove-btn {
  padding: var(--space-1);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  transition: opacity var(--transition-normal);
}

.remove-btn:hover {
  opacity: 0.8;
}

.add-button-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-normal);
}

.add-button-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.add-carousel-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-normal);
  width: 100%;
  justify-content: center;
}

.add-carousel-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Template Name Section */
.template-name-section {
  margin-top: var(--space-6);
}

/* VueSelect Styling */
:deep(.control) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding-left: var(--space-2);
  height: 38px;
}

:deep(.vue3-select-component),
:deep(.vue3-select-component input) {
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .carousel-item {
    padding: var(--space-3);
  }
}
</style> 