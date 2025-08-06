<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { Input, Button, VueSelect } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
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
  'modal-closed': [];
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Store
const publishStore = usePublishStore();

// Dummy tabs for PublishModalLayout
const tabs = [
  { id: 'create', label: 'Create Template' }
];

// Views management (like in example)
const views = ref({
  fields: 'current',
  settings: 'hidden'
});

// Template data structure (based on example)
const template = ref({
  name: '',
  category: 'MARKETING',
  type: 'text',
  bodyIncludes: ['body'],
  header: 'text',
  footer_text: '',
  slides: [] as any[]
});

const block = ref({
  language: 'en',
  text: '',
  buttons: [
    {
      type: 'postback',
      text: '',
      value: ''
    }
  ]
});

const errors = ref({});

// Options (from example)
const template_types = [
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

const ctaOptions = [
  { label: 'Postback', value: 'postback' },
  { label: 'URL', value: 'url' },
  { label: 'Phone Number', value: 'phone' }
];

// Computed properties
const isAuthenticationCategory = computed(() => template.value.category === 'AUTHENTICATION');
const isMediaType = computed(() => template.value.type === 'media');
const isGenericType = computed(() => template.value.type === 'generic');

// Methods (from example)
const afterSelect = () => {
  // Handle after select
};

const onChangeCategory = () => {
  if (template.value.category === 'AUTHENTICATION') {
    // Auto-fill authentication template
    block.value.text = '{{1}} is your verification code. For security do not share this code.';
    template.value.footer_text = 'This code will expire in 1 minutes.';
    block.value.buttons[0].type = 'postback';
  }
};

const onChangeTemplateType = () => {
  // Handle template type change
  if (template.value.type === 'text') {
    template.value.bodyIncludes = ['body'];
  } else if (template.value.type === 'media') {
    template.value.bodyIncludes = ['body'];
  } else if (template.value.type === 'generic') {
    template.value.slides = [createSlide()];
  }
};

const onChangeCta = (buttonIndex: number, fieldIndex: number) => {
  // Handle CTA change
};

const checkForVariables = () => {
  // Check for variables in text
};

const addVariable = () => {
  const currentText = block.value.text;
  const nextVarNum = extractVariables(currentText).length + 1;
  const cursorPos = (document.querySelector('.body-textarea') as HTMLTextAreaElement)?.selectionStart || currentText.length;
  
  const newText = currentText.slice(0, cursorPos) + `{{${nextVarNum}}}` + currentText.slice(cursorPos);
  block.value.text = newText;
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

const createSlide = () => ({
  header: 'image',
  body: '',
  buttons: []
});

const goNext = () => {
  if (views.value.fields === 'current') {
    views.value.fields = 'hidden';
    views.value.settings = 'current';
  }
};

const goBack = () => {
  if (views.value.settings === 'current') {
    views.value.settings = 'hidden';
    views.value.fields = 'current';
  }
};

const isNextDisabled = () => {
  return !block.value.text || !template.value.category || !block.value.language;
};

const validateData = () => {
  return block.value.text && template.value.category && block.value.language;
};

const saveBlock = async () => {
  if (!validateData()) {
    return;
  }

  try {
    const templateData = {
      name: template.value.name || 'Template',
      category: template.value.category,
      language: block.value.language,
      type: template.value.type,
      body: block.value.text,
      footer: template.value.footer_text,
      buttons: block.value.buttons,
      bodyIncludes: template.value.bodyIncludes,
      slides: template.value.slides
    };

    const result = await publishStore.createTemplate(templateData);
    
    if (result.success) {
      window.$toast?.success('Template created successfully!');
      emit('create-template', templateData);
      closeModal();
    } else {
      window.$toast?.error('Failed to create template');
    }
  } catch (error) {
    console.error('Failed to create template:', error);
    window.$toast?.error('Failed to create template');
  }
};

const openModal = () => {
  modalRef.value?.openModal();
  // Reset form
  template.value = {
    name: '',
    category: 'MARKETING',
    type: 'text',
    bodyIncludes: ['body'],
    header: 'text',
    footer_text: '',
    slides: [] as any[]
  };
  block.value = {
    language: 'en',
    text: '',
    buttons: [{ type: 'postback', text: '', value: '' }]
  };
  views.value = { fields: 'current', settings: 'hidden' };
  errors.value = {};
};

const openModalWithData = (templateData: any) => {
  modalRef.value?.openModal();
  // Populate with template data
  // Implementation for cloning
};

const closeModal = () => {
  modalRef.value?.closeModal();
  emit('modal-closed');
};

const handleModalClose = () => {
  emit('modal-closed');
};

defineExpose({ openModal, closeModal, openModalWithData });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Template Editor"
    :tabs="tabs"
    max-width="1000px"
    default-tab="create"
    @back="closeModal"
    @close="handleModalClose"
  >
    <template #default="{ activeTab }">
      <div v-if="activeTab === 'create'" class="template-editor">
        <!-- TEMPLATE DATA TAB -->
        <div class="main-block-style" v-show="views.fields === 'current'">
          <legend>Template Editor</legend>
          <section class="current">
            <div class="row" id="form-fields">
              <div class="col-md-12 mt-2">
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label>Category</label>
                    <VueSelect
                      :model-value="template.category"
                      @update:model-value="(value: any) => { template.category = value; onChangeCategory(); }"
                      :options="categories"
                      placeholder="Select Template Category"
                      class="form-control"
                    />
                  </div>
                  <div class="form-group col-md-6">
                    <label>Language</label>
                    <VueSelect
                      :model-value="block.language"
                      @update:model-value="(value: any) => block.language = value"
                      :options="languages"
                      placeholder="Select Template Language"
                      class="form-control"
                    />
                  </div>
                </div>
                <div class="form-group" v-if="template.category != 'AUTHENTICATION'">
                  <label for="template_type">Media Block Type</label>
                  <VueSelect
                    :model-value="template.type"
                    @update:model-value="(value: any) => { template.type = value; onChangeTemplateType(); }"
                    :options="template_types"
                    placeholder="Select Template Type"
                    class="form-control"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- AUTHENTICATION TEMPLATE -->
        <template v-if="template.category == 'AUTHENTICATION'">
          <div class="row mt-2" id="form-fields" v-show="views.fields === 'current'">
            <div class="col-md-12 mt-2">
              <div class="form-group">
                <div class="dashed-border d-flex align-items-center justify-content-between p-2">
                  <p class="mb-0 px-3 font-weight-bold py-2 text-uppercase mr-2">button</p>
                  <div class="d-flex justify-content-between align-items-center px-3">
                    <VueSelect
                      :model-value="block.buttons[0].type"
                      @update:model-value="(value: any) => { block.buttons[0].type = value; onChangeCta(0, 0); }"
                      :options="ctaOptions"
                      placeholder="Select Call to action"
                      class="form-control px-2 py-1 ml-2"
                      style="width: 180px !important; height: 33px;"
                    />
                  </div>
                </div>
                
                <div class="dashed-border border-bottom-0 templateBodyDiv buttons-body p-4 bg-white border-top-0">
                  <div class="w-100 mb-4" v-for="(button, btnIndex) in block.buttons" :key="btnIndex">
                    <div class="templateBodyDiv mb-3">
                      <label class="form-label fw-semibold">Button Text</label>
                      <Input
                        v-model="button.text"
                        placeholder="Enter button text"
                        class="form-control"
                      />
                    </div>
                    <div class="templateBodyDiv mb-3">
                      <label class="form-label fw-semibold">Button Value</label>
                      <Input
                        v-model="button.value"
                        placeholder="Enter button value"
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- REGULAR TEMPLATE -->
        <template v-else>
          <div class="row mt-2" id="form-fields" v-show="views.fields === 'current'">
            <div class="col-md-12 mt-2">
              <!-- BODY INCLUDE SELECTORS -->
              <div v-show="template.type == 'media'" class="body-header-selector text-uppercase mb-3">
                <label class="btn" :class="template.bodyIncludes.includes('header') ? 'btn-theme-green':'btn-primary'" for="bheader">
                  <input type="checkbox" id="bheader" value="header" v-model="template.bodyIncludes">
                  <i v-if="template.bodyIncludes.includes('header')" class="fa fa-check"></i> header
                </label>
                <label class="btn" :class="template.bodyIncludes.includes('body') ? 'btn-theme-green':'btn-primary'" for="bbody">
                  <input type="checkbox" id="bbody" value="body" v-model="template.bodyIncludes" disabled>
                  <i class="fa fa-check"></i> body
                </label>
                <label class="btn" :class="template.bodyIncludes.includes('footer') ? 'btn-theme-green':'btn-primary'" for="bfooter">
                  <input type="checkbox" id="bfooter" value="footer" v-model="template.bodyIncludes">
                  <i v-if="template.bodyIncludes.includes('footer')" class="fa fa-check"></i> footer
                </label>
                <label class="btn" :class="template.bodyIncludes.includes('buttons') ? 'btn-theme-green':'btn-primary'" for="bbuttons">
                  <input type="checkbox" id="bbuttons" value="buttons" v-model="template.bodyIncludes">
                  <i v-if="template.bodyIncludes.includes('buttons')" class="fa fa-check"></i> buttons
                </label>
              </div>

              <!-- TEMPLATE HEADER -->
              <div v-if="template.bodyIncludes.includes('header')" class="form-group">
                <label>Header Type</label>
                <VueSelect
                  :model-value="template.header"
                  @update:model-value="(value: any) => template.header = value"
                  :options="[
                    { label: 'Text', value: 'text' },
                    { label: 'Image', value: 'image' },
                    { label: 'Video', value: 'video' },
                    { label: 'Document', value: 'document' }
                  ]"
                  placeholder="Select header type"
                  class="form-control"
                />
              </div>

              <!-- TEMPLATE BODY -->
              <div class="form-group">
                <label>Body Text</label>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Template Body</span>
                  <Button
                    variant="secondary"
                    size="small"
                    icon="pi pi-plus"
                    @click="addVariable"
                  >
                    Add Variable
                  </Button>
                </div>
                <textarea
                  v-model="block.text"
                  placeholder="Type message you want to send..."
                  class="form-control body-textarea"
                  rows="6"
                ></textarea>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <small class="text-muted">{{ block.text.length }}/1024 characters</small>
                  <i class="pi pi-globe text-success"></i>
                </div>
              </div>

              <!-- TEMPLATE FOOTER -->
              <div v-if="template.bodyIncludes.includes('footer')" class="form-group">
                <label>Footer Text</label>
                <Input
                  v-model="template.footer_text"
                  placeholder="Enter footer text"
                  class="form-control"
                />
              </div>

              <!-- TEMPLATE BUTTONS -->
              <div v-if="template.bodyIncludes.includes('buttons')" class="form-group">
                <label>Button Type</label>
                <VueSelect
                  :model-value="block.buttons[0].type"
                  @update:model-value="(value: any) => block.buttons[0].type = value"
                  :options="ctaOptions"
                  placeholder="Select button type"
                  class="form-control"
                />
                
                <div class="mt-3">
                  <label>Button Text</label>
                  <Input
                    v-model="block.buttons[0].text"
                    placeholder="Enter button text"
                    class="form-control"
                  />
                </div>
                
                <div class="mt-3">
                  <label>Button Value</label>
                  <Input
                    v-model="block.buttons[0].value"
                    placeholder="Enter button value"
                    class="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- SETTINGS TAB -->
        <div v-show="views.settings === 'current'" class="settings-section">
          <h3>Template Settings</h3>
          <div class="form-group">
            <label>Template Name</label>
            <Input
              v-model="template.name"
              placeholder="Enter template name"
              class="form-control"
            />
          </div>
          
          <!-- Preview section -->
          <div class="preview-section mt-4">
            <h4>Template Preview</h4>
            <div class="preview-container">
              <div class="preview-message">
                <div v-if="template.bodyIncludes.includes('header')" class="preview-header">
                  <strong v-if="template.header === 'text'">Header Text</strong>
                  <div v-else class="preview-media">
                    <i class="pi pi-image"></i>
                    <span>Media Preview</span>
                  </div>
                </div>
                
                <div class="preview-body">
                  <pre>{{ block.text || 'Body text will appear here...' }}</pre>
                </div>
                
                <div v-if="template.bodyIncludes.includes('footer')" class="preview-footer">
                  <small>{{ template.footer_text }}</small>
                </div>
                
                <div v-if="template.bodyIncludes.includes('buttons')" class="preview-buttons">
                  <Button variant="secondary" size="small">
                    {{ block.buttons[0].text || 'Button Text' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <Button 
        variant="secondary"
        size="medium"
        @click="views.fields === 'current' ? closeModal() : goBack()"
        :disabled="props.isLoading"
      >
        {{ views.fields === 'current' ? 'Cancel' : 'Back' }}
      </Button>
      
      <Button 
        variant="primary"
        size="medium"
        @click="views.settings === 'current' ? saveBlock() : goNext()"
        :loading="props.isLoading"
        :disabled="isNextDisabled()"
      >
        {{ views.settings === 'current' ? (props.isLoading ? 'Creating...' : 'Create Template') : 'Next' }}
      </Button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.template-editor {
  padding: var(--space-4);
}

/* Main Block Style */
.main-block-style {
  margin-bottom: var(--space-6);
}

.main-block-style legend {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

/* Form Layout */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

/* Body Header Selector */
.body-header-selector {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.body-header-selector .btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.body-header-selector .btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.body-header-selector .btn input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.body-header-selector .btn.btn-theme-green {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.body-header-selector .btn i {
  font-size: 12px;
}

/* Dashed Border */
.dashed-border {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

/* Template Body Div */
.templateBodyDiv {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

/* Body Textarea */
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
  font-family: inherit;
}

.body-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Settings Section */
.settings-section {
  padding: var(--space-4);
}

.settings-section h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Preview Section */
.preview-section {
  margin-top: var(--space-6);
}

.preview-section h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-container {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.preview-message {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.preview-header {
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.preview-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg-tertiary);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
}

.preview-media i {
  font-size: 24px;
  margin-bottom: var(--space-2);
}

.preview-body {
  margin-bottom: var(--space-3);
}

.preview-body pre {
  margin: 0;
  white-space: break-spaces;
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.preview-footer {
  margin-bottom: var(--space-3);
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.preview-buttons {
  display: flex;
  gap: var(--space-2);
}

/* Form Control */
.form-control {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 14px;
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Utility Classes */
.text-uppercase {
  text-transform: uppercase;
}

.mb-3 {
  margin-bottom: var(--space-3);
}

.mb-4 {
  margin-bottom: var(--space-4);
}

.mt-2 {
  margin-top: var(--space-2);
}

.mt-3 {
  margin-top: var(--space-3);
}

.mt-4 {
  margin-top: var(--space-4);
}

.p-2 {
  padding: var(--space-2);
}

.p-4 {
  padding: var(--space-4);
}

.px-2 {
  padding-left: var(--space-2);
  padding-right: var(--space-2);
}

.px-3 {
  padding-left: var(--space-3);
  padding-right: var(--space-3);
}

.py-1 {
  padding-top: var(--space-1);
  padding-bottom: var(--space-1);
}

.py-2 {
  padding-top: var(--space-2);
  padding-bottom: var(--space-2);
}

.mr-2 {
  margin-right: var(--space-2);
}

.ml-2 {
  margin-left: var(--space-2);
}

.w-100 {
  width: 100%;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.flex-wrap {
  flex-wrap: wrap;
}

.text-muted {
  color: var(--color-text-tertiary);
}

.text-success {
  color: var(--color-success);
}

.font-weight-bold {
  font-weight: 600;
}

.font-weight-semibold {
  font-weight: 500;
}

.mb-0 {
  margin-bottom: 0;
}

.border-bottom-0 {
  border-bottom: none;
}

.border-top-0 {
  border-top: none;
}

.bg-white {
  background-color: white;
}

/* VueSelect Styling */
:deep(.vue-select) {
  width: 100%;
}

:deep(.vue-select .vs__dropdown-toggle) {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  min-height: 40px;
}

:deep(.vue-select .vs__selected-options) {
  padding: 0;
}

:deep(.vue-select .vs__actions) {
  padding: 0;
}

:deep(.vue-select .vs__search) {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  color: var(--color-text-primary);
}

:deep(.vue-select .vs__dropdown-menu) {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

:deep(.vue-select .vs__dropdown-option) {
  padding: 8px 12px;
  color: var(--color-text-primary);
}

:deep(.vue-select .vs__dropdown-option--highlight) {
  background-color: var(--color-primary);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .body-header-selector {
    flex-direction: column;
  }
  
  .preview-buttons {
    flex-direction: column;
  }
  
  .d-flex {
    flex-direction: column;
  }
  
  .justify-content-between {
    justify-content: flex-start;
  }
}
</style> 