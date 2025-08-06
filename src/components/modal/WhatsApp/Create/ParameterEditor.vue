<script setup lang="ts">
import { computed } from "vue";
import { Input } from "@/components/ui";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";
import MessagePreview from "./MessagePreview.vue";

const store = useWhatsAppTemplateStore();

// Extract variables from different sections
const headerVariables = computed(() => {
  if (store.template.header !== 'text') return [];
  const variables = store.extractVariables(store.template.header_text || '');
  return variables.map(num => ({ id: num, section: 'header', label: `Header Variable ${num}` }));
});

const bodyVariables = computed(() => {
  const variables = store.extractVariables(store.block.text || '');
  return variables.map(num => ({ id: num, section: 'body', label: `Body Variable ${num}` }));
});

const buttonVariables = computed(() => {
  const variables: any[] = [];
  store.block.buttons.forEach((button, buttonIndex) => {
    if (button.text) {
      const buttonVars = store.extractVariables(button.text);
      buttonVars.forEach(num => {
        variables.push({ 
          id: num, 
          section: 'button', 
          buttonIndex, 
          label: `Button ${buttonIndex + 1} Variable ${num}` 
        });
      });
    }
  });
  return variables;
});

const allVariables = computed(() => {
  return [...headerVariables.value, ...bodyVariables.value, ...buttonVariables.value];
});

const updateVariableValue = (variable: any, value: string) => {
  if (!store.template.variables) {
    store.template.variables = {};
  }
  
  const key = `${variable.section}_${variable.id}`;
  if (variable.section === 'button') {
    const buttonKey = `${key}_button_${variable.buttonIndex}`;
    store.template.variables[buttonKey] = value;
  } else {
    store.template.variables[key] = value;
  }
};

const getVariableValue = (variable: any) => {
  if (!store.template.variables) return '';
  
  const key = `${variable.section}_${variable.id}`;
  if (variable.section === 'button') {
    const buttonKey = `${key}_button_${variable.buttonIndex}`;
    return store.template.variables[buttonKey] || '';
  } else {
    return store.template.variables[key] || '';
  }
};
</script>

<template>
  <div class="parameter-editor">
    <div class="parameter-section">
      <h3>Template Name</h3>
      <Input
        v-model="store.template.name"
        placeholder="Enter template name"
        class="template-name-input"
      />
    </div>

    <!-- Authentication Template Parameters -->
    <div v-if="store.isAuthenticationCategory" class="parameter-section">
      <h3>Authentication Settings</h3>
      <div class="auth-params">
        <div class="form-group">
          <label>OTP Length</label>
          <Input
            v-model="store.template.otpLength"
            type="number"
            min="4"
            max="8"
            placeholder="6"
          />
        </div>
        <div class="form-group">
          <label>OTP Expiry (minutes)</label>
          <Input
            v-model="store.template.otpExpiry"
            type="number"
            min="1"
            max="60"
            placeholder="1"
          />
        </div>
      </div>
    </div>

    <!-- Variable Parameters -->
    <div v-if="allVariables.length > 0" class="parameter-section">
      <h3>Template Variables</h3>
      <div class="variables-list">
        <div 
          v-for="variable in allVariables" 
          :key="`${variable.section}_${variable.id}${variable.buttonIndex ? '_' + variable.buttonIndex : ''}`"
          class="variable-item"
        >
          <label>{{ variable.label }}</label>
          <Input
            :value="getVariableValue(variable)"
            @input="(value: string) => updateVariableValue(variable, value)"
            :placeholder="`Enter value for ${variable.label}`"
          />
        </div>
      </div>
    </div>

    <!-- Message Preview -->
    <div class="parameter-section">
      <h3>Message Preview</h3>
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
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.variable-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.variable-item label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-params {
    grid-template-columns: 1fr;
  }
}
</style> 