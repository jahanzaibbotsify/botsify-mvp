<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import Button from "@/components/ui/Button.vue";
import VueSelect from "@/components/ui/VueSelect.vue";
import Textarea from "@/components/ui/Textarea.vue";
import Table from "@/components/ui/Table.vue";
import TableHead from "@/components/ui/TableHead.vue";
import TableBody from "@/components/ui/TableBody.vue";
import TableRow from "@/components/ui/TableRow.vue";
import TableCell from "@/components/ui/TableCell.vue";
import TableHeader from "@/components/ui/TableHeader.vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
defineEmits<{
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
const deleteResponderId = ref<string | null>(null);

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
const storeCommentResponders = computed(() => publishStore.cache.commentResponder);
const storeCommentRespondersLoaded = computed(() => publishStore.cacheValid.commentResponder);
const storeIsLoadingCommentResponders = computed(() => publishStore.loadingStates.commentResponder);

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
    
    // Load plugin data
    loadPluginData();
  }
});

const loadPluginData = async () => {
  try {
    const result = await publishStore.loadDataForPlugins("posts");
    if (result.success && result.data) {
      setPluginData(result.data);
    }
  } catch (error) {
    console.error('Failed to load plugin data:', error);
  }
};



const setPluginData = (data: any) => {
  if (!data || !data.facebook_posts) {
    return;
  }
  
  // Set posts from API response
  posts.value = data.facebook_posts.data || [];
};

const startAddingNew = () => {
  isAddingNew.value = true;
  isEditing.value = false; // Hide edit form when opening create form
  newResponder.value = {
    keywords: '',
    selectedPost: '',
    message: ''
  };
};

const startEditing = (responder: AutoResponder) => {
  isEditing.value = true;
  isAddingNew.value = false; // Hide create form when opening edit form
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
      window.$toast.success('Auto responder updated successfully!');
    } else {
      console.error('Failed to update auto responder:', result.error);
      window.$toast.error(result.error || 'Failed to update auto responder');
    }
  } catch (error) {
    console.error('Failed to update auto responder:', error);
    window.$toast.error('Failed to update auto responder');
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
      window.$toast.success('Auto responder created successfully!');
    } else {
      console.error('Failed to create auto responder:', result.error);
      window.$toast.error(result.error || 'Failed to create auto responder');
    }
  } catch (error) {
    console.error('Failed to create auto responder:', error);
    window.$toast.error('Failed to create auto responder');
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
  window.$confirm({
    text: 'Are you sure you want to delete this auto responder?',
  }, () => {
    performDelete(id);
  });
};

const performDelete = async (id: string) => {
  isLoading.value = true;
  deleteResponderId.value = id;
  try {
    const result = await publishStore.deleteCommentResponder(id);

    if (result.success) {
      // Refresh the list
      await loadCommentResponders();
      window.$toast.success('Auto responder deleted successfully!');
    } else {
      console.error('Failed to delete auto responder:', result.error);
      window.$toast.error(result.error || 'Failed to delete auto responder');
    }
  } catch (error) {
    console.error('Failed to delete auto responder:', error);
    window.$toast.error('Failed to delete auto responder');
  } finally {
    deleteResponderId.value = null;
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

// Load data on mount
onMounted(() => {
  // Load comment responders
  if (!storeCommentRespondersLoaded.value) {
    loadCommentResponders();
  } else if (storeCommentResponders.value) {
    transformAndSetData();
  }
  
  // Load plugin data
  loadPluginData();
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
        <Textarea 
          v-model="newResponder.message"
          placeholder="Enter your auto-response message"
          size="medium"
          :rows="4"
        />
      </div>

      <div class="form-actions">
        <Button 
          variant="secondary"
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
        <Textarea 
          v-model="editResponder.message"
          placeholder="Enter your auto-response message"
          size="medium"
          :rows="4"
        />
      </div>

      <div class="form-actions">
        <Button 
          variant="secondary"
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
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Keywords</TableHeader>
            <TableHeader>Post</TableHeader>
            <TableHeader>Message</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow v-for="responder in autoResponders" :key="responder.id">
            <TableCell>
              <div class="keywords-cell">
                <span v-for="keyword in responder.keywords" :key="keyword" class="keyword-badge">
                  {{ keyword }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div class="post-cell">
                {{ posts.find(p => p.id === responder.selectedPost)?.message || 'Unknown post' }}
              </div>
            </TableCell>
            <TableCell>
              <div class="message-cell">
                {{ responder.message }}
              </div>
            </TableCell>
            <TableCell>
              <div class="actions-cell">
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
                  :loading="deleteResponderId === responder.id"
                  :disabled="deleteResponderId === responder.id"
                  icon="pi pi-trash"
                  iconOnly
                  @click="deleteAutoResponder(responder.id)"
                  title="Delete"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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

/* Form Inputs */
.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text-primary);
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

/* Table Styles */
.keywords-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.keyword-badge {
  display: inline-block;
  padding: 4px 8px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
}

.post-cell {
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}



.message-cell {
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .keywords-cell {
    flex-direction: column;
    gap: 2px;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 