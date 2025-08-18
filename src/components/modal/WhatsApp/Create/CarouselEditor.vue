<script setup lang="ts">
import { computed } from "vue";
import { Button, VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import EmojiTextarea from "./EmojiTextarea.vue";
import ButtonsEditor from "./ButtonsEditor.vue";

const store = useWhatsAppTemplateStore();

const headerTypes = [
  { label: 'Video', value: 'video' },
  { label: 'Image', value: 'image' }
];

const afterSelect = () => {
  store.afterSelect();
};

// Computed property to check if controls should be disabled
const shouldDisableControls = computed(() => {
  return store.template.slides.length > 1;
});
</script>

<template>
  <div class="form-group">
    <div class="carousel-header">
      <p class="carousel-label">Media template</p>
    </div>

    <div class="carousel-body">
      <div
        v-for="(_, index) in store.template.slides"
        :key="index"
        class="slide-item"
      >
        <div class="form-group">
          <!-- Header Section -->
          <div class="slide-header-section">
            <p class="slide-header-label">header</p>
            <VueSelect
              v-model="store.template.slides[index].header"
              :reduce="(h: any) => h.value"
              :clearable="false"
              placeholder="Select Header Type"
              :options="headerTypes"
              @close="afterSelect"
              :disabled="shouldDisableControls"
            />
          </div>
          
          <div class="slide-header-body">
            <img
              class="slide-header-image"
              src="/theme/images/file-cover.png"
              alt="no-image-found"
            />
          </div>
        </div>

        <!-- Body Section with EmojiTextarea -->
        <EmojiTextarea
          :key="index"
          :id-suffix="`slide${index}`"
          :text="store.block.slides[index]?.title || ''"
          :error-text="store.errors.slides[index].title"
          :maxlength="store.template.type == 'generic' ? 150 : 1024"
          :label="`SLIDE ${index + 1}`"
          :variable-count="store.getVariableCount('slider', index)"
          @update:text="val => store.block.slides[index].title = val"
          @update:error-text="val => store.errors.slides[index].title = val"
          @add-variable="() => store.addVariable('slider', true, null, index)"
          @check-variables="() => store.checkForVariables('slider', index)"
        />

        <!-- Buttons for the slide -->
        <ButtonsEditor
          :show="store.template.type === 'generic'"
          :template="store.template.slides[index]"
          :block="store.block.slides[index]"
          :errors="store.errors"
          :current="index"
          :slide-index="index"
          :disable-controls="shouldDisableControls"
        />

        <!-- Slide Actions -->
        <div class="slide-actions">
          <div class="add-slide-container">
            <Button
              type="button"
              variant="primary"
              size="small"
              @click="store.addSlide"
              :disabled="!store.canAddSlide"
              :title="!store.canAddSlide ? 'Complete the first slide (title and ALL buttons) before adding more slides' : 'Add a new slide'"
            >
              Add slide
            </Button>
            <span v-if="!store.canAddSlide" class="add-slide-hint">
              Complete first slide (title and ALL buttons) to add more
            </span>
          </div>
          <Button
            v-if="store.template.slides.length > 1"
            type="button"
            variant="error"
            size="small"
            @click="store.removeSlide(index)"
          >
            Remove slide
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-header {
  display: flex;
  align-items: baseline;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  gap: var(--space-3);
}

.carousel-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.carousel-body {
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  padding: var(--space-3);
  background: var(--color-bg-secondary);
}

.slide-item {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border-secondary);
}

.slide-item:last-child {
  margin-bottom: 0;
}

.slide-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.slide-header-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.slide-header-body {
  border: 1px dashed var(--color-border-secondary);
  border-top: none;
  padding: var(--space-3);
  background: white;
  text-align: center;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.slide-header-image {
  max-width: 100px;
  height: auto;
  border-radius: var(--radius-md);
  opacity: 0.6;
}

.slide-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.add-slide-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.add-slide-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group:last-child {
  margin-bottom: 0;
}
</style> 