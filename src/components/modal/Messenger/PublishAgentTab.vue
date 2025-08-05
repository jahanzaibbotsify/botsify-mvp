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

const disconnectPage = async (pageId: string) => {
  isLoading.value = true;
  try {
    console.log('Disconnecting page:', pageId);
    // Add actual disconnect logic here
    // Update page status to disconnected
    const page = pages.value.find(p => p.id === pageId);
    if (page) {
      page.is_bot_page = false;
      page.status = 'disconnected';
      page.botName = null;
    }
  } catch (error) {
    console.error('Failed to disconnect page:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshPagePermissions = async () => {
  isLoading.value = true;
  try {
    console.log('Refreshing page permissions');
    const result = await publishStore.refreshPagePermission('all');
    
    if (result.success) {
      console.log('Page permissions refreshed successfully');
    } else {
      console.error('Failed to refresh page permissions:', result.error);
    }
  } catch (error) {
    console.error('Failed to refresh page permissions:', error);
  } finally {
    isLoading.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'var(--color-secondary, #10b981)';
    case 'disconnected':
      return 'var(--color-text-tertiary, #9ca3af)';
    case 'error':
      return 'var(--color-error, #ef4444)';
    default:
      return 'var(--color-text-tertiary, #9ca3af)';
  }
};

// Expose methods for parent component
defineExpose({
  pages,
  isLoading
});
</script>

<template>
  <div class="tab-panel">
    <h3>Messenger Integration</h3>
    <p class="subtitle">Connect your Facebook pages to enable Messenger bot functionality</p>

    <!-- Empty State -->
    <div v-if="pages.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-facebook"></i>
        </div>
        <h4>No Facebook Pages Found</h4>
        <p>Connect your Facebook account to manage your pages and enable Messenger bot functionality.</p>
        <button 
          class="connect-account-btn"
          @click="emit('connect-account')"
          :disabled="isLoading"
        >
          <i class="pi pi-link"></i>
          Connect Facebook Account
        </button>
      </div>
    </div>

    <!-- Pages List -->
    <div v-else>
      <!-- Header Actions -->
      <div class="header-actions">
        <button 
          class="refresh-btn"
          @click="refreshPagePermissions"
          :disabled="isLoading"
        >
          <i class="pi pi-refresh"></i>
          {{ isLoading ? 'Refreshing...' : 'Refresh Pages' }}
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

      <!-- Pages List -->
      <div class="pages-list">
        <div 
          v-for="page in pages" 
          :key="page.id"
          class="page-card"
        >
          <div class="page-info">
            <div class="page-name">{{ page.name }}</div>
            <div class="page-id">ID: {{ page.id }}</div>
            <div v-if="page.is_bot_page && page.botName" class="bot-connection">
              Connected to {{ page.botName }}
            </div>
          </div>
          
          <div class="page-status">
            <span 
              class="status-badge"
              :style="{ backgroundColor: getStatusColor(page.status) }"
            >
              {{ page.status }}
            </span>
          </div>
          
          <div class="page-actions">
            <button 
              v-if="!page.is_bot_page"
              class="action-btn primary"
              @click="connectPage(page.id)"
              :disabled="isLoading"
            >
              <i class="pi pi-link"></i>
              Connect
            </button>
            
            <button 
              v-else
              class="action-btn secondary"
              @click="disconnectPage(page.id)"
              :disabled="isLoading"
            >
              <i class="pi pi-unlink"></i>
              Disconnect
            </button>
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

/* Header Actions */
.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.refresh-btn,
.create-page-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.refresh-btn:hover:not(:disabled),
.create-page-btn:hover:not(:disabled) {
  background: var(--color-bg-tertiary, #f3f4f6);
  border-color: var(--color-primary, #3b82f6);
}

.refresh-btn:disabled,
.create-page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn i,
.create-page-btn i {
  font-size: 12px;
}

/* Pages List */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  transition: border-color var(--transition-normal, 0.2s ease);
}

.page-card:hover {
  border-color: var(--color-primary, #3b82f6);
}

.page-info {
  flex: 1;
}

.page-name {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 16px;
  margin-bottom: 4px;
}

.page-id {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 4px;
}

.bot-connection {
  font-size: 12px;
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
}

.page-status {
  margin-right: 16px;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.action-btn.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-btn.secondary {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  border: 1px solid var(--color-border, #e5e7eb);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--color-bg-hover, #f1f5f9);
  border-color: var(--color-primary, #3b82f6);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
  }
  
  .page-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-status {
    margin-right: 0;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 