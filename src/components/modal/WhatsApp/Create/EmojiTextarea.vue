<template>
  <div class="form-group">
    <div class="emoji-header">
      <p class="emoji-label">{{ label }}</p>
      <Button
        type="button"
        @click="onAddVariable"
        variant="primary"
        size="small"
      >
        Add Variable <i class="fa fa-plus"></i>
      </Button>
    </div>

    <div class="emoji-textarea-container">
      <textarea
        v-model="textValue"
        :maxlength="maxlength"
        data-autoresize
        :id="computedId"
        rows="4"
        class="emoji-textarea"
        :placeholder="placeholder"
      ></textarea>
    </div>

    <div class="emoji-footer">
      <p class="characters-count">{{ textValue.length }}/{{ maxlength }} characters</p>
    </div>

    <p class="text-danger" v-if="localErrorText"><small>{{ localErrorText }}</small></p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { Button } from '@/components/ui';

// Props
interface Props {
  idSuffix: string | number;
  text?: string;
  errorText?: string;
  label?: string;
  placeholder?: string;
  maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  errorText: '',
  label: 'BODY',
  placeholder: 'Type message you want to send...',
  maxlength: 1024
});

// Emits
const emit = defineEmits<{
  'update:text': [value: string];
  'update:errorText': [value: string];
  'add-variable': [];
  'check-variables': [value: string];
}>();

// Reactive data
const textValue = ref(props.text);
const localErrorText = ref(props.errorText);

// Computed
const computedId = computed(() => `emojionearea_${props.idSuffix}`);

// Watchers
watch(() => props.text, (newVal) => {
  textValue.value = newVal;
  nextTick(() => loadEmojiArea());
});

watch(() => props.errorText, (newVal) => {
  localErrorText.value = newVal;
});

watch(textValue, (newVal) => {
  emit('update:text', newVal);
});

// Methods
const onAddVariable = () => {
  emit('add-variable');
};

const checkVariables = () => {
  emit('check-variables', textValue.value);
};

const loadEmojiArea = () => {
  const selector = `#${computedId.value}`;
  const interval = setInterval(() => {
    if (typeof (window as any).$(selector).emojioneArea === 'function') {
      (window as any).$(selector).emojioneArea({
        pickerPosition: 'right',
        tonesStyle: 'bullet',
        attributes: { dir: 'auto' },
        events: {
          change(this: any) {
            const newText = this.getText();
            const limitedText = newText.length > props.maxlength
              ? newText.substring(0, props.maxlength)
              : newText;

            if (newText === '') {
              localErrorText.value = 'The template body field is required';
              emit('update:errorText', localErrorText.value);
            } else {
              localErrorText.value = '';
              emit('update:errorText', '');
            }

            if (limitedText !== textValue.value) {
              textValue.value = limitedText;
            }

            checkVariables();
          },
          keyup(this: any) {
            const newText = this.getText();
            const limitedText = newText.length > props.maxlength
              ? newText.substring(0, props.maxlength)
              : newText;

            if (newText === '') {
              localErrorText.value = 'The template body field is required';
              emit('update:errorText', localErrorText.value);
            } else {
              localErrorText.value = '';
              emit('update:errorText', '');
            }

            if (limitedText !== textValue.value) {
              textValue.value = limitedText;
            }

            checkVariables();
          },
          onLoad(this: any) {
            this.setText(textValue.value || '');
          }
        }
      });

      clearInterval(interval);
    }
  }, 100);
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    loadEmojiArea();
  });
});
</script>

<style scoped>
.emoji-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-2);
  border: 1px dashed var(--color-border);
  border-bottom: none;
  background-color: var(--color-bg-secondary);
}

.emoji-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.emoji-textarea-container {
  border: 1px dashed var(--color-border);
  border-bottom: none;
  background-color: var(--color-bg-secondary);
}

.emoji-textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: var(--space-3);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 120px;
}

.emoji-textarea:focus {
  outline: none;
}

.emoji-footer {
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
  margin-top: var(--space-2);
}
</style>
