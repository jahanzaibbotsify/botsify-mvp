<script setup lang="ts">
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import MessagePreview from "./MessagePreview.vue";

// Props
interface Props {
  botService?: string;
}

const props = withDefaults(defineProps<Props>(), {
  botService: 'facebookAPI'
});

const store = useWhatsAppTemplateStore();

// Debug computed properties
// const debugTemplate = computed(() => {
//   console.log('Store template:', store.template);
//   console.log('Store template slides:', store.template.slides);
//   console.log('Store template variables:', store.template.variables);
//   return store.template;
// });
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
          :error="!store.template.name ? 'Template name is required' : ''"
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
            placeholder="Enter URL for the {{ store.template.header }}"
            @input="store.onUpdateAttachmentLink"
            :error="store.errors.file && Object.keys(store.errors.file).length > 0 ? Object.values(store.errors.file)[0] : ''"
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
            :error="!store.template.variables.header.value ? 'This is required field' : ''"
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
              :error="!variable.value ? 'This is required field' : ''"
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
                    @input="() => store.onUpdateCarouselAttachmentLink(slideIndex)"
                    :error="store.errors.file && Object.keys(store.errors.file).length > 0 ? Object.values(store.errors.file)[0] : ''"
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
                      :error="!variable.value ? 'This is required field' : ''"
                    />
                  </div>
                </div>
              </div>

              <!-- Button Variables Section -->
              <div class="slide-section" v-if="slide.variables?.button">
                <h5>Button Variables</h5>
                <div class="variables-grid">
                  <div>
                    <label>Button Variable - {{ slide.variables.button.key }}</label>
                    <Input
                      v-model="slide.variables.button.value"
                      :placeholder="`Enter value for ${slide.variables.button.key}`"
                      :error="!slide.variables.button.value ? 'This is required field' : ''"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BUTTON VARIABLES -->
      <div v-if="store.template.variables.button" class="parameter-section">
          <h3>Button variables</h3>
          <div class="variables-grid">
          <div class="form-group">
            <label>Button Variable - {{ store.template.variables.button.key }}</label>
            <Input
              v-model="store.template.variables.button.value"
              :placeholder="`Enter value for ${store.template.variables.button.key}`"
              :error="!store.template.variables.button.value ? 'This is required field' : ''"
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
  max-height: 600px;
  overflow-y: scroll;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-3);
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