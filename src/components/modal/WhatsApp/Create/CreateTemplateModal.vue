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
                      <div v-if="store.template.bodyIncludes.includes('header')" class="form-group">
                        <label>Header Type</label>
                        <VueSelect
                          :model-value="store.template.header"
                          @update:model-value="(value: any) => store.template.header = value"
                          :options="[
                            { label: 'Text', value: 'text' },
                            { label: 'Image', value: 'image' },
                            { label: 'Video', value: 'video' },
                            { label: 'Document', value: 'document' }
                          ]"
                          placeholder="Select header type"
                        />
                      </div>

                      <!-- TEMPLATE BODY -->
                      <EmojiTextarea
                        id-suffix="body"
                        :text="store.block.text"
                        :error-text="store.errors.body"
                        @update:text="(val: string) => store.block.text = val"
                        @update:error-text="(val: string) => store.errors.body = val"
                        @add-variable="() => store.addVariable()"
                        @check-variables="(val: string) => store.checkForVariables('body')"
                      />

                      <!-- TEMPLATE FOOTER -->
                      <div v-if="store.template.bodyIncludes.includes('footer')" class="form-group">
                        <label>Footer Text</label>
                        <Input
                          v-model="store.template.footer_text"
                          placeholder="Enter footer text"
                        />
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

/* Responsive Design */
@media (max-width: 768px) {
  .body-header-selector {
    flex-direction: column;
  }
}
</style>