<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import VueSelect from "vue3-select-component";
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
  'create-template': [template: any];
}>();

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Dummy tabs for PublishModalLayout (not used in this simple form modal)
const tabs = [
  { id: 'create', label: 'Create Template' }
];

// Step management
const currentStep = ref(1);
const totalSteps = 2;

// Create form data
const createForm = ref({
  name: '',
  category: '',
  language: '',
  type: '',
  body: ''
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
  { label: "Afrikaans (af)", value: "af" },
  { label: "Albanian (sq)", value: "sq" },
  { label: "Arabic (ar)", value: "ar" },
  { label: "Azerbaijani (az)", value: "az" },
  { label: "Bengali (bn)", value: "bn" },
  { label: "Bulgarian (bg)", value: "bg" },
  { label: "Catalan (ca)", value: "ca" },
  { label: "Chinese (CHN) (zh_CN)", value: "zh_CN" },
  { label: "Chinese (HKG) (zh_HK)", value: "zh_HK" },
  { label: "Chinese (TAI) (zh_TW)", value: "zh_TW" },
  { label: "Croatian (hr)", value: "hr" },
  { label: "Czech (cs)", value: "cs" },
  { label: "Danish (da)", value: "da" },
  { label: "Dutch (nl)", value: "nl" },
  { label: "English (en)", value: "en" },
  { label: "English (UK) (en_GB)", value: "en_GB" },
  { label: "English (US) (en_US)", value: "en_US" },
  { label: "Estonian (et)", value: "et" },
  { label: "Filipino (fil)", value: "fil" },
  { label: "Finnish (fi)", value: "fi" },
  { label: "French (fr)", value: "fr" },
  { label: "Georgian (ka)", value: "ka" },
  { label: "German (de)", value: "de" },
  { label: "Greek (el)", value: "el" },
  { label: "Gujarati (gu)", value: "gu" },
  { label: "Hausa (ha)", value: "ha" },
  { label: "Hebrew (he)", value: "he" },
  { label: "Hindi (hi)", value: "hi" },
  { label: "Hungarian (hu)", value: "hu" },
  { label: "Indonesian (id)", value: "id" },
  { label: "Irish (ga)", value: "ga" },
  { label: "Italian (it)", value: "it" },
  { label: "Japanese (ja)", value: "ja" },
  { label: "Kannada (kn)", value: "kn" },
  { label: "Kazakh (kk)", value: "kk" },
  { label: "Kinyarwanda (rw_RW)", value: "rw_RW" },
  { label: "Korean (ko)", value: "ko" },
  { label: "Kyrgyz (Kyrgyzstan) (ky_KG)", value: "ky_KG" },
  { label: "Lao (lo)", value: "lo" },
  { label: "Latvian (lv)", value: "lv" },
  { label: "Lithuanian (lt)", value: "lt" },
  { label: "Macedonian (mk)", value: "mk" },
  { label: "Malay (ms)", value: "ms" },
  { label: "Malayalam (ml)", value: "ml" },
  { label: "Marathi (mr)", value: "mr" },
  { label: "Norwegian (nb)", value: "nb" },
  { label: "Persian (fa)", value: "fa" },
  { label: "Polish (pl)", value: "pl" },
  { label: "Portuguese (BR) (pt_BR)", value: "pt_BR" },
  { label: "Portuguese (POR) (pt_PT)", value: "pt_PT" },
  { label: "Punjabi (pa)", value: "pa" },
  { label: "Romanian (ro)", value: "ro" },
  { label: "Russian (ru)", value: "ru" },
  { label: "Serbian (sr)", value: "sr" },
  { label: "Slovak (sk)", value: "sk" },
  { label: "Slovenian (sl)", value: "sl" },
  { label: "Spanish (es)", value: "es" },
  { label: "Spanish (ARG) (es_AR)", value: "es_AR" },
  { label: "Spanish (SPA) (es_ES)", value: "es_ES" },
  { label: "Spanish (MEX) (es_MX)", value: "es_MX" },
  { label: "Swahili (sw)", value: "sw" },
  { label: "Swedish (sv)", value: "sv" },
  { label: "Tamil (ta)", value: "ta" },
  { label: "Telugu (te)", value: "te" },
  { label: "Thai (th)", value: "th" },
  { label: "Turkish (tr)", value: "tr" },
  { label: "Ukrainian (uk)", value: "uk" },
  { label: "Urdu (ur)", value: "ur" },
  { label: "Uzbek (uz)", value: "uz" },
  { label: "Vietnamese (vi)", value: "vi" },
  { label: "Zulu (zu)", value: "zu" }
];

const openModal = () => {
  modalRef.value?.openModal();
  // Reset form and step when opening
  createForm.value = {
    name: '',
    category: '',
    language: '',
    type: '',
    body: ''
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

const createTemplate = () => {
  if (!createForm.value.name || !createForm.value.body) {
    console.error('Name and body are required');
    return;
  }

  const templateData = {
    name: createForm.value.name,
    message: createForm.value.body,
    buttons: [] // No buttons in this simple form
  };

  emit('create-template', templateData);
  closeModal();
};

// Handle VueSelect values
const handleSelectChange = (key: keyof typeof createForm.value, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  createForm.value[key] = singleValue
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
            <label for="template-category">Category</label>
            <VueSelect
              :model-value="createForm.category"
              @update:model-value="(value: string | string[]) => handleSelectChange('category', value)"
              :options="categories"
              placeholder="Select category"
              :multiple="false"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="template-language">Language</label>
              <VueSelect
                :model-value="createForm.language"
                @update:model-value="(value: string | string[]) => handleSelectChange('language', value)"
                :options="languages"
                placeholder="Select language"
                :multiple="false"
              />
            </div>
            
            <div class="form-group">
              <label for="template-type">Template Type</label>
              <VueSelect
                :model-value="createForm.type"
                @update:model-value="(value: string | string[]) => handleSelectChange('type', value)"
                :options="templateTypes"
                placeholder="Select template type"
                :multiple="false"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="template-body">Body</label>
            <textarea 
              id="template-body"
              v-model="createForm.body"
              placeholder="Enter template content"
              class="form-input"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Step 2: Preview -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-group">
            <label for="template-name">Template Name</label>
            <input 
              id="template-name"
              v-model="createForm.name"
              type="text"
              placeholder="Enter template name"
              class="form-input"
            />
          </div>
          
          <div class="preview-section">
            <h4>Preview</h4>
            <div class="preview-container">
              <div class="preview-item">
                <strong>Category:</strong> {{ categories.find(c => c.value === createForm.category)?.label || 'Not selected' }}
              </div>
              <div class="preview-item">
                <strong>Language:</strong> {{ languages.find(l => l.value === createForm.language)?.label || 'Not selected' }}
              </div>
              <div class="preview-item">
                <strong>Template Type:</strong> {{ templateTypes.find(t => t.value === createForm.type)?.label || 'Not selected' }}
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
        @click="createTemplate"
        :disabled="isLoading || !createForm.name || !createForm.body"
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

/* VueSelect Styling */
.create-media-content .form-group :deep(.vue3-select-component) {
  font-size: 14px;
  height: 44px;
}
.create-media-content .form-group :deep(.control) {
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-1) var(--space-2);
}

.create-media-content .form-group :deep(.vue3-select-component input) {
  height: 44px;
  padding: 12px 16px;
  font-size: 14px;
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