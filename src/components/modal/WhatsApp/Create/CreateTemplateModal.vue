<script setup lang="ts">
import { ref } from "vue";
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import { Button, Input, VueSelect } from "@/components/ui";
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

// File input refs
const imageInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const documentInput = ref<HTMLInputElement | null>(null);

// Store
const store = useWhatsAppTemplateStore();

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

const handleSave = async () => {
  const result = await store.saveBlock();
  if (result?.success) {
    emit('create-template', result.data);
    closeModal();
  }
};

// File upload handlers
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Here you would typically upload the file to your server
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file);
    store.block.image_url = url;
  }
};

const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Here you would typically upload the file to your server
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file);
    store.block.video_url = url;
  }
};

const handleDocumentUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Here you would typically upload the file to your server
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file);
    store.block.attachment_link = url;
  }
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
                                Add Variable <i class="fa fa-plus"></i>
                              </Button>
                              <Button 
                                v-else 
                                type="button"
                                variant="secondary"
                                size="small"
                                disabled
                              >
                                Add Variable <i class="fa fa-plus"></i>
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
                                {label: 'Video', value: 'video'},
                                {label: 'Image', value: 'image'},
                                {label: 'Document', value: 'document'}
                              ]"
                              @input="store.onChangeHeaderType"
                            />
                          </div>
                        </div>
                        <div class="header-body" :class="store.template.header != 'text' ? 'text-center' : ''">
                          <textarea 
                            v-if="store.template.header == 'text'" 
                            v-model="store.template.header_text" 
                            @input="store.checkForVariables('header')" 
                            rows="4" 
                            class="header-textarea" 
                            placeholder="Type your media block header text here..."
                          ></textarea>
                          <div v-else-if="store.template.header == 'image'" class="file-upload">
                            <img v-if="store.block.image_url" :src="store.block.image_url" class="header-image" alt="header-image">
                            <div v-else class="upload-placeholder">
                              <i class="fa fa-image"></i>
                              <p>Click to upload image</p>
                              <input type="file" accept="image/*" @change="handleImageUpload" style="display: none;" ref="imageInput">
                              <Button @click="$refs.imageInput.click()" variant="secondary" size="small">Upload Image</Button>
                            </div>
                          </div>
                          <div v-else-if="store.template.header == 'video'" class="file-upload">
                            <video v-if="store.block.video_url" :src="store.block.video_url" controls class="header-video"></video>
                            <div v-else class="upload-placeholder">
                              <i class="fa fa-video"></i>
                              <p>Click to upload video</p>
                              <input type="file" accept="video/*" @change="handleVideoUpload" style="display: none;" ref="videoInput">
                              <Button @click="$refs.videoInput.click()" variant="secondary" size="small">Upload Video</Button>
                            </div>
                          </div>
                          <div v-else-if="store.template.header == 'document'" class="file-upload">
                            <div v-if="store.block.attachment_link" class="document-preview">
                              <i class="fa fa-file"></i>
                              <span>Document uploaded</span>
                            </div>
                            <div v-else class="upload-placeholder">
                              <i class="fa fa-file"></i>
                              <p>Click to upload document</p>
                              <input type="file" accept=".pdf,.doc,.docx" @change="handleDocumentUpload" style="display: none;" ref="documentInput">
                              <Button @click="$refs.documentInput.click()" variant="secondary" size="small">Upload Document</Button>
                            </div>
                          </div>
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
                        @check-variables="(val: string) => store.checkForVariables('body')"
                      />

                      <!-- TEMPLATE FOOTER -->
                      <div class="form-group" v-show="store.template.type == 'media' && store.template.bodyIncludes.includes('footer')">
                        <div class="footer-container">
                          <p class="footer-label">footer</p>
                        </div>
                        <div class="footer-body">
                          <textarea 
                            v-model="store.template.footer_text" 
                            rows="4" 
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
                        @add-button="store.addTheButton"
                        @remove-button="store.removeTheButton"
                        @after-select="store.afterSelect"
                        @button-type-change="store.onButtonTypeChange"
                        @cta-change="store.onChangeCta"
                        @check-url-variables="store.checkForVariables"
                        @add-variable="store.addVariable"
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
          <ParameterEditor />
        </div>
      </div>
    </template>

    <template #actions>
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
        :loading="props.isLoading"
        :disabled="store.isNextDisabled()"
      >
        {{ store.views.settings === 'current' ? (props.isLoading ? 'Creating...' : 'Create Template') : 'Next' }}
      </Button>
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
}

.header-body.text-center {
  text-align: center;
  padding: var(--space-3);
  border-bottom: 1px dashed var(--color-border-secondary) !important;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.header-textarea {
  width: 100%;
  border: none;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 80px;
  outline: none;
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
  min-height: 80px;
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