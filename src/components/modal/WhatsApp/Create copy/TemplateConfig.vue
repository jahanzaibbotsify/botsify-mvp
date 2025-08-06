<script setup lang="ts">
import VueSelect from "vue3-select-component";

// Props
interface Props {
  templateForm: any;
  categories: any[];
  languages: any[];
  templateTypes: any[];
  onSelectChange: (key: string, value: string | string[]) => void;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="template-config">
    <div class="config-row">
      <div class="form-group">
        <label>Category</label>
        <VueSelect
          :model-value="templateForm.category"
          @update:model-value="(value: any) => onSelectChange('category', value)"
          :options="categories"
          placeholder="Select category"
        />
      </div>
      
      <div class="form-group">
        <label>Language</label>
        <VueSelect
          :model-value="templateForm.language"
          @update:model-value="(value: any) => onSelectChange('language', value)"
          :options="languages"
          placeholder="Select language"
        />
      </div>
    </div>

    <div class="form-group">
      <label>Media Block Type</label>
      <VueSelect
        :model-value="templateForm.type"
        @update:model-value="(value: any) => onSelectChange('type', value)"
        :options="templateTypes"
        placeholder="Select template type"
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
}

/* VueSelect Styling */
:deep(.control) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding-left: var(--space-2);
  height: 38px;
}

:deep(.vue3-select-component),
:deep(.vue3-select-component input) {
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
}
</style> 