<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import Button from "@/components/ui/Button.vue";
import VueSelect from "@/components/ui/VueSelect.vue";

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

// Store
const publishStore = usePublishStore();

// Auto responder interface
interface AutoResponder {
  id: string;
  keywords: string[];
  selectedPost: string;
  message: string;
  isActive: boolean;
}

// Post interface
interface Post {
  id: string;
  message: string;
  created_time: string;
}

// Reactive data
const autoResponders = ref<AutoResponder[]>([]);
const posts = ref<Post[]>([]);
const isAddingNew = ref(false);
const isEditing = ref(false);
const newKeyword = ref('');
const isLoading = ref(false);
const isVisible = ref(false);

// New responder form
const newResponder = ref({
  keywords: '',
  selectedPost: '',
  message: ''
});

// Edit responder form
const editResponder = ref({
  id: '',
  keywords: '',
  selectedPost: '',
  message: ''
});

// Computed properties for store state
const storeCommentResponders = computed(() => publishStore.commentResponderCache);
const storeCommentRespondersLoaded = computed(() => publishStore.commentResponderLoaded);
const storeIsLoadingCommentResponders = computed(() => publishStore.isLoadingCommentResponder);
const storePluginData = computed(() => publishStore.pluginDataCache);
const storePluginDataLoaded = computed(() => publishStore.pluginDataLoaded);
const storeIsLoadingPluginData = computed(() => publishStore.isLoadingPluginData);

// Computed post options for VueSelect
const postOptions = computed(() => {
  return posts.value.map(post => ({
    value: post.id,
    label: post.message || `Post ${post.id}`
  }));
});

// Watch for visibility changes
watch(() => props.isLoading, (newValue) => {
  if (!newValue && !isVisible.value) {
    isVisible.value = true;
    // Load data when component becomes visible
    if (!storeCommentRespondersLoaded.value) {
      loadCommentResponders();
    } else if (storeCommentResponders.value) {
      transformAndSetData();
    }
    
    // Load plugin data if not already loaded
    if (!storePluginDataLoaded.value) {
      loadPluginData();
    } else if (storePluginData.value) {
      setPluginData();
    }
  }
});

const loadPluginData = async () => {
  if (storeIsLoadingPluginData.value) {
    return;
  }
  
  try {
    const result = await publishStore.loadDataForPlugins("optin_templates,posts");
    if (result.success && result.data) {
      setPluginData();
    }
  } catch (error) {
    console.error('Failed to load plugin data:', error);
  }
};

const setPluginData = () => {
  if (!storePluginData.value || !storePluginData.value.posts) {
    return;
  }
  
  // Set posts from API response
  posts.value = storePluginData.value.posts.data || [];
  
  // Transform optin templates to auto responders if needed
  if (storePluginData.value.optin_templates) {
    transformOptinTemplates();
  }
};

const transformOptinTemplates = () => {
  if (!storePluginData.value.optin_templates) {
    return;
  }
  
  const optinTemplates = storePluginData.value.optin_templates;
  
  autoResponders.value = optinTemplates.map((template: any) => {
    let parsedData = {
      keywords: '',
      post_id: '',
      message: '',
      is_active: true
    };
    
    // Try to parse template text if it exists
    if (template.text) {
      try {
        const textData = JSON.parse(template.text);
        parsedData.message = textData.text || '';
      } catch (e) {
        console.warn('Failed to parse template text:', e);
      }
    }
    
    return {
      id: template.id.toString(),
      keywords: parsedData.keywords ? parsedData.keywords.split(',').map((k: string) => k.trim()) : [],
      selectedPost: parsedData.post_id || '',
      message: parsedData.message || '',
      isActive: parsedData.is_active || true
    };
  });
};

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

const startEditing = (responder: AutoResponder) => {
  isEditing.value = true;
  editResponder.value = {
    id: responder.id,
    keywords: responder.keywords.join(', '),
    selectedPost: responder.selectedPost,
    message: responder.message
  };
};

const cancelEditing = () => {
  isEditing.value = false;
  editResponder.value = {
    id: '',
    keywords: '',
    selectedPost: '',
    message: ''
  };
};

const saveEditAutoResponder = async () => {
  if (!editResponder.value.keywords || !editResponder.value.selectedPost || !editResponder.value.message) {
    console.error('All fields are required');
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishStore.updateCommentResponder(editResponder.value.id, {
      message: editResponder.value.message,
      post_id: editResponder.value.selectedPost,
      keywords: editResponder.value.keywords
    });

    if (result.success) {
      // Refresh the list
      await loadCommentResponders();
      cancelEditing();
      if (window.$toast) {
        window.$toast.success('Auto responder updated successfully!');
      }
    } else {
      console.error('Failed to update auto responder:', result.error);
      if (window.$toast) {
        window.$toast.error(result.error || 'Failed to update auto responder');
      }
    }
  } catch (error) {
    console.error('Failed to update auto responder:', error);
    if (window.$toast) {
      window.$toast.error('Failed to update auto responder');
    }
  } finally {
    isLoading.value = false;
  }
};

const saveNewAutoResponder = async () => {
  if (!newResponder.value.keywords || !newResponder.value.selectedPost || !newResponder.value.message) {
    console.error('All fields are required');
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishStore.createCommentResponder({
      message: newResponder.value.message,
      post_id: newResponder.value.selectedPost,
      keywords: newResponder.value.keywords
    });

    if (result.success) {
      // Refresh the list
      await loadCommentResponders();
      cancelAddingNew();
      if (window.$toast) {
        window.$toast.success('Auto responder created successfully!');
      }
    } else {
      console.error('Failed to create auto responder:', result.error);
      if (window.$toast) {
        window.$toast.error(result.error || 'Failed to create auto responder');
      }
    }
  } catch (error) {
    console.error('Failed to create auto responder:', error);
    if (window.$toast) {
      window.$toast.error('Failed to create auto responder');
    }
  } finally {
    isLoading.value = false;
  }
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

const deleteAutoResponder = async (id: string) => {
  isLoading.value = true;
  try {
    const result = await publishStore.deleteCommentResponder(id);

    if (result.success) {
      // Refresh the list
      await loadCommentResponders();
      if (window.$toast) {
        window.$toast.success('Auto responder deleted successfully!');
      }
    } else {
      console.error('Failed to delete auto responder:', result.error);
      if (window.$toast) {
        window.$toast.error(result.error || 'Failed to delete auto responder');
      }
    }
  } catch (error) {
    console.error('Failed to delete auto responder:', error);
    if (window.$toast) {
      window.$toast.error('Failed to delete auto responder');
    }
  } finally {
    isLoading.value = false;
  }
};

const loadCommentResponders = async () => {
  if (storeIsLoadingCommentResponders.value) {
    return;
  }
  
  try {
    const result = await publishStore.getFbCommentResponder();
    if (result.success && result.data) {
      transformAndSetData();
    }
  } catch (error) {
    console.error('Failed to load comment responders:', error);
  }
};

const transformAndSetData = () => {
  if (!storeCommentResponders.value || !storeCommentResponders.value.data) {
    return;
  }
  
  const optins = storeCommentResponders.value.data.optins || [];
  
  autoResponders.value = optins.map((item: any) => {
    // Parse the optin_json if it exists
    let parsedData = {
      keywords: item.keyword || '',
      post_id: item.post_id || '',
      message: '',
      is_active: true
    };
    
    // Try to parse optin_json if it exists
    if (item.optin_json) {
      try {
        const jsonData = JSON.parse(item.optin_json);
        parsedData = {
          keywords: jsonData.keywords || item.keyword || '',
          post_id: jsonData.post_id || item.post_id || '',
          message: jsonData.message || '',
          is_active: true
        };
      } catch (e) {
        console.warn('Failed to parse optin_json:', e);
      }
    }
    
    return {
      id: item.id.toString(),
      keywords: parsedData.keywords ? parsedData.keywords.split(',').map((k: string) => k.trim()) : [],
      selectedPost: parsedData.post_id || '',
      message: parsedData.message || '',
      isActive: parsedData.is_active || true
    };
  });
};

const getKeywordsArray = (keywordsString: string) => {
  return keywordsString.split(',').map(k => k.trim()).filter(k => k);
};

// Load data on mount
onMounted(() => {
  // Load comment responders
  if (!storeCommentRespondersLoaded.value) {
    loadCommentResponders();
  } else if (storeCommentResponders.value) {
    transformAndSetData();
  }
  
  // Load plugin data
  if (!storePluginDataLoaded.value) {
    loadPluginData();
  } else if (storePluginData.value) {
    setPluginData();
  }
});

// Expose methods for parent component
defineExpose({
  autoResponders,
  loadCommentResponders
});
</script>

<template>
  <div class="tab-panel">
    <h3>Comment auto responder</h3>
    <p class="subtitle">Automatically respond to comments based on keywords</p>

    <!-- Loading State -->
    <div v-if="storeIsLoadingCommentResponders" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Loading auto responders...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="autoResponders.length === 0 && !isAddingNew" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-comments"></i>
        </div>
        <h4>No auto responders</h4>
        <p>Create your first auto responder to automatically reply to comments.</p>
        <Button 
          variant="primary"
          :loading="isLoading"
          icon="pi pi-plus"
          @click="startAddingNew"
        >
          Create auto responder
        </Button>
      </div>
    </div>

    <!-- Add New Form -->
    <div v-if="isAddingNew" class="add-form">
      <div class="form-header">
        <h4>Create new auto responder</h4>
        <Button 
          variant="error-outline"
          size="small"
          icon="pi pi-times"
          iconOnly
          @click="cancelAddingNew"
        />
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
        <VueSelect
          v-model="newResponder.selectedPost"
          :options="postOptions"
          :reduce="(option: any) => option.value"
          placeholder="Select a post"
          :clearable="false"
        />
      </div>

      <div class="form-group">
        <label>Message</label>
        <textarea 
          v-model="newResponder.message"
          placeholder="Enter your auto-response message"
          class="form-input"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <Button 
          variant="secondary"
          :loading="isLoading"
          @click="cancelAddingNew"
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          :loading="isLoading"
          @click="saveNewAutoResponder"
          :disabled="!newResponder.keywords || !newResponder.selectedPost || !newResponder.message"
        >
          Create auto responder
        </Button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="isEditing" class="edit-form">
      <div class="form-header">
        <h4>Edit auto responder</h4>
        <Button 
          variant="error-outline"
          size="small"
          icon="pi pi-times"
          iconOnly
          @click="cancelEditing"
        />
      </div>

      <div class="form-group">
        <label>Keywords (comma separated)</label>
        <input 
          v-model="editResponder.keywords"
          type="text"
          placeholder="help, support, pricing"
          class="form-input"
        />
        <small class="help-text">Enter keywords separated by commas</small>
      </div>

      <div class="form-group">
        <label>Select post</label>
        <VueSelect
          v-model="editResponder.selectedPost"
          :options="postOptions"
          :reduce="(option: any) => option.value"
          placeholder="Select a post"
          :clearable="false"
        />
      </div>

      <div class="form-group">
        <label>Message</label>
        <textarea 
          v-model="editResponder.message"
          placeholder="Enter your auto-response message"
          class="form-input"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <Button 
          variant="secondary"
          :loading="isLoading"
          @click="cancelEditing"
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          :loading="isLoading"
          @click="saveEditAutoResponder"
          :disabled="!editResponder.keywords || !editResponder.selectedPost || !editResponder.message"
        >
          Save changes
        </Button>
      </div>
    </div>

    <!-- Auto Responders List -->
    <div v-if="autoResponders.length > 0" class="responders-section">
      <div class="section-header">
        <h4>Auto responders ({{ autoResponders.length }})</h4>
        <Button 
          v-if="!isAddingNew && !isEditing"
          variant="primary"
          :loading="isLoading"
          icon="pi pi-plus"
          @click="startAddingNew"
        >
          Add New
        </Button>
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
                {{ posts.find(p => p.id === responder.selectedPost)?.message || 'Unknown post' }}
              </div>
            </div>
            <div class="responder-actions">
              <Button 
                v-if="!isEditing"
                variant="primary-outline"
                size="small"
                icon="pi pi-pencil"
                iconOnly
                @click="startEditing(responder)"
                title="Edit"
              />
              <Button 
                variant="error-outline"
                size="small"
                :loading="isLoading"
                icon="pi pi-trash"
                iconOnly
                @click="deleteAutoResponder(responder.id)"
                title="Delete"
              />
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

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.loading-content {
  max-width: 400px;
  margin: 0 auto;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 20px;
  color: var(--color-primary, #3b82f6);
}

.loading-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
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

/* Add Form */
.add-form {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  margin-bottom: 24px;
}

.edit-form {
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