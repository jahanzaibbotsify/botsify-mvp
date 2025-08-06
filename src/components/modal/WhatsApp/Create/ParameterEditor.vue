<script setup lang="ts">
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import MessagePreview from "./MessagePreview.vue";

const store = useWhatsAppTemplateStore();

// Helper function to check if it's a text template without variables
const isTextTemplateWithoutVariables = () => {
  const template = store.template;
  const variables = template.variables || {};
  
  return (
    (template.header === 'text' && !variables.header && !variables.button && (!variables.body || variables.body.length === 0)) ||
    (template.header === 'media' && !variables.header && !variables.button && (!variables.body || variables.body.length === 0))
  );
};
</script>

<template>
  <div class="parameter-editor">
    <legend>Preview & Submit</legend>
    <section class="parameter-content">
      <div class="parameter-layout">
        <div class="variables-section">
          <!-- ONLY SHOW IF THERE ARE NO VARIABLES AND IT IS TEXT TEMPLATE -->
          <p
            class="no-variables-message"
            v-if="isTextTemplateWithoutVariables()"
          >
            You haven't used any variable placeholders in your text.
            <br />
            <br />
            In order to add a variable, go back to the editor and insert
            at the given position, where # represents the variable
            index, which needs to start at .
          </p>

          <template v-else>
            <h6 class="section-title">Example values</h6>
            
            <!-- Media Link Input -->
            <div
              class="form-group"
              v-if="store.template.header !== 'text' && store.template.bodyIncludes.includes('header')"
            >
              <label>
                {{ store.template.header.charAt(0).toUpperCase() + store.template.header.slice(1) }} Link
              </label>
              <Input
                type="url"
                v-model="store.block.attachment_link"
                placeholder="Enter media URL"
              />
              <p class="text-danger" v-if="store.errors.file">
                <small>{{ store.errors.file }}</small>
              </p>
            </div>

            <!-- HEADER VARIABLES -->
            <div
              class="form-group"
              v-if="store.template.type === 'media' && store.template.bodyIncludes.includes('header') && store.template.header === 'text' && store.template.variables?.header"
            >
              <label>
                Header Variable - {{ store.template.variables.header.key }}
              </label>
              <Input
                type="text"
                v-model="store.template.variables.header.value"
                placeholder="Enter header variable value"
              />
              <p
                class="text-danger"
                v-if="store.template.variables.header.value === ''"
              >
                <small>This is required field</small>
              </p>
            </div>

            <!-- BODY VARIABLES -->
            <template v-if="store.template.variables?.body && store.template.variables.body.length > 0">
              <div
                class="form-group"
                v-for="(_variable, varIndex) in store.template.variables.body"
                :key="varIndex"
              >
                <label v-if="store.template.category === 'AUTHENTICATION'">
                  Authentication Code - {{ _variable.key }}
                </label>
                <label v-else>
                  Body Variable - {{ _variable.key }}
                </label>
                <Input
                  type="text"
                  v-model="_variable.value"
                  placeholder="Enter variable value"
                />
                <p class="text-danger" v-if="_variable.value === ''">
                  <small>This is required field</small>
                </p>
              </div>
            </template>

            <!-- BUTTON VARIABLES -->
            <div
              class="form-group"
              v-if="store.template.type === 'media' && store.block.buttons.length > 0 && store.template.bodyIncludes.includes('buttons') && store.template.variables?.button"
            >
              <label>
                URL Button Variable - {{ store.template.variables.button.key }}
              </label>
              <Input
                type="text"
                v-model="store.template.variables.button.value"
                placeholder="Enter button variable value"
              />
              <p
                class="text-danger"
                v-if="store.template.variables.button.value === ''"
              >
                <small>This is required field</small>
              </p>
            </div>
          </template>

          <!-- Generic Template (Carousel) Variables -->
          <template v-if="store.template.type === 'generic'">
            <div class="carousel-slides">
              <div class="slides-container">
                <div
                  v-for="(slide, index) in store.template.slides"
                  :key="'template-slide-' + index"
                  class="slide-card"
                >
                  <h5 class="slide-title">Slide {{ index + 1 }}</h5>

                  <!-- Image Link or File Input -->
                  <div class="form-group">
                    <label>
                      {{ slide.header.charAt(0).toUpperCase() + slide.header.slice(1) }} Link
                    </label>
                    <Input
                      type="url"
                      v-model="store.block.slides[index].attachment_link"
                      :placeholder="slide.header === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'"
                    />
                    <p
                      class="text-danger"
                      v-if="store.errors.file && store.errors.file[index]"
                    >
                      <small>{{ store.errors.file[index] }}</small>
                    </p>
                  </div>

                  <!-- Slide Body Variables -->
                  <template v-if="slide.variables?.body && slide.variables.body.length > 0">
                    <div
                      class="form-group"
                      v-for="(_variable, varIndex) in slide.variables.body"
                      :key="varIndex"
                    >
                      <label>
                        Body Variable - {{ _variable.key }}
                      </label>
                      <Input
                        type="text"
                        v-model="_variable.value"
                        placeholder="Enter variable value"
                      />
                      <p
                        class="text-danger"
                        v-if="_variable.value === ''"
                      >
                        <small>This is required field</small>
                      </p>
                    </div>
                  </template>
                  
                  <!-- Slide Button Variable -->
                  <div
                    class="form-group"
                    v-if="slide.variables?.button"
                  >
                    <label>
                      Button Variable
                    </label>
                    <Input
                      type="text"
                      v-model="slide.variables.button.value"
                      placeholder="Enter button variable value"
                    />
                    <p
                      v-if="slide.variables.button.value === ''"
                      class="text-danger"
                    >
                      <small>This is a required field</small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="preview-section">
          <MessagePreview
            :template="store.template"
            :block="store.block"
            :bot-service="'dialog360'"
            :file-src="''"
            :show-title="true"
            title="Preview"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.parameter-editor {
  margin-bottom: var(--space-6);
}

.parameter-editor legend {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.parameter-content {
  width: 100%;
}

.parameter-layout {
  display: flex;
  gap: var(--space-4);
}

.variables-section {
  width: 50%;
  height: 600px;
  overflow-y: auto;
}

.preview-section {
  width: 50%;
}

.preview-section div {
  border: 1px solid #e5e5e5;
  background: rgb(255, 255, 255);
  border-radius: 6px;
  position: relative;
  padding: 10px 15px 10px 25px;
}

.no-variables-message {
  margin-bottom: 0;
}

.section-title {
  text-transform: uppercase;
  margin-bottom: var(--space-4);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.text-danger {
  color: var(--color-error);
}

.carousel-slides {
  margin-bottom: var(--space-3);
}

.slides-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-2);
  border: 0;
}

.slide-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: var(--space-3);
}

.slide-title {
  margin-bottom: var(--space-3);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.carousel-slides::-webkit-scrollbar {
  height: 6px;
}

.carousel-slides::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.carousel-slides {
  scrollbar-width: thin;
}
</style> 