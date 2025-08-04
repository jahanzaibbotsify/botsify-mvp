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
  'save-checkbox': [settings: any];
}>();

// Reactive data
const checkboxSettings = ref({
  enabled: false,
  checkboxText: 'Subscribe to our newsletter',
  privacyPolicyUrl: '',
  termsUrl: '',
  autoResponse: 'Thank you for subscribing!',
  placement: 'bottom'
});

const placementOptions = [
  { value: 'top', label: 'Top of Page' },
  { value: 'bottom', label: 'Bottom of Page' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'popup', label: 'Popup' }
];

const saveSettings = () => {
  if (!checkboxSettings.value.checkboxText) {
    console.error('Checkbox text is required');
    return;
  }
  emit('save-checkbox', checkboxSettings.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Facebook Checkbox Plugin</h3>
    <p class="subtitle">Configure the Facebook checkbox plugin for your page</p>

    <div class="settings-section">
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="checkboxSettings.enabled"
            class="checkbox-input"
          />
          <span class="checkbox-text">Enable Facebook Checkbox Plugin</span>
        </label>
      </div>

      <div v-if="checkboxSettings.enabled" class="enabled-settings">
        <div class="form-group">
          <label for="checkbox-text">Checkbox Text</label>
          <input 
            id="checkbox-text"
            v-model="checkboxSettings.checkboxText"
            type="text"
            placeholder="Enter checkbox text"
            class="form-input"
          />
          <small class="help-text">
            Text that will appear next to the checkbox
          </small>
        </div>

        <div class="form-group">
          <label for="privacy-policy">Privacy Policy URL</label>
          <input 
            id="privacy-policy"
            v-model="checkboxSettings.privacyPolicyUrl"
            type="url"
            placeholder="https://yourdomain.com/privacy"
            class="form-input"
          />
          <small class="help-text">
            URL to your privacy policy (optional but recommended)
          </small>
        </div>

        <div class="form-group">
          <label for="terms-url">Terms of Service URL</label>
          <input 
            id="terms-url"
            v-model="checkboxSettings.termsUrl"
            type="url"
            placeholder="https://yourdomain.com/terms"
            class="form-input"
          />
          <small class="help-text">
            URL to your terms of service (optional)
          </small>
        </div>

        <div class="form-group">
          <label for="auto-response">Auto Response Message</label>
          <textarea 
            id="auto-response"
            v-model="checkboxSettings.autoResponse"
            placeholder="Enter auto response message"
            class="form-input"
            rows="3"
          ></textarea>
          <small class="help-text">
            Message sent to users after they check the box
          </small>
        </div>

        <div class="form-group">
          <label for="placement">Plugin Placement</label>
          <select id="placement" v-model="checkboxSettings.placement" class="form-input">
            <option v-for="option in placementOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <small class="help-text">
            Where the checkbox plugin will appear on your page
          </small>
        </div>
      </div>

      <div v-else class="disabled-state">
        <div class="empty-state">
          <i class="pi pi-check-square empty-icon"></i>
          <h4>Checkbox Plugin Disabled</h4>
          <p>Enable the Facebook checkbox plugin to collect user permissions and subscriptions.</p>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="checkboxSettings.enabled" class="preview-section">
      <h4>Preview</h4>
      <div class="preview-container">
        <div class="checkbox-preview">
          <label class="preview-checkbox-label">
            <input type="checkbox" class="preview-checkbox" />
            <span class="preview-checkbox-text">{{ checkboxSettings.checkboxText }}</span>
          </label>
        </div>
        
        <div v-if="checkboxSettings.privacyPolicyUrl || checkboxSettings.termsUrl" class="preview-links">
          <div v-if="checkboxSettings.privacyPolicyUrl" class="preview-link">
            <a href="#" class="link-text">Privacy Policy</a>
          </div>
          <div v-if="checkboxSettings.termsUrl" class="preview-link">
            <a href="#" class="link-text">Terms of Service</a>
          </div>
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

/* Preview Section */
.preview-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.preview-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.preview-container {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
}

.checkbox-preview {
  margin-bottom: 16px;
}

.preview-checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.preview-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary, #3b82f6);
}

.preview-checkbox-text {
  font-weight: 500;
}

.preview-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.preview-link {
  font-size: 12px;
}

.link-text {
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
}

.link-text:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .preview-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 