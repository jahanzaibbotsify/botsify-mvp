<script setup lang="ts">
import { computed } from "vue";

// Props
interface Props {
  bodyText: string;
  onUpdate: (text: string) => void;
  onAddVariable: () => void;
}

const props = defineProps<Props>();

const bodyCharCount = computed(() => props.bodyText.length);
const maxBodyChars = 1024;
</script>

<template>
  <div class="body-section">
    <div class="section-header">
      <h3>BODY</h3>
      <button 
        type="button"
        class="add-variable-btn"
        @click="onAddVariable"
      >
        <i class="pi pi-plus"></i>
        Add Variable
      </button>
    </div>
    
    <div class="form-group">
      <textarea 
        :value="bodyText"
        @input="(e) => onUpdate((e.target as HTMLTextAreaElement).value)"
        placeholder="Type message you want to send..."
        class="body-textarea"
        rows="6"
      ></textarea>
      
      <div class="textarea-footer">
        <div class="char-counter" :class="{ 'error': bodyCharCount > maxBodyChars }">
          {{ bodyCharCount }}/{{ maxBodyChars }} characters
        </div>
        <div class="translate-icon">
          <i class="pi pi-globe"></i>
        </div>
      </div>
      
      <div v-if="!bodyText" class="validation-error">
        The template body field is required
      </div>
    </div>
  </div>
</template>

<style scoped>
.body-section {
  margin-bottom: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.add-variable-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.add-variable-btn:hover {
  background: var(--color-primary-hover);
}

.body-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
}

.body-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-2);
  padding: 0 var(--space-2);
}

.char-counter {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.char-counter.error {
  color: var(--color-error);
}

.translate-icon {
  color: var(--color-success);
  font-size: 16px;
}

.validation-error {
  margin-top: var(--space-2);
  color: var(--color-error);
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style> 