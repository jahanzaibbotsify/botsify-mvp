<script setup lang="ts">
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import MessagePreview from "./MessagePreview.vue";
import { ref, computed, watch } from 'vue';

// Props
interface Props {
  botService?: string;
}

const props = withDefaults(defineProps<Props>(), {
  botService: 'facebookAPI'
});

const store = useWhatsAppTemplateStore();

// Local state to track field interactions
const touchedFields = ref({
  templateName: false,
  headerLink: false,
  headerVariable: false,
  bodyVariables: {} as Record<number, boolean>,
  buttonVariable: false,
  carouselSlides: {} as Record<number, Record<string, boolean>>
});

// Computed properties for validation
const hasValidationErrors = computed(() => {
  // Check template name
  if (!store.template.name) return true;
  
  // Check header link if required
  if (store.template.type === 'media' && 
      store.template.bodyIncludes.includes('header') && 
      store.template.header !== 'text' && 
      !store.block.attachment_link) {
    return true;
  }
  
  // Check header variable if exists
  if (store.template.variables.header && !store.template.variables.header.value) {
    return true;
  }
  
  // Check body variables
  for (const variable of store.template.variables.body) {
    if (!variable.value) return true;
  }
  
  // Check button variable if exists
  if (store.template.variables.button && !store.template.variables.button.value) {
    return true;
  }
  
  // Check carousel slides
  for (let i = 0; i < store.template.slides.length; i++) {
    const slide = store.template.slides[i];
    const blockSlide = store.block.slides[i];
    
    // Check slide body variables
    if (slide.variables?.body) {
      for (const variable of slide.variables.body) {
        if (!variable.value) return true;
      }
    }
    
    // Check slide button variables
    if (slide.variables?.button && !slide.variables.button.value) {
      return true;
    }
    
    // Check slide media link if required (only for non-text headers)
    if (slide.header !== 'text' && !blockSlide?.attachment_link) {
      return true;
    }
  }
  
  return false;
});

// Methods to mark fields as touched
const markFieldAsTouched = (fieldName: string, index?: number, subField?: string) => {
  if (fieldName === 'templateName') {
    touchedFields.value.templateName = true;
  } else if (fieldName === 'headerLink') {
    touchedFields.value.headerLink = true;
  } else if (fieldName === 'headerVariable') {
    touchedFields.value.headerVariable = true;
  } else if (fieldName === 'bodyVariable') {
    if (index !== undefined) {
      touchedFields.value.bodyVariables[index] = true;
    }
  } else if (fieldName === 'buttonVariable') {
    touchedFields.value.buttonVariable = true;
  } else if (fieldName === 'carouselSlide') {
    if (index !== undefined) {
      if (!touchedFields.value.carouselSlides[index]) {
        touchedFields.value.carouselSlides[index] = {};
      }
      if (subField) {
        touchedFields.value.carouselSlides[index][subField] = true;
      }
    }
  }
};

// Helper function to check if field should show error
const shouldShowError = (fieldName: string, index?: number, subField?: string): boolean => {
  if (fieldName === 'templateName') {
    return touchedFields.value.templateName && !store.template.name;
  } else if (fieldName === 'headerLink') {
    return touchedFields.value.headerLink && 
           store.template.type === 'media' && 
           store.template.bodyIncludes.includes('header') && 
           store.template.header !== 'text' && 
           !store.block.attachment_link;
  } else if (fieldName === 'headerVariable') {
    return touchedFields.value.headerVariable && 
           store.template.variables.header && 
           !store.template.variables.header.value;
  } else if (fieldName === 'bodyVariable') {
    if (index !== undefined) {
      return touchedFields.value.bodyVariables[index] && 
             store.template.variables.body[index] && 
             !store.template.variables.body[index].value;
    }
  } else if (fieldName === 'buttonVariable') {
    return touchedFields.value.buttonVariable && 
           store.template.variables.button && 
           !store.template.variables.button.value;
  } else if (fieldName === 'carouselSlide') {
    if (index !== undefined && subField) {
      const isTouched = touchedFields.value.carouselSlides[index]?.[subField] || false;
      if (!isTouched) return false;
      
      // Check for specific validation errors based on subField
      if (subField === 'media') {
        // Check if media link is required but missing
        const slide = store.template.slides[index];
        // Only show error if the slide header is not 'text' (i.e., it's image/video/document)
        // and the attachment link is missing
        return slide && slide.header !== 'text' && !store.block.slides[index]?.attachment_link;
      } else if (subField.startsWith('body_')) {
        // Check if body variable is required but missing
        const varIndex = parseInt(subField.split('_')[1]);
        const slide = store.template.slides[index];
        return slide?.variables?.body?.[varIndex] && !slide.variables.body[varIndex].value;
      } else if (subField === 'button') {
        // Check if button variable is required but missing
        const slide = store.template.slides[index];
        return slide?.variables?.button && !slide.variables.button.value;
      }
      return false;
    }
  }
  return false;
};

// Watch for changes to mark fields as touched
watch(() => store.template.name, () => {
  if (store.template.name !== '') {
    markFieldAsTouched('templateName');
  }
});

watch(() => store.block.attachment_link, () => {
  if (store.block.attachment_link !== '') {
    markFieldAsTouched('headerLink');
  }
});

// Expose validation state for parent component
defineExpose({
  hasValidationErrors
});

// Helper function to check if button actually has variables
const hasButtonVariables = (slide?: any, slideIndex?: number): boolean => {
  if (slide && slideIndex !== undefined) {
    // For carousel slides, check if the slide button has variables
    const blockSlide = store.block.slides[slideIndex];
    if (blockSlide?.buttons) {
      for (const button of blockSlide.buttons) {
        if (button.title && button.title.includes('{{')) return true;
        if (button.text && button.text.includes('{{')) return true;
        if (button.url && button.url.includes('{{')) return true;
      }
    }
    return false;
  } else {
    // For regular template, check if main buttons have variables
    if (store.block.buttons) {
      for (const button of store.block.buttons) {
        if (button.title && button.title.includes('{{')) return true;
        if (button.text && button.text.includes('{{')) return true;
        if (button.url && button.url.includes('{{')) return true;
      }
    }
    return false;
  }
};
</script>

<template>
  <div class="parameter-editor">
    <div class="parameter-content">
      <!-- Template Name Section -->
      <div class="parameter-section">
        <h3>Template name</h3>
        <Input
          v-model="store.template.name"
          placeholder="Enter template name"
          :error="shouldShowError('templateName') ? 'Template name is required' : ''"
          @input="markFieldAsTouched('templateName')"
        />
      </div>

      <!-- HEADER FILE/URL INPUT -->
      <div 
        class="parameter-section"
        v-if="store.template.type == 'media' && store.template.bodyIncludes.includes('header') && store.template.header != 'text'"
      >
        <h3>Header {{ store.template.header.charAt(0).toUpperCase() + store.template.header.slice(1) }}</h3>
        <div class="form-group">
          <label class="required-label">
            {{ store.template.header.charAt(0).toUpperCase() + store.template.header.slice(1) }} Link
          </label>
          <Input
            type="url"
            v-model="store.block.attachment_link"
            :placeholder="`Enter URL for the ${store.template.header}`"
            @input="() => { store.onUpdateAttachmentLink(); markFieldAsTouched('headerLink'); }"
            :error="shouldShowError('headerLink') ? 'Header link is required' : ''"
          />
        </div>
      </div>

      <!-- HEADER VARIABLES -->
      <div 
        class="parameter-section"
        v-if="store.template.type == 'media' && store.template.bodyIncludes.includes('header') && store.template.header == 'text' && store.template.variables.header"
      >
        <h3>Header variable</h3>
        <div class="form-group">
          <label>Header variable - {{ store.template.variables.header.key }}</label>
          <Input
            v-model="store.template.variables.header.value"
            placeholder="Enter header variable value"
            :error="shouldShowError('headerVariable') ? 'This is required field' : ''"
            @input="markFieldAsTouched('headerVariable')"
          />
        </div>
      </div>

      <!-- BODY VARIABLES -->
      <div v-if="store.template.variables.body.length > 0" class="parameter-section">
        <h3>Body variables</h3>
        <div class="variables-grid">
          <div 
            class="form-group"
            v-for="(variable, varIndex) in store.template.variables.body"
            :key="varIndex"
          >
            <label v-if="store.template.category == 'AUTHENTICATION'">
              Authentication code - {{ variable.key }}
            </label>
            <label v-else>
              Body variable - {{ variable.key }}
            </label>
            <Input
              v-model="variable.value"
              :placeholder="`Enter value for ${variable.key}`"
              :error="shouldShowError('bodyVariable', varIndex) ? 'This is required field' : ''"
              @input="markFieldAsTouched('bodyVariable', varIndex)"
            />
          </div>
        </div>
      </div>

      <!-- CAROUSEL SLIDES GROUPED BY SLIDE -->
      <div 
        v-if="store.template.type === 'generic' && store.template.slides.length > 0"
        class="parameter-section"
      >
        <h3>Carousel Slides</h3>
        <div class="carousel-slides-container">
          <div 
            v-for="(slide, slideIndex) in store.template.slides"
            :key="slideIndex"
            class="carousel-slide-group"
          >
            <div class="slide-header">
              <h4>Carousel {{ slideIndex + 1 }}</h4>
              <span class="slide-type">{{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }}</span>
            </div>
            
            <div class="slide-content">
              <!-- Media Section -->
              <div class="slide-section">
                <h5>Media</h5>
                
                <!-- Meta Cloud - File Upload -->
                <div class="form-group" v-if="props.botService === 'facebookAPI'">
                  <label class="required-label">
                    Upload {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }}
                  </label>
                  <input
                    type="file"
                    :accept="store.getAcceptedFileTypes(slide.header)"
                    @change="(event) => store.onUploadCarouselFile(event, slideIndex)"
                    class="file-input"
                  />
                  <p class="input-hint">Upload a {{ slide.header }} file for this slide</p>
                </div>
                
                <!-- Dialog360 - URL Input -->
                <div class="form-group" v-else-if="props.botService === 'dialog360'">
                  <label class="required-label">
                    {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }} Link
                  </label>
                  <Input
                    type="url"
                    v-model="store.block.slides[slideIndex].attachment_link"
                    :placeholder="slide.header === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'"
                    @input="() => { store.onUpdateCarouselAttachmentLink(slideIndex); markFieldAsTouched('carouselSlide', slideIndex, 'media'); }"
                    :error="shouldShowError('carouselSlide', slideIndex, 'media') ? 'Media link is required' : ''"
                  />
                </div>
              </div>

              <!-- Body Variables Section -->
              <div class="slide-section" v-if="slide.variables?.body?.length > 0">
                <h5>Body Variables</h5>
                <div class="variables-grid">
                  <div 
                    v-for="(variable, varIndex) in slide.variables.body"
                    :key="varIndex"
                    class="form-group"
                  >
                    <label>Body variable - {{ variable.key }}</label>
                    <Input
                      v-model="variable.value"
                      :placeholder="`Enter value for ${variable.key}`"
                      :error="shouldShowError('carouselSlide', slideIndex, `body_${varIndex}`) ? 'This is required field' : ''"
                      @input="markFieldAsTouched('carouselSlide', slideIndex, `body_${varIndex}`)"
                    />
                  </div>
                </div>
              </div>

              <!-- Button Variables Section - Only show if button actually has variables -->
              <div class="slide-section" v-if="slide.variables?.button">
                <h5>Button Variables</h5>
                <div class="variables-grid">
                  <div>
                    <label>Button Variable - {{ slide.variables.button.key }}</label>
                    <Input
                      v-model="slide.variables.button.value"
                      :placeholder="`Enter value for ${slide.variables.button.key}`"
                      :error="shouldShowError('carouselSlide', slideIndex, 'button') ? 'This is required field' : ''"
                      @input="markFieldAsTouched('carouselSlide', slideIndex, 'button')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BUTTON VARIABLES - Only show if button actually has variables -->
      <div v-if="store.template.variables.button" class="parameter-section">
          <h3>Button variables</h3>
          <div class="variables-grid">
          <div class="form-group">
            <label>Button Variable - {{ store.template.variables.button.key }}</label>
            <Input
              v-model="store.template.variables.button.value"
              :placeholder="`Enter value for ${store.template.variables.button.key}`"
              :error="shouldShowError('buttonVariable') ? 'This is required field' : ''"
              @input="markFieldAsTouched('buttonVariable')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Message Preview -->
    <div class="parameter-section">
      <h3>Message preview</h3>
      <MessagePreview 
        :template="store.template"
        :block="store.block"
        :variables="store.template.variables"
        :slides="store.block.slides"
      />
    </div>
  </div>
</template>

<style scoped>
.parameter-editor {
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-4);
}

.parameter-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 500px;
  overflow-y: auto;
  padding-right: var(--space-5);
  scrollbar-width: thin;
}

.parameter-section {
  margin-bottom: var(--space-4);
}

.parameter-section h3 {
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--space-2);
}



.form-group {
  margin-bottom: var(--space-3);
  margin-top: var(--space-3);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.required-label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.required-label::after {
  content: " *";
  color: var(--color-error);
}


/* Variables Grid for better organization */
.variables-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}

/* Carousel Slides Container */
.carousel-slides-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.carousel-slide-group {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.slide-header {
  background: var(--color-bg-tertiary);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slide-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.slide-type {
  background: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slide-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.slide-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
}

.slide-section h5 {
  margin: 0 0 var(--space-3) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.file-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.file-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-hint {
  margin: var(--space-1) 0 0 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .parameter-editor {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .variables-grid {
    grid-template-columns: 1fr;
  }
  
  .slide-content {
    padding: var(--space-3);
  }
  
  .slide-section {
    padding: var(--space-2);
  }
}

@media (max-width: 480px) {
  .parameter-editor {
    padding: var(--space-3);
  }
  
  .slide-header {
    padding: var(--space-2) var(--space-3);
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }
}
</style> 