<script setup lang="ts">
import { Input, Button, VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import EmojiTextarea from "./EmojiTextarea.vue";
import ButtonsEditor from "./ButtonsEditor.vue";

const store = useWhatsAppTemplateStore();

const headerTypes = [
  { label: 'Video', value: 'video' },
  { label: 'Image', value: 'image' }
];

const addSlide = () => {
  if (store.template.slides.length < 10) {
    store.template.slides.push(store.createSlide());
  }
};

const removeSlide = (index: number) => {
  if (store.template.slides.length > 1) {
    store.template.slides.splice(index, 1);
  }
};

const addVariable = (section: string) => {
  store.addVariable(section);
};

const checkForVariables = (section: string) => {
  store.checkForVariables(section);
};

const afterSelect = () => {
  store.afterSelect();
};
</script>

<template>
  <div class="form-group">
    <div class="carousel-header">
      <p class="carousel-label">Media Template</p>
    </div>

    <div class="carousel-body">
      <div
        v-for="(slide, index) in store.template.slides"
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
          :text="slide.body"
          :error-text="store.errors.body"
          :maxlength="store.template.type == 'generic' ? 150 : 1024"
          @update:text="val => slide.body = val"
          @update:error-text="val => store.errors.body = val"
          @add-variable="() => addVariable('body_slide')"
          @check-variables="val => checkForVariables('body_slide')"
        />

        <!-- Buttons for the slide -->
        <ButtonsEditor
          :show="store.template.type === 'generic'"
          :template="store.template.slides[index]"
          :block="{ buttons: slide.buttons }"
          :errors="store.errors"
          :current="index"
          :slide-index="index"
        />

        <!-- Slide Actions -->
        <div class="slide-actions">
          <Button
            type="button"
            variant="primary"
            size="small"
            @click="addSlide"
            :disabled="store.template.slides.length >= 10"
          >
            Add Slide
          </Button>
          <Button
            v-if="store.template.slides.length > 1"
            type="button"
            variant="error"
            size="small"
            @click="removeSlide(index)"
          >
            Remove Slide
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
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group:last-child {
  margin-bottom: 0;
}
</style> 