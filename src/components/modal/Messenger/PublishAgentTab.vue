<script setup lang="ts">
import { ref } from "vue";
import { usePublishStore } from "@/stores/publishStore";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-new-page': [];
  'refresh-page-permission': [];
  'remove-page-permission': [];
  'connect-account': [];
}>();

const publishStore = usePublishStore();

// Page data - this would come from API in real implementation
const pages = ref([
  {
    id: '123456789',
    name: 'My Business Page',
    is_bot_page: true,
    status: 'connected',
    botName: 'agent1'
  },
  {
    id: '987654321',
    name: 'Marketing Page',
    is_bot_page: false,
    status: 'disconnected',
    botName: null
  }
]);

const isLoading = ref(false);

// Actions
const createNewPage = () => {
  // Redirect to Facebook new tab
  window.open('https://www.facebook.com/pages/create', '_blank');
  emit('create-new-page');
};

const connectPage = async (pageId: string) => {
  isLoading.value = true;
  try {
    console.log('Connecting page:', pageId);
    // Add actual connect logic here
    // Update page status to connected
    const page = pages.value.find(p => p.id === pageId);
    if (page) {
      page.is_bot_page = true;
      page.status = 'connected';
      page.botName = 'agent1';
    }
  } catch (error) {
    console.error('Failed to connect page:', error);
  } finally {
    isLoading.value = false;
  }
};

const reconnectPage = async (pageId: string) => {
  isLoading.value = true;
  try {
    console.log('Reconnecting page:', pageId);
    // Add actual reconnect logic here
    // Update page status to connected
    const page = pages.value.find(p => p.id === pageId);
    if (page) {
      page.status = 'connected';
    }
  } catch (error) {
    console.error('Failed to reconnect page:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshAllPagePermissions = async () => {
  isLoading.value = true;
  try {
    console.log('Refreshing all page permissions');
    // Add actual refresh logic here for all pages
    const result = await publishStore.refreshPagePermission('all');
    
    if (result.success) {
      console.log('All page permissions refreshed successfully');
    } else {
      console.error('Failed to refresh page permissions:', result.error);
    }
  } catch (error) {
    console.error('Failed to refresh page permissions:', error);
  } finally {
    isLoading.value = false;
  }
  emit('refresh-page-permission');
};

const removeAllPagePermissions = async () => {
  isLoading.value = true;
  try {
    console.log('Removing all page permissions');
    // Add actual remove logic here for all pages
    const result = await publishStore.removePagePermission('all');
    
    if (result.success) {
      console.log('All page permissions removed successfully');
      // Update all pages status to disconnected
      pages.value.forEach(page => {
        page.is_bot_page = false;
        page.status = 'disconnected';
        page.botName = null;
      });
    } else {
      console.error('Failed to remove page permissions:', result.error);
    }
  } catch (error) {
    console.error('Failed to remove page permissions:', error);
  } finally {
    isLoading.value = false;
  }
  emit('remove-page-permission');
};

const connectAccount = () => {
  console.log('Connecting Facebook account');
  emit('connect-account');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'var(--color-secondary, #10b981)';
    case 'disconnected':
      return 'var(--color-error, #ef4444)';
    default:
      return 'var(--color-text-secondary, #6b7280)';
  }
};

// Expose methods for parent component
defineExpose({
  createNewPage,
  connectPage,
  reconnectPage,
  refreshAllPagePermissions,
  removeAllPagePermissions,
  connectAccount
});
</script>

<template>
  <div class="tab-panel">
    <h3>Page Management</h3>
    <p class="subtitle">Manage your Facebook pages and bot connections</p>

    <!-- Empty State -->
    <div v-if="pages.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-facebook empty-icon"></i>
        <h4>No Pages Connected</h4>
        <p>Connect your Facebook pages to start using the Messenger bot.</p>
        <button 
          class="connect-account-btn"
          @click="connectAccount"
          :disabled="isLoading"
        >
          <i class="pi pi-link"></i>
          {{ isLoading ? 'Connecting...' : 'Connect Account' }}
        </button>
      </div>
    </div>

    <!-- Pages Table -->
    <div v-else class="pages-section">
      <div class="table-header">
        <h4>Connected Pages</h4>
        <div class="header-actions">
          <button 
            class="action-btn"
            @click="refreshAllPagePermissions"
            :disabled="isLoading"
          >
            <i class="pi pi-refresh"></i>
            {{ isLoading ? 'Refreshing...' : 'Refresh All Permissions' }}
          </button>
          <button 
            class="action-btn danger"
            @click="removeAllPagePermissions"
            :disabled="isLoading"
          >
            <i class="pi pi-trash"></i>
            {{ isLoading ? 'Removing...' : 'Remove All Permissions' }}
          </button>
          <button 
            class="create-page-btn"
            @click="createNewPage"
            :disabled="isLoading"
          >
            <i class="pi pi-plus"></i>
            Create New Page
          </button>
        </div>
      </div>

      <div class="pages-table">
        <div class="table-row header">
          <div class="col-page-name">Page Name</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>

        <div 
          v-for="page in pages" 
          :key="page.id"
          class="table-row"
        >
          <div class="col-page-name">
            <div class="page-name">{{ page.name }}</div>
            <div class="page-id">ID: {{ page.id }}</div>
            <div v-if="page.is_bot_page && page.botName" class="bot-connection">
              Connected to {{ page.botName }}
            </div>
          </div>
          
          <div class="col-status">
            <span 
              class="status-badge"
              :style="{ backgroundColor: getStatusColor(page.status) }"
            >
              {{ page.status }}
            </span>
          </div>
          
          <div class="col-actions">
            <div class="action-buttons">
              <!-- Connect Button -->
              <button 
                class="action-btn primary"
                @click="connectPage(page.id)"
                :disabled="isLoading"
              >
                <i class="pi pi-link"></i>
                Connect
              </button>
              
              <!-- Reconnect Button -->
              <button 
                class="action-btn primary"
                @click="reconnectPage(page.id)"
                :disabled="isLoading"
              >
                <i class="pi pi-refresh"></i>
                Reconnect
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

.connect-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
}

.connect-account-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.connect-account-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.connect-account-btn i {
  font-size: 12px;
}

/* Pages Section */
.pages-section {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.table-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.create-page-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal, 0.2s ease);
}

.create-page-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.create-page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-page-btn i {
  font-size: 12px;
}

/* Table Styles */
.pages-table {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 16px;
  padding: 16px;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.header {
  background: var(--color-bg-tertiary, #f3f4f6);
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.col-page-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-name {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.page-id {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.bot-connection {
  font-size: 12px;
  color: var(--color-secondary, #10b981);
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  white-space: nowrap;
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

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 10px;
}

@media (max-width: 768px) {
  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .table-row.header {
    display: none;
  }
  
  .col-page-name,
  .col-status,
  .col-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .col-page-name::before {
    content: 'Page Name:';
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .col-status::before {
    content: 'Status:';
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .col-actions::before {
    content: 'Actions:';
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 