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
        />
      </div>
      
      <div class="form-group">
        <label>Language</label>
        <VueSelect
          :model-value="store.block.language"
          @update:model-value="(value: any) => store.block.language = value"
          :options="store.languages"
          placeholder="Select Template Language"
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
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
}
</style> 