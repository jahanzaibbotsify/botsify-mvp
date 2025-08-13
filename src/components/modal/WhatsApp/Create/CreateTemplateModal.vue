<script setup lang="ts">
import { ref, computed } from "vue";
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { Button, VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import TemplateConfiguration from "./TemplateConfiguration.vue";
import AuthenticationTemplate from "./AuthenticationTemplate.vue";
import CarouselEditor from "./CarouselEditor.vue";
import ParameterEditor from "./ParameterEditor.vue";
import EmojiTextarea from "./EmojiTextarea.vue";
import ButtonsEditor from "./ButtonsEditor.vue";

// Props
interface Props {
  isLoading?: boolean;
  botService?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  botService: 'facebookAPI'
});

// Emits
const emit = defineEmits<{
  'create-template': [template: any];
  'modal-closed': [];
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Store
const store = useWhatsAppTemplateStore();

// Add ref for ParameterEditor to access validation state
const parameterEditorRef = ref<InstanceType<typeof ParameterEditor> | null>(null);

// Dummy tabs for PublishModalLayout
const tabs = [
  { id: 'create', label: 'Create Template' }
];

const openModal = () => {
  modalRef.value?.openModal();
  store.resetForm();
};

const openModalWithData = (templateData: any) => {
  modalRef.value?.openModal();
  console.log('Opening modal with cloned data:', templateData);
  
  if (templateData && templateData.template && templateData.block) {
    // Store the original cloned data to restore after initialization
    const originalTemplate = { ...templateData.template };
    const originalBlock = { ...templateData.block };
    
    // Populate the store with cloned data
    store.template = { ...store.template, ...templateData.template };
    store.block = { ...store.block, ...templateData.block };
    
    // Reset views to show the fields step
    store.views.fields = 'current';
    store.views.settings = 'hidden';
    
    // Call onChangeCategory and onChangeTemplateType to ensure proper initialization
    store.onChangeCategory();
    store.onChangeTemplateType();
    
    // Restore the cloned data after initialization to prevent override
    store.template = { ...store.template, ...originalTemplate };
    store.block = { ...store.block, ...originalBlock };
    
    if(['button', 'image', 'video', 'document'].includes(store.template.type)){
      store.template.type = 'media';
      if (store.template.header !== 'text') {
        store.errors.header = '';
      } else if (store.template.header === 'text' && !store.template.header_text) {
        store.errors.header = 'The template header field is required';
      }
    }
    
    // Check for variables after populating data
    if (templateData.template.header_text) {
      store.checkForVariables('header');
    }
    if (templateData.block.text) {
      store.checkForVariables('body');
    }
    
    // Check for button variables
    if (templateData.block.buttons && templateData.block.buttons.length > 0) {
      templateData.block.buttons.forEach((button: any, index: number) => {
        store.checkForVariables(`button_${index}`);
      });
    }
    
    // Check for slide variables if it's a carousel
    if (templateData.template.type === 'generic' && templateData.block.slides) {
      templateData.block.slides.forEach((slide: any, slideIndex: number) => {
        if (slide.title) {
          store.checkForVariables('slider', slideIndex);
        }
        if (slide.buttons) {
          slide.buttons.forEach((button: any, buttonIndex: number) => {
            store.checkForVariables(`button_${buttonIndex}`, slideIndex);
          });
        }
      });
    }
  }
};

const closeModal = () => {
  modalRef.value?.closeModal();
  emit('modal-closed');
};

const handleModalClose = () => {
  emit('modal-closed');
};

const handleSave = async () => {
  const result = await store.saveBlock();
  if (result?.success) {
    emit('create-template', result.data);
    closeModal();
  }
};

// Computed property to check if save button should be disabled
const isSaveButtonDisabled = computed(() => {
  // If we're on the settings step, check for validation errors
  if (store.views.settings === 'current') {
    return parameterEditorRef.value?.hasValidationErrors || store.isSaving;
  }
  // On other steps, use the store's logic
  return store.isNextDisabled() || store.isSaving;
});

defineExpose({ openModal, closeModal, openModalWithData });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Whatsapp template"
    icon="/bots/whatsapp.png"
    :tabs="tabs"
    max-width="1200px"
    default-tab="create"
    @back="closeModal"
    @close="handleModalClose"
  >
    <template #default="{ activeTab }">
      <div v-if="activeTab === 'create'" class="template-editor">
        <!-- Step 1: Template Configuration -->
        <div v-if="store.views.fields === 'current'" class="step-content">
          <div class="main-block-style">
            <section class="current">
              <div class="form-fields">
                <div class="form-section">
                  <!-- Template Configuration -->
                  <TemplateConfiguration />
                  
                  <!-- Authentication Template -->
                  <AuthenticationTemplate v-if="store.isAuthenticationCategory" />
                  
                  <!-- Regular Template -->
                  <template v-else>
                    <div class="form-section">
                      <!-- BODY INCLUDE SELECTORS -->
                      <div v-show="store.template.type == 'media'" class="body-header-selector">
                        <label class="selector-btn" :class="store.template.bodyIncludes.includes('header') ? 'active':'default'" for="bheader">
                          <input type="checkbox" id="bheader" value="header" v-model="store.template.bodyIncludes">
                          <i v-if="store.template.bodyIncludes.includes('header')" class="fa fa-check"></i> header
                        </label>
                        <label class="selector-btn" :class="store.template.bodyIncludes.includes('body') ? 'active':'default'" for="bbody">
                          <input type="checkbox" id="bbody" value="body" v-model="store.template.bodyIncludes" disabled>
                          <i class="fa fa-check"></i> body
                        </label>
                        <label class="selector-btn" :class="store.template.bodyIncludes.includes('footer') ? 'active':'default'" for="bfooter">
                          <input type="checkbox" id="bfooter" value="footer" v-model="store.template.bodyIncludes">
                          <i v-if="store.template.bodyIncludes.includes('footer')" class="fa fa-check"></i> footer
                        </label>
                        <label class="selector-btn" :class="store.template.bodyIncludes.includes('buttons') ? 'active':'default'" for="bbuttons">
                          <input type="checkbox" id="bbuttons" value="buttons" v-model="store.template.bodyIncludes">
                          <i v-if="store.template.bodyIncludes.includes('buttons')" class="fa fa-check"></i> buttons
                        </label>
                      </div>

                      <!-- TEMPLATE HEADER -->
                      <div class="form-group" v-show="store.template.type == 'media' && store.template.bodyIncludes.includes('header')">
                        <div class="header-container">
                          <p class="header-label">header</p>
                          <div class="header-controls" :class="store.template.header == 'text' ? 'justify-between' : 'justify-end'">
                            <template v-if="store.template.header == 'text'">
                              <Button 
                                v-if="store.canAddVariable('header')" 
                                type="button" 
                                @click="store.addVariable('header')"
                                variant="primary"
                                size="small"
                              >
                                Add variable <i class="fa fa-plus"></i>
                              </Button>
                              <Button 
                                v-else 
                                type="button"
                                variant="secondary"
                                size="small"
                                disabled
                              >
                                Add variable <i class="fa fa-plus"></i>
                              </Button>
                            </template>
                            <VueSelect
                              @close="store.afterSelect"
                              :clearable="false"
                              v-model="store.template.header"
                              :reduce="(h_type: any) => h_type.value"
                              placeholder="Select Header Type"
                              :options="[
                                {label: 'Text', value: 'text'},
                                {label: 'Image', value: 'image'},
                                {label: 'Video', value: 'video'},
                                {label: 'Document', value: 'document'}
                              ]"
                              @change="store.onChangeHeaderType"
                            />
                          </div>
                        </div>
                        <div class="header-body" :class="store.template.header != 'text' ? 'text-center' : ''">
                          <textarea 
                            v-if="store.template.header == 'text'" 
                            v-model="store.template.header_text" 
                            @input="store.checkForVariables('header')" 
                            rows="2" 
                            class="header-textarea" 
                            placeholder="Type your media block header text here..."
                          ></textarea>
                          <img v-else class="header-placeholder" src="/theme/images/file-cover.png" alt="no-image-found">
                        </div>
                        <div v-if="store.template.header == 'text'" class="header-footer">
                          <p class="characters-count">{{ store.template.header_text?.length || 0 }}/60 characters</p>
                          <p class="characters-count">{{ store.getVariableCount('header') }}/1 variable</p>
                        </div>
                        <p class="text-danger" v-if="store.errors.header"><small>{{ store.errors.header }}</small></p>
                      </div>

                      <!-- TEMPLATE BODY -->
                      <EmojiTextarea
                        id-suffix="body"
                        :text="store.block.text"
                        :error-text="store.errors.body"
                        @update:text="(val: string) => store.block.text = val"
                        @update:error-text="(val: string) => store.errors.body = val"
                        @add-variable="() => store.addVariable('body')"
                        @check-variables="() => store.checkForVariables('body')"
                      />

                      <!-- TEMPLATE FOOTER -->
                      <div class="form-group" v-show="store.template.type == 'media' && store.template.bodyIncludes.includes('footer')">
                        <div class="footer-container">
                          <p class="footer-label">footer</p>
                        </div>
                        <div class="footer-body">
                          <textarea 
                            v-model="store.template.footer_text" 
                            rows="2" 
                            class="footer-textarea" 
                            placeholder="Type your media block footer text here..."
                          ></textarea>
                        </div>
                        <div class="footer-footer">
                          <p class="characters-count">{{ store.template.footer_text?.length || 0 }}/60 characters</p>
                        </div>
                        <p class="text-danger" v-if="store.errors.footer"><small>{{ store.errors.footer }}</small></p>
                      </div>

                      <!-- TEMPLATE BUTTONS -->
                      <ButtonsEditor
                        :show="store.template.bodyIncludes.includes('buttons')"
                        :template="store.template"
                        :block="store.block"
                        :errors="store.errors"
                        :slideIndex="0"
                      />
                      
                      <!-- Carousel Editor -->
                      <CarouselEditor v-if="store.isGenericType" />
                    </div>
                  </template>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Step 2: Parameters and Preview -->
        <div v-if="store.views.settings === 'current'" class="step-content">
          <ParameterEditor ref="parameterEditorRef" :bot-service="props.botService" />
        </div>
      </div>
      <div class="agent-action-buttons">
        <Button 
          variant="secondary"
          size="medium"
          @click="store.views.fields === 'current' ? closeModal() : store.goBack()"
          :disabled="props.isLoading"
        >
          {{ store.views.fields === 'current' ? 'Cancel' : 'Back' }}
        </Button>
        
        <Button 
          variant="primary"
          size="medium"
          @click="store.views.settings === 'current' ? handleSave() : store.goNext()"
          :loading="store.isSaving"
          :disabled="isSaveButtonDisabled"
        >
          {{ store.views.settings === 'current' ? (store.isSaving ? 'Saving...' : 'Create Template') : 'Next' }}
        </Button>
      </div>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
.template-editor {
  padding: var(--space-3);
}

/* Step Content */
.step-content {
  display: block;
}

/* Main Block Style */
.main-block-style {
  margin-bottom: var(--space-4);
}

/* Form Layout */
.form-fields {
  width: 100%;
}

.form-section {
  margin-top: var(--space-2);
}

/* Body Header Selector */
.body-header-selector {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
  text-transform: uppercase;
}

.selector-btn {
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

.selector-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.selector-btn input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.selector-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.selector-btn.default {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.selector-btn i {
  font-size: 12px;
}

/* Header Styles */
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.header-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-controls.justify-between {
  justify-content: space-between;
}

.header-controls.justify-end {
  justify-content: flex-end;
}

.header-body {
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: white;
}

.header-textarea {
  width: 100%;
  border: none;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  outline: none;
}

.header-body.text-center {
  text-align: center;
  border-bottom: 1px dashed var(--color-border-secondary);
}

.header-textarea:focus {
  outline: none;
}

.header-image {
  max-width: 100px;
  height: auto;
  border-radius: var(--radius-md);
}

.header-video {
  max-width: 100px;
  height: auto;
  border-radius: var(--radius-md);
}

.header-placeholder {
  max-width: 100px;
  height: auto;
  border-radius: var(--radius-md);
  opacity: 0.6;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.file-upload:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 12px;
}

.upload-placeholder i {
  font-size: 24px;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-bg-success);
  border-radius: var(--radius-md);
  color: var(--color-text-success);
  font-size: 12px;
}

.document-preview i {
  font-size: 18px;
}

.header-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-top: none;
  padding: var(--space-2);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background-color: var(--color-bg-secondary);
}

/* Footer Styles */
.footer-container {
  display: flex;
  align-items: baseline;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  gap: var(--space-3);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--color-bg-secondary);
}

.footer-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.footer-body {
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: white;
}

.footer-textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  outline: none;
}

.footer-textarea:focus {
  outline: none;
}

.footer-footer {
  display: flex;
  justify-content: flex-end;
  border: 1px dashed var(--color-border-secondary);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--space-2);
  background-color: var(--color-bg-secondary);
}

.characters-count {
  margin: 0;
  padding: var(--space-1) var(--space-2);
  background: var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
}

.text-danger {
  color: var(--color-error);
  margin-top: var(--space-2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .body-header-selector {
    flex-direction: column;
  }
  
  .header-controls {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>