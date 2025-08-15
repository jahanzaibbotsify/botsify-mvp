<script setup lang="ts">
import { computed } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface Props {
  modelValue?: { start: string; end: string };
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  format?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: '', end: '' }),
  placeholder: 'Select date range',
  disabled: false,
  required: false,
  format: 'yyyy-MM-dd'
});

const emit = defineEmits<{
  'update:modelValue': [value: { start: string; end: string }];
  'change': [value: { start: string; end: string }];
}>();

const dateRangeClasses = computed(() => [
  'ui-date-range',
  {
    'ui-date-range--error': props.error,
    'ui-date-range--disabled': props.disabled
  }
]);

// Computed binding between strings ↔ Date objects
const dateModel = computed({
  get: () => {
    if (props.modelValue?.start && props.modelValue?.end) {
      return [new Date(props.modelValue.start), new Date(props.modelValue.end)];
    }
    return null;
  },
  set: (val: [Date, Date] | null) => {
    if (val && val[0] && val[1]) {
      const start = val[0].toISOString().split('T')[0];
      const end = val[1].toISOString().split('T')[0];
      emit('update:modelValue', { start, end });
      emit('change', { start, end });
    }
  }
});


</script>

<template>
  <div class="date-range-wrapper">
    <label v-if="label" class="date-range-label">
      {{ label }} <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="date-range-container" :class="dateRangeClasses">
      <VueDatePicker
        v-model="dateModel"
        :disabled="disabled"
        :enable-time-picker="false"
        range
        :placeholder="placeholder"
        :format="format"
        :clearable="false"
      />
    </div>

    <div v-if="error" class="date-range-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.date-range-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-range-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.required-mark {
  color: var(--color-error);
}

.date-range-container {
  position: relative;
}

.date-range-container :deep(.dp__main) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  transition: border-color var(--transition-normal);
}

.date-range-container :deep(.dp__main:hover) {
  border-color: var(--color-primary);
}

.date-range-container :deep(.dp__main:focus-within) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 163, 255, 0.1);
}

.date-range-container--error :deep(.dp__main) {
  border-color: var(--color-error);
}

.date-range-container--disabled :deep(.dp__main) {
  opacity: 0.6;
  pointer-events: none;
}

.date-range-error {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: var(--space-1);
}
</style>
