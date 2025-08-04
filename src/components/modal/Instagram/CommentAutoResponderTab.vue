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
  isEditing?: boolean;
}

// Reactive data
const autoResponders = ref<AutoResponder[]>([
  {
    id: '1',
    keywords: ['help', 'support'],
    selectedPost: 'post-1',
    message: 'Thank you for your comment! Our team will get back to you soon.'
  },
  {
    id: '2',
    keywords: ['pricing', 'cost'],
    selectedPost: 'post-2',
    message: 'Check out our pricing page for detailed information about our plans.'
  }
]);

const newAutoResponder = ref<AutoResponder>({
  id: '',
  keywords: [],
  selectedPost: '',
  message: ''
});

const newKeyword = ref('');
const isAddingNew = ref(false);

// Post options (dummy data - would come from API)
const posts = [
  { value: '', label: 'Select a post' },
  { value: 'post-1', label: 'Welcome to our new service! 🎉' },
  { value: 'post-2', label: 'Check out our latest products' },
  { value: 'post-3', label: 'Happy holidays from our team' },
  { value: 'post-4', label: 'Customer success story' },
  { value: 'post-5', label: 'Upcoming event announcement' }
];

const addKeyword = () => {
  if (newKeyword.value.trim() && !newAutoResponder.value.keywords.includes(newKeyword.value.trim())) {
    newAutoResponder.value.keywords.push(newKeyword.value.trim());
    newKeyword.value = '';
  }
};

const removeKeyword = (index: number) => {
  newAutoResponder.value.keywords.splice(index, 1);
};

const addKeywordToExisting = (responder: AutoResponder) => {
  if (newKeyword.value.trim() && !responder.keywords.includes(newKeyword.value.trim())) {
    responder.keywords.push(newKeyword.value.trim());
    newKeyword.value = '';
  }
};

const removeKeywordFromExisting = (responder: AutoResponder, index: number) => {
  responder.keywords.splice(index, 1);
};

const startAddingNew = () => {
  isAddingNew.value = true;
  newAutoResponder.value = {
    id: Date.now().toString(),
    keywords: [],
    selectedPost: '',
    message: ''
  };
};

const saveNewAutoResponder = () => {
  if (!newAutoResponder.value.keywords.length || !newAutoResponder.value.selectedPost || !newAutoResponder.value.message) {
    console.error('All fields are required');
    return;
  }
  
  autoResponders.value.push({ ...newAutoResponder.value });
  isAddingNew.value = false;
  newAutoResponder.value = {
    id: '',
    keywords: [],
    selectedPost: '',
    message: ''
  };
};

const cancelAddingNew = () => {
  isAddingNew.value = false;
  newAutoResponder.value = {
    id: '',
    keywords: [],
    selectedPost: '',
    message: ''
  };
  newKeyword.value = '';
};

const editAutoResponder = (responder: AutoResponder) => {
  responder.isEditing = true;
};

const saveEdit = (responder: AutoResponder) => {
  if (!responder.keywords.length || !responder.selectedPost || !responder.message) {
    console.error('All fields are required');
    return;
  }
  responder.isEditing = false;
};

const cancelEdit = (responder: AutoResponder) => {
  responder.isEditing = false;
};

const deleteAutoResponder = (id: string) => {
  const index = autoResponders.value.findIndex(r => r.id === id);
  if (index !== -1) {
    autoResponders.value.splice(index, 1);
  }
};

const sendMessage = () => {
  if (autoResponders.value.length === 0) {
    console.error('No auto responders configured');
    return;
  }
  emit('send-message', autoResponders.value);
};

const saveSettings = () => {
  emit('save-settings', autoResponders.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
  sendMessage
});
</script>

<template>
  <div class="tab-panel">
    <h3>Comment Auto Responder</h3>
    <p class="subtitle">Configure automatic responses to comments on your Instagram posts</p>

    <!-- Add New Auto Responder Button -->
    <div class="add-new-section">
      <button 
        v-if="!isAddingNew"
        class="add-new-btn"
        @click="startAddingNew"
      >
        <i class="pi pi-plus"></i>
        Add New Auto Responder
      </button>
    </div>

    <!-- Add New Auto Responder Form -->
    <div v-if="isAddingNew" class="new-responder-form">
      <h4>Add New Auto Responder</h4>
      
      <div class="form-group">
        <label>Keywords</label>
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
          
          <div v-if="newAutoResponder.keywords.length > 0" class="keywords-list">
            <div 
              v-for="(keyword, index) in newAutoResponder.keywords" 
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
        <label for="new-selected-post">Select Post</label>
        <select 
          id="new-selected-post"
          v-model="newAutoResponder.selectedPost"
          class="form-input"
        >
          <option v-for="post in posts" :key="post.value" :value="post.value">
            {{ post.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="new-message">Message</label>
        <textarea 
          id="new-message"
          v-model="newAutoResponder.message"
          placeholder="Enter your auto-response message"
          class="form-input"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <button 
          class="action-btn"
          @click="cancelAddingNew"
        >
          Cancel
        </button>
        <button 
          class="action-btn primary"
          @click="saveNewAutoResponder"
          :disabled="!newAutoResponder.keywords.length || !newAutoResponder.selectedPost || !newAutoResponder.message"
        >
          Save Auto Responder
        </button>
      </div>
    </div>

    <!-- Auto Responders List -->
    <div v-if="autoResponders.length > 0" class="responders-list">
      <h4>Auto Responders ({{ autoResponders.length }})</h4>
      
      <div 
        v-for="responder in autoResponders" 
        :key="responder.id"
        class="responder-item"
      >
        <!-- View Mode -->
        <div v-if="!responder.isEditing" class="responder-view">
          <div class="responder-header">
            <div class="responder-info">
              <div class="keywords-display">
                <strong>Keywords:</strong> 
                <span v-for="(keyword, index) in responder.keywords" :key="index" class="keyword-badge">
                  {{ keyword }}
                </span>
              </div>
              <div class="post-display">
                <strong>Post:</strong> {{ posts.find(p => p.value === responder.selectedPost)?.label }}
              </div>
            </div>
            <div class="responder-actions">
              <button 
                class="action-btn small"
                @click="editAutoResponder(responder)"
              >
                <i class="pi pi-pencil"></i>
                Edit
              </button>
              <button 
                class="action-btn small danger"
                @click="deleteAutoResponder(responder.id)"
              >
                <i class="pi pi-trash"></i>
                Delete
              </button>
            </div>
          </div>
          <div class="responder-message">
            <strong>Message:</strong> {{ responder.message }}
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="responder-edit">
          <div class="form-group">
            <label>Keywords</label>
            <div class="keywords-section">
              <div class="keyword-input-group">
                <input 
                  v-model="newKeyword"
                  type="text"
                  placeholder="Add keyword"
                  class="form-input"
                  @keyup.enter="addKeywordToExisting(responder)"
                />
                <button 
                  type="button"
                  class="add-keyword-btn"
                  @click="addKeywordToExisting(responder)"
                  :disabled="!newKeyword.trim()"
                >
                  Add
                </button>
              </div>
              
              <div v-if="responder.keywords.length > 0" class="keywords-list">
                <div 
                  v-for="(keyword, index) in responder.keywords" 
                  :key="index"
                  class="keyword-item"
                >
                  <span class="keyword-text">{{ keyword }}</span>
                  <button 
                    type="button"
                    class="remove-keyword-btn"
                    @click="removeKeywordFromExisting(responder, index)"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Select Post</label>
            <select 
              v-model="responder.selectedPost"
              class="form-input"
            >
              <option v-for="post in posts" :key="post.value" :value="post.value">
                {{ post.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Message</label>
            <textarea 
              v-model="responder.message"
              placeholder="Enter your auto-response message"
              class="form-input"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              class="action-btn"
              @click="cancelEdit(responder)"
            >
              Cancel
            </button>
            <button 
              class="action-btn primary"
              @click="saveEdit(responder)"
              :disabled="!responder.keywords.length || !responder.selectedPost || !responder.message"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isAddingNew" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-comments empty-icon"></i>
        <h4>No Auto Responders</h4>
        <p>Create your first auto responder to automatically reply to Instagram comments.</p>
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

.add-new-section {
  margin-bottom: 24px;
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

.new-responder-form {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  margin-bottom: 24px;
}

.new-responder-form h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
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

select.form-input {
  cursor: pointer;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
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

/* Responders List */
.responders-list {
  margin-top: 24px;
}

.responders-list h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.responder-item {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  margin-bottom: 12px;
}

.responder-view .responder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.responder-info {
  flex: 1;
}

.keywords-display {
  margin-bottom: 8px;
}

.keyword-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  margin-left: 4px;
}

.post-display {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
}

.responder-actions {
  display: flex;
  gap: 8px;
}

.responder-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #111827);
}

.responder-edit {
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  margin-top: 16px;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
}

.action-btn.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-btn {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
}

.action-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary, #f9fafb);
}

.action-btn.danger {
  background: var(--color-error, #ef4444);
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: var(--color-error-hover, #dc2626);
}

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 10px;
  margin-right: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
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
  .responder-view .responder-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .responder-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .keyword-input-group {
    flex-direction: column;
  }
  
  .add-keyword-btn {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style> 