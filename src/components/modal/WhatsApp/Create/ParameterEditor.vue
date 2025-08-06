<script setup lang="ts">
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import MessagePreview from "./MessagePreview.vue";

const store = useWhatsAppTemplateStore();
</script>

<template>
  <div class="parameter-editor">
    <div>
    <div class="parameter-section">
      <h3>Template name</h3>
      <Input
        v-model="store.template.name"
        placeholder="Enter template name"
        class="template-name-input"
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
        />
        <p class="text-danger" v-if="store.errors.file && Object.keys(store.errors.file).length > 0">
          <small>{{ Object.values(store.errors.file)[0] }}</small>
        </p>
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
        />
        <p class="text-danger" v-if="store.template.variables.header.value == ''">
          <small>This is required field</small>
        </p>
      </div>
    </div>

    <!-- BODY VARIABLES -->
    <div v-if="store.template.variables.body.length > 0" class="parameter-section">
      <h3>Body variables</h3>
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
        />
        <p class="text-danger" v-if="variable.value == ''">
          <small>This is required field</small>
        </p>
      </div>
    </div>

    <!-- BUTTON VARIABLES -->
    <div v-if="store.template.variables.buttons.length > 0" class="parameter-section">
      <h3>Button variables</h3>
      <div 
        class="form-group"
        v-for="(buttonVar, varIndex) in store.template.variables.buttons"
        :key="varIndex"
      >
        <label>Button {{ buttonVar.buttonIndex + 1 }} Variable - {{ buttonVar.key }}</label>
        <Input
          v-model="buttonVar.value"
          :placeholder="`Enter value for ${buttonVar.key}`"
        />
        <p class="text-danger" v-if="buttonVar.value == ''">
          <small>This is required field</small>
        </p>
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

.parameter-section {
  margin-bottom: var(--space-6);
}

.parameter-section h3 {
  margin-bottom: var(--space-3);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-name-input {
  max-width: 400px;
}

.auth-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
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

.text-danger {
  color: var(--color-error);
  margin-top: var(--space-1);
}

.text-danger small {
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-params {
    grid-template-columns: 1fr;
  }
}
</style> 