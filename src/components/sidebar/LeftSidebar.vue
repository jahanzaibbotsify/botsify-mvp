<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '../../stores/chatStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useWindowSize } from '@vueuse/core';
import ChatListItem from '../chat/ChatListItem.vue';
import SidebarPricing from './SidebarPricing.vue';

const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const router = useRouter();
const { width } = useWindowSize();

const isMobile = computed(() => width.value < 768);

const filteredChats = computed(() => {
  return chatStore.chats;
});

const createNewChat = () => {
  const newChat = chatStore.createNewChat();
  router.push(`/chat/${newChat.id}`);
};

const navigateToChat = (chatId: string) => {
  router.push(`/chat/${chatId}`);
  if (isMobile.value) {
    sidebarStore.isOpen = false;
  }
};
</script>

<template>
  <aside class="left-sidebar scrollbar" :class="{ 'open': sidebarStore.isOpen }">
    <div class="sidebar-header">
      <div class="header-content">
        <div class="app-title-container">
          <!-- Botsify Logo -->
            <img src="https://botsify.com/assets/img/logos/logo/logo-color-600w.webp" alt="Botsify" class="logo-icon" />
        </div>
        <button class="new-chat-button primary" @click="createNewChat">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Chat</span>
        </button>
      </div>
    </div>
    
    <div class="chat-list">
      <ChatListItem
        v-for="chat in filteredChats"
        :key="chat.id"
        :chat="chat"
        :isActive="chat.id === chatStore.activeChat"
        @click="navigateToChat(chat.id)"
      />
      
      <div v-if="filteredChats.length === 0" class="no-results">
        <p>No chats found</p>
      </div>
    </div>

    <!-- Sidebar Pricing (keeping this at the bottom) -->
    <SidebarPricing />
  </aside>
</template>

<style scoped>
.left-sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: var(--z-fixed);
}

.sidebar-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background-color: var(--color-bg-secondary);
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.app-title-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.botsify-logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.logo-icon {
  width: 100%;
  object-fit: contain;
}

.app-title {
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-primary);
  font-weight: 600;
}

.new-chat-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
  white-space: nowrap;
  min-width: fit-content;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.no-results {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.settings-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  margin-top: var(--space-3);
}

.settings-link:hover, .settings-link.active {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.settings-link svg {
  flex-shrink: 0;
}

/* Mobile styles */
@media (max-width: 767px) {
  .left-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
    transition: transform var(--transition-normal);
  }

  .left-sidebar.open {
    transform: translateX(0);
  }
  
  .new-chat-button span {
    display: none;
  }
  
  .new-chat-button {
    padding: var(--space-2);
    min-width: 44px;
    min-height: 44px;
  }
  
  .app-title {
    font-size: 1.125rem;
  }
  
  .botsify-logo {
    width: 28px;
    height: 28px;
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
  }
}
</style>