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
  'send-message': [message: any];
}>();

// Auto responder interface
interface AutoResponder {
  id: string;
  keywords: string[];
  selectedPost: string;
  message: string;
  isActive: boolean;
}

// Reactive data
const autoResponders = ref<AutoResponder[]>([
  {
    id: '1',
    keywords: ['help', 'support'],
    selectedPost: 'post-1',
    message: 'Thank you for your message! Our team will get back to you soon.',
    isActive: true
  },
  {
    id: '2',
    keywords: ['pricing', 'cost'],
    selectedPost: 'post-2',
    message: 'Check out our pricing page for detailed information about our plans.',
    isActive: true
  }
]);

const isAddingNew = ref(false);
const newKeyword = ref('');

// Post options (dummy data - would come from API)
const posts = [
  { value: '', label: 'Select a post' },
  { value: 'post-1', label: 'Welcome to our new service! 🎉' },
  { value: 'post-2', label: 'Check out our latest products' },
  { value: 'post-3', label: 'Happy holidays from our team' },
  { value: 'post-4', label: 'Customer success story' },
  { value: 'post-5', label: 'Upcoming event announcement' }
];

// New responder form
const newResponder = ref({
  keywords: '',
  selectedPost: '',
  message: ''
});

const addKeyword = () => {
  if (newKeyword.value.trim()) {
    const keywords = newResponder.value.keywords ? newResponder.value.keywords.split(',').map(k => k.trim()) : [];
    if (!keywords.includes(newKeyword.value.trim())) {
      keywords.push(newKeyword.value.trim());
      newResponder.value.keywords = keywords.join(', ');
    }
    newKeyword.value = '';
  }
};

const removeKeyword = (keywordToRemove: string) => {
  const keywords = newResponder.value.keywords.split(',').map(k => k.trim());
  const filteredKeywords = keywords.filter(k => k !== keywordToRemove);
  newResponder.value.keywords = filteredKeywords.join(', ');
};

const startAddingNew = () => {
  isAddingNew.value = true;
  newResponder.value = {
    keywords: '',
    selectedPost: '',
    message: ''
  };
};

const saveNewAutoResponder = () => {
  if (!newResponder.value.keywords || !newResponder.value.selectedPost || !newResponder.value.message) {
    console.error('All fields are required');
    return;
  }

  const keywords = newResponder.value.keywords.split(',').map(k => k.trim()).filter(k => k);
  
  const newAutoResponder: AutoResponder = {
    id: Date.now().toString(),
    keywords,
    selectedPost: newResponder.value.selectedPost,
    message: newResponder.value.message,
    isActive: true
  };

  autoResponders.value.unshift(newAutoResponder);
  cancelAddingNew();
};

const cancelAddingNew = () => {
  isAddingNew.value = false;
  newResponder.value = {
    keywords: '',
    selectedPost: '',
    message: ''
  };
  newKeyword.value = '';
};

const toggleAutoResponder = (responder: AutoResponder) => {
  responder.isActive = !responder.isActive;
};

const deleteAutoResponder = (id: string) => {
  autoResponders.value = autoResponders.value.filter(r => r.id !== id);
};

const getKeywordsArray = (keywordsString: string) => {
  return keywordsString.split(',').map(k => k.trim()).filter(k => k);
};

// Expose methods for parent component
defineExpose({
  autoResponders
});
</script>

<template>
  <div class="tab-panel">
    <h3>Comment auto responder</h3>
    <p class="subtitle">Automatically respond to comments based on keywords</p>

    <!-- Empty State -->
    <div v-if="autoResponders.length === 0 && !isAddingNew" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-comments"></i>
        </div>
        <h4>No auto responders</h4>
        <p>Create your first auto responder to automatically reply to comments.</p>
        <button 
          class="add-new-btn"
          @click="startAddingNew"
        >
          <i class="pi pi-plus"></i>
          Create auto responder
        </button>
      </div>
    </div>

    <!-- Add New Form -->
    <div v-if="isAddingNew" class="add-form">
      <div class="form-header">
        <h4>Create new auto responder</h4>
        <button class="close-btn" @click="cancelAddingNew">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="form-group">
        <label>Keywords (comma separated)</label>
        <input 
          v-model="newResponder.keywords"
          type="text"
          placeholder="help, support, pricing"
          class="form-input"
        />
        <small class="help-text">Enter keywords separated by commas</small>
      </div>

      <div class="form-group">
        <label>Select post</label>
        <select 
          v-model="newResponder.selectedPost"
          class="form-input"
        >
          <option v-for="post in posts" :key="post.value" :value="post.value">
            {{ post.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Response message</label>
        <textarea 
          v-model="newResponder.message"
          placeholder="Enter your auto-response message"
          class="form-input"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <button 
          class="action-btn secondary"
          @click="cancelAddingNew"
        >
          Cancel
        </button>
        <button 
          class="action-btn primary"
          @click="saveNewAutoResponder"
          :disabled="!newResponder.keywords || !newResponder.selectedPost || !newResponder.message"
        >
          Create auto responder
        </button>
      </div>
    </div>

    <!-- Auto Responders List -->
    <div v-if="autoResponders.length > 0" class="responders-section">
      <div class="section-header">
        <h4>Auto responders ({{ autoResponders.length }})</h4>
        <button 
          v-if="!isAddingNew"
          class="add-new-btn"
          @click="startAddingNew"
        >
          <i class="pi pi-plus"></i>
          Add New
        </button>
      </div>
      
      <div class="responders-list">
        <div 
          v-for="responder in autoResponders" 
          :key="responder.id"
          class="responder-card"
        >
          <div class="responder-header">
            <div class="responder-info">
              <div class="keywords-display">
                <span v-for="keyword in responder.keywords" :key="keyword" class="keyword-badge">
                  {{ keyword }}
                </span>
              </div>
              <div class="post-display">
                {{ posts.find(p => p.value === responder.selectedPost)?.label }}
              </div>
            </div>
            <div class="responder-actions">
              <button 
                class="toggle-btn"
                :class="{ active: responder.isActive }"
                @click="toggleAutoResponder(responder)"
                :title="responder.isActive ? 'Disable' : 'Enable'"
              >
                <i class="pi" :class="responder.isActive ? 'pi-check' : 'pi-times'"></i>
              </button>
              <button 
                class="delete-btn"
                @click="deleteAutoResponder(responder.id)"
                title="Delete"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
          <div class="responder-message">
            {{ responder.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.add-new-btn {
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

.add-new-btn:hover {
  background: var(--color-primary-hover, #2563eb);
}

.add-new-btn i {
  font-size: 12px;
}

/* Add Form */
.add-form {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  margin-bottom: 24px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm, 4px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.close-btn:hover {
  background: var(--color-error, #ef4444);
  color: white;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

/* Responders List */
.responders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.responder-card {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  transition: border-color var(--transition-normal, 0.2s ease);
}

.responder-card:hover {
  border-color: var(--color-primary, #3b82f6);
}

.responder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.responder-info {
  flex: 1;
}

.keywords-display {
  margin-bottom: 8px;
}

.keyword-badge {
  display: inline-block;
  padding: 4px 8px;
  margin: 2px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
}

.post-display {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
}

.responder-actions {
  display: flex;
  gap: 8px;
}

.toggle-btn,
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.toggle-btn {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
}

.toggle-btn.active {
  background: var(--color-secondary, #10b981);
  color: white;
}

.toggle-btn:hover {
  background: var(--color-secondary, #10b981);
  color: white;
}

.delete-btn {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
}

.delete-btn:hover {
  background: var(--color-error, #ef4444);
  color: white;
}

.responder-message {
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  line-height: 1.5;
  padding: 12px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: var(--radius-sm, 4px);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .responder-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .responder-actions {
    align-self: flex-end;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 