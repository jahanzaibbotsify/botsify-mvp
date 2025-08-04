<script setup lang="ts">
import { ref } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'save-settings': [settings: any];
}>();

// Reactive data
const autoResponderSettings = ref({
  enabled: false,
  responseTemplate: '',
  keywords: [] as string[],
  autoReplyDelay: 5
});

const newKeyword = ref('');

const addKeyword = () => {
  if (newKeyword.value.trim() && !autoResponderSettings.value.keywords.includes(newKeyword.value.trim())) {
    autoResponderSettings.value.keywords.push(newKeyword.value.trim());
    newKeyword.value = '';
  }
};

const removeKeyword = (index: number) => {
  autoResponderSettings.value.keywords.splice(index, 1);
};

const saveSettings = () => {
  emit('save-settings', autoResponderSettings.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Comment Auto Responder</h3>
    <p class="subtitle">Automatically respond to comments on your Facebook posts</p>

    <div class="settings-section">
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="autoResponderSettings.enabled"
            class="checkbox-input"
          />
          <span class="checkbox-text">Enable Auto Responder</span>
        </label>
      </div>

      <div v-if="autoResponderSettings.enabled" class="enabled-settings">
        <div class="form-group">
          <label for="response-template">Response Template</label>
          <textarea 
            id="response-template"
            v-model="autoResponderSettings.responseTemplate"
            placeholder="Enter your auto-response template..."
            class="form-input"
            rows="4"
          ></textarea>
          <small class="help-text">
            Use {{name}} to include the commenter's name
          </small>
        </div>

        <div class="form-group">
          <label>Keywords (Optional)</label>
          <div class="keywords-section">
            <div class="keyword-input-group">
              <input 
                v-model="newKeyword"
                type="text"
                placeholder="Add keyword"
                class="form-input"
                @keyup.enter="addKeyword"
              />
              <button 
                type="button"
                class="add-keyword-btn"
                @click="addKeyword"
                :disabled="!newKeyword.trim()"
              >
                Add
              </button>
            </div>
            
            <div v-if="autoResponderSettings.keywords.length > 0" class="keywords-list">
              <div 
                v-for="(keyword, index) in autoResponderSettings.keywords" 
                :key="index"
                class="keyword-item"
              >
                <span class="keyword-text">{{ keyword }}</span>
                <button 
                  type="button"
                  class="remove-keyword-btn"
                  @click="removeKeyword(index)"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="reply-delay">Reply Delay (seconds)</label>
          <input 
            id="reply-delay"
            v-model="autoResponderSettings.autoReplyDelay"
            type="number"
            min="1"
            max="60"
            class="form-input"
          />
          <small class="help-text">
            Delay before sending auto-reply (1-60 seconds)
          </small>
        </div>
      </div>

      <div v-else class="disabled-state">
        <div class="empty-state">
          <i class="pi pi-comments empty-icon"></i>
          <h4>Auto Responder Disabled</h4>
          <p>Enable the auto responder to automatically reply to comments on your Facebook posts.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.settings-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-tertiary, #9ca3af);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

/* Checkbox Styles */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary, #3b82f6);
}

.checkbox-text {
  font-size: 14px;
}

/* Keywords Section */
.keywords-section {
  margin-top: 8px;
}

.keyword-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.add-keyword-btn {
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
  white-space: nowrap;
}

.add-keyword-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.add-keyword-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-sm, 4px);
  font-size: 14px;
}

.keyword-text {
  color: var(--color-text-primary, #111827);
}

.remove-keyword-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: var(--color-error, #ef4444);
  color: white;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
  font-size: 10px;
}

.remove-keyword-btn:hover {
  background: var(--color-error-hover, #dc2626);
}

/* Disabled State */
.disabled-state {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .keyword-input-group {
    flex-direction: column;
  }
  
  .add-keyword-btn {
    width: 100%;
  }
}
</style> 