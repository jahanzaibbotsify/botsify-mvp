<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useBotStore } from "@/stores/botStore";
import BotsifyLoader from './components/ui/BotsifyLoader.vue';

const route = useRoute();
const isAuthenticated = computed(() => useBotStore().apiKeyConfirmed);
const chatStore = useChatStore();

// Check if current route should show loading screen
const shouldShowLoading = computed(() => {
  // Don't show loading for Unauthenticated and NotFound routes
  if (route.name === 'Unauthenticated' || route.name === 'NotFound') {
    return false;
  }
  return !isAuthenticated.value;
});

const showStorageWarning = ref(false);
const storageSizeMB = ref(0);

// Check storage size
function checkStorageSize() {
  try {
    const chatsJson = localStorage.getItem('botsify_chats') || '[]';
    const templatesJson = localStorage.getItem('botsify_prompt_templates') || '[]';
    
    const totalSize = chatsJson.length + templatesJson.length;
    storageSizeMB.value = totalSize / (1024 * 1024);
    
    // Show warning if storage is getting large
    showStorageWarning.value = storageSizeMB.value > 3.5;
    
    return storageSizeMB.value;
  } catch (e) {
    console.error('Error checking storage size:', e);
    return 0;
  }
}

// Format size for display
const formattedSize = computed(() => {
  return storageSizeMB.value.toFixed(2);
});

// Clear old chats (keep only the 5 most recent)
function clearOldChats() {
  window.$confirm({
    text: 'Are you sure you want to clear old chats?',
  }, () => {
    const sortedChats = [...chatStore.chats].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const recentChats = sortedChats.slice(0, 5);
      const recentChatIds = recentChats.map(chat => chat.id);

      chatStore.chats = chatStore.chats.filter(chat =>
        recentChatIds.includes(chat.id)
      );
      chatStore.saveToTemplate();
      checkStorageSize();
      if (storageSizeMB.value < 3) {
        showStorageWarning.value = false;
      }
      window.$toast({
        message: 'Old chats cleared successfully.',
        type: 'success',
      });
  })
}

onMounted(() => {
  // Redirect to home page on load if needed
  // if (router.currentRoute.value.path === '/') {
  //   router.push('/');
  // }
  
  // Check storage size
  checkStorageSize();
  
  // Check storage size periodically
  setInterval(checkStorageSize, 60000); // Check every minute
});
</script>

<template>
  <div class="app-container">
    <div v-if="shouldShowLoading" class="main-loading">
      <botsify-loader />
    </div>
    <div v-else>  
      <div v-if="showStorageWarning" class="storage-warning">
        <div class="warning-content">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">
            Storage usage: {{ formattedSize }}MB (may affect persistence)
          </span>
          <button class="clear-button" @click="clearOldChats">
            Clear Old Chats
          </button>
          <button class="close-button" @click="showStorageWarning = false">
            ✕
          </button>
        </div>
      </div>

      <router-view />
      </div>
    </div>

</template>

<style>
.app-container {
  position: relative;
  overflow: scroll !important;
  height: 100%;
}

.main-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.storage-warning {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff9800;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  width: auto;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  font-size: 16px;
}

.warning-text {
  font-size: 14px;
  white-space: nowrap;
}

.clear-button {
  background-color: white;
  color: #ff9800;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.clear-button:hover {
  background-color: #f5f5f5;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
  margin-left: 4px;
}

@media (max-width: 600px) {
  .storage-warning {
    bottom: 10px;
    padding: 6px 12px;
  }
  
  .warning-text {
    font-size: 12px;
  }
}
</style>