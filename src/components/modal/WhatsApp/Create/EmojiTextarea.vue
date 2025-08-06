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
        :id="computedId"
        rows="3"
        class="emoji-textarea"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      
      <button 
        type="button" 
        class="emoji-trigger"
        @click="togglePicker"
        title="Add emoji"
      >
        😊
      </button>
      
      <div class="emoji-picker-container" v-if="showPicker">
        <div class="emoji-picker-overlay" @click="hidePicker"></div>
        <div class="emoji-picker">
          <div class="emoji-grid">
            <button 
              v-for="emoji in commonEmojis" 
              :key="emoji"
              class="emoji-item"
              @click="insertEmoji(emoji)"
              type="button"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="emoji-footer">
      <p class="characters-count">{{ textValue.length }}/{{ maxlength }} characters</p>
    </div>

    <p class="text-danger" v-if="localErrorText"><small>{{ localErrorText }}</small></p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
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
const showPicker = ref(false);

// Common emojis for quick access
const commonEmojis = [
  '😊', '😂', '❤️', '👍', '👎', '🎉', '🔥', '💯', '✨', '🌟',
  '😍', '😭', '😡', '😱', '😴', '🤔', '👀', '💪', '🙏', '🎯',
  '📱', '📞', '📧', '💻', '🌍', '🏠', '🚗', '✈️', '🎵', '📷'
];

// Computed
const computedId = computed(() => `emoji-textarea_${props.idSuffix}`);

// Watchers
watch(() => props.text, (newVal) => {
  textValue.value = newVal;
});

watch(() => props.errorText, (newVal) => {
  localErrorText.value = newVal;
});

watch(textValue, (newVal) => {
  emit('update:text', newVal);
  emit('check-variables', newVal);
  validateText();
});

// Methods
const onAddVariable = () => {
  emit('add-variable');
};

const handleInput = () => {
  emit('update:text', textValue.value);
  emit('check-variables', textValue.value);
  validateText();
};

const handleFocus = () => {
  // Handle focus
};

const handleBlur = () => {
  // Handle blur
};

const validateText = () => {
  if (textValue.value.length > props.maxlength) {
    localErrorText.value = `Text is too long. Maximum ${props.maxlength} characters allowed.`;
    emit('update:errorText', localErrorText.value);
  } else if (textValue.value === '') {
    localErrorText.value = 'The template body field is required';
    emit('update:errorText', localErrorText.value);
  } else {
    localErrorText.value = '';
    emit('update:errorText', '');
  }
};

const togglePicker = () => {
  showPicker.value = !showPicker.value;
};

const hidePicker = () => {
  showPicker.value = false;
};

const insertEmoji = (emoji: string) => {
  const textarea = document.getElementById(computedId.value) as HTMLTextAreaElement;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textValue.value;
    
    const newText = text.substring(0, start) + emoji + text.substring(end);
    textValue.value = newText;
    
    // Set cursor position after emoji
    nextTick(() => {
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
    });
    
    emit('update:text', newText);
    emit('check-variables', newText);
  }
  
  hidePicker();
};

// Click outside to close picker
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.emoji-textarea-container')) {
    hidePicker();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.form-group {
  margin-bottom: var(--space-4);
}

.emoji-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-2);
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  justify-content: space-between;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--color-bg-secondary);
}

.emoji-label {
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
}

.emoji-textarea-container {
  position: relative;
  border: 1px dashed var(--color-border-secondary);
  border-bottom: none;
  background: white;
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
  outline: none;
}

.emoji-textarea:focus {
  outline: none;
}

.emoji-trigger {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-normal);
}

.emoji-trigger:hover {
  background-color: var(--color-bg-hover);
}

.emoji-picker-container {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
}

.emoji-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.emoji-picker {
  position: relative;
  z-index: 1000;
  background: white;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  padding: var(--space-2);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: var(--space-1);
  max-width: 300px;
}

.emoji-item {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-normal);
}

.emoji-item:hover {
  background-color: var(--color-bg-hover);
}

.emoji-footer {
  display: flex;
  justify-content: flex-end;
  border: 1px dashed var(--color-border-secondary);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--space-2);
  background-color: var(--color-bg-secondary);
}

.characters-count {
  margin: 0;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
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
