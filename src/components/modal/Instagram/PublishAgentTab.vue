<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import Button from "@/components/ui/Button.vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const publishStore = usePublishStore();
const botStore = useBotStore();

// Computed properties to sync with store state
const storePages = computed(() => publishStore.instagramPagesCache);
const storePagesLoaded = computed(() => publishStore.instagramPagesLoaded);
const storeIsLoadingPages = computed(() => publishStore.isLoadingInstagramPages);

// Computed pages data from store
const pages = computed(() => {
  if (!storePages.value) {
    return [];
  }
  
  // Check if we have pagesData structure (API response format)
  if (storePages.value.pagesData && storePages.value.pagesData.data) {
    const pagesData = storePages.value.pagesData.data;
    if (Array.isArray(pagesData) && pagesData.length > 0) {
      return pagesData.map((page: any) => ({
        id: page.id,
        name: page.instagram_business_account.name,
        username: page.instagram_business_account.username,
        profile_picture_url: page.instagram_business_account.profile_picture_url,
        followers_count: page.instagram_business_account.followers_count,
        follows_count: page.instagram_business_account.follows_count,
        is_bot_page: !!page.connected_page_bot,
        status: page.connected_page_bot ? 'connected' : 'disconnected',
        botName: page.connected_page_bot || null,
        accessToken: page.access_token || null,
      }));
    }
  } else if (Array.isArray(storePages.value) && storePages.value.length > 0) {
    // Direct array structure (fallback)
    return storePages.value.map((page: any) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
      username: page.instagram_business_account.username,
      profile_picture_url: page.instagram_business_account.profile_picture_url,
      followers_count: page.instagram_business_account.followers_count,
      follows_count: page.instagram_business_account.follows_count,
      is_bot_page: page.is_bot_page || false,
      status: page.status || 'disconnected',
      botName: page.botName || null,
    }));
  }
  
  return [];
});

// Computed show connect button
const showConnectButton = computed(() => {
  return !storePagesLoaded.value || pages.value.length === 0;
});

const isLoading = ref(false);

// Load Instagram pages
const loadInstaPages = async () => {
  // Check if we're already loading
  if (storeIsLoadingPages.value) {
    return;
  }
  
  try {
    await publishStore.getInstagramPages();
    // The computed pages will automatically update when store data changes
  } catch (error) {
    console.error('Failed to load Instagram pages:', error);
  }
};

const connectAccount = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.refreshFbPagePermission(true);
    if (result.success && result.data?.redirect) {
      // Redirect to the URL provided by the API
      window.open(result.data.redirect, '_blank');
    } else {
      console.error('Failed to get redirect URL:', result.error);
    }
  } catch (error) {
    console.error('Failed to connect account:', error);
  } finally {
    isLoading.value = false;
  }
};

const connectionPage = async (type: string, page: any) => {
  isLoading.value = true;
  try {
    const result = await publishStore.connectionInstaPage(type, page.id, page.name, page.accessToken);
    console.log(result, "...");
    if (result.success) {
      // Clear cache and reload pages to update the status
      publishStore.clearInstaPagesCache();
      await loadInstaPages();
      if (window.$toast) {
        window.$toast.success('Page disconnected successfully!');
      }
    } else {
      console.error('Failed to disconnect page:', result.error);
      if (window.$toast) {
        window.$toast.error(result.error || 'Failed to disconnect page');
      }
    }
  } catch (error) {
    console.error('Failed to disconnect page:', error);
    if (window.$toast) {
      window.$toast.error('Failed to disconnect page');
    }
  } finally {
    isLoading.value = false;
  }
};


const openInstagramPage = (pageId: string) => {
  // Open Instagram page in new tab
  window.open(`https://instagram.com/${pageId}`, '_blank');
};

const refreshFbPagePermissions = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.refreshFbPagePermission(true);
    if (result.success && result.data?.redirect) {
      // Redirect to the URL provided by the API
      window.open(result.data.redirect, '_blank');
    } else {
      console.error('Failed to get redirect URL:', result.error);
    }
  } catch (error) {
    console.error('Failed to refresh page permissions:', error);
  } finally {
    isLoading.value = false;
  }
};


const removeFbPagePermissions = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.removeFbPagePermission(true);
    if (result.success && result.data?.redirect) {
      // Redirect to the URL provided by the API
      window.open(result.data.redirect, '_blank');
    } else {
      console.error('Failed to get redirect URL:', result.error);
    }
  } catch (error) {
    console.error('Failed to refresh page permissions:', error);
  } finally {
    isLoading.value = false;
  }
};


// Get initials from page name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format follower count
const formatFollowerCount = (count: number) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

// Load data when component mounts
onMounted(() => {
  // Only load if not already loaded in store
  if (!storePagesLoaded.value) {
    loadInstaPages();
  }
});

// Expose methods for parent component
defineExpose({
  isLoading,
  loadInstaPages
});
</script>

<template>
  <div class="tab-panel">
    <h3>Messenger integration</h3>
    <p class="subtitle">Connect your Instagram pages to enable Messenger bot functionality</p>

    <!-- Loading State -->
    <div v-if="storeIsLoadingPages" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading Instagram pages...</p>
      </div>
    </div>

    <!-- Empty State / Connect Button -->
    <div v-else-if="showConnectButton || pages.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="pi pi-instagram"></i>
        </div>
        <h4>No Instagram pages found</h4>
        <p>Connect your Instagram account to manage your pages and enable Messenger bot functionality.</p>
        <Button 
          variant="primary"
          :loading="isLoading"
          icon="pi pi-link"
          @click="connectAccount"
        >
          {{ isLoading ? 'Connecting...' : 'Connect Instagram account' }}
        </Button>
      </div>
    </div>

    <!-- Pages List -->
    <div v-else>
      <!-- Header Actions -->
      <div class="header-actions">
        <Button 
          variant="primary"
          :loading="isLoading"
          icon="pi pi-refresh"
          @click="refreshFbPagePermissions"
        >
          {{ isLoading ? 'Refreshing...' : 'Refresh Permission' }}
        </Button>
        <Button 
          variant="warning"
          :loading="isLoading"
          icon="pi pi-trash"
          @click="removeFbPagePermissions"
        >
          {{ isLoading ? 'Updating...' : 'Remove Permission' }}
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
                v-if="page.profile_picture_url" 
                :src="page.profile_picture_url" 
                :alt="page.name"
                class="avatar-image"
                @error="(event) => { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }"
              />
              <div v-else class="avatar-fallback">
                {{ getInitials(page.name) }}
              </div>
            </div>
            <div class="page-content">
              <div class="page-header">
                <div class="page-title">
                  <h4 class="page-name">{{ page.name }}</h4>
                  <div class="page-meta">
                    <span v-if="page.username" class="page-username">@{{ page.username }}</span>
                    <span v-if="page.followers_count" class="page-followers">
                      <i class="pi pi-users"></i>
                      {{ formatFollowerCount(page.followers_count) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="page.is_bot_page && page.botName" class="bot-connection">
                Connected to {{ page.botName }}
              </div>
            </div>
          </div>
          
          <div class="page-actions">
            <div class="action-buttons">
              <Button 
                v-if="!page.is_bot_page"
                variant="primary"
                size="small"
                :loading="isLoading"
                icon="pi pi-link"
                @click="connectionPage('connect', page)"
              >
                Connect
              </Button>
              
              <div v-else-if="page.botName === botStore.botName" class="connected-actions">
                <Button 
                  variant="success"
                  size="small"
                  :loading="isLoading"
                  icon="pi pi-refresh"
                  @click="connectionPage('connect', page)"
                >
                  Reconnect
                </Button>
                
                <Button 
                  variant="error"
                  size="small"
                  :loading="isLoading"
                  icon="pi pi-times"
                  @click="connectionPage('disconnect', page)"
                >
                  Disconnect
                </Button>
              </div>
              
              <span 
                v-else
                class="connected-text"
              >
                Connected to {{ page.botName }}
              </span>
            </div>
            
            <Button 
              variant="secondary"
              size="small"
              icon="pi pi-external-link"
              @click="openInstagramPage(page.username || page.id)"
              title="Open Instagram profile"
            />
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
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-bg-tertiary, #f3f4f6);
  border-top: 3px solid var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 14px;
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

.page-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

.page-username {
  font-weight: 500;
}

.page-followers {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-tertiary, #9ca3af);
}

.bot-connection {
  font-size: 12px;
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
  margin-top: 4px;
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
}
</style> 