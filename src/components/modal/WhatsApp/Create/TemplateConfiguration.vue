<script setup lang="ts">
import { VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

const store = useWhatsAppTemplateStore();
</script>

<template>
  <div class="template-config">
    <div class="config-header">
      <p class="config-label">Template Configuration</p>
    </div>
    
    <div class="config-body">
      <div class="config-row">
        <div class="config-section">
          <label class="config-field-label">Category</label>
          <VueSelect
            :model-value="store.template.category"
            @update:model-value="(value: any) => { store.template.category = value; store.onChangeCategory(); }"
            :options="store.categories"
            placeholder="Select Template Category"
          />
        </div>
        
        <div class="config-section">
          <label class="config-field-label">Language</label>
          <VueSelect
            :model-value="store.block.language"
            @update:model-value="(value: any) => store.block.language = value"
            :options="store.languages"
            placeholder="Select Template Language"
          />
        </div>
      </div>

      <div class="config-section" v-if="store.template.category != 'AUTHENTICATION'">
        <label class="config-field-label">Media Block Type</label>
        <VueSelect
          :model-value="store.template.type"
          @update:model-value="(value: any) => { store.template.type = value; store.onChangeTemplateType(); }"
          :options="store.template_types"
          placeholder="Select Template Type"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-config {
  margin-bottom: var(--space-6);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--color-bg-secondary);
  border-bottom: none;
}

.config-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.config-body {
  border: 1px dashed var(--color-border-secondary);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.config-section {
  display: flex;
  flex-direction: column;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-field-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
}
</style> 