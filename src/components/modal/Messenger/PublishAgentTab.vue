<script setup lang="ts">
import { ref, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import Button from "@/components/ui/Button.vue";
import { APP_URL } from "@/utils/config";
import type { FacebookPage, FacebookPageForTemplate } from "@/types";
import { publishApi } from "@/services/publishApi";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-new-page': [];
  'refresh-page-permission': [];
  'remove-page-permission': [];
  'connect-account': [];
  'page-disconnect': [];
  'page-connect': [];
}>();

const publishStore = usePublishStore();

// Computed properties to sync with store state
const storePages = computed(() => publishStore.facebookPages.data);
const storePagesLoaded = computed(() => publishStore.facebookPages.valid);
const storeIsLoadingPages = computed(() => publishStore.facebookPages.loading);

// Computed pages data for template
const pages = computed((): FacebookPageForTemplate[] => {
  if (!storePages.value) return [];
  
  // Check if we have pagesData structure (API response format)
  if (storePages.value.data && storePages.value.data?.pagesData?.data) {
    const pagesData = storePages.value.data.pagesData.data;
    const currentPageId = storePages.value?.data.pageId;

    if (Array.isArray(pagesData) && pagesData.length > 0) {
      return pagesData.map((page: FacebookPage) => ({
        id: page.id,
        name: page.name,
        is_bot_page: currentPageId === page.id,
        status: page.connected_page_bot ? 'connected' : 'disconnected',
        botName: page.connected_page_bot || null,
        accessToken: page.access_token || null,
        category: page.category,
        profile_picture_url: page.profile_picture_url || null
      }));
    }
  }
  
  return [];
});

// Computed show connect button
const showConnectButton = computed(() => {
  return !storePagesLoaded.value || pages.value.length === 0;
});

const isConnectLoading = ref(false);
const connectId = ref('');
const disconnectId = ref('');
const isRefreshLoading = ref(false);
const isRemoveLoading = ref(false);

// Refresh Facebook page permissions function
const refreshPermissions = async () => {
  try {
    const result = await publishApi.refreshFbPagePermission();
    if(result.success){
      publishStore.facebookPages.invalidate();
      publishStore.facebookPages.load();
    } else{
      window.$toast.error(result?.message || 'Failed to refresh Facebook page permissions');
    }
    return result;
  } catch (error) {
    console.error('Failed to refresh Facebook page permissions:', error);
    return { success: false, error };
  }
};

// Actions
const createNewPage = () => {
  // Redirect to Facebook new page creation
  window.open('https://www.facebook.com/pages', '_blank');
  emit('create-new-page');
};

const connectAccount = async () => {
  isConnectLoading.value = true;
  try {
    const result = await refreshPermissions();
    if (result.success && 'data' in result && result.data?.redirect) {
      openAuthPopup(result.data.redirect, 'connection');
    } else {
      window.$toast.error(result || 'Failed to get authentication URL');
    }
  } catch (error) {
    console.error('Failed to connect account:', error);
    window.$toast.error('Failed to connect Facebook account');
  } finally {
    isConnectLoading.value = false;
  }
};

const connectionPage = async (type: string, page: any) => {
  if (type === 'connect') {
    connectId.value = page.id;
  } else if (type === 'disconnect') {
    disconnectId.value = page.id;
  }
  try {
    const result = await publishApi.connectionFbPage(
      type,
      page.id,
      page.name,
      page.accessToken
    );
    if(result.success){
      window.$toast.success(`Page ${type}ed successfully!`);
      publishStore.facebookPages.invalidate();
      publishStore.facebookPages.load();
      if(type === 'connect'){
        emit('page-connect');
      } else{
        emit('page-disconnect');
      }
    } else{
      window.$toast.error(result?.message || 'Failed to connect page');
    }
  } catch (error) {
    window.$toast.error('Failed to connect page');
  } finally {
    connectId.value = '';
    disconnectId.value = '';
  }
};

const openFacebookPage = (pageId: string) => {
  // Open Facebook page in new tab
  window.open(`https://facebook.com/${pageId}`, '_blank');
};

const refreshFbPagePermissions = async () => {
  isRefreshLoading.value = true;
  try {
    const result = await refreshPermissions();
    if (result.success && 'data' in result && result.data?.redirect) {
      openAuthPopup(result.data.redirect, 'permission refresh');
    } else {
      console.error('Failed to get redirect URL:', result);
      window.$toast.error(result || 'Failed to get authentication URL');
    }
  } catch (error) {
    console.error('Failed to refresh page permissions:', error);
    window.$toast.error('Failed to refresh Facebook permissions');
  } finally {
    isRefreshLoading.value = false;
  }
};

const removeFbPagePermissions = async () => {
  isRemoveLoading.value = true;
  try {
    const result = await publishApi.removeFbPagePermission();
    if(result.success){
      publishStore.facebookPages.data = null;
    } else{
      window.$toast.error(result?.message || 'Failed to remove Facebook page permissions');
    }
    return result;
  } catch (error) {
    window.$toast.error('Failed to remove Facebook permissions');
  } finally {
    isRemoveLoading.value = false;
  }
};

// Get initials from page name
// const getInitials = (name: string) => {
//   return name
//     .split(' ')
//     .map(word => word.charAt(0))
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);
// };

// Utility function to handle popup windows for authentication
const openAuthPopup = (url: string, action: string) => {
  const popup = window.open(
    url,
    'facebook_auth',
    'width=600,height=700,scrollbars=yes,resizable=yes'
  );
  
  if (!popup) {
    if (window.$toast) {
      window.$toast.error('Popup blocked! Please allow popups for this site.');
    }
    return null;
  }
  
  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    
    if (event.data.type === 'FB_CONNECT_SUCCESS') {
      popup.close();
      window.removeEventListener('message', messageHandler);
      
      publishStore.publishStatus.invalidate();
      publishStore.facebookPages.invalidate();
      publishStore.facebookPages.load();
      window.$toast?.success(`Facebook ${action} completed successfully!`);
    } else if (event.data.type === 'FACEBOOK_AUTH_ERROR') {
      popup.close();
      window.removeEventListener('message', messageHandler);
      window.$toast?.error(event.data.message || `Failed to ${action} Facebook`);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  const checkClosed = setInterval(() => {
    try {
      // ✅ Check if popup navigated back to APP_URL
      if (popup.location.origin === APP_URL) {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        
        publishStore.publishStatus.invalidate();
        publishStore.facebookPages.invalidate();
        publishStore.facebookPages.load();
        window.$toast?.success(`Facebook ${action} completed successfully!`);
      }
    } catch {
      // Ignore cross-origin access errors until it comes back to our domain
    }

    // ✅ Also check if manually closed
    if (popup.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
      publishStore.publishStatus.invalidate();
      publishStore.facebookPages.invalidate();
      publishStore.facebookPages.load();
    }
  }, 1000);
  
  return popup;
};

</script>

<template>
  <div class="tab-panel">
    <h3>Messenger integration</h3>
    <p class="subtitle">Connect your Facebook pages to enable Messenger agent functionality</p>

    <!-- Loading State -->
    <div v-if="storeIsLoadingPages" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading Facebook pages...</p>
      </div>
    </div>

    <!-- Empty State / Connect Button -->
    <div v-else-if="showConnectButton || pages.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-facebook"></i>
        </div>
        <h4>No Facebook pages found</h4>
        <p>Connect your Facebook account to manage your pages and enable Messenger agent functionality.</p>
        <Button 
          variant="primary"
          :loading="isConnectLoading"
          icon="pi pi-link"
          @click="connectAccount"
        >
          {{ isConnectLoading ? 'Connecting...' : 'Connect Facebook account' }}
        </Button>
      </div>
    </div>

    <!-- Pages List -->
    <div v-else>
      <!-- Header Actions -->
      <div class="header-actions">
        <Button 
          variant="primary"
          :loading="isRefreshLoading"
          icon="pi pi-refresh"
          @click="refreshFbPagePermissions"
        >
          {{ isRefreshLoading ? 'Refreshing...' : 'Refresh Permission' }}
        </Button>
        <Button 
          variant="warning"
          :loading="isRemoveLoading"
          icon="pi pi-trash"
          @click="removeFbPagePermissions"
        >
          {{ isRemoveLoading ? 'Updating...' : 'Remove Permission' }}
        </Button>
        <Button 
          variant="secondary"
          icon="pi pi-plus"
          @click="createNewPage"
        >
          Create new page
        </Button>
      </div>

      <!-- Pages List -->
      <div class="pages-list">
        <div 
          v-for="page in pages" 
          :key="page.id"
          class="page-card"
        >
          <div class="page-main">
            <div class="page-avatar">
              <img 
                :src="'https://graph.facebook.com/' + page.id + '/picture?type=large'" 
                :alt="page.name"
                class="avatar-image"
                @error="(event) => { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }"
              />
            </div>
            
            <div class="page-content">
              <div class="page-header">
                <div class="page-title">
                  <h4 class="page-name">{{ page.name }}</h4>
                  <span v-if="page.category" class="page-category">{{ page.category }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="page-actions">
            <div class="action-buttons">
              <span 
                v-if="!!page.botName && !page.is_bot_page"
                class="connected-text"
              >
                Connected to {{ page.botName }}
              </span>
              <Button 
                v-else-if="!page.is_bot_page"
                variant="primary"
                size="small"
                :loading="connectId == page.id"
                :disabled="connectId == page.id"
                icon="pi pi-link"
                @click="connectionPage('connect', page)"
              >
                Connect
              </Button>
              
              <div v-else-if="page.is_bot_page" class="connected-actions">
                <Button 
                  variant="success"
                  size="small"
                  :loading="connectId == page.id"
                  :disabled="connectId == page.id"
                  icon="pi pi-refresh"
                  @click="connectionPage('connect', page)"
                >
                  Reconnect
                </Button>
                
                <Button 
                  variant="error"
                  size="small"
                  :loading="disconnectId == page.id"
                  :disabled="disconnectId == page.id"
                  icon="pi pi-times"
                  @click="connectionPage('disconnect', page)"
                >
                  Disconnect
                </Button>
              </div>
              
            </div>
            
            <Button 
              variant="secondary"
              size="small"
              icon="pi pi-external-link"
              @click="openFacebookPage(page.id)"
              title="Open Facebook page"
            />
          </div>
        </div>
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

/* Header Actions */
.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

/* Pages List */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  transition: all var(--transition-normal, 0.2s ease);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
}

.page-card:hover {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
  transform: translateY(-1px);
}

.page-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.page-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--color-border, #e5e7eb);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  background-color: var(--color-bg-tertiary, #f3f4f6);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-content {
  flex: 1;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.page-title {
  display: grid;
  align-items: center;
  gap: 5px;
}

.page-name {
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  font-size: 16px;
  margin: 0;
}

.page-category {
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
  font-size: 12px;
  font-style: italic;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.connected-actions {
  display: flex;
  gap: 8px;
}

.connected-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  font-style: italic;
  padding: 8px 12px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: var(--radius-sm, 4px);
  border: 1px solid var(--color-border, #e5e7eb);
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
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .connected-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .page-external-link {
    margin-left: 0; /* Reset margin for smaller screens */
    width: 100%;
    justify-content: flex-end;
  }
}
</style>