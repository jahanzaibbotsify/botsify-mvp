<script setup lang="ts">
import { Input, VueSelect } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

const store = useWhatsAppTemplateStore();
</script>

<template>
  <div class="auth-template-section">
    <div class="auth-info">
      <h4>Authentication Template</h4>
      <p class="auth-description">
        This template will be used for OTP verification. The body should contain {{1}} placeholder for the verification code.
      </p>
    </div>
    
    <div class="form-group">
      <div class="dashed-border d-flex align-items-center justify-content-between p-2">
        <p class="mb-0 px-3 font-weight-bold py-2 text-uppercase mr-2">button</p>
        <div class="d-flex justify-content-between align-items-center px-3">
          <VueSelect
            :model-value="store.block.buttons[0].type"
            @update:model-value="(value: any) => { store.block.buttons[0].type = value; store.onChangeCta(0, 0); }"
            :options="store.ctaOptions"
            placeholder="Select Call to action"
            class="form-control px-2 py-1 ml-2"
            style="width: 180px !important; height: 33px;"
          />
        </div>
      </div>
      
      <div class="dashed-border border-bottom-0 templateBodyDiv buttons-body p-4 bg-white border-top-0">
        <div class="w-100 mb-4" v-for="(button, btnIndex) in store.block.buttons" :key="btnIndex">
          <div class="templateBodyDiv mb-3">
            <label class="form-label fw-semibold">Button Text</label>
            <Input
              v-model="button.text"
              placeholder="Enter button text"
              class="form-control"
            />
          </div>
          <div class="templateBodyDiv mb-3">
            <label class="form-label fw-semibold">Button Value</label>
            <Input
              v-model="button.value"
              placeholder="Enter button value"
              class="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-template-section {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.auth-info {
  margin-bottom: var(--space-4);
}

.auth-info h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.auth-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.dashed-border {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.templateBodyDiv {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
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

/* Utility Classes */
.text-uppercase {
  text-transform: uppercase;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-3 {
  margin-bottom: var(--space-3);
}

.mb-4 {
  margin-bottom: var(--space-4);
}

.p-2 {
  padding: var(--space-2);
}

.p-4 {
  padding: var(--space-4);
}

.px-2 {
  padding-left: var(--space-2);
  padding-right: var(--space-2);
}

.px-3 {
  padding-left: var(--space-3);
  padding-right: var(--space-3);
}

.py-1 {
  padding-top: var(--space-1);
  padding-bottom: var(--space-1);
}

.py-2 {
  padding-top: var(--space-2);
  padding-bottom: var(--space-2);
}

.mr-2 {
  margin-right: var(--space-2);
}

.ml-2 {
  margin-left: var(--space-2);
}

.w-100 {
  width: 100%;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.font-weight-bold {
  font-weight: 600;
}

.font-weight-semibold {
  font-weight: 500;
}

.border-bottom-0 {
  border-bottom: none;
}

.border-top-0 {
  border-top: none;
}

.bg-white {
  background-color: white;
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
  .d-flex {
    flex-direction: column;
  }
  
  .justify-content-between {
    justify-content: flex-start;
  }
}
</style>
