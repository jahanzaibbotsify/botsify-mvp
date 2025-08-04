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
  'schedule-message': [message: any];
  'delete-scheduled': [id: number];
}>();

// Reactive data
const scheduledMessages = ref([
  {
    id: 1,
    title: 'Weekly Newsletter',
    message: 'Check out our latest updates and offers!',
    scheduledDate: '2024-01-15T10:00:00',
    status: 'scheduled',
    targetAudience: 'Subscribed Users'
  },
  {
    id: 2,
    title: 'Product Launch',
    message: 'Our new product is now available!',
    scheduledDate: '2024-01-20T14:30:00',
    status: 'scheduled',
    targetAudience: 'All Users'
  }
]);

const newMessage = ref({
  title: '',
  message: '',
  scheduledDate: '',
  targetAudience: 'All Users'
});

const showForm = ref(false);

const audienceOptions = [
  { value: 'All Users', label: 'All Users' },
  { value: 'Subscribed Users', label: 'Subscribed Users' },
  { value: 'Custom List', label: 'Custom List' }
];

const scheduleMessage = () => {
  if (!newMessage.value.title || !newMessage.value.message || !newMessage.value.scheduledDate) {
    console.error('Title, message, and scheduled date are required');
    return;
  }

  const message = {
    id: Date.now(),
    ...newMessage.value,
    status: 'scheduled'
  };

  scheduledMessages.value.push(message);
  emit('schedule-message', message);
  
  // Reset form
  newMessage.value = {
    title: '',
    message: '',
    scheduledDate: '',
    targetAudience: 'All Users'
  };
  showForm.value = false;
};

const deleteScheduled = (id: number) => {
  scheduledMessages.value = scheduledMessages.value.filter(msg => msg.id !== id);
  emit('delete-scheduled', id);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'var(--color-primary, #3b82f6)';
    case 'sent':
      return 'var(--color-secondary, #10b981)';
    case 'failed':
      return 'var(--color-error, #ef4444)';
    default:
      return 'var(--color-text-secondary, #6b7280)';
  }
};

// Expose methods for parent component
defineExpose({
  scheduleMessage,
  deleteScheduled
});
</script>

<template>
  <div class="tab-panel">
    <h3>Schedule Messages</h3>
    <p class="subtitle">Schedule messages to be sent at specific times</p>

    <div class="schedule-section">
      <!-- Add New Message Button -->
      <div class="add-message-section">
        <button 
          v-if="!showForm"
          class="add-message-btn"
          @click="showForm = true"
        >
          <i class="pi pi-plus"></i>
          Schedule New Message
        </button>
      </div>

      <!-- New Message Form -->
      <div v-if="showForm" class="message-form">
        <h4>Schedule New Message</h4>
        
        <div class="form-group">
          <label for="message-title">Message Title</label>
          <input 
            id="message-title"
            v-model="newMessage.title"
            type="text"
            placeholder="Enter message title"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="message-content">Message Content</label>
          <textarea 
            id="message-content"
            v-model="newMessage.message"
            placeholder="Enter your message content..."
            class="form-input"
            rows="4"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="scheduled-date">Scheduled Date & Time</label>
            <input 
              id="scheduled-date"
              v-model="newMessage.scheduledDate"
              type="datetime-local"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="target-audience">Target Audience</label>
            <select id="target-audience" v-model="newMessage.targetAudience" class="form-input">
              <option v-for="option in audienceOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="action-button"
            @click="showForm = false"
          >
            Cancel
          </button>
          <button 
            class="action-button primary"
            @click="scheduleMessage"
            :disabled="!newMessage.title || !newMessage.message || !newMessage.scheduledDate"
          >
            Schedule Message
          </button>
        </div>
      </div>

      <!-- Scheduled Messages List -->
      <div class="scheduled-messages">
        <h4>Scheduled Messages</h4>
        
        <div v-if="scheduledMessages.length === 0" class="empty-state">
          <i class="pi pi-clock empty-icon"></i>
          <h5>No Scheduled Messages</h5>
          <p>You haven't scheduled any messages yet.</p>
        </div>

        <div v-else class="messages-list">
          <div 
            v-for="message in scheduledMessages" 
            :key="message.id"
            class="message-item"
          >
            <div class="message-header">
              <div class="message-title">{{ message.title }}</div>
              <div class="message-status" :style="{ color: getStatusColor(message.status) }">
                {{ message.status }}
              </div>
            </div>
            
            <div class="message-content">
              {{ message.message }}
            </div>
            
            <div class="message-details">
              <div class="detail-item">
                <strong>Scheduled:</strong> {{ formatDate(message.scheduledDate) }}
              </div>
              <div class="detail-item">
                <strong>Audience:</strong> {{ message.targetAudience }}
              </div>
            </div>
            
            <div class="message-actions">
              <button 
                class="action-btn danger"
                @click="deleteScheduled(message.id)"
              >
                <i class="pi pi-trash"></i>
                Delete
              </button>
            </div>
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

.schedule-section {
  margin-top: 20px;
}

.add-message-section {
  margin-bottom: 24px;
}

.add-message-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
}

.add-message-btn:hover {
  background: var(--color-primary-hover, #2563eb);
}

.add-message-btn i {
  font-size: 12px;
}

/* Message Form */
.message-form {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  margin-bottom: 24px;
}

.message-form h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
}

.action-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Scheduled Messages */
.scheduled-messages h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
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

.empty-state h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.message-title {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 16px;
}

.message-status {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.message-content {
  margin-bottom: 12px;
  color: var(--color-text-primary, #111827);
  line-height: 1.5;
}

.message-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.detail-item {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

.detail-item strong {
  color: var(--color-text-primary, #111827);
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
}

.action-btn.danger {
  background: var(--color-error, #ef4444);
  color: white;
}

.action-btn.danger:hover {
  background: var(--color-error-hover, #dc2626);
}

.action-btn i {
  font-size: 10px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 