<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Input, VueSelect } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload.vue";
import MessagePreview from "./Create/MessagePreview.vue";
import { useWhatsAppTemplateStore } from "@/stores/whatsappTemplateStore";

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

// Store
const store = useWhatsAppTemplateStore();

// Reactive data
const broadcastForm = ref({
  message: '',
  template: '',
  userSegment: '',
  phoneNumber: '',
  mediaType: 'text',
  uploadedFile: null as any | null
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
  { value: 'upload', label: 'Upload User' },
  { value: 'single', label: 'Single User' }
];

// Computed properties
const showFileUpload = computed(() => broadcastForm.value.userSegment === 'upload');
const showPhoneNumber = computed(() => broadcastForm.value.userSegment === 'single');

// Methods
const handleTemplateChange = () => {
  // Load template content based on selection
  switch (broadcastForm.value.template) {
    case 'welcome':
      store.block.text = 'Welcome to our service! We\'re excited to have you on board.';
      break;
    case 'promotion':
      store.block.text = '🎉 Special Offer! Get 20% off your next purchase. Limited time only!';
      break;
    case 'reminder':
      store.block.text = '⏰ Reminder: You have an appointment scheduled for tomorrow.';
      break;
    case 'newsletter':
      store.block.text = '📰 Our monthly newsletter is here! Check out the latest updates.';
      break;
    default:
      store.block.text = '';
  }
};

const handleFileUpload = (attachments: any[]) => {
  if (attachments && attachments.length > 0) {
    broadcastForm.value.uploadedFile = attachments[0];
  }
};

const sendBroadcast = () => {
  if (!store.block.text) {
    console.error('Message is required');
    return;
  }
  
  if (!broadcastForm.value.userSegment) {
    console.error('User segment is required');
    return;
  }
  
  if (broadcastForm.value.userSegment === 'single' && !broadcastForm.value.phoneNumber) {
    console.error('Phone number is required for single user broadcast');
    return;
  }
  
  if (broadcastForm.value.userSegment === 'upload' && !broadcastForm.value.uploadedFile) {
    console.error('File upload is required for upload user broadcast');
    return;
  }
  
  emit('send-broadcast', {
    ...broadcastForm.value,
    message: store.block.text,
    type: broadcastForm.value.userSegment
  });
};

// Expose methods for parent component
defineExpose({
  sendBroadcast
});
</script>

<template>
  <div class="broadcast-layout">
    <!-- Main Content -->
    <div class="main-content">
      <h3>Broadcast</h3>
      <p class="subtitle">Send broadcast messages to your audience</p>
      
      <div class="broadcast-form">
        <!-- Message Template -->
        <div class="form-group">
          <label for="broadcast-template">Message template</label>
          <VueSelect
            id="broadcast-template"
            v-model="broadcastForm.template"
            :options="messageTemplates"
            :reduce="(template: any) => template.value"
            placeholder="Select a template"
            @input="handleTemplateChange"
          />
        </div>
        
        <!-- User Segment -->
        <div class="form-group">
          <label for="broadcast-segment">User segment</label>
          <VueSelect
            id="broadcast-segment"
            v-model="broadcastForm.userSegment"
            :options="userSegments"
            :reduce="(segment: any) => segment.value"
            placeholder="Select user segment"
          />
        </div>
        
        <!-- File Upload (Upload user only) -->
        <div v-if="showFileUpload" class="form-group">
          <label>Upload user file</label>
          <FileUpload
            v-model="broadcastForm.uploadedFile"
            accept=".csv,.txt"
            :multiple="false"
            :max-size-m-b="10"
            text="Upload CSV or TXT file with phone numbers"
            @upload="handleFileUpload"
          />
          <small class="help-text">
            Upload a CSV or TXT file containing phone numbers to send messages to.
          </small>
        </div>
        
        <!-- Phone Number (Single user only) -->
        <div v-if="showPhoneNumber" class="form-group">
          <label for="broadcast-phone">Phone number</label>
          <Input
            id="broadcast-phone"
            v-model="broadcastForm.phoneNumber"
            type="tel"
            placeholder="Enter phone number"
          />
        </div>
      </div>
      
             <!-- Message Editor -->
       <div class="message-editor">
         <h4>Message content</h4>
         
         <!-- Simple textarea for message body -->
         <div class="form-group">
           <label for="broadcast-message">Message</label>
           <textarea
             id="broadcast-message"
             v-model="store.block.text"
             placeholder="Enter your broadcast message here..."
             class="message-textarea"
             rows="6"
           ></textarea>
         </div>
       </div>
    </div>
    
    <!-- Side Panel -->
    <div class="side-panel">
      <div class="preview-header">
        <h4>Message preview</h4>
      </div>
      <MessagePreview 
        :template="store.template"
        :block="store.block"
        :variables="store.template.variables"
      />
    </div>
  </div>
</template>

<style scoped>
.broadcast-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-4);
  height: 100%;
}

.main-content {
  padding: 0;
}

.main-content h3 {
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
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
}

.message-editor {
  margin-top: var(--space-6);
}

.message-editor h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.message-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #111827);
  background-color: var(--color-bg-tertiary, #f3f4f6);
  resize: vertical;
  min-height: 120px;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-textarea::placeholder {
  color: var(--color-text-tertiary, #9ca3af);
}

.side-panel {
  background: var(--color-bg-secondary, #f9fafb);
  border-left: 1px solid var(--color-border, #e5e7eb);
  padding: var(--space-4);
  overflow-y: auto;
  height: 100%;
}

.preview-header {
  margin-bottom: var(--space-4);
}

.preview-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .broadcast-layout {
    grid-template-columns: 1fr;
  }
  
  .side-panel {
    border-left: none;
    border-top: 1px solid var(--color-border, #e5e7eb);
    padding-top: var(--space-4);
  }
}

@media (max-width: 768px) {
  .broadcast-layout {
    gap: var(--space-3);
  }
  
  .side-panel {
    padding: var(--space-3);
  }
}
</style> 