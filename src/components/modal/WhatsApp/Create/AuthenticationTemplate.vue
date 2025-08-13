<script setup lang="ts">
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

const store = useWhatsAppTemplateStore();
</script>

<template>
  <div class="auth-template-section">
    <div class="auth-info">
      <h4>Authentication template</h4>
      <p class="auth-description">
        This template will be used for OTP verification. The body should contain {{1}} placeholder for the verification code.
      </p>
    </div>
    
    <div class="form-group">
      <div class="buttons-header">
        <p class="buttons-label">Copy code button</p>
      </div>
      
      <div class="buttons-body">
        <div class="button-item">
          <div class="button-config-row">
            <div class="button-config-section full-width">
              <label class="button-label">Button text</label>
              <Input
                v-model="store.block.buttons[0].text"
                placeholder="e.g., Copy code"
                maxlength="20"
              />
              <p class="input-hint">Text that will appear on the copy code button</p>
              <p v-if="store.errors.title_btn_var" class="text-danger">
                <small>{{ store.errors.title_btn_var }}</small>
              </p>
            </div>
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

.buttons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border-bottom: none;
}

.buttons-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.buttons-body {
  border: 1px dashed var(--color-border-secondary);
  padding: var(--space-3);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.button-item {
  margin-bottom: var(--space-4);
}

.button-item:last-child {
  margin-bottom: 0;
}

.button-config-row {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
  margin-bottom: var(--space-3);
}

.button-config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.button-config-section.full-width {
  flex: 1;
}

.button-config-section .button-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-hint {
  margin: var(--space-1) 0 0 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.text-danger {
  color: var(--color-error);
  margin-top: var(--space-2);
  font-size: 0.75rem;
}
</style>
