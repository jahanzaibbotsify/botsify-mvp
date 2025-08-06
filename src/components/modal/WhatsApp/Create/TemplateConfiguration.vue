<script setup lang="ts">
import { VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

const store = useWhatsAppTemplateStore();
</script>

<template>
  <div class="template-config">
    <div class="config-row">
      <div class="form-group">
        <label>Category</label>
        <VueSelect
          :model-value="store.template.category"
          @update:model-value="(value: any) => { store.template.category = value; store.onChangeCategory(); }"
          :options="store.categories"
          placeholder="Select Template Category"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label>Language</label>
        <VueSelect
          :model-value="store.block.language"
          @update:model-value="(value: any) => store.block.language = value"
          :options="store.languages"
          placeholder="Select Template Language"
          class="form-control"
        />
      </div>
    </div>

    <div class="form-group" v-if="store.template.category != 'AUTHENTICATION'">
      <label for="template_type">Media Block Type</label>
      <VueSelect
        :model-value="store.template.type"
        @update:model-value="(value: any) => { store.template.type = value; store.onChangeTemplateType(); }"
        :options="store.template_types"
        placeholder="Select Template Type"
        class="form-control"
      />
    </div>
  </div>
</template>

<style scoped>
.template-config {
  margin-bottom: var(--space-6);
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 14px;
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* VueSelect Styling */
:deep(.vue-select) {
  width: 100%;
}

:deep(.vue-select .vs__dropdown-toggle) {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  min-height: 40px;
}

:deep(.vue-select .vs__selected-options) {
  padding: 0;
}

:deep(.vue-select .vs__actions) {
  padding: 0;
}

:deep(.vue-select .vs__search) {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  color: var(--color-text-primary);
}

:deep(.vue-select .vs__dropdown-menu) {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

:deep(.vue-select .vs__dropdown-option) {
  padding: 8px 12px;
  color: var(--color-text-primary);
}

:deep(.vue-select .vs__dropdown-option--highlight) {
  background-color: var(--color-primary);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
}
</style> 