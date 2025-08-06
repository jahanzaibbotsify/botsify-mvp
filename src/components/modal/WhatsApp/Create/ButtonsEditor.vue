<template>
  <div class="form-group" v-show="show">
    <div class="buttons-header">
      <p class="buttons-label">buttons</p>
      <div class="buttons-controls" v-if="current == null || current <= 0">
        <Button
          v-if="block.buttons.length < template.total_buttons"
          type="button"
          @click="$emit('add-button', current || null)"
          variant="primary"
          size="small"
        >
          Add Button <i class="fa fa-plus"></i>
        </Button>
        <Button 
          v-else 
          type="button" 
          variant="secondary" 
          size="small"
          disabled
        >
          Add Button <i class="fa fa-plus"></i>
        </Button>

        <div class="button-type-selector" v-if="current == null || current <= 0">
          <VueSelect
            @close="() => $emit('after-select')"
            label="label"
            :clearable="false"
            v-model="template.button_type"
            :reduce="(b: any) => b.value"
            placeholder="Select Button Type"
            :options="buttonTypeOptions"
            @input="$emit('button-type-change', current || null)"
            :disabled="block.buttons.length > 0"
          />

          <i
            v-if="current !== null && current !== undefined"
            class="fa fa-info-circle fa-lg text-info"
            title="All slide buttons must have the same label length and button type (e.g., all CTA or all Postback)."
          ></i>
        </div>
      </div>
    </div>

    <div class="buttons-body">
      <div
        class="button-item"
        v-for="(button, btnIndex) in block.buttons"
        :key="btnIndex"
      >
        <div class="button-header">
          <p class="button-type-label" v-if="(current && current > 0) || button.type == 'postback'">
            {{ button.type == 'postback' ? 'Quick Reply' : button.type.replace(/_/g, ' ') }}
          </p>

          <template v-if="current == null || current <= 0">
            <div v-if="template.button_type === 'cta'" class="button-controls">
              <VueSelect
                @close="() => $emit('after-select')"
                label="label"
                :clearable="false"
                v-model="button.type"
                :reduce="(cta: any) => cta.value"
                placeholder="Select Call to action"
                :options="ctaOptions"
                :disabled="block.buttons.length > 1"
                @input="(val: any) => $emit('cta-change', btnIndex, current || null)"
              />
              <Button
                @click="$emit('remove-button', btnIndex, current || null)"
                variant="error"
                size="small"
              >
                <i class="fa fa-trash"></i>
              </Button>
            </div>

            <Button
              v-else
              @click="$emit('remove-button', btnIndex, current || null)"
              variant="error"
              size="small"
            >
              <i class="fa fa-trash"></i>
            </Button>
          </template>
        </div>

        <!-- Button Title -->
        <div class="button-title-container">
          <textarea
            v-model="button.title"
            rows="2"
            maxlength="20"
            class="button-title-input"
            placeholder="Type your button label here..."
          />
        </div>

        <div class="button-footer">
          <p class="characters-count">{{ button.title.length }}/20 characters</p>
        </div>

        <!-- Button Response -->
        <div class="button-response-container">
          <textarea
            v-if="button.type === 'postback'"
            v-model="button.response"
            maxlength="20"
            rows="2"
            class="button-response-input"
            placeholder="Type the response for the quick reply"
          />
          <template v-if="button.type === 'web_url'">
            <Input
              type="url"
              v-model="button.url"
              @input="$emit('check-url-variables', 'button', btnIndex, current || null)"
              placeholder="URL"
              required
            />
            <Button
              v-if="!template.variables.button"
              type="button"
              @click="$emit('add-variable', 'button', true, btnIndex, current || null)"
              title="Add Variable"
              variant="primary"
              size="small"
              class="add-variable-btn"
            >
              <i class="fa fa-plus"></i>
            </Button>
          </template>
          <textarea
            v-if="button.type === 'phone_number'"
            v-model="button.payload"
            rows="2"
            class="button-response-input"
            placeholder="Phone Number .. +1 631-555-5555"
          />
        </div>

        <div v-if="button.type === 'postback'" class="button-footer">
          <p class="characters-count">{{ button.response.length }}/20 characters</p>
        </div>

        <template v-if="button.type === 'web_url'">
          <div class="button-footer">
            <p class="characters-count text-danger" v-if="errors.url_btn_var !== ''">
              {{ errors.url_btn_var }}
            </p>
            <p class="characters-count">{{ template.variables.button ? 1 : 0 }}/1 variable (must be at the end of text)</p>
          </div>
        </template>
      </div>
    </div>

    <div class="buttons-footer">
      <p class="characters-count">{{ block.buttons.length }}/{{ template.total_buttons }} buttons</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, Input, VueSelect } from '@/components/ui';

// Props
interface Props {
  show: boolean;
  current?: number | null;
  template: any;
  block: any;
  errors: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'add-button': [current: number | null];
  'remove-button': [btnIndex: number, current: number | null];
  'after-select': [];
  'button-type-change': [current: number | null];
  'cta-change': [btnIndex: number, current: number | null];
  'check-url-variables': [type: string, btnIndex: number, current: number | null];
  'add-variable': [type: string, isButton: boolean, btnIndex: number, current: number | null];
}>();

// Data
const buttonTypeOptions = [
  { label: 'Quick Reply', value: 'postback' },
  { label: 'Call to action', value: 'cta' },
];

const ctaOptions = [
  { label: 'URL', value: 'web_url' },
  { label: 'Phone Number', value: 'phone_number' },
];
</script>

<style scoped>
.buttons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border);
  background-color: var(--color-bg-secondary);
}

.buttons-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.buttons-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.button-type-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 33%;
}

.button-type-selector i {
  margin-left: var(--space-2);
  cursor: pointer;
  color: var(--color-primary);
}

.buttons-body {
  border: 1px dashed var(--color-border);
  border-bottom: none;
  background-color: var(--color-bg-secondary);
  padding: var(--space-3);
}

.button-item {
  margin-bottom: var(--space-4);
}

.button-item:last-child {
  margin-bottom: 0;
}

.button-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border: 1px dashed var(--color-border);
  border-bottom: none;
  background-color: var(--color-bg-secondary);
}

.button-type-label {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.button-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.button-title-container {
  border: 1px dashed var(--color-border);
  border-bottom: none;
  background-color: var(--color-bg-secondary);
}

.button-title-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 80px;
}

.button-title-input:focus {
  outline: none;
}

.button-footer {
  display: flex;
  justify-content: flex-end;
  border: 1px dashed var(--color-border);
  border-top: none;
  background-color: var(--color-bg-secondary);
  padding: var(--space-2);
}

.button-response-container {
  border: 1px dashed var(--color-border);
  position: relative;
  background-color: var(--color-bg-secondary);
}

.button-response-container:not(:has(textarea)) {
  border-bottom: none;
}

.button-response-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 80px;
}

.button-response-input:focus {
  outline: none;
}

.add-variable-btn {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  font-size: 12px;
  padding: var(--space-1);
}

.buttons-footer {
  display: flex;
  justify-content: flex-end;
  border: 1px dashed var(--color-border);
  border-top: none;
  background-color: var(--color-bg-secondary);
  padding: var(--space-2);
}

.characters-count {
  margin: 0;
  padding: var(--space-1) var(--space-2);
  background: var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
}

.text-danger {
  color: var(--color-error);
}

.text-info {
  color: var(--color-primary);
}
</style>
  