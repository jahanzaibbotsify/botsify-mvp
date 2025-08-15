<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { Button, VueSelect, Textarea, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Pagination } from "@/components/ui"
import Input from "@/components/ui/Input.vue";

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
const deleteResponderId = ref<string | null>(null);

// Pagination data
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(20);

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

const startAddingNew = async () => {
  isAddingNew.value = true;
  isEditing.value = false; // Hide edit form when opening create form
  newResponder.value = {
    keywords: '',
    selectedPost: '',
    message: ''
  };
};

const startEditing = async (responder: AutoResponder) => {
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
      // Refresh the list on current page
      await loadCommentResponders(currentPage.value);
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
      // Refresh the list on current page
      await loadCommentResponders(currentPage.value);
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
      // Refresh the list on current page
      await loadCommentResponders(currentPage.value);
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

const loadCommentResponders = async (page = 1) => {
  if (storeIsLoadingCommentResponders.value) {
    return;
  }
  
  try {
    currentPage.value = page;
    const result = await publishStore.getFbCommentResponder(page);
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
  
  const optins = storeCommentResponders.value.data.optins || {};
  posts.value = storeCommentResponders.value.data.facebook_posts.data || [];

  // Set pagination data
  currentPage.value = optins.current_page || 1;
  totalPages.value = optins.last_page || 1;
  totalItems.value = optins.total || 0;
  itemsPerPage.value = optins.per_page || 20;
  
  // Transform the data array
  const optinsData = optins.data || [];
  
  autoResponders.value = optinsData.map((item: any) => {
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

// Handle page change
const handlePageChange = (page: number) => {
  loadCommentResponders(page);
};

// Load data on mount
onMounted(() => {
  // Load comment responders
  if (!storeCommentRespondersLoaded.value) {
    loadCommentResponders();
  } else if (storeCommentResponders.value) {
    transformAndSetData();
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
        <div class="loading-spinner"></div>
        <span>Loading autoresponder...</span>
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
      </div>

      <div class="form-group">
        <Input
          label="Keywords (comma separated)"
          v-model="newResponder.keywords"
          type="text"
          placeholder="help, support, pricing"
        />
        <small class="help-text">Enter keywords separated by commas</small>
      </div>

      <div class="form-group">
        <VueSelect
          label="Select post"
          v-model="newResponder.selectedPost"
          :options="postOptions"
          :reduce="(option: any) => option.value"
          placeholder="Select a post"
          :clearable="false"
        />
      </div>

      <div class="form-group">
        <Textarea 
          label="Message"
          v-model="newResponder.message"
          placeholder="Enter your auto-response message"
          size="medium"
          :rows="4"
        />
      </div>

      <div class="agent-action-buttons">
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
      </div>

      <div class="form-group">
        <label>Keywords (comma separated)</label>
        <Input 
          v-model="editResponder.keywords"
          type="text"
          placeholder="help, support, pricing"
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

      <div class="agent-action-buttons">
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
                {{ postOptions.find(p => p.value === responder.selectedPost)?.label || 'Unknown post' }}
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

      <div class="agent-pagination-section">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          :disabled="storeIsLoadingCommentResponders"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

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