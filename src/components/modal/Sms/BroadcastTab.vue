<script setup lang="ts">
import { ref, computed } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'send-broadcast': [data: any];
}>();

// Reactive data
const broadcastForm = ref({
  message: '',
  template: '',
  userSegment: '',
  mediaType: 'text'
});

// Message templates
const messageTemplates = [
  { value: '', label: 'Select a template' },
  { value: 'welcome', label: 'Welcome Message' },
  { value: 'promotion', label: 'Promotional Offer' },
  { value: 'reminder', label: 'Appointment Reminder' },
  { value: 'newsletter', label: 'Newsletter Update' },
  { value: 'custom', label: 'Custom Message' }
];

// User segments
const userSegments = [
  { value: '', label: 'Select user segment' },
  { value: 'subscribed', label: 'Subscribed Users' },
  { value: 'upload-user', label: 'Upload User List' }
];

// Preview data
const previewData = ref({
  image: '',
  text: '',
  buttons: [] as string[],
  description: ''
});

// Computed properties
const showUserSegment = computed(() => true); // Always show user segment for multiple broadcast

// Methods
const handleTemplateChange = () => {
  // Load template content based on selection
  switch (broadcastForm.value.template) {
    case 'welcome':
      broadcastForm.value.message = 'Welcome to our service! We\'re excited to have you on board.';
      break;
    case 'promotion':
      broadcastForm.value.message = '🎉 Special Offer! Get 20% off your next purchase. Limited time only!';
      break;
    case 'reminder':
      broadcastForm.value.message = '⏰ Reminder: You have an appointment scheduled for tomorrow.';
      break;
    case 'newsletter':
      broadcastForm.value.message = '📰 Our monthly newsletter is here! Check out the latest updates.';
      break;
    default:
      broadcastForm.value.message = '';
  }
  
  // Update preview
  updatePreview();
};

const updatePreview = () => {
  // Generate dummy preview data based on form
  previewData.value = {
    image: broadcastForm.value.mediaType === 'image' ? 'https://via.placeholder.com/300x200' : '',
    text: broadcastForm.value.message,
    buttons: broadcastForm.value.message.includes('offer') ? ['Shop Now', 'Learn More'] : [],
    description: broadcastForm.value.message.length > 100 ? broadcastForm.value.message.substring(0, 100) + '...' : broadcastForm.value.message
  };
};

const handleMessageChange = () => {
  updatePreview();
};

const sendBroadcast = () => {
  if (!broadcastForm.value.message) {
    console.error('Message is required');
    return;
  }
  
  if (!broadcastForm.value.userSegment) {
    console.error('User segment is required for broadcast');
    return;
  }
  
  emit('send-broadcast', {
    ...broadcastForm.value,
    type: 'multiple'
  });
};

// Expose methods for parent component
defineExpose({
  sendBroadcast
});
</script>

<template>
  <div class="tab-panel">
    <h3>Broadcast</h3>
    <p class="subtitle">Send broadcast messages to your audience</p>
    
    <div class="broadcast-form">
      <!-- Message Template -->
      <div class="form-group">
        <label for="broadcast-template">Message Template</label>
        <select 
          id="broadcast-template" 
          v-model="broadcastForm.template" 
          class="form-input"
          @change="handleTemplateChange"
        >
          <option v-for="template in messageTemplates" :key="template.value" :value="template.value">
            {{ template.label }}
          </option>
        </select>
      </div>
      
      <!-- User Segment -->
      <div class="form-group">
        <label for="broadcast-segment">User Segment</label>
        <select id="broadcast-segment" v-model="broadcastForm.userSegment" class="form-input">
          <option v-for="segment in userSegments" :key="segment.value" :value="segment.value">
            {{ segment.label }}
          </option>
        </select>
        <small v-if="broadcastForm.userSegment === 'upload-user'" class="help-text">
          Upload a CSV file with phone numbers to send to specific users.
        </small>
      </div>
    </div>
    
    <!-- Preview Section -->
    <div class="preview-section">
      <h4>Preview</h4>
      <div class="preview-container">
        <!-- Image Preview -->
        <div v-if="previewData.image" class="preview-image">
          <img :src="previewData.image" alt="Preview" />
        </div>
        
        <!-- Text Preview -->
        <div v-if="previewData.text" class="preview-text">
          {{ previewData.text }}
        </div>
        
        <!-- Buttons Preview -->
        <div v-if="previewData.buttons.length > 0" class="preview-buttons">
          <button 
            v-for="button in previewData.buttons" 
            :key="button"
            class="preview-button"
          >
            {{ button }}
          </button>
        </div>
        
        <!-- Description Preview -->
        <div v-if="previewData.description" class="preview-description">
          {{ previewData.description }}
        </div>
        
        <!-- Empty State -->
        <div v-if="!previewData.text && !previewData.image && previewData.buttons.length === 0" class="preview-empty">
          <p>No preview available. Add a message to see the preview.</p>
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
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.broadcast-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
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
}

/* Toggle Group */
.toggle-group {
  display: flex;
  gap: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 4px;
  background: var(--color-bg-tertiary, #f3f4f6);
}

.toggle-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.toggle-btn.active {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
}

/* Preview Section */
.preview-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.preview-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.preview-container {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  min-height: 120px;
}

.preview-image {
  margin-bottom: 12px;
}

.preview-image img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 4px);
}

.preview-text {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #111827);
}

.preview-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.preview-button {
  padding: 6px 12px;
  border: 1px solid var(--color-primary, #3b82f6);
  border-radius: var(--radius-sm, 4px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.preview-description {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.4;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: var(--color-text-tertiary, #9ca3af);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 768px) {
  .toggle-group {
    flex-direction: column;
  }
  
  .preview-buttons {
    flex-direction: column;
  }
  
  .preview-button {
    width: 100%;
    text-align: center;
  }
}
</style> 